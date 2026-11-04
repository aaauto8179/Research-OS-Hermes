"""Unstructured text and concall transcript extractor with speaker diarization."""
import hashlib
import os
import re
import uuid
from typing import Any

from ..chunkers.sliding_window import SlidingWindowChunker
from ..models.statements import ExtractedChunk, ExtractedDocument

# Common speaker pattern: "Firstname Lastname (Title / Affiliation): text" or "Operator: text"
SPEAKER_REGEX = re.compile(
    r"^([A-Z][A-Za-z0-9\.\s\-]+(?:\([A-Za-z0-9\s,\.\-]+\))?)\s*:\s*(.*)$"
)

# Numbered note pattern: "Note 18: Borrowings" or "Note 2.3: Summary of Significant Accounting Policies"
NOTE_REGEX = re.compile(
    r"^(?:Note|NOTE)\s+([0-9A-Za-z\.]+)\s*[:\-–]\s*(.*)$", re.IGNORECASE
)

class UnstructuredExtractor:
    """Extracts speaker dialogue turns and structured sections from transcripts and notes."""

    def __init__(self, chunk_size: int = 400, overlap: int = 40):
        self.chunker = SlidingWindowChunker(chunk_size=chunk_size, overlap=overlap)

    def _determine_speaker_role(self, speaker_name: str) -> str:
        s_lower = speaker_name.lower()
        if "operator" in s_lower or "moderator" in s_lower:
            return "OPERATOR"
        elif any(role in s_lower for role in ("cfo", "ceo", "managing director", "chairman", "cmd", "president", "management", "executive", "vp")):
            return "MANAGEMENT"
        elif any(role in s_lower for role in ("analyst", "securities", "capital", "morgan", "ubs", "goldman", "clsa", "nomura", "jefferies", "research")):
            return "ANALYST"
        return "PARTICIPANT"

    def extract_text(
        self,
        text_content: str,
        company_symbol: str = "UNKNOWN",
        title: str = "Unstructured Document",
        doc_type: str = "CONCALL_TRANSCRIPT",
        file_name: str | None = None
    ) -> ExtractedDocument:
        doc_id = str(uuid.uuid4())
        content_hash = hashlib.sha256(text_content.encode("utf-8")).hexdigest()
        chunks: list[ExtractedChunk] = []
        chunk_idx = 0

        lines = [line.strip() for line in text_content.splitlines()]

        # Check if text contains speaker dialogue markers
        turns: list[dict[str, Any]] = []
        current_speaker: str | None = None
        current_role: str = "UNKNOWN"
        current_buffer: list[str] = []

        current_section = "INTRODUCTION"

        for line in lines:
            if not line:
                continue

            # Check section transitions
            line_upper = line.upper()
            if "QUESTION-AND-ANSWER" in line_upper or "Q&A SESSION" in line_upper:
                current_section = "QA_SESSION"
            elif "PARTICIPANTS" in line_upper:
                current_section = "PARTICIPANTS"

            # Check speaker match
            speaker_match = SPEAKER_REGEX.match(line)
            note_match = NOTE_REGEX.match(line)

            if speaker_match:
                raw_spk = speaker_match.group(1).strip()
                if raw_spk.upper() in {"PARTICIPANTS", "DATE", "TRANSCRIPT", "LOCATION", "CONFERENCE CALL", "TOPIC", "TIME", "SUBJECT"}:
                    current_buffer.append(line)
                    continue

                if current_speaker and current_buffer:
                    turns.append({
                        "type": "CONCALL_TURN",
                        "speaker": current_speaker,
                        "role": current_role,
                        "section": current_section,
                        "text": " ".join(current_buffer)
                    })
                    current_buffer = []

                content = speaker_match.group(2).strip()
                current_speaker = raw_spk
                current_role = self._determine_speaker_role(raw_spk)
                if content:
                    current_buffer.append(content)
            elif note_match:
                if current_speaker and current_buffer:
                    turns.append({
                        "type": "CONCALL_TURN",
                        "speaker": current_speaker,
                        "role": current_role,
                        "section": current_section,
                        "text": " ".join(current_buffer)
                    })
                    current_buffer = []

                note_num = note_match.group(1).strip()
                note_title = note_match.group(2).strip()
                turns.append({
                    "type": "NOTE_TO_ACCOUNTS",
                    "note_number": note_num,
                    "title": note_title,
                    "section": "NOTES_TO_ACCOUNTS",
                    "text": line
                })
                current_speaker = None
            else:
                if current_speaker:
                    current_buffer.append(line)
                else:
                    # General paragraph
                    current_buffer.append(line)

        # Flush final turn
        if current_speaker and current_buffer:
            turns.append({
                "type": "CONCALL_TURN",
                "speaker": current_speaker,
                "role": current_role,
                "section": current_section,
                "text": " ".join(current_buffer)
            })
        elif current_buffer:
            turns.append({
                "type": "TEXT",
                "section": current_section,
                "text": " ".join(current_buffer)
            })

        # Convert turns to ExtractedChunk
        for idx, turn in enumerate(turns):
            chunk_id = f"chunk_{doc_id[:8]}_{idx:03d}"
            c_type = turn.get("type", "CONCALL_TURN")
            spk = turn.get("speaker")
            role = turn.get("role", "UNKNOWN")
            body = turn.get("text", "")

            # If a turn is excessively long, apply sliding window
            if len(body.split()) > 350:
                sub_chunks = self.chunker.chunk(body)
                for sub_i, sc in enumerate(sub_chunks):
                    prefix = f"[{spk} ({role}) - Part {sub_i + 1}] " if spk else ""
                    chunks.append(ExtractedChunk(
                        chunk_id=f"{chunk_id}_{sub_i}",
                        document_id=doc_id,
                        chunk_index=chunk_idx,
                        chunk_type=c_type,
                        content=f"{prefix}{sc.text}",
                        meta={
                            "speaker": spk,
                            "role": role,
                            "section": turn.get("section"),
                            "turn_index": idx
                        }
                    ))
                    chunk_idx += 1
            else:
                prefix = f"[{spk} ({role})] " if spk else ""
                chunks.append(ExtractedChunk(
                    chunk_id=chunk_id,
                    document_id=doc_id,
                    chunk_index=chunk_idx,
                    chunk_type=c_type,
                    content=f"{prefix}{body}",
                    meta={
                        "speaker": spk,
                        "role": role,
                        "section": turn.get("section"),
                        "turn_index": idx
                    }
                ))
                chunk_idx += 1

        return ExtractedDocument(
            document_id=doc_id,
            company_symbol=company_symbol,
            doc_type=doc_type,
            title=title,
            file_name=file_name or "transcript.txt",
            file_hash=content_hash,
            source="MANUAL_UPLOAD",
            page_count=1,
            chunks=chunks,
            line_items=[],
            meta={"turns_count": len(turns), "speakers_detected": list({t.get("speaker") for t in turns if t.get("speaker")})}
        )

    def extract_from_file(
        self,
        file_path: str,
        company_symbol: str = "UNKNOWN",
        doc_type: str = "CONCALL_TRANSCRIPT"
    ) -> ExtractedDocument:
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")
        with open(file_path, encoding="utf-8", errors="ignore") as f:
            content = f.read()
        file_name = os.path.basename(file_path)
        title = f"{doc_type.replace('_', ' ').title()} - {company_symbol}"
        return self.extract_text(
            text_content=content,
            company_symbol=company_symbol,
            title=title,
            doc_type=doc_type,
            file_name=file_name
        )

__all__ = ["UnstructuredExtractor"]
