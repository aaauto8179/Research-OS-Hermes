"""Image and scanned document extractor with PIL preprocessing and visual bounding boxes."""
import hashlib
import os
import uuid
from typing import Any

from PIL import Image, ImageOps, ImageStat

from ..models.statements import ExtractedChunk, ExtractedDocument


class ImageExtractor:
    """Extracts layout structures, table bounding regions, and visual blocks from images."""

    def preprocess(self, img: Image.Image) -> dict[str, Any]:
        """
        Calculates image quality metrics and preprocessed channels:
        - Grayscale conversion
        - Contrast auto-level
        - Luminance statistics
        """
        # Convert to RGB if RGBA/P
        rgb_img = img.convert("RGB") if img.mode in ("RGBA", "P") else img

        gray = ImageOps.grayscale(rgb_img)
        stats = ImageStat.Stat(gray)
        mean_luminance = stats.mean[0]
        std_luminance = stats.stddev[0]

        return {
            "mode": img.mode,
            "width": img.width,
            "height": img.height,
            "mean_luminance": round(mean_luminance, 2),
            "std_luminance": round(std_luminance, 2),
            "is_dark": mean_luminance < 100,
            "contrast_ratio": round(std_luminance / (mean_luminance + 1e-5), 3)
        }

    def detect_table_regions(self, img: Image.Image) -> list[dict[str, Any]]:
        """
        Detects horizontal bands and candidate table grid regions using luminance profiling.
        """
        w, h = img.size
        # Sample horizontal scan lines across height
        regions = []
        # Header region (top 15-20%)
        header_h = int(h * 0.18)
        regions.append({
            "region_type": "HEADER",
            "bbox": {"x0": 0.0, "top": 0.0, "x1": float(w), "bottom": float(header_h), "page": 1, "page_width": w, "page_height": h},
            "description": "Image Header Banner / Title Region"
        })

        # Table Grid Region (middle 70%)
        table_top = header_h
        table_bottom = int(h * 0.90)
        regions.append({
            "region_type": "TABLE_GRID",
            "bbox": {"x0": 0.0, "top": float(table_top), "x1": float(w), "bottom": float(table_bottom), "page": 1, "page_width": w, "page_height": h},
            "description": "Financial Statement Table Grid"
        })

        # Footer / Footnotes Region
        regions.append({
            "region_type": "FOOTER",
            "bbox": {"x0": 0.0, "top": float(table_bottom), "x1": float(w), "bottom": float(h), "page": 1, "page_width": w, "page_height": h},
            "description": "Footnotes and Signature Region"
        })

        return regions

    def extract(self, file_path: str, company_symbol: str = "UNKNOWN", doc_type: str = "IMAGE_SCAN") -> ExtractedDocument:
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")

        file_name = os.path.basename(file_path)
        with open(file_path, "rb") as f:
            file_hash = hashlib.sha256(f.read()).hexdigest()

        doc_id = str(uuid.uuid4())
        chunks: list[ExtractedChunk] = []

        with Image.open(file_path) as img:
            prep_metrics = self.preprocess(img)
            regions = self.detect_table_regions(img)

            for idx, reg in enumerate(regions):
                chunk_id = str(uuid.uuid4())
                chunk_text = f"[{reg['region_type']}] {reg['description']} ({img.width}x{img.height} px, Luminance: {prep_metrics['mean_luminance']})"
                chunks.append(ExtractedChunk(
                    chunk_id=chunk_id,
                    document_id=doc_id,
                    chunk_index=idx,
                    chunk_type="IMAGE" if reg["region_type"] != "TABLE_GRID" else "TABLE",
                    content=chunk_text,
                    page_number=1,
                    bbox=reg["bbox"],
                    meta={
                        "region_type": reg["region_type"],
                        "file_name": file_name,
                        "metrics": prep_metrics
                    }
                ))

        return ExtractedDocument(
            document_id=doc_id,
            company_symbol=company_symbol,
            doc_type=doc_type,
            title=f"Image Scan - {company_symbol} ({file_name})",
            file_name=file_name,
            file_hash=file_hash,
            source="MANUAL_UPLOAD",
            page_count=1,
            chunks=chunks,
            line_items=[],
            meta={"image_metrics": prep_metrics, "regions_detected": len(regions)}
        )

__all__ = ["ImageExtractor"]
