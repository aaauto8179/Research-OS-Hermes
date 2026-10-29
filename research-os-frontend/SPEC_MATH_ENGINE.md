# Research OS - Math Engine Specification

## Overview
Deterministic, auditable financial mathematics engine for equity research. Zero-LLM math - all calculations are pure functions with testable inputs/outputs. Built for Indian equity markets with regulatory compliance.

## Design Principles

1. **Deterministic**: Same inputs → Same outputs, always
2. **Auditable**: Every calculation has traceable inputs, formula, and version
3. **Pure Functions**: No side effects, no global state, no randomness
4. **Testable**: Golden vector tests for every function
5. **Extensible**: Plugin architecture for new models
6. **Regulatory Compliant**: SEBI/IndAS compliant calculations

## Architecture

```
math-engine/
├── src/math_engine/
│   ├── __init__.py
│   ├── valuation/
│   │   ├── __init__.py
│   │   ├── dcf.py              # DCF (FCFF, FCFE, Gordon, H-model)
│   │   ├── relative.py         # Comps, precedent transactions
│   │   ├── sotp.py             # Sum-of-the-parts
│   │   ├── banking.py          # P/B-ROE, residual income
│   │   └── excess_return.py    # EVA, residual income
│   ├── forensics/
│   │   ├── __init__.py
│   │   ├── beneish.py          # M-Score
│   │   ├── altman.py           # Z-Score (original, revised, emerging)
│   │   └── piotroski.py        # F-Score
│   ├── portfolio/
│   │   ├── __init__.py
│   │   ├── returns.py          # TWR, MWR, XIRR
│   │   ├── risk.py             # Sharpe, Sortino, Calmar, VaR, CVaR
│   │   ├── attribution.py      # Brinson, factor-based
│   │   └── optimization.py     # Mean-variance, risk parity
│   ├── screening/
│   │   ├── __init__.py
│   │   ├── factors.py          # Factor definitions
│   │   ├── ranking.py          # Ranking algorithms
│   │   └── screening.py        # Multi-factor screening engine
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── interpolation.py    # Linear, log, spline
│   │   ├── statistics.py       # Robust stats, winsorization
│   │   ├── dates.py            # Business day conventions
│   │   └── audit.py            # Calculation audit trail
│   └── constants.py            # Market constants, defaults
├── tests/
│   ├── test_dcf.py
│   ├── test_relative.py
│   ├── test_banking.py
│   ├── test_excess_return.py
│   ├── test_forensics.py
│   ├── test_portfolio.py
│   ├── test_screening.py
│   └── golden_vectors/         # JSON test vectors
└── pyproject.toml
```

## Core Types

```python
from dataclasses import dataclass
from datetime import date
from decimal import Decimal
from typing import Literal, Optional, List, Dict
from enum import Enum

class Frequency(Enum):
    ANNUAL = "annual"
    QUARTERLY = "quarterly"
    MONTHLY = "monthly"
    DAILY = "daily"

class Compounding(Enum):
    CONTINUOUS = "continuous"
    DISCRETE = "discrete"
    SIMPLE = "simple"

@dataclass(frozen=True)
class CashFlow:
    date: date
    amount: Decimal
    currency: str = "INR"
    is_estimated: bool = False

@dataclass(frozen=True)
class FinancialStatement:
    symbol: str
    period_end: date
    frequency: Frequency
    revenue: Optional[Decimal] = None
    ebitda: Optional[Decimal] = None
    ebit: Optional[Decimal] = None
    pat: Optional[Decimal] = None
    total_assets: Optional[Decimal] = None
    equity: Optional[Decimal] = None
    debt: Optional[Decimal] = None
    cash: Optional[Decimal] = None
    cfo: Optional[Decimal] = None
    cfi: Optional[Decimal] = None
    cff: Optional[Decimal] = None
    shares_outstanding: Optional[Decimal] = None
    # ... additional fields

@dataclass(frozen=True)
class ValuationInputs:
    symbol: str
    as_of: date
    statements: List[FinancialStatement]
    assumptions: Dict[str, Decimal]
    model_type: Literal["dcf_fcff", "dcf_fcfe", "gordon", "h_model", "relative", "sotp", "banking_pb_roe", "excess_return"]
```

## DCF Models

### 1. FCFF (Free Cash Flow to Firm)
```python
def dcf_fcff(inputs: ValuationInputs) -> DCFResult:
    """
    FCFF = EBIT * (1 - tax_rate) + D&A - CapEx - ΔNWC
    EV = Σ FCFF_t / (1 + WACC)^t + TV / (1 + WACC)^n
    Equity Value = EV - Net Debt
    """
    
    # 1. Project FCFF
    fcff_projections = project_fcff(
        base_fcff=calculate_base_fcff(inputs.statements[-1]),
        growth_rates=inputs.assumptions["growth_rates"],
        years=inputs.assumptions["projection_years"]
    )
    
    # 2. Calculate WACC
    wacc = calculate_wacc(
        cost_of_equity=inputs.assumptions["cost_of_equity"],
        cost_of_debt=inputs.assumptions["cost_of_debt"],
        tax_rate=inputs.assumptions["tax_rate"],
        debt_to_equity=inputs.assumptions["debt_to_equity"]
    )
    
    # 3. Terminal Value
    if inputs.assumptions["terminal_method"] == "gordon":
        tv = gordon_terminal_value(
            final_fcf=fcff_projections[-1],
            terminal_growth=inputs.assumptions["terminal_growth"],
            wacc=wacc
        )
    elif inputs.assumptions["terminal_method"] == "exit_multiple":
        tv = exit_multiple_terminal_value(
            final_metric=fcff_projections[-1],
            exit_multiple=inputs.assumptions["exit_multiple"],
            wacc=wacc,
            years=inputs.assumptions["projection_years"]
        )
    
    # 4. Discount
    pv_fcff = sum(fcf / (1 + wacc) ** (i+1) for i, fcf in enumerate(fcff_projections))
    pv_tv = tv / (1 + wacc) ** len(fcff_projections)
    
    enterprise_value = pv_fcff + pv_tv
    equity_value = enterprise_value - net_debt
    fair_value_per_share = equity_value / shares_outstanding
    
    return DCFResult(
        enterprise_value=enterprise_value,
        equity_value=equity_value,
        fair_value_per_share=fair_value_per_share,
        wacc=wacc,
        pv_fcff=pv_fcff,
        pv_tv=pv_tv,
        sensitivity=run_sensitivity(fair_value_per_share, inputs.assumptions),
        audit_trail=create_audit_trail(inputs, "dcf_fcff")
    )
```

### 2. Gordon Growth Model
```python
def gordon_growth(inputs: ValuationInputs) -> GordonResult:
    """
    P = D1 / (r - g)  or  P = FCFE1 / (r - g)
    For FCFF: EV = FCFF1 / (WACC - g)
    """
    base_fcff = calculate_base_fcff(inputs.statements[-1])
    terminal_value = base_fcff * (1 + g) / (wacc - g)
    # ... rest similar to DCF
```

### 3. H-Model
```python
def h_model(inputs: ValuationInputs) -> HModelResult:
    """
    Two-stage growth: High growth declining linearly to stable growth
    V0 = D0 * (1+gL)/(r-gL) + D0 * H * (gS - gL) / (r - gL)
    Where H = half-life of high growth period
    """
    # For FCFF adaptation
    v0 = fcff0 * (1+gL)/(wacc-gL) + fcff0 * H * (gS - gL) / (wacc - gL)
```

### 4. Sensitivity Analysis
```python
def run_sensitivity(base_value: Decimal, assumptions: Dict) -> SensitivityMatrix:
    """
    2D sensitivity table: WACC vs Terminal Growth
    """
    wacc_range = [assumptions["wacc"] * (1 + i*0.005) for i in range(-4, 5)]
    growth_range = [assumptions["terminal_growth"] + i*0.0025 for i in range(-4, 5)]
    
    matrix = []
    for w in wacc_range:
        row = []
        for g in growth_range:
            if w <= g:  # Invalid
                row.append(None)
            else:
                value = recalculate_with(wacc=w, terminal_growth=g)
                row.append(value)
        matrix.append(row)
    
    return SensitivityMatrix(
        wacc_range=wacc_range,
        growth_range=growth_range,
        values=matrix,
        base_wacc=assumptions["wacc"],
        base_growth=assumptions["terminal_growth"]
    )
```

## Relative Valuation

### Peer Comps
```python
def relative_valuation(inputs: RelativeInputs) -> RelativeResult:
    """
    1. Select peers (same sector, similar size, geography)
    2. Calculate multiples: P/E, EV/EBITDA, P/B, EV/Sales
    3. Apply to target's metrics
    4. Weight by relevance
    """
    peers = select_peers(
        target_symbol=inputs.target_symbol,
        sector=inputs.sector,
        market_cap_range=inputs.market_cap_range,
        max_peers=inputs.max_peers
    )
    
    multiples = {}
    for peer in peers:
        multiples[peer.symbol] = calculate_multiples(peer)
    
    # Aggregate (median, harmonic mean, weighted)
    implied_values = {}
    for metric in ["pe", "ev_ebitda", "pb", "ev_sales"]:
        peer_values = [m[metric] for m in multiples.values() if m[metric]]
        if peer_values:
            median = median(peer_values)
            implied_values[metric] = median * getattr(target, metric.replace("ev_", "").replace("_", ""))
    
    # Football field
    football_field = FootballField(
        dcf_range=(dcf_low, dcf_high),
        relative_range=(rel_low, rel_high),
        sotp_range=(sotp_low, sotp_high),
        current_price=current_price,
        consensus_target=consensus_target
    )
    
    return RelativeResult(
        implied_values=implied_values,
        peer_multiples=multiples,
        football_field=football_field,
        audit_trail=...
    )
```

### Precedent Transactions
```python
def precedent_transactions(sector: str, lookback_years: int = 3) -> PrecedentResult:
    # Fetch M&A transactions in sector
    # Calculate transaction multiples
    # Adjust for control premium, synergies
```

## SOTP (Sum-of-the-Parts)

```python
def sotp_valuation(inputs: SOTPInputs) -> SOTPResult:
    """
    For conglomerates: Value each segment separately, sum up
    """
    segment_values = []
    for segment in inputs.segments:
        if segment.method == "dcf":
            val = dcf_fcff(segment.inputs)
        elif segment.method == "relative":
            val = relative_valuation(segment.inputs)
        elif segment.method == "multiple":
            val = segment.metric * segment.multiple
        elif segment.method == "book_value":
            val = segment.equity
        
        # Apply holding discount
        discounted = val * (1 - segment.holding_discount)
        segment_values.append(SegmentValue(
            name=segment.name,
            method=segment.method,
            gross_value=val,
            discount=segment.holding_discount,
            net_value=discounted
        ))
    
    total_ev = sum(s.net_value for s in segment_values)
    net_debt = inputs.net_debt
    equity_value = total_ev - net_debt
    
    return SOTPResult(
        segments=segment_values,
        total_ev=total_ev,
        equity_value=equity_value,
        fair_value_per_share=equity_value / shares_outstanding
    )
```

## Banking Valuation

### P/B - ROE Regression
```python
def banking_pb_roe(inputs: BankingInputs) -> BankingResult:
    """
    P/B = a + b * ROE
    For Indian banks: P/B ≈ 0.8 + 8.5 * ROE (calibrated)
    """
    # 1. Peer regression
    peers = get_banking_peers(inputs.target_symbol)
    x = [p.roe for p in peers]
    y = [p.pb for p in peers]
    
    # Robust regression (Huber)
    slope, intercept = huber_regression(x, y)
    
    # Predicted P/B
    predicted_pb = intercept + slope * inputs.target_roe
    
    # Implied price
    implied_price = predicted_pb * inputs.book_value_per_share
    
    # Residual income cross-check
    ri_value = residual_income_valuation(inputs)
    
    return BankingResult(
        predicted_pb=predicted_pb,
        implied_price=implied_price,
        regression_slope=slope,
        regression_intercept=intercept,
        r_squared=r2,
        residual_income_value=ri_value,
        audit_trail=...
    )
```

### Residual Income (Excess Return)
```python
def residual_income_valuation(inputs: ExcessReturnInputs) -> ExcessReturnResult:
    """
    V0 = B0 + Σ (ROE_t - r) * B_{t-1} / (1+r)^t + TV
    Where TV = (ROE_T - r) * B_{T-1} / (r - g)
    """
    book_values = project_book_values(
        b0=inputs.current_book_value,
        roe_forecast=inputs.roe_forecast,
        payout_ratio=inputs.payout_ratio,
        years=inputs.projection_years
    )
    
    pv_ri = sum(
        (roe - cost_of_equity) * b_prev / (1 + cost_of_equity) ** (t+1)
        for t, (roe, b_prev) in enumerate(zip(inputs.roe_forecast, book_values[:-1]))
    )
    
    # Terminal value
    terminal_ri = (inputs.terminal_roe - cost_of_equity) * book_values[-1] / (cost_of_equity - inputs.terminal_growth)
    pv_terminal_ri = terminal_ri / (1 + cost_of_equity) ** inputs.projection_years
    
    equity_value = inputs.current_book_value + pv_ri + pv_terminal_ri
    
    return ExcessReturnResult(
        equity_value=equity_value,
        fair_value_per_share=equity_value / shares_outstanding,
        pv_ri=pv_ri,
        pv_terminal_ri=pv_terminal_ri,
        book_value_path=book_values
    )
```

## Forensics

### Beneish M-Score
```python
def beneish_m_score(statements: List[FinancialStatement]) -> BeneishResult:
    """
    M = -4.84 + 0.92*DSRI + 0.528*GMI + 0.404*AQI + 0.892*SGI + 0.115*DEPI - 0.172*SGAI + 4.679*TATA - 0.327*LVGI
    M > -1.78 → Manipulation likely
    """
    # Calculate 8 variables from financial statements
    dsri = (receivables_t / revenue_t) / (receivables_t-1 / revenue_t-1)
    gmi = (gross_margin_t-1) / (gross_margin_t)
    aqi = (1 - (current_assets_t + ppe_t + securities_t) / total_assets_t) / (1 - (current_assets_t-1 + ppe_t-1 + securities_t-1) / total_assets_t-1)
    sgi = revenue_t / revenue_t-1
    depi = (dep_t-1 / (dep_t-1 + ppe_t-1)) / (dep_t / (dep_t + ppe_t))
    sgai = (sga_t / revenue_t) / (sga_t-1 / revenue_t-1)
    tata = (pat_t - cfo_t) / total_assets_t
    lvgi = (debt_t + equity_t) / (debt_t-1 + equity_t-1)
    
    m_score = -4.84 + 0.92*dsri + 0.528*gmi + 0.404*aqi + 0.892*sgi + 0.115*depi - 0.172*sgai + 4.679*tata - 0.327*lvgi
    
    return BeneishResult(
        m_score=m_score,
        manipulation_likely=m_score > -1.78,
        variables={...}
    )
```

### Altman Z-Score
```python
def altman_z_score(statements: List[FinancialStatement], model: Literal["original", "revised", "emerging"] = "revised") -> AltmanResult:
    """
    Original (public manufacturers): Z = 1.2X1 + 1.4X2 + 3.3X3 + 0.6X4 + 1.0X5
    Revised (private): Z' = 0.717X1 + 0.847X2 + 3.107X3 + 0.420X4 + 0.998X5
    Emerging markets: Z'' = 6.56X1 + 3.26X2 + 6.72X3 + 1.05X4
    """
    x1 = working_capital / total_assets
    x2 = retained_earnings / total_assets
    x3 = ebit / total_assets
    x4 = market_cap / total_liabilities
    x5 = revenue / total_assets
    
    if model == "original":
        z = 1.2*x1 + 1.4*x2 + 3.3*x3 + 0.6*x4 + 1.0*x5
        zones = {"safe": 2.99, "grey": 1.81, "distress": 0}
    elif model == "revised":
        z = 0.717*x1 + 0.847*x2 + 3.107*x3 + 0.420*x4 + 0.998*x5
        zones = {"safe": 2.6, "grey": 1.1, "distress": 0}
    else:
        z = 6.56*x1 + 3.26*x2 + 6.72*x3 + 1.05*x4
        zones = {"safe": 2.6, "grey": 1.1, "distress": 0}
    
    return AltmanResult(z_score=z, zone=..., model=model)
```

### Piotroski F-Score
```python
def piotroski_f_score(statements: List[FinancialStatement]) -> PiotroskiResult:
    """
    9 binary signals across 3 categories:
    Profitability (4): ROA>0, CFO>0, ΔROA>0, CFO>ROA
    Leverage/Liquidity (3): ΔLeverage<0, ΔLiquidity>0, NoEquityIssuance
    Operating Efficiency (2): ΔMargin>0, ΔTurnover>0
    """
    signals = {
        "roa_positive": pat > 0,
        "cfo_positive": cfo > 0,
        "roa_improving": roa_t > roa_t-1,
        "cfo_exceeds_roa": cfo > pat,
        "leverage_decreasing": leverage_t < leverage_t-1,
        "liquidity_increasing": current_ratio_t > current_ratio_t-1,
        "no_dilution": shares_outstanding_t <= shares_outstanding_t-1,
        "margin_improving": gross_margin_t > gross_margin_t-1,
        "turnover_improving": asset_turnover_t > asset_turnover_t-1,
    }
    
    score = sum(signals.values())
    return PiotroskiResult(
        score=score,
        signals=signals,
        category="HIGH" if score >= 7 else "MEDIUM" if score >= 5 else "LOW"
    )
```

## Portfolio Analytics

### Returns
```python
def twr(portfolio_values: List[Tuple[date, Decimal]], cash_flows: List[CashFlow]) -> Decimal:
    """Time-Weighted Return - eliminates cash flow timing impact"""
    sub_periods = split_by_cash_flows(portfolio_values, cash_flows)
    twr = 1
    for start_val, end_val, cf in sub_periods:
        twr *= (end_val - cf) / start_val
    return twr - 1

def xirr(cash_flows: List[CashFlow], guess: float = 0.1) -> Decimal:
    """Extended IRR - handles irregular cash flows"""
    # Newton-Raphson or Brent's method
    def npv(rate):
        return sum(cf.amount / (1 + rate) ** ((cf.date - cash_flows[0].date).days / 365) for cf in cash_flows)
    return brentq(npv, -0.99, 10)
```

### Risk Metrics
```python
def sharpe_ratio(returns: List[Decimal], risk_free: Decimal, frequency: Frequency = Frequency.DAILY) -> Decimal:
    excess = [r - risk_free / freq_factor(frequency) for r in returns]
    return mean(excess) / stdev(excess) * sqrt(freq_factor(frequency))

def sortino_ratio(returns: List[Decimal], risk_free: Decimal, frequency: Frequency = Frequency.DAILY) -> Decimal:
    excess = [r - risk_free / freq_factor(frequency) for r in returns]
    downside = [r for r in excess if r < 0]
    downside_dev = stdev(downside) if downside else Decimal("0")
    return mean(excess) / downside_dev * sqrt(freq_factor(frequency))

def max_drawdown(values: List[Decimal]) -> Decimal:
    peak = values[0]
    max_dd = Decimal("0")
    for v in values:
        if v > peak:
            peak = v
        dd = (peak - v) / peak
        if dd > max_dd:
            max_dd = dd
    return max_dd

def var_cvar(returns: List[Decimal], confidence: float = 0.95) -> Tuple[Decimal, Decimal]:
    sorted_returns = sorted(returns)
    var_idx = int(len(sorted_returns) * (1 - confidence))
    var = abs(sorted_returns[var_idx])
    cvar = abs(sum(sorted_returns[:var_idx]) / var_idx) if var_idx > 0 else var
    return var, cvar
```

### Performance Attribution
```python
def brinson_attribution(
    portfolio_weights: Dict[str, Decimal],
    portfolio_returns: Dict[str, Decimal],
    benchmark_weights: Dict[str, Decimal],
    benchmark_returns: Dict[str, Decimal]
) -> AttributionResult:
    """
    Allocation Effect = Σ (wp - wb) * (rb - rb_total)
    Selection Effect = Σ wb * (rp - rb)
    Interaction Effect = Σ (wp - wb) * (rp - rb)
    """
    all_sectors = set(portfolio_weights) | set(benchmark_weights)
    
    allocation = Decimal("0")
    selection = Decimal("0")
    interaction = Decimal("0")
    
    rb_total = sum(benchmark_weights[s] * benchmark_returns[s] for s in benchmark_weights)
    
    for sector in all_sectors:
        wp = portfolio_weights.get(sector, Decimal("0"))
        wb = benchmark_weights.get(sector, Decimal("0"))
        rp = portfolio_returns.get(sector, Decimal("0"))
        rb = benchmark_returns.get(sector, Decimal("0"))
        
        allocation += (wp - wb) * (rb - rb_total)
        selection += wb * (rp - rb)
        interaction += (wp - wb) * (rp - rb)
    
    return AttributionResult(
        total_active=allocation + selection + interaction,
        allocation=allocation,
        selection=selection,
        interaction=interaction
    )
```

## Screening Engine

### Factor Definitions
```python
@dataclass(frozen=True)
class Factor:
    name: str
    formula: Callable[[FinancialStatement], Optional[Decimal]]
    direction: Literal["higher_better", "lower_better"]
    weight: Decimal
    universe_filter: Optional[Callable] = None

FACTORS = [
    Factor("pe", lambda fs: fs.market_cap / fs.pat if fs.pat else None, "lower_better", Decimal("0.15")),
    Factor("ev_ebitda", lambda fs: (fs.market_cap + fs.debt - fs.cash) / fs.ebitda if fs.ebitda else None, "lower_better", Decimal("0.15")),
    Factor("fcf_yield", lambda fs: fs.cfo / fs.market_cap if fs.cfo and fs.market_cap else None, "higher_better", Decimal("0.10")),
    Factor("roe", lambda fs: fs.pat / fs.equity if fs.equity else None, "higher_better", Decimal("0.15")),
    Factor("roce", lambda fs: fs.ebit / (fs.total_assets - fs.current_liabilities) if fs.total_assets and fs.current_liabilities else None, "higher_better", Decimal("0.10")),
    Factor("debt_equity", lambda fs: fs.debt / fs.equity if fs.equity else None, "lower_better", Decimal("0.10")),
    Factor("f_score", lambda fs: piotroski_f_score(fs.statements).score, "higher_better", Decimal("0.10")),
    Factor("beneish_m", lambda fs: beneish_m_score(fs.statements).m_score, "lower_better", Decimal("0.05")),
    Factor("z_score", lambda fs: altman_z_score(fs.statements).z_score, "higher_better", Decimal("0.05")),
    Factor("momentum_6m", lambda fs: momentum_6m(fs.symbol), "higher_better", Decimal("0.05")),
]
```

### Multi-Factor Screening
```python
def screen_universe(
    universe: List[FinancialStatement],
    criteria: ScreeningCriteria,
    factors: List[Factor] = FACTORS
) -> ScreeningResult:
    """
    1. Apply hard filters (criteria)
    2. Score each factor (percentile rank within universe)
    3. Weight and sum
    4. Rank
    """
    # 1. Hard filters
    filtered = universe
    if criteria.pe_max:
        filtered = [f for f in filtered if f.pe and f.pe <= criteria.pe_max]
    if criteria.roe_min:
        filtered = [f for f in filtered if f.roe and f.roe >= criteria.roe_min]
    # ... other filters
    
    # 2. Score factors
    scores = []
    for company in filtered:
        factor_scores = {}
        for factor in factors:
            value = factor.formula(company)
            if value is not None:
                percentile = percentile_rank(value, [factor.formula(c) for c in filtered if factor.formula(c) is not None], factor.direction)
                factor_scores[factor.name] = percentile * factor.weight
            else:
                factor_scores[factor.name] = Decimal("0")
        
        total_score = sum(factor_scores.values())
        scores.append(ScreeningScore(
            symbol=company.symbol,
            total_score=total_score,
            factor_scores=factor_scores
        ))
    
    # 3. Rank
    scores.sort(key=lambda s: s.total_score, reverse=True)
    for rank, score in enumerate(scores, 1):
        score.rank = rank
    
    return ScreeningResult(
        scores=scores,
        universe_size=len(universe),
        filtered_size=len(filtered),
        criteria=criteria,
        factors_used=[f.name for f in factors]
    )
```

## Golden Vector Tests

### Test Structure
```python
# tests/golden_vectors/test_dcf_vectors.json
{
  "dcf_fcff": [
    {
      "name": "basic_reliance",
      "inputs": {
        "base_fcff": 10000000000,
        "growth_rates": [0.15, 0.12, 0.10, 0.08, 0.06],
        "terminal_growth": 0.04,
        "wacc": 0.105,
        "projection_years": 5,
        "net_debt": 20000000000,
        "shares_outstanding": 6765000000
      },
      "expected": {
        "enterprise_value": 1950000000000,
        "equity_value": 1930000000000,
        "fair_value_per_share": 285.32,
        "wacc": 0.105,
        "pv_fcff": 1450000000000,
        "pv_tv": 500000000000
      },
      "tolerance": 0.001
    }
  ]
}
```

### Test Runner
```python
def test_golden_vectors():
    for test_file in glob("tests/golden_vectors/*.json"):
        with open(test_file) as f:
            vectors = json.load(f)
        
        for test_case in vectors[test_file.stem]:
            result = globals()[test_file.stem](**test_case["inputs"])
            expected = test_case["expected"]
            tolerance = test_case.get("tolerance", 1e-6)
            
            for key, expected_value in expected.items():
                actual = getattr(result, key)
                assert abs(actual - expected_value) / expected_value < tolerance, \
                    f"{test_case['name']}.{key}: {actual} != {expected_value}"
```

## Audit Trail

### Calculation Log
```python
@dataclass(frozen=True)
class CalculationLog:
    calculation_id: str
    model: str
    timestamp: datetime
    inputs_hash: str  # SHA256 of serialized inputs
    inputs: Dict
    outputs: Dict
    steps: List[CalculationStep]
    version: str

@dataclass(frozen=True)
class CalculationStep:
    step_name: str
    formula: str
    inputs: Dict
    output: Any
    timestamp: datetime

def create_audit_trail(inputs: ValuationInputs, model: str) -> CalculationLog:
    inputs_json = json_dumps(inputs, sort_keys=True)
    inputs_hash = sha256(inputs_json.encode()).hexdigest()
    
    return CalculationLog(
        calculation_id=uuid7(),
        model=model,
        timestamp=datetime.utcnow(),
        inputs_hash=inputs_hash,
        inputs=inputs.__dict__,
        outputs={},
        steps=[],
        version=__version__
    )
```

## Indian Market Specifics

### Tax Rates
```python
INDIAN_TAX_RATES = {
    "corporate_base": Decimal("0.25"),      # 25% for turnover < 400Cr
    "corporate_high": Decimal("0.30"),      # 30% for turnover > 400Cr
    "surcharge": Decimal("0.07"),           # 7% on tax
    "cess": Decimal("0.04"),                # 4% health & education cess
    "effective_high": Decimal("0.34944"),   # 30% * 1.07 * 1.04
    "effective_base": Decimal("0.2912"),    # 25% * 1.07 * 1.04
    "mat": Decimal("0.15"),                 # Minimum Alternate Tax
    "dividend_distribution": Decimal("0"),  # Abolished FY21
    "buyback_tax": Decimal("0.20"),         # 20% on buyback
}
```

### Market Conventions
```python
MARKET_CONVENTIONS = {
    "day_count": "ACT/365",
    "business_day": "Mumbai",
    "compounding": "continuous",
    "dividend_yield_basis": "trailing",
    "earnings_basis": "consolidated",
    "currency": "INR",
    "million": 1_000_000,
    "crore": 10_000_000,
    "lakh": 100_000,
}
```

### Regulatory Adjustments
```python
def ind_as_adjustments(statements: List[FinancialStatement]) -> List[FinancialStatement]:
    """
    Apply IndAS adjustments for comparability:
    - Lease accounting (IndAS 116)
    - Revenue recognition (IndAS 115)
    - Financial instruments (IndAS 109)
    - Business combinations (IndAS 103)
    """
    adjusted = []
    for stmt in statements:
        adj = stmt
        # Add lease liabilities to debt
        adj.debt += stmt.lease_liabilities
        # Adjust revenue for IndAS 115
        adj.revenue = stmt.revenue - stmt.contract_liabilities_change
        # Mark-to-market financial instruments
        adj.pat += stmt.fair_value_changes
        adjusted.append(adj)
    return adjusted
```

## Versioning & Backwards Compatibility

```python
__version__ = "1.0.0"

# Model versioning in audit trail
MODEL_VERSIONS = {
    "dcf_fcff": "1.0",
    "relative": "1.0",
    "sotp": "1.0",
    "banking_pb_roe": "1.0",
    "excess_return": "1.0",
    "beneish": "1.0",
    "altman": "1.0",
    "piotroski": "1.0",
}

# Backwards compatibility: old inputs auto-upgraded
def upgrade_inputs(inputs: Dict, model: str) -> ValuationInputs:
    version = inputs.get("_version", "0.9")
    if version == "0.9":
        # Map old field names
        inputs["projection_years"] = inputs.pop("years", 5)
        inputs["terminal_method"] = inputs.get("terminal_method", "gordon")
    return ValuationInputs(**inputs)
```

## Performance Requirements

| Operation | Target | Max |
|-----------|--------|-----|
| DCF (5yr) | < 10ms | 50ms |
| Relative (20 peers) | < 50ms | 200ms |
| SOTP (5 segments) | < 20ms | 100ms |
| Banking PB-ROE | < 10ms | 50ms |
| Screening (500 cos) | < 500ms | 2s |
| Forensics (3 models) | < 5ms | 20ms |
| Portfolio XIRR | < 20ms | 100ms |

## Testing Checklist

- [ ] All golden vectors pass
- [ ] Property-based tests for invariants
- [ ] Edge cases: zero/negative values, missing data
- [ ] Round-trip: inputs → outputs → audit → reconstruct
- [ ] Cross-model consistency (DCF vs Relative vs SOTP)
- [ ] Regulatory compliance (SEBI, IndAS)
- [ ] Performance benchmarks
- [ ] Audit trail completeness