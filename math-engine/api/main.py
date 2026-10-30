"""
Vercel Python entry point for Math Engine Service.
Handles DCF, Screening, and other financial calculations.
"""
import json
import os
from http.server import BaseHTTPRequestHandler
from typing import Dict, Any
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from math_engine.dcf import DCFEngine, DCFInputs
from math_engine.screening import ScreeningEngine, ScreeningCriteria
from math_engine.relative import RelativeValuationEngine, RelativeValuationInputs
from math_engine.sotp import SOTPEngine, SOTPInputs
from math_engine.banking import BankingValuationEngine, BankingValuationInputs
from math_engine.excess_return import ExcessReturnEngine, ExcessReturnInputs
from math_engine.beneish import BeneishEngine
from math_engine.altman import AltmanZEngine
from math_engine.piotroski import PiotroskiEngine
from math_engine.portfolio import PortfolioAnalyticsEngine
from math_engine.registry import MathEngineRegistry


class MathEngineHandler(BaseHTTPRequestHandler):
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
            if path == '/dcf':
                result = self.handle_dcf(data)
            elif path == '/screening':
                result = self.handle_screening(data)
            elif path == '/relative':
                result = self.handle_relative(data)
            elif path == '/sotp':
                result = self.handle_sotp(data)
            elif path == '/banking':
                result = self.handle_banking(data)
            elif path == '/excess-return':
                result = self.handle_excess_return(data)
            elif path == '/beneish':
                result = self.handle_beneish(data)
            elif path == '/altman':
                result = self.handle_altman(data)
            elif path == '/piotroski':
                result = self.handle_piotroski(data)
            elif path == '/portfolio':
                result = self.handle_portfolio(data)
            else:
                self.send_error_response(404, f"Endpoint not found: {path}")
                return
            
            self.send_json_response(200, result)
            
        except Exception as e:
            self.send_error_response(500, str(e))

    def do_GET(self):
        if self.path == '/health':
            self.send_json_response(200, {"status": "healthy", "service": "math-engine"})
        else:
            self.send_error_response(404, f"Endpoint not found: {self.path}")

    def handle_dcf(self, data: Dict[str, Any]) -> Dict[str, Any]:
        inputs = DCFInputs(**data)
        engine = DCFEngine()
        outputs = engine.calculate(inputs)
        return outputs.model_dump()

    def handle_screening(self, data: Dict[str, Any]) -> Dict[str, Any]:
        criteria = ScreeningCriteria(**data)
        engine = ScreeningEngine()
        # Use mock data for now - in production would fetch from data-ingestion
        from math_engine.mock_data import get_mock_companies
        companies = get_mock_companies()
        results = engine.screen(companies, criteria)
        return {"results": [r.model_dump() for r in results]}

    def handle_relative(self, data: Dict[str, Any]) -> Dict[str, Any]:
        inputs = RelativeValuationInputs(**data)
        engine = RelativeValuationEngine()
        outputs = engine.calculate(inputs)
        return outputs.model_dump()

    def handle_sotp(self, data: Dict[str, Any]) -> Dict[str, Any]:
        inputs = SOTPInputs(**data)
        engine = SOTPEngine()
        outputs = engine.calculate(inputs)
        return outputs.model_dump()

    def handle_banking(self, data: Dict[str, Any]) -> Dict[str, Any]:
        inputs = BankingValuationInputs(**data)
        engine = BankingValuationEngine()
        outputs = engine.calculate(inputs)
        return outputs.model_dump()

    def handle_excess_return(self, data: Dict[str, Any]) -> Dict[str, Any]:
        inputs = ExcessReturnInputs(**data)
        engine = ExcessReturnEngine()
        outputs = engine.calculate(inputs)
        return outputs.model_dump()

    def handle_beneish(self, data: Dict[str, Any]) -> Dict[str, Any]:
        engine = BeneishEngine()
        result = engine.calculate(data)
        return result.model_dump()

    def handle_altman(self, data: Dict[str, Any]) -> Dict[str, Any]:
        engine = AltmanZEngine()
        result = engine.calculate(data)
        return result.model_dump()

    def handle_piotroski(self, data: Dict[str, Any]) -> Dict[str, Any]:
        engine = PiotroskiEngine()
        result = engine.calculate(data)
        return result.model_dump()

    def handle_portfolio(self, data: Dict[str, Any]) -> Dict[str, Any]:
        engine = PortfolioAnalyticsEngine()
        result = engine.analyze(data)
        return result.model_dump()

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


# Vercel expects a handler function
def handler(request, context):
    """Vercel serverless function entry point."""
    # This is a simplified handler - Vercel will adapt the request
    pass


if __name__ == "__main__":
    from http.server import HTTPServer
    port = int(os.environ.get("PORT", 8000))
    server = HTTPServer(("", port), MathEngineHandler)
    print(f"Math Engine running on port {port}")
    server.serve_forever()
