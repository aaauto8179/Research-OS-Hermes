"""
Vercel Python entry point for Data Ingestion Service.
Handles document extraction, classification, and PIT-compliant storage.
"""
import json
import os
import sys
from http.server import BaseHTTPRequestHandler
from typing import Dict, Any

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

# Import data ingestion modules
# from data_ingestion.extractors import DocumentExtractor
# from data_ingestion.classifiers import DocumentClassifier
# from data_ingestion.pit import PITTransformer

class DataIngestionHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode('utf-8') if content_length > 0 else '{}'
        
        try:
            data = json.loads(body) if body else {}
        except json.JSONDecodeError:
            self.send_error_response(400, "Invalid JSON")
            return

        path = self.path
        
        try:
            if path == '/extract':
                result = self.handle_extract(data)
            elif path == '/classify':
                result = self.handle_classify(data)
            elif path == '/pit-transform':
                result = self.handle_pit_transform(data)
            elif path == '/ingest':
                result = self.handle_ingest(data)
            else:
                self.send_error_response(404, f"Endpoint not found: {path}")
                return
            
            self.send_json_response(200, result)
            
        except Exception as e:
            self.send_error_response(500, str(e))

    def do_GET(self):
        if self.path == '/health':
            self.send_json_response(200, {"status": "healthy", "service": "data-ingestion"})
        else:
            self.send_error_response(404, f"Endpoint not found: {self.path}")

    def handle_extract(self, data: Dict[str, Any]) -> Dict[str, Any]:
        # Extract text from document
        document = data.get('document', {})
        content = data.get('content', '')
        
        # Mock extraction - replace with actual implementation
        return {
            "text": content,
            "tables": [],
            "metadata": {
                "pages": 1,
                "word_count": len(content.split()),
            }
        }

    def handle_classify(self, data: Dict[str, Any]) -> Dict[str, Any]:
        document = data.get('document', {})
        
        # Mock classification - replace with actual implementation
        return {
            "doc_type": "ANNUAL_REPORT",
            "confidence": 0.95,
            "metadata": {}
        }

    def handle_pit_transform(self, data: Dict[str, Any]) -> Dict[str, Any]:
        records = data.get('records', [])
        
        # Mock PIT transformation
        transformed = []
        for record in records:
            transformed.append({
                **record,
                "pit_timestamp": "2024-01-01T00:00:00Z",
                "filing_date": record.get("filing_date", "2024-01-01"),
            })
        return {"records": transformed}

    def handle_ingest(self, data: Dict[str, Any]) -> Dict[str, Any]:
        document = data.get('document', {})
        
        # Mock ingestion
        return {
            "document_id": "doc_123",
            "status": "ingested",
            "chunks": 5,
        }

    def send_json_response(self, status: int, data: Any):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))

    def send_error_response(self, status: int, message: str):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps({"error": message}).encode('utf-8'))


if __name__ == "__main__":
    from http.server import HTTPServer
    port = int(os.environ.get("PORT", 8001))
    server = HTTPServer(("", port), DataIngestionHandler)
    print(f"Data Ingestion running on port {port}")
    server.serve_forever()
