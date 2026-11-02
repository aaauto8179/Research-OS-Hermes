# Ratio Analysis Engine Specification

**Tool Name:** Ratio Analysis Engine  
**Category:** Analysis Engines  
**Sheet:** Company Page → Analysis  
**Spec Version:** 2.0.0  
**Status:** 🔄 Under Revision (Post-Audit)  
**Owner:** Quant Team  
**Last Updated:** 2026-11-02

---

## 1. Purpose & Scope

### 1.1 What this tool does
Computes 40+ fundamental ratios across Profitability, Leverage, Liquidity, Efficiency, Valuation, and Growth categories. Supports both Commercial Corporates (Ind AS Schedule III Division II) and Financial Institutions (Banks/NBFCs per Division III). Provides peer percentile benchmarking, DuPont decomposition, and forensic flagging for negative denominators/distressed financials.

### 1.2 What this tool does NOT do
- Does not make investment recommendations
- Does not replace auditor-certified financial statements
- Does not compute forward estimates (see Revenue Projection Engine)

---

## 2. Excel Source Reference

| Field | Value |
|-------|-------|
| Sheet | Company Page |
| Category | Analysis → Ratio Analysis |
| Tool | Ratio Analysis |
| Description | Automated ratio computation with peer benchmarking and forensic guardrails |
| Data Source | Financial Statements Engine + Peer Database |
| Sample Link | — |

---

## 3. Calculations & Logic

### 3.1 Entity Type Branching (Mandatory)

All ratio computations MUST branch on `entityType`:

```typescript
type EntityType = 'COMMERCIAL_CORPORATE' | 'BANKING' | 'NBFC' | 'INSURANCE';
```

| Entity Type | Applicable Ratios | Disabled/Replaced Ratios |
|-------------|-------------------|--------------------------|
| **COMMERCIAL_CORPORATE** | All standard ratios (40+) | Banking-specific ratios return `NOT_APPLICABLE` |
| **BANKING** / **NBFC** | NIM, Cost-to-Income, GNPA%, NNPA%, PCR, CRAR (Tier 1/2), CASA%, RoA, Advances/Deposits, Liquidity Coverage Ratio | EBITDA, Gross Margin, Inventory/Receivables/Payables Turnover, Debt/EBITDA, Asset Turnover → `NOT_APPLICABLE` |
| **INSURANCE** | Solvency Ratio, Combined Ratio, Expense Ratio, Persistency, VNB Margin | Standard corporate ratios → `NOT_APPLICABLE` |

### 3.2 Ratio Categories & Formulas (Complete)

#### A. Profitability Ratios

| Ratio | Formula | Guardrails |
|-------|---------|------------|
| **ROE** | `PAT / Avg_Equity` | Return `NM` if `Avg_Equity ≤ 0` (Negative Net Worth = Distress) |
| **ROCE** | `EBIT / (Total_Assets - Current_Liabilities)` | Return `NM` if `Capital_Employed ≤ 0` |
| **ROA** | `PAT / Avg_Total_Assets` | Return `NM` if `Total_Assets ≤ 0` |
| **Net Margin** | `PAT / Revenue` | Return `NM` if `Revenue ≤ 0` |
| **EBITDA Margin** | `EBITDA / Revenue` | Return `NM` if `Revenue ≤ 0` |
| **Gross Margin** | `(Revenue - COGS) / Revenue` | Return `NM` if `Revenue ≤ 0`. IT/Services: `COGS = Employee_Exp + Subcontracting` |
| **FCF Margin** | `FCFF / Revenue` | Return `NM` if `Revenue ≤ 0` |
| **RoA (Banking)** | `PAT / Avg_Total_Assets` | Standard |
| **NIM (Banking)** | `(Interest_Income - Interest_Expense) / Avg_Earning_Assets` | Return `NM` if `Earning_Assets ≤ 0` |
| **Cost-to-Income (Banking)** | `Operating_Expense / (Net_Interest_Income + Non_Interest_Income)` | Return `NM` if denominator ≤ 0 |

#### B. Leverage Ratios

| Ratio | Formula | Guardrails |
|-------|---------|------------|
| **Debt/Equity** | `Total_Debt / Total_Equity` | Return `NM` if `Total_Equity ≤ 0`. If `Net_Debt < 0` → `NET_CASH` |
| **Debt/EBITDA** | `Net_Debt / EBITDA` | Return `NM` if `EBITDA ≤ 0` (Operational Distress). If `Net_Debt < 0` → `NET_CASH` |
| **Interest Coverage** | `EBIT / Interest_Expense` | Return `INFINITY` if `Interest_Expense = 0` and `EBIT > 0` (Debt-Free). Return `NM` if `EBIT ≤ 0` |
| **Net Debt/EBITDA** | `(Borrowings + Lease_Liabilities - Cash_Investments) / EBITDA` | Same as Debt/EBITDA |
| **Capital Adequacy (Banking)** | `Tier1_Capital / Risk_Weighted_Assets` | Per RBI Basel III norms |
| **Leverage Ratio (Banking)** | `Tier1_Capital / Total_Exposure` | Per RBI Basel III (≥ 3.5%) |

#### C. Liquidity Ratios

| Ratio | Formula | Guardrails |
|-------|---------|------------|
| **Current Ratio** | `Current_Assets / Current_Liabilities` | Return `NM` if `Current_Liabilities = 0` |
| **Quick Ratio** | `(Current_Assets - Inventory) / Current_Liabilities` | Same |
| **Cash Ratio** | `Cash_Equivalents / Current_Liabilities` | Same |
| **Working Capital Cycle** | `Inventory_Days + Receivable_Days - Payable_Days` | Each component: `Inventory_Days = (Avg_Inventory / COGS) * 365` (guard COGS=0) |
| **LCR (Banking)** | `High_Quality_Liquid_Assets / Total_Net_Cash_Outflows_30d` | Per RBI ≥ 100% |
| **NSFR (Banking)** | `Available_Stable_Funding / Required_Stable_Funding` | Per RBI ≥ 100% |

#### D. Efficiency Ratios

| Ratio | Formula | Guardrails |
|-------|---------|------------|
| **Asset Turnover** | `Revenue / Avg_Total_Assets` | Return `NM` if `Total_Assets ≤ 0` |
| **Inventory Turnover** | `COGS / Avg_Inventory` | Return `NM` if `Inventory = 0` or `COGS ≤ 0` |
| **Receivables Turnover** | `Revenue / Avg_Receivables` | Return `NM` if `Receivables = 0` |
| **Payables Turnover** | `COGS / Avg_Payables` | Return `NM` if `Payables = 0` |
| **Fixed Asset Turnover** | `Revenue / Avg_Net_Fixed_Assets` | Return `NM` if `Fixed_Assets ≤ 0` |

#### E. Valuation Ratios

| Ratio | Formula | Guardrails |
|-------|---------|------------|
| **P/E** | `Market_Cap / PAT` OR `CMP / EPS` | Return `NM` if `PAT ≤ 0` or `EPS ≤ 0` (Loss-Making) |
| **P/B** | `Market_Cap / Net_Worth` | Return `NM` if `Net_Worth ≤ 0` |
| **EV/EBITDA** | `Enterprise_Value / EBITDA` | Return `NM` if `EBITDA ≤ 0` |
| **EV/Sales** | `Enterprise_Value / Revenue` | Return `NM` if `Revenue ≤ 0` |
| **FCF Yield** | `FCFF / Market_Cap` | Return `NM` if `Market_Cap ≤ 0` |
| **Dividend Yield** | `Dividend_Per_Share / CMP` | Return `NM` if `CMP = 0` |

#### F. Growth Ratios (CAGR)

| Ratio | Formula | Guardrails |
|-------|---------|------------|
| **Revenue CAGR** | `(Revenue_T / Revenue_0)^(1/n) - 1` | Return `NM` if `Revenue_0 ≤ 0` (negative base) |
| **EBITDA CAGR** | `(EBITDA_T / EBITDA_0)^(1/n) - 1` | Return `NM` if `EBITDA_0 ≤ 0` |
| **PAT CAGR** | `(PAT_T / PAT_0)^(1/n) - 1` | Return `NM` if `PAT_0 ≤ 0` |
| **EPS CAGR** | `(EPS_T / EPS_0)^(1/n) - 1` | Return `NM` if `EPS_0 ≤ 0` |

---

### 3.3 DuPont Decomposition (Mandatory)

```python
def dupont_decomposition(pat: float, revenue: float, total_assets: float, equity: float):
    """
    ROE = Net Margin × Asset Turnover × Financial Leverage
    ROE = (PAT/Revenue) × (Revenue/Total_Assets) × (Total_Assets/Equity)
    """
    if equity <= 0:
        return {"status": "NM", "reason": "Negative Equity"}
    
    net_margin = pat / revenue if revenue != 0 else None
    asset_turnover = revenue / total_assets if total_assets != 0 else None
    financial_leverage = total_assets / equity if equity != 0 else None
    
    if None in [net_margin, asset_turnover, financial_leverage]:
        return {"status": "NM", "reason": "Zero denominator in DuPont"}
    
    roe = net_margin * asset_turnover * financial_leverage
    return {
        "roe": roe,
        "net_margin": net_margin,
        "asset_turnover": asset_turnover,
        "financial_leverage": financial_leverage,
        "extended_5_step": {
            "tax_burden": None,        # PAT / EBT
            "interest_burden": None,   # EBT / EBIT
            "ebit_margin": None,       # EBIT / Revenue
            "asset_turnover": asset_turnover,
            "financial_leverage": financial_leverage
        }
    }
```

**Extended 5-Step DuPont (when EBT, EBIT available):**
```
ROE = (PAT/EBT) × (EBT/EBIT) × (EBIT/Revenue) × (Revenue/Assets) × (Assets/Equity)
    = Tax Burden × Interest Burden × EBIT Margin × Asset Turnover × Financial Leverage
```

---

### 3.4 Peer Benchmarking & Percentile Logic

```python
def compute_percentile_rank(value: float, peer_values: list[float], lower_is_better: bool = False) -> float:
    """
    Percentile rank: % of peers with value <= this company's value
    For 'lower_is_better' ratios (P/E, EV/EBITDA, D/E, M-Score):
        - Invert: 100 - percentile_rank
    """
    valid_peers = [v for v in peer_values if v is not None and not math.isnan(v)]
    if not valid_peers:
        return 50.0  # No peers
    
    rank = sum(1 for v in valid_peers if v <= value) / len(valid_peers) * 100
    
    if lower_is_better:
        rank = 100 - rank
    
    return round(rank, 1)

# Factors requiring inversion (lower_is_better = True):
LOWER_BETTER_FACTORS = {
    'PE', 'EV_EBITDA', 'EV_SALES', 'PB', 'DEBT_EQUITY', 
    'DEBT_EBITDA', 'BENEISH_M_SCORE', 'ALTMAN_Z_SCORE_DISTRESS'
}
```

**Harmonic Mean for Valuation Multiples (P/E, EV/EBITDA):**
```python
def harmonic_mean(values: list[float]) -> float:
    positive_values = [v for v in values if v > 0]
    if not positive_values:
        return None
    return len(positive_values) / sum(1/v for v in positive_values)
```

---

### 3.5 Edge Case & Distress Classification Matrix

| Condition | Ratios Affected | Output | UI Flag |
|-----------|-----------------|--------|---------|
| `Total_Equity ≤ 0` | ROE, P/B, D/E, ROCE | `NM` (Not Meaningful) | 🔴 **Negative Net Worth — Distress** |
| `EBITDA ≤ 0` | Debt/EBITDA, EV/EBITDA, Interest Coverage, FCF Margin | `NM` | 🔴 **Operational Distress** |
| `Interest_Expense = 0` | Interest Coverage | `INFINITY` | 🟢 **Debt-Free** |
| `Net_Debt < 0` | D/E, Debt/EBITDA, Net Debt/EBITDA | `NET_CASH` | 🟢 **Net Cash Position** |
| `Revenue ≤ 0` | All margins, turnover, EV/Sales | `NM` | 🔴 **Zero/Pre-Revenue** |
| `Total_Assets ≤ 0` | ROA, Asset Turnover, ROCE | `NM` | 🔴 **Invalid Balance Sheet** |
| `EBIT ≤ 0` | Interest Coverage, ROCE | `NM` | 🟡 **EBIT Loss** |
| `PAT ≤ 0` | P/E, ROE, Net Margin, PAT CAGR | `NM` / `LOSS_MAKING` | 🔴 **Loss-Making** |
| `EPS ≤ 0` | P/E, EPS CAGR | `NM` | 🔴 **Negative EPS** |
| `Total_Liabilities = 0` | Current/Quick/Cash Ratio | `INFINITY` | 🟢 **No Current Liabilities** |

**Loss-Making Peer Handling:**
- Exclude from peer median/harmonic mean calculations for P/E, EV/EBITDA
- Assign `LOSS_MAKING` flag with percentile = 0 for valuation multiples
- Include in leverage/liquidity peer sets (if solvent)

---

### 3.6 Data Contracts (TypeScript/Python)

```typescript
// Input
interface RatioAnalysisInput {
  symbol: string;
  entityType: 'COMMERCIAL_CORPORATE' | 'BANKING' | 'NBFC' | 'INSURANCE';
  financials: {
    // P&L
    revenue: number;
    cogs: number;
    ebitda: number;
    ebit: number;
    pat: number;
    interest_expense: number;
    tax_expense: number;
    // Balance Sheet
    total_assets: number;
    current_assets: number;
    cash_investments: number;
    inventory: number;
    receivables: number;
    total_equity: number;
    total_debt: number;           // Borrowings
    lease_liabilities: number;
    current_liabilities: number;
    payables: number;
    // Market
    market_cap: number;
    cmp: number;
    shares_outstanding: number;
    // Cash Flow
    cfo: number;
    capex: number;
    // Banking Specific
    interest_income?: number;
    non_interest_income?: number;
    operating_expense?: number;
    gross_npa?: number;
    net_npa?: number;
    tier1_capital?: number;
    risk_weighted_assets?: number;
    advances?: number;
    deposits?: number;
  };
  // Peer data for benchmarking
  peer_data?: {
    symbol: string;
    ratios: Record<string, number>;
  }[];
}

// Output
interface RatioAnalysisOutput {
  symbol: string;
  entityType: string;
  ratios: {
    profitability: RatioOutput[];
    leverage: RatioOutput[];
    liquidity: RatioOutput[];
    efficiency: RatioOutput[];
    valuation: RatioOutput[];
    growth: RatioOutput[];
    banking?: RatioOutput[];      // Only for BANKING/NBFC
    dupont: DuPontOutput;
  };
  peerBenchmarking: {
    metric: string;
    value: number;
    percentile: number;
    sectorMedian: number;
    bestInClass: number;
    lowerIsBetter: boolean;
  }[];
  distressFlags: DistressFlag[];
  computedAt: string;
}

interface RatioOutput {
  name: string;
  value: number | 'NM' | 'INFINITY' | 'NET_CASH' | 'LOSS_MAKING';
  unit: 'ratio' | 'pct' | 'times' | 'x';
  description: string;
  lowerIsBetter?: boolean;
}

interface DuPontOutput {
  status: 'COMPUTED' | 'NM';
  roe?: number;
  netMargin?: number;
  assetTurnover?: number;
  financialLeverage?: number;
  extended?: {
    taxBurden?: number;
    interestBurden?: number;
    ebitMargin?: number;
  };
  reason?: string;
}

interface DistressFlag {
  type: 'NEGATIVE_NET_WORTH' | 'OPERATIONAL_DISTRESS' | 'LOSS_MAKING' | 
        'NEGATIVE_EPS' | 'HIGH_LEVERAGE' | 'LOW_INTEREST_COVERAGE' | 'NEGATIVE_EQUITY';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO';
  message: string;
  affectedRatios: string[];
}
```

---

## 4. Golden Vector Tests (Expanded: 36 Vectors)

| # | Test Case | Company | Entity Type | Key Assertions |
|---|-----------|---------|-------------|----------------|
| 1 | Standard Corporate | RELIANCE FY24 | COMMERCIAL | ROE=22.5%, D/E=0.45, ROCE=18.2% |
| 2 | IT Services | TCS FY24 | COMMERCIAL | ROE=42.3%, D/E=0.01, Gross Margin IT formula |
| 3 | Banking | HDFCBANK FY24 | BANKING | NIM=3.8%, GNPA=1.2%, PCR=75%, RoA=1.7% |
| 4 | Auto Turnaround | TATAMOTORS FY24 | COMMERCIAL | ROE=8.2%, D/E=1.85, Interest Coverage=2.3x |
| 5 | **Negative Net Worth** | DISTRESSED_CO | COMMERCIAL | ROE=NM, P/B=NM, D/E=NM, flag=NEGATIVE_NET_WORTH |
| 6 | **Loss-Making** | LOSS_CO FY24 | COMMERCIAL | P/E=NM, ROE=NM, PAT CAGR=NM, flag=LOSS_MAKING |
| 7 | **EBITDA Negative** | EBITDA_LOSS | COMMERCIAL | D/EBITDA=NM, EV/EBITDA=NM, Interest Cov=NM |
| 8 | **Debt-Free** | DEBT_FREE_CO | COMMERCIAL | Interest Coverage=INFINITY, D/E=0, flag=DEBT_FREE |
| 9 | **Net Cash** | CASH_RICH_CO | COMMERCIAL | D/E=NET_CASH, Debt/EBITDA=NET_CASH |
| 10 | **Zero Revenue** | PRE_REVENUE | COMMERCIAL | All margins=NM, flag=ZERO_REVENUE |
| 11 | **Banking NPA** | BANK_HIGH_NPA | BANKING | GNPA%=5.2%, PCR=45%, CRAR=14.2% |
| 12 | **Loss-Making Bank** | BANK_LOSS | BANKING | RoA=NM, NIM computed, PCR=NM |
| 13 | **DuPont Standard** | RELIANCE FY24 | COMMERCIAL | 3-step + 5-step match ROE |
| 14 | **DuPont Negative Equity** | DISTRESSED_CO | COMMERCIAL | DuPont=NM, reason="Negative Equity" |
| 15 | **Peer Percentile Normal** | RELIANCE | COMMERCIAL | P/E percentile=65, inverted for lower-better |
| 16 | **Peer Percentile Loss-Maker** | LOSS_CO | COMMERCIAL | P/E=LOSS_MAKING, excluded from harmonic mean |
| 17 | **Harmonic Mean P/E** | Sector Peers | COMMERCIAL | Harmonic mean excludes negative |
| 18 | **Interest Coverage Zero Debt** | DEBT_FREE_CO | COMMERCIAL | Interest Coverage=INFINITY |
| 19 | **Working Capital Cycle** | MFG_CO | COMMERCIAL | Inv Days + Rec Days - Pay Days |
| 20 | **IT Services Gross Margin** | TCS | COMMERCIAL | COGS = Emp Exp + Subcontracting |
| 21 | **Negative Base CAGR** | TURNAROUND_CO | COMMERCIAL | PAT CAGR=NM (negative base) |
| 22 | **D/E Negative Equity** | DISTRESSED_CO | COMMERCIAL | D/E=NM (not negative ratio) |
| 23 | **P/B Negative Net Worth** | DISTRESSED_CO | COMMERCIAL | P/B=NM |
| 24 | **FCF Yield Loss-Making** | LOSS_CO | COMMERCIAL | FCF Yield=NM |
| 25 | **Dividend Yield Zero Price** | DELISTED_CO | COMMERCIAL | Div Yield=NM |
| 26 | **Banking Cost-to-Income** | HDFCBANK | BANKING | C/I ratio = OpEx/(NII+NonIntInc) |
| 27 | **Banking LCR/NSFR** | HDFCBANK | BANKING | LCR≥100%, NSFR≥100% |
| 28 | **Insurance Solvency** | INSURANCE_CO | INSURANCE | Solvency ratio ≥ 1.5 |
| 29 | **Leverage Ratio Banking** | HDFCBANK | BANKING | Tier1/Exposure ≥ 3.5% |
| 30 | **Zero Current Liabilities** | NO_CL_CO | COMMERCIAL | Current Ratio=INFINITY |
| 31 | **Zero Inventory** | SERVICE_CO | COMMERCIAL | Inv Turnover=NM |
| 32 | **Zero Receivables** | CASH_BUSINESS | COMMERCIAL | Rec Turnover=NM |
| 33 | **Zero Payables** | ADVANCE_PAY | COMMERCIAL | Pay Turnover=INFINITY |
| 34 | **Zero COGS** | NO_COGS_CO | COMMERCIAL | Gross Margin=NM, Inv Turn=NM |
| 35 | **Extended DuPont** | RELIANCE FY24 | COMMERCIAL | 5-step decomposition valid |
| 36 | **Comprehensive Distress** | MULTI_DISTRESS | COMMERCIAL | Multiple flags triggered correctly |

---

## 5. Implementation Architecture

### 5.1 Backend (Python FastAPI) — `services/finance-engine/src/finance_engine/analysis/ratio_analysis.py`

```python
from pydantic import BaseModel, field_validator
from typing import Optional, Literal
from decimal import Decimal, getcontext
import math

getcontext().prec = 28  # High precision for currency

class RatioEngine:
    """Deterministic, pure-function ratio computation with guardrails."""
    
    @staticmethod
    def safe_divide(numerator: float, denominator: float, 
                    zero_denom_result: str = 'NM',
                    neg_denom_result: str = 'NM') -> float | str:
        """Centralized division with guardrails."""
        if denominator == 0:
            return zero_denom_result
        if denominator < 0:
            return neg_denom_result
        return numerator / denominator
    
    @staticmethod
    def compute_roe(pat: float, avg_equity: float) -> float | str:
        if avg_equity <= 0:
            return 'NM'  # Negative Net Worth
        return pat / avg_equity
    
    @staticmethod
    def compute_debt_ebitda(net_debt: float, ebitda: float) -> float | str:
        if ebitda <= 0:
            return 'NM'  # Operational Distress
        if net_debt < 0:
            return 'NET_CASH'
        return net_debt / ebitda
    
    # ... all other ratio methods with identical guardrail patterns

    @staticmethod
    def compute_all(input: RatioAnalysisInput) -> RatioAnalysisOutput:
        # Branch on entityType
        if input.entityType in ('BANKING', 'NBFC'):
            return RatioEngine._compute_banking(input)
        elif input.entityType == 'INSURANCE':
            return RatioEngine._compute_insurance(input)
        else:
            return RatioEngine._compute_corporate(input)
```

### 5.2 Frontend (React) — `apps/web/src/components/company/analysis/RatioAnalysis.tsx`

- **State**: Loading → Data → Error/Empty/Zero-Revenue/Loss-Making
- **Display**: Ratio cards with percentile badges (Green >75, Yellow 25-75, Red <25)
- **DuPont**: Interactive 3-step + 5-step waterfall visualization
- **Distress Flags**: Red banner for CRITICAL, Amber for HIGH, Info for MEDIUM
- **Entity Toggle**: Visible entity type badge with auto-detect from financials

---

## 6. API Contract

```typescript
// POST /api/analysis/ratio
interface RatioAnalysisRequest {
  symbol: string;
  entityType?: 'COMMERCIAL_CORPORATE' | 'BANKING' | 'NBFC' | 'INSURANCE';
  // Auto-detected from financials if not provided
}

// Response: RatioAnalysisOutput (see Section 3.6)
```

---

## 7. Compliance Mapping

| Ratio | Ind AS / Schedule III | SEBI / RBI |
|-------|----------------------|------------|
| Revenue Recognition | Ind AS 115 | SEBI LODR Reg 33 |
| Lease Capitalization | Ind AS 116 (ROU Asset, Lease Liability) | — |
| Financial Instruments | Ind AS 109 (ECL, FVOCI, FVPL) | — |
| Segment Reporting | Ind AS 108 | SEBI LODR Reg 33 |
| NPA Classification | — | RBI Master Directions |
| Capital Adequacy | — | Basel III / RBI |
| Related Party Transactions | Ind AS 24 | SEBI LODR Reg 23 |
| Capital Gains | — | IT Act Sec 111A/112A (Finance Act 2024) |

---

## 8. Performance & Quality Standards

| Metric | Target |
|--------|--------|
| **Computation Time** | < 5ms for full 40-ratio set |
| **Precision** | Decimal28 / Float64, drift < 1e-10 |
| **Golden Vectors** | 36/36 passing |
| **Edge Case Coverage** | 12 distress scenarios |
| **Property Tests** | 1000+ iterations (commutativity, bounds) |
| **Regulatory Tests** | SEBI/Ind AS/RBI test suites passing |
| **API Latency** | < 50ms p99 |

---

## 9. Implementation Status

| Component | Status |
|-----------|--------|
| Spec (this file) | 🔄 **Updated Post-Audit v2.0** |
| Backend Engine | 🔄 **Needs Revision** (add guardrails, banking branch, DuPont, distress flags) |
| API Endpoint | 🔄 **Needs Update** (new response schema) |
| Golden Vectors | 🔄 **Expand to 36** (add 32 edge cases) |
| Frontend Widget | ⏳ Pending |
| Integration Tests | ⏳ Pending |
| Documentation | ⏳ Pending |

---

## 10. Changelog (v2.0 - Post Audit)

- **Added**: Mandatory entityType branching (Commercial vs Banking vs NBFC vs Insurance)
- **Added**: Comprehensive guardrails for all negative/zero denominator cases
- **Added**: Distress classification matrix with UI flags
- **Added**: Mandatory DuPont decomposition (3-step + 5-step)
- **Added**: Peer percentile inversion for "lower-is-better" factors
- **Added**: Harmonic mean for valuation multiples
- **Added**: Loss-maker exclusion from peer medians
- **Added**: Banking/NBFC ratio set (NIM, PCR, CRAR, CASA, LCR, NSFR)
- **Added**: Net Cash / Net Debt / Debt-Free special outputs
- **Expanded**: Golden vectors from 4 to 36 (32 edge cases)
- **Fixed**: ROE negative equity inversion, Debt/EBITDA operational distress, P/E loss-maker handling

---

*Spec Version: 2.0.0 | Post-Audit Revision | Implementation Required*