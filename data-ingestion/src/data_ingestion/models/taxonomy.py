"""Indian financial statements taxonomy and canonical line item mapping."""
import re

LINE_ITEM_TAXONOMY = {
    # Profit & Loss (PL)
    "REV_OPERATIONS": {
        "statement_type": "PL",
        "category": "REVENUE",
        "display_name": "Revenue from Operations",
        "synonyms": [
            "revenue from operations", "sales", "net sales", "total revenue from operations",
            "income from operations", "total income from operations", "revenue", "gross sales", "turnover"
        ]
    },
    "EXPENSES": {
        "statement_type": "PL",
        "category": "EXPENSE",
        "display_name": "Total Expenses",
        "synonyms": [
            "expenses", "operating expenses", "total expenses", "total expenditure",
            "total operating expenses"
        ]
    },
    "EBITDA": {
        "statement_type": "PL",
        "category": "PROFITABILITY",
        "display_name": "Operating Profit (EBITDA)",
        "synonyms": [
            "operating profit", "ebitda", "operating profit (ebitda)",
            "operating profit before depreciation", "pbdit", "operating earnings",
            "operating profit before working capital changes"
        ]
    },
    "OPM_PCT": {
        "statement_type": "PL",
        "category": "RATIO",
        "display_name": "Operating Profit Margin %",
        "synonyms": [
            "opm %", "operating profit margin %", "operating margin %", "opm", "ebitda margin %"
        ]
    },
    "OTHER_INCOME": {
        "statement_type": "PL",
        "category": "OTHER_INCOME",
        "display_name": "Other Income",
        "synonyms": [
            "other income", "non-operating income", "other non-operating income"
        ]
    },
    "DEPRECIATION": {
        "statement_type": "PL",
        "category": "EXPENSE",
        "display_name": "Depreciation & Amortisation",
        "synonyms": [
            "depreciation", "depreciation and amortisation", "depreciation & amortisation",
            "depreciation and amortization expense", "depreciation and amortisation expense",
            "depreciation & amortisation expense", "depreciation & amortization expense"
        ]
    },
    "INTEREST": {
        "statement_type": "PL",
        "category": "FINANCE_COST",
        "display_name": "Finance Costs (Interest)",
        "synonyms": [
            "interest", "finance costs", "finance charges", "borrowing costs", "finance cost"
        ]
    },
    "PBT": {
        "statement_type": "PL",
        "category": "PROFITABILITY",
        "display_name": "Profit Before Tax (PBT)",
        "synonyms": [
            "profit before tax", "pbt", "profit / (loss) before tax", "profit before taxes"
        ]
    },
    "TAX": {
        "statement_type": "PL",
        "category": "TAX",
        "display_name": "Tax Expense",
        "synonyms": [
            "tax", "tax %", "tax expense", "provision for tax", "current tax", "deferred tax",
            "total tax expense"
        ]
    },
    "PAT": {
        "statement_type": "PL",
        "category": "PROFITABILITY",
        "display_name": "Net Profit (PAT)",
        "synonyms": [
            "net profit", "pat", "profit after tax", "net profit / (loss) for the period",
            "profit for the year", "net profit (pat)", "net profit for the period (pat)",
            "profit after tax (pat)", "profit / (loss) for the period after tax",
            "profit/(loss) for the period after tax", "profit / (loss) for the period",
            "profit/(loss) for the period", "profit for the period", "profit after tax for the period"
        ]
    },
    "EPS": {
        "statement_type": "PL",
        "category": "RATIO",
        "display_name": "Earnings Per Share (INR)",
        "synonyms": [
            "eps in rs", "basic eps", "diluted eps", "earnings per share", "eps"
        ]
    },
    "DIVIDEND_PAYOUT": {
        "statement_type": "PL",
        "category": "RATIO",
        "display_name": "Dividend Payout %",
        "synonyms": [
            "dividend payout %", "dividend payout ratio", "dividend payout"
        ]
    },

    # Balance Sheet (BS)
    "EQUITY_CAPITAL": {
        "statement_type": "BS",
        "category": "EQUITY",
        "display_name": "Equity Share Capital",
        "synonyms": [
            "equity capital", "equity share capital", "share capital"
        ]
    },
    "RESERVES": {
        "statement_type": "BS",
        "category": "EQUITY",
        "display_name": "Reserves & Surplus",
        "synonyms": [
            "reserves", "other equity & reserves", "other equity", "reserves and surplus",
            "reserves & surplus", "total reserves"
        ]
    },
    "BORROWINGS": {
        "statement_type": "BS",
        "category": "LIABILITY",
        "display_name": "Total Borrowings (Debt)",
        "synonyms": [
            "borrowings", "total debt", "total borrowings (debt)", "long term borrowings",
            "short term borrowings", "financial liabilities - borrowings", "debt"
        ]
    },
    "OTHER_LIABILITIES": {
        "statement_type": "BS",
        "category": "LIABILITY",
        "display_name": "Other Liabilities",
        "synonyms": [
            "other liabilities", "current liabilities", "other financial liabilities",
            "trade payables", "provisions"
        ]
    },
    "TOTAL_LIABILITIES": {
        "statement_type": "BS",
        "category": "LIABILITY",
        "display_name": "Total Equity & Liabilities",
        "synonyms": [
            "total liabilities", "total equity and liabilities", "total equity & liabilities"
        ]
    },
    "FIXED_ASSETS": {
        "statement_type": "BS",
        "category": "ASSET",
        "display_name": "Property, Plant & Equipment",
        "synonyms": [
            "fixed assets", "tangible fixed assets", "property, plant and equipment",
            "ppe", "property, plant & equipment"
        ]
    },
    "CWIP": {
        "statement_type": "BS",
        "category": "ASSET",
        "display_name": "Capital Work-in-Progress (CWIP)",
        "synonyms": [
            "cwip", "capital work in progress", "capital work-in-progress"
        ]
    },
    "INVESTMENTS": {
        "statement_type": "BS",
        "category": "ASSET",
        "display_name": "Investments",
        "synonyms": [
            "investments", "non-current investments", "financial assets - investments",
            "current investments"
        ]
    },
    "OTHER_ASSETS": {
        "statement_type": "BS",
        "category": "ASSET",
        "display_name": "Other Assets",
        "synonyms": [
            "other assets", "current assets", "other non-current assets", "inventories",
            "trade receivables", "cash and cash equivalents", "cash & cash equivalents",
            "cash & bank balances", "cash and bank balances"
        ]
    },
    "TOTAL_ASSETS": {
        "statement_type": "BS",
        "category": "ASSET",
        "display_name": "Total Assets",
        "synonyms": [
            "total assets"
        ]
    },

    # Cash Flow (CF)
    "OPERATING_CASH_FLOW": {
        "statement_type": "CF",
        "category": "CASH_FLOW",
        "display_name": "Cash Flow from Operating Activities",
        "synonyms": [
            "cash from operating activity", "cash flow from operating activities",
            "cash from operations", "operating cash flow", "net cash from operating activities",
            "net cash generated from operating activities", "net cash generated from / (used in) operating activities",
            "cash generated from operating activities", "cash generated from operations"
        ]
    },
    "INVESTING_CASH_FLOW": {
        "statement_type": "CF",
        "category": "CASH_FLOW",
        "display_name": "Cash Flow from Investing Activities",
        "synonyms": [
            "cash from investing activity", "cash flow from investing activities",
            "net cash used in investing activities", "investing cash flow",
            "net cash from investing activities"
        ]
    },
    "FINANCING_CASH_FLOW": {
        "statement_type": "CF",
        "category": "CASH_FLOW",
        "display_name": "Cash Flow from Financing Activities",
        "synonyms": [
            "cash from financing activity", "cash flow from financing activities",
            "net cash from / (used in) financing activities", "financing cash flow",
            "net cash used in financing activities"
        ]
    },
    "NET_CASH_FLOW": {
        "statement_type": "CF",
        "category": "CASH_FLOW",
        "display_name": "Net Cash Flow",
        "synonyms": [
            "net cash flow", "net increase / (decrease) in cash and cash equivalents",
            "net change in cash", "net cash inflow / (outflow)"
        ]
    },
}

def clean_text(text: str) -> str:
    """Normalize text by stripping whitespace and lowering."""
    if not text:
        return ""
    text = re.sub(r"[\s\xa0]+", " ", str(text)).strip().lower()
    # Strip leading/trailing symbols, punctuation
    return re.sub(r"^[\W_]+|[\W_]+$", "", text)

def canonicalize_line_item(raw_label: str, hint_statement_type: str | None = None) -> tuple[str, str, str, str]:
    """
    Map raw label to (line_item_code, display_name, statement_type, category).
    If no match, creates a slugified code and defaults to hint or PL.
    """
    cleaned = clean_text(raw_label)

    # Priority matching by statement hint if provided
    for code, info in LINE_ITEM_TAXONOMY.items():
        if hint_statement_type and info["statement_type"] != hint_statement_type:
            continue
        for syn in info["synonyms"]:
            if cleaned == clean_text(syn):
                return code, info["display_name"], info["statement_type"], info["category"]

    # Secondary matching across all statement types
    for code, info in LINE_ITEM_TAXONOMY.items():
        for syn in info["synonyms"]:
            if cleaned == clean_text(syn):
                return code, info["display_name"], info["statement_type"], info["category"]

    # Partial substring match for key phrases
    for code, info in LINE_ITEM_TAXONOMY.items():
        if hint_statement_type and info["statement_type"] != hint_statement_type:
            continue
        for syn in info["synonyms"]:
            syn_clean = clean_text(syn)
            if len(syn_clean) > 4 and syn_clean in cleaned:
                return code, info["display_name"], info["statement_type"], info["category"]

    # Fallback: slugify raw label
    slug = re.sub(r"[^\w]+", "_", cleaned).strip("_").upper()
    statement_type = hint_statement_type or "PL"
    return slug or "OTHER_LINE_ITEM", raw_label.strip(), statement_type, "OTHER"
