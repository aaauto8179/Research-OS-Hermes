"""
Vercel Python entry point for Math Engine Service.
Handles DCF, Screening, and other financial calculations.
"""
import json
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from math_engine import (
    DCFEngine, DCFInputs,
    ScreeningEngine, ScreeningCriteria,
    RelativeValuationEngine, RelativeValuationInputs,
    SOTPEngine, SOTPInputs,
    BankingValuationEngine, BankingValuationInputs,
    ExcessReturnEngine, ExcessReturnInputs,
    BeneishEngine, BeneishInputs,
    AltmanZEngine, AltmanZInputs,
    PiotroskiEngine, PiotroskiInputs,
    PortfolioAnalyticsEngine, PortfolioMetricsInputs,
)
from math_engine.portfolio.corporate_actions import CorporateActionsEngine, CorporateAction

app = FastAPI(title="Research OS Math Engine", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "healthy", "service": "math-engine"}


@app.post("/dcf")
async def dcf(request: Request):
    data = await request.json()
    inputs = DCFInputs(**data)
    engine = DCFEngine()
    outputs = engine.calculate(inputs)
    return JSONResponse(content=outputs.model_dump())


@app.post("/screening")
async def screening(request: Request):
    data = await request.json()
    criteria = ScreeningCriteria(**data.get("criteria", {}))
    engine = ScreeningEngine()
    universe = data.get("companies", [])
    results = engine.calculate(universe, criteria)
    return JSONResponse(content={"results": [r.model_dump() for r in results]})


@app.post("/relative")
async def relative(request: Request):
    data = await request.json()
    inputs = RelativeValuationInputs(**data)
    engine = RelativeValuationEngine()
    outputs = engine.calculate(inputs)
    return JSONResponse(content=outputs.model_dump())


@app.post("/sotp")
async def sotp(request: Request):
    data = await request.json()
    inputs = SOTPInputs(**data)
    engine = SOTPEngine()
    outputs = engine.calculate(inputs)
    return JSONResponse(content=outputs.model_dump())


@app.post("/banking")
async def banking(request: Request):
    data = await request.json()
    inputs = BankingValuationInputs(**data)
    engine = BankingValuationEngine()
    outputs = engine.calculate(inputs)
    return JSONResponse(content=outputs.model_dump())


@app.post("/excess-return")
async def excess_return(request: Request):
    data = await request.json()
    inputs = ExcessReturnInputs(**data)
    engine = ExcessReturnEngine()
    outputs = engine.calculate(inputs)
    return JSONResponse(content=outputs.model_dump())


@app.post("/beneish")
async def beneish(request: Request):
    data = await request.json()
    inputs = BeneishInputs(**data)
    engine = BeneishEngine()
    result = engine.calculate(inputs)
    return JSONResponse(content=result.model_dump())


@app.post("/altman")
async def altman(request: Request):
    data = await request.json()
    inputs = AltmanZInputs(**data)
    engine = AltmanZEngine()
    result = engine.calculate(inputs)
    return JSONResponse(content=result.model_dump())


@app.post("/piotroski")
async def piotroski(request: Request):
    data = await request.json()
    inputs = PiotroskiInputs(**data)
    engine = PiotroskiEngine()
    result = engine.calculate(inputs)
    return JSONResponse(content=result.model_dump())


@app.post("/portfolio")
async def portfolio(request: Request):
    data = await request.json()
    inputs = PortfolioMetricsInputs(**data)
    engine = PortfolioAnalyticsEngine()
    result = engine.calculate(inputs)
    return JSONResponse(content=result.model_dump())


@app.post("/corporate-actions")
async def corporate_actions(request: Request):
    data = await request.json()
    engine = CorporateActionsEngine()
    action = CorporateAction(**data.get("action", {}))
    holdings = data.get("holdings", [])
    result = engine.adjust_holdings(holdings, action)
    return JSONResponse(content={"adjusted_holdings": result})


@app.websocket("/ws/prices")
async def websocket_prices(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            import json as _json, random
            symbols = _json.loads(data).get("symbols", [])
            prices = {s: round(random.uniform(100, 5000), 2) for s in symbols}
            await websocket.send_json({"prices": prices, "timestamp": __import__("datetime").datetime.now().isoformat()})
    except WebSocketDisconnect:
        pass


@app.get("/prices")
async def prices(symbols: str = ""):
    import random
    symbol_list = [s.strip() for s in symbols.split(",") if s.strip()]
    price_data = {s: round(random.uniform(100, 5000), 2) for s in symbol_list}
    return JSONResponse(content={"prices": price_data})


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)