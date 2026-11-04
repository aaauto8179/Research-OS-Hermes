"""Excel and CSV financial statement extractor for Screener.in and BSE/NSE exports."""
import hashlib
import os
import re
import uuid
from datetime import datetime

import openpyxl
import pandas as pd

from ..models.statements import ExtractedChunk, ExtractedDocument, ParsedLineItem
from ..models.taxonomy import canonicalize_line_item


def parse_period_header(header_str: str) -> tuple[str, int, str] | None:
    """
    Parses period header into (period_end_date, fiscal_year, fiscal_quarter).
    Examples:
      'Mar 2024' -> ('2024-03-31', 2024, 'FY')
      '31-Mar-2024' -> ('2024-03-31', 2024, 'FY')
      'Dec 2023' -> ('2023-12-31', 2024, 'Q3')
      'TTM' -> ('2024-09-30', 2025, 'TTM')
    """
    if not header_str:
        return None
    s = str(header_str).strip()
    if s.upper() == "TTM":
        return ("2024-12-31", 2025, "TTM")

    # Match '31-Mar-2024' or '31/03/2024' or '2024-03-31'
    for fmt in ("%d-%b-%Y", "%d-%b-%y", "%Y-%m-%d", "%d/%m/%Y", "%b %Y", "%B %Y", "%b-%y", "%b-%Y"):
        try:
            dt = datetime.strptime(s, fmt)
            # Find end of month
            year = dt.year
            month = dt.month
            if month in (1, 3, 5, 7, 8, 10, 12):
                day = 31
            elif month in (4, 6, 9, 11):
                day = 30
            else:
                day = 29 if (year % 4 == 0 and (year % 100 != 0 or year % 400 == 0)) else 28
            end_date = f"{year:04d}-{month:02d}-{day:02d}"

            # Fiscal year logic for India (April to March)
            if month == 3:
                fy = year
                fq = "FY"
            elif month == 6:
                fy = year + 1
                fq = "Q1"
            elif month == 9:
                fy = year + 1
                fq = "Q2"
            elif month == 12:
                fy = year + 1
                fq = "Q3"
            else:
                fy = year
                fq = "FY"
            return (end_date, fy, fq)
        except ValueError:
            continue

    # Regex search for Month + Year e.g. "Mar 2024" or "March 2024"
    match = re.search(r"([A-Za-z]{3,9})[\s\-_']+(\d{2,4})", s)
    if match:
        month_str, yr_str = match.groups()
        if len(yr_str) == 2:
            yr_str = "20" + yr_str
        yr = int(yr_str)
        month_map = {
            "jan": 1, "feb": 2, "mar": 3, "apr": 4, "may": 5, "jun": 6,
            "jul": 7, "aug": 8, "sep": 9, "oct": 10, "nov": 11, "dec": 12
        }
        m_prefix = month_str[:3].lower()
        if m_prefix in month_map:
            m = month_map[m_prefix]
            if m in (1, 3, 5, 7, 8, 10, 12):
                d = 31
            elif m in (4, 6, 9, 11):
                d = 30
            else:
                d = 29 if (yr % 4 == 0 and (yr % 100 != 0 or yr % 400 == 0)) else 28
            end_date = f"{yr:04d}-{m:02d}-{d:02d}"
            if m == 3:
                fy = yr
                fq = "FY"
            elif m == 6:
                fy = yr + 1
                fq = "Q1"
            elif m == 9:
                fy = yr + 1
                fq = "Q2"
            elif m == 12:
                fy = yr + 1
                fq = "Q3"
            else:
                fy = yr
                fq = "FY"
            return (end_date, fy, fq)

    return None


def clean_numeric_cell(raw_c: object) -> float | None:
    """Clean and parse a cell value into a float, handling accounting negatives and preventing NaN leakage."""
    if raw_c is None:
        return None
    if isinstance(raw_c, (int, float)):
        import math
        if math.isnan(raw_c) or math.isinf(raw_c):
            return None
        return float(raw_c)

    s = str(raw_c).strip()
    if not s or s.lower() in ("n/a", "na", "nan", "-", "--", "nil", "null", "none"):
        return None

    # Strip commas, %, and currency symbols
    s = s.replace(",", "").replace("%", "").replace("₹", "").replace("$", "").strip()

    is_negative = False
    if s.startswith("(") and s.endswith(")"):
        is_negative = True
        s = s[1:-1].strip()

    # Handle DR / CR suffixes
    upper_s = s.upper()
    if upper_s.endswith("DR") or upper_s.endswith("CR"):
        s = s[:-2].strip()

    if s.startswith("(") and s.endswith(")"):
        is_negative = True
        s = s[1:-1].strip()

    if not s or s.lower() in ("n/a", "na", "nan", "-", "--", "nil", "null", "none"):
        return None

    try:
        val = float(s)
        import math
        if math.isnan(val) or math.isinf(val):
            return None
        return -val if is_negative else val
    except (ValueError, TypeError):
        return None


class ExcelCSVExtractor:
    """Extractor for Screener.in Excel spreadsheets and BSE/NSE CSV results."""

    def extract(self, file_path: str, company_symbol: str = "UNKNOWN") -> ExtractedDocument:
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")

        file_name = os.path.basename(file_path)
        with open(file_path, "rb") as f:
            file_hash = hashlib.sha256(f.read()).hexdigest()

        doc_id = str(uuid.uuid4())
        ext = os.path.splitext(file_path)[1].lower()

        if ext in (".xlsx", ".xls", ".xlsm"):
            return self._extract_excel(file_path, doc_id, file_name, file_hash, company_symbol)
        elif ext == ".csv":
            return self._extract_csv(file_path, doc_id, file_name, file_hash, company_symbol)
        else:
            raise ValueError(f"Unsupported spreadsheet format: {ext}")

    def _extract_excel(self, file_path: str, doc_id: str, file_name: str, file_hash: str, symbol: str) -> ExtractedDocument:
        wb = openpyxl.load_workbook(file_path, data_only=True)
        chunks: list[ExtractedChunk] = []
        line_items: list[ParsedLineItem] = []
        chunk_idx = 0

        # Detect sheets
        for sheet_name in wb.sheetnames:
            ws = wb[sheet_name]
            max_r = ws.max_row
            max_c = ws.max_column

            # Look for sections like Profit & Loss, Balance Sheet, Cash Flow
            current_section = "PL"
            header_periods: list[tuple[int, str, int, str]] = [] # [(col_idx, period_end_date, fiscal_year, fiscal_quarter)]

            for r in range(1, max_r + 1):
                row_vals = [ws.cell(row=r, column=c).value for c in range(1, max_c + 1)]
                first_val = str(row_vals[0] or "").strip()

                # Section header detection
                upper_first = first_val.upper()
                if "PROFIT & LOSS" in upper_first or "PROFIT AND LOSS" in upper_first or "INCOME STATEMENT" in upper_first:
                    current_section = "PL"
                    continue
                elif "BALANCE SHEET" in upper_first:
                    current_section = "BS"
                    continue
                elif "CASH FLOW" in upper_first:
                    current_section = "CF"
                    continue

                # Check if this row is a period header row (e.g. contains "Mar 2015", "Mar 2024")
                detected_headers = []
                for col_idx, val in enumerate(row_vals[1:], start=2):
                    parsed_p = parse_period_header(str(val or ""))
                    if parsed_p:
                        detected_headers.append((col_idx, parsed_p[0], parsed_p[1], parsed_p[2]))

                if len(detected_headers) >= 2:
                    header_periods = detected_headers
                    continue

                # If we have detected header periods and this row has a line item label
                if header_periods and first_val and not first_val.startswith("#"):
                    # Check if at least one cell has a numeric value
                    has_numeric = False
                    cell_data: dict[str, float] = {}
                    for col_idx, end_date, _fy, _fq in header_periods:
                        raw_c = ws.cell(row=r, column=col_idx).value
                        num_val = clean_numeric_cell(raw_c)
                        if num_val is not None:
                            cell_data[end_date] = num_val
                            has_numeric = True

                    if has_numeric:
                        code, display_name, statement_type, category = canonicalize_line_item(
                            first_val, hint_statement_type=current_section
                        )
                        start_col_letter = openpyxl.utils.get_column_letter(2)
                        end_col_letter = openpyxl.utils.get_column_letter(header_periods[-1][0])
                        cell_anchor = f"'{sheet_name}'!{start_col_letter}{r}:{end_col_letter}{r}"

                        chunk_id = str(uuid.uuid4())
                        chunk_text = f"[{statement_type}] {display_name} ({cell_anchor}): " + ", ".join(
                            f"{d}: {v:,.2f}" for d, v in cell_data.items()
                        )
                        chunk = ExtractedChunk(
                            chunk_id=chunk_id,
                            document_id=doc_id,
                            chunk_index=chunk_idx,
                            chunk_type="STATEMENT_ROW",
                            content=chunk_text,
                            sheet_name=sheet_name,
                            cell_range=cell_anchor,
                            meta={
                                "line_item_code": code,
                                "raw_label": first_val,
                                "statement_type": statement_type,
                                "row_index": r
                            }
                        )
                        chunks.append(chunk)
                        chunk_idx += 1

                        # Generate ParsedLineItem per period
                        for col_idx, end_date, fy, fq in header_periods:
                            if end_date in cell_data:
                                item = ParsedLineItem(
                                    company_symbol=symbol,
                                    statement_type=statement_type,
                                    period_type="TTM" if fq == "TTM" else ("QUARTERLY" if fq.startswith("Q") else "ANNUAL"),
                                    fiscal_year=fy,
                                    fiscal_quarter=fq,
                                    period_end_date=end_date,
                                    line_item_code=code,
                                    line_item_name=display_name,
                                    category=category,
                                    value=cell_data[end_date],
                                    unit="INR_CRORES",
                                    sheet_name=sheet_name,
                                    cell_range=f"'{sheet_name}'!{openpyxl.utils.get_column_letter(col_idx)}{r}",
                                    citation_chunk_id=chunk_id,
                                    citation_meta={"sheet": sheet_name, "row": r, "col": col_idx}
                                )
                                line_items.append(item)

        return ExtractedDocument(
            document_id=doc_id,
            company_symbol=symbol,
            doc_type="SCREENER_EXCEL",
            title=f"Screener Financial Export - {symbol}",
            file_name=file_name,
            file_hash=file_hash,
            source="SCREENER",
            page_count=len(wb.sheetnames),
            chunks=chunks,
            line_items=line_items,
            meta={"sheets": wb.sheetnames, "row_count": len(line_items)}
        )

    def _extract_csv(self, file_path: str, doc_id: str, file_name: str, file_hash: str, symbol: str) -> ExtractedDocument:
        df = pd.read_csv(file_path)
        chunks: list[ExtractedChunk] = []
        line_items: list[ParsedLineItem] = []
        chunk_idx = 0

        # Case 1: Standard BSE results format:
        # Columns: Security Code, Security Name, Quarter Ended, Line Item, Audited/Unaudited, Amount_in_Lakhs
        cols_lower = [str(c).strip().lower() for c in df.columns]
        if "amount_in_lakhs" in cols_lower or ("line item" in cols_lower and "quarter ended" in cols_lower):
            col_map = {str(c).strip().lower(): c for c in df.columns}
            item_col = col_map.get("line item") or col_map.get("description")
            date_col = col_map.get("quarter ended")
            amt_col = col_map.get("amount_in_lakhs") or col_map.get("amount") or col_map.get("value")
            is_lakhs = "amount_in_lakhs" in cols_lower

            for idx, row in df.iterrows():
                raw_item = str(row[item_col]).strip()
                raw_date = str(row[date_col]).strip()
                raw_val = clean_numeric_cell(row[amt_col])
                if raw_val is None:
                    continue

                parsed_p = parse_period_header(raw_date)
                if not parsed_p:
                    continue
                end_date, fy, fq = parsed_p

                # Convert Lakhs to Crores if applicable
                norm_val = (raw_val / 100.0) if is_lakhs else raw_val

                code, display_name, statement_type, category = canonicalize_line_item(raw_item, hint_statement_type="PL")
                chunk_id = str(uuid.uuid4())
                chunk_text = f"[BSE {statement_type}] {display_name} ({end_date}): {norm_val:,.2f} Cr"
                chunk = ExtractedChunk(
                    chunk_id=chunk_id,
                    document_id=doc_id,
                    chunk_index=chunk_idx,
                    chunk_type="STATEMENT_ROW",
                    content=chunk_text,
                    cell_range=f"Row {idx + 2}",
                    meta={"raw_item": raw_item, "raw_val": raw_val, "is_lakhs": is_lakhs}
                )
                chunks.append(chunk)
                chunk_idx += 1

                line_items.append(ParsedLineItem(
                    company_symbol=symbol,
                    statement_type=statement_type,
                    period_type="QUARTERLY" if fq.startswith("Q") else "ANNUAL",
                    fiscal_year=fy,
                    fiscal_quarter=fq,
                    period_end_date=end_date,
                    line_item_code=code,
                    line_item_name=display_name,
                    category=category,
                    value=norm_val,
                    unit="INR_CRORES",
                    cell_range=f"Row {idx + 2}",
                    citation_chunk_id=chunk_id,
                    citation_meta={"row_index": idx + 2}
                ))

            return ExtractedDocument(
                document_id=doc_id,
                company_symbol=symbol,
                doc_type="BSE_CSV",
                title=f"BSE Results Filing - {symbol}",
                file_name=file_name,
                file_hash=file_hash,
                source="BSE",
                page_count=1,
                chunks=chunks,
                line_items=line_items,
                meta={"rows": len(df)}
            )

        # Case 2: Standard Screener/Time-series CSV format:
        # First column is Line Item, following columns are period dates
        first_col = df.columns[0]
        period_headers = []
        for col_name in df.columns[1:]:
            parsed_p = parse_period_header(str(col_name))
            if parsed_p:
                period_headers.append((col_name, parsed_p[0], parsed_p[1], parsed_p[2]))

        for idx, row in df.iterrows():
            raw_item = str(row[first_col]).strip()
            if not raw_item or raw_item.startswith("#"):
                continue

            code, display_name, statement_type, category = canonicalize_line_item(raw_item)
            cell_data: dict[str, float] = {}
            for orig_col, end_date, _fy, _fq in period_headers:
                raw_c = row[orig_col]
                num_val = clean_numeric_cell(raw_c)
                if num_val is not None:
                    cell_data[end_date] = num_val

            if cell_data:
                chunk_id = str(uuid.uuid4())
                chunk_text = f"[{statement_type}] {display_name} (Row {idx + 2}): " + ", ".join(
                    f"{d}: {v:,.2f}" for d, v in cell_data.items()
                )
                chunk = ExtractedChunk(
                    chunk_id=chunk_id,
                    document_id=doc_id,
                    chunk_index=chunk_idx,
                    chunk_type="STATEMENT_ROW",
                    content=chunk_text,
                    cell_range=f"Row {idx + 2}",
                    meta={"line_item_code": code, "raw_label": raw_item}
                )
                chunks.append(chunk)
                chunk_idx += 1

                for orig_col, end_date, fy, fq in period_headers:
                    if end_date in cell_data:
                        line_items.append(ParsedLineItem(
                            company_symbol=symbol,
                            statement_type=statement_type,
                            period_type="TTM" if fq == "TTM" else ("QUARTERLY" if fq.startswith("Q") else "ANNUAL"),
                            fiscal_year=fy,
                            fiscal_quarter=fq,
                            period_end_date=end_date,
                            line_item_code=code,
                            line_item_name=display_name,
                            category=category,
                            value=cell_data[end_date],
                            unit="INR_CRORES",
                            cell_range=f"Row {idx + 2}, Col {orig_col}",
                            citation_chunk_id=chunk_id,
                            citation_meta={"row": idx + 2, "column": orig_col}
                        ))

        return ExtractedDocument(
            document_id=doc_id,
            company_symbol=symbol,
            doc_type="CSV_EXPORT",
            title=f"CSV Statement Export - {symbol}",
            file_name=file_name,
            file_hash=file_hash,
            source="MANUAL_UPLOAD",
            page_count=1,
            chunks=chunks,
            line_items=line_items,
            meta={"rows": len(df)}
        )

__all__ = ["ExcelCSVExtractor", "parse_period_header"]
