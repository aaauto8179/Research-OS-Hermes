"""HTML and web link extractor for exchange announcements and press releases."""
import hashlib
import uuid

import aiohttp
from bs4 import BeautifulSoup

from ..chunkers.sliding_window import SlidingWindowChunker
from ..models.statements import ExtractedChunk, ExtractedDocument


class LinkExtractor:
    """Fetches and parses HTML exchange announcements and corporate disclosures."""

    def __init__(self, chunk_size: int = 400, overlap: int = 40):
        self.chunker = SlidingWindowChunker(chunk_size=chunk_size, overlap=overlap)

    async def fetch_url(self, url: str) -> str:
        """Asynchronously fetches HTML content from a URL."""
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        async with (
            aiohttp.ClientSession(headers=headers) as session,
            session.get(url, timeout=aiohttp.ClientTimeout(total=15)) as resp,
        ):
            resp.raise_for_status()
            return await resp.text()

    def parse_html(
        self,
        html_content: str,
        source_url: str | None = None,
        company_symbol: str = "UNKNOWN",
        doc_type: str = "EXCHANGE_ANNOUNCEMENT",
    ) -> ExtractedDocument:
        """Parses HTML string into structured chunks and tables."""
        soup = BeautifulSoup(html_content, "html.parser")

        # Strip scripts and styles
        for tag in soup(["script", "style", "noscript", "svg"]):
            tag.decompose()

        # Extract title
        title_tag = soup.find("title") or soup.find("h1") or soup.find("h2")
        title = title_tag.get_text(strip=True) if title_tag else "Corporate Announcement"

        doc_id = str(uuid.uuid4())
        content_hash = hashlib.sha256(html_content.encode("utf-8")).hexdigest()
        chunks: list[ExtractedChunk] = []
        chunk_idx = 0

        # 1. Extract HTML tables
        tables = soup.find_all("table")
        for t_idx, table in enumerate(tables):
            table_rows = []
            for tr in table.find_all("tr"):
                cells = [td.get_text(strip=True) for td in tr.find_all(["th", "td"])]
                if cells:
                    table_rows.append(cells)

            if len(table_rows) >= 1:
                md_rows = []
                header = table_rows[0]
                md_rows.append("| " + " | ".join(header) + " |")
                md_rows.append("| " + " | ".join(["---"] * len(header)) + " |")
                for r in table_rows[1:]:
                    md_rows.append("| " + " | ".join(r) + " |")

                t_content = "\n".join(md_rows)
                chunks.append(ExtractedChunk(
                    chunk_id=str(uuid.uuid4()),
                    document_id=doc_id,
                    chunk_index=chunk_idx,
                    chunk_type="TABLE",
                    content=t_content,
                    page_number=1,
                    meta={"table_index": t_idx, "rows": len(table_rows)}
                ))
                chunk_idx += 1

        # 2. Extract paragraph blocks and main text
        paragraphs = [p.get_text(strip=True) for p in soup.find_all(["p", "div", "section", "article"]) if p.get_text(strip=True)]
        full_text = "\n\n".join(paragraphs)
        if not full_text.strip():
            full_text = soup.get_text(separator="\n", strip=True)

        if full_text.strip():
            text_chunks = self.chunker.chunk(full_text)
            for tc in text_chunks:
                chunks.append(ExtractedChunk(
                    chunk_id=str(uuid.uuid4()),
                    document_id=doc_id,
                    chunk_index=chunk_idx,
                    chunk_type="TEXT",
                    content=tc.text,
                    page_number=1,
                    meta={"words": len(tc.text.split())}
                ))
                chunk_idx += 1

        return ExtractedDocument(
            document_id=doc_id,
            company_symbol=company_symbol,
            doc_type=doc_type,
            title=f"{title} - {company_symbol}",
            file_name=source_url or "announcement.html",
            file_hash=content_hash,
            source="URL_FETCH" if source_url else "MANUAL_UPLOAD",
            source_url=source_url,
            page_count=1,
            chunks=chunks,
            line_items=[],
            meta={"tables_found": len(tables), "characters": len(full_text)}
        )

    async def extract_from_url(
        self,
        url: str,
        company_symbol: str = "UNKNOWN",
        doc_type: str = "EXCHANGE_ANNOUNCEMENT"
    ) -> ExtractedDocument:
        html = await self.fetch_url(url)
        return self.parse_html(html, source_url=url, company_symbol=company_symbol, doc_type=doc_type)

    def extract_from_file(
        self,
        file_path: str,
        company_symbol: str = "UNKNOWN",
        doc_type: str = "EXCHANGE_ANNOUNCEMENT"
    ) -> ExtractedDocument:
        with open(file_path, encoding="utf-8", errors="ignore") as f:
            html = f.read()
        return self.parse_html(html, source_url=file_path, company_symbol=company_symbol, doc_type=doc_type)

__all__ = ["LinkExtractor"]
