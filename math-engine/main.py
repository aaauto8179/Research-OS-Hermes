"""
Vercel Python entry point for Math Engine Service.
Handles DCF, Screening, and other financial calculations.
"""
import json
import os
import sys

# Vercel deployment: math_engine package is at root level
# Local development: math_engine package is in src/
sys.path.insert(0, os.path.dirname(__file__))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

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
    criteria = ScreeningCriteria(**data)
    engine = ScreeningEngine()
    from math_engine.mock_data import get_mock_companies
    companies = get_mock_companies()
    results = engine.screen(companies, criteria)
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
    engine = BeneishEngine()
    result = engine.calculate(data)
    return JSONResponse(content=result.model_dump())


@app.post("/altman")
async def altman(request: Request):
    data = await request.json()
    engine = AltmanZEngine()
    result = engine.calculate(data)
    return JSONResponse(content=result.model_dump())


@app.post("/piotroski")
async def piotroski(request: Request):
    data = await request.json()
    engine = PiotroskiEngine()
    result = engine.calculate(data)
    return JSONResponse(content=result.model_dump())


@app.post("/portfolio")
async def portfolio(request: Request):
    data = await request.json()
    engine = PortfolioAnalyticsEngine()
    result = engine.analyze(data)
    return JSONResponse(content=result.model_dump())


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
