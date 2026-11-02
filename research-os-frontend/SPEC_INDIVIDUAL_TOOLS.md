# Research OS - Individual Tool Specifications

This document contains detailed specifications for each individual financial tool in the Research OS platform.

---

## Table of Contents

1. [DCF Valuation Tool](#1-dcf-valuation-tool)
2. [Relative Valuation Tool](#2-relative-valuation-tool)
3. [SOTP Valuation Tool](#3-sotp-valuation-tool)
4. [Banking P/B-ROE Tool](#4-banking-pb-roe-tool)
5. [Excess Return Tool](#5-excess-return-tool)
6. [Beneish M-Score Tool](#6-beneish-m-score-tool)
7. [Altman Z-Score Tool](#7-altman-z-score-tool)
8. [Piotroski F-Score Tool](#8-piotroski-f-score-tool)
9. [Management Consistency Tracker](#9-management-consistency-tracker)
10. [Revenue Projection Engine](#10-revenue-projection-engine)
11. [Multi-Factor Screening Tool](#11-multi-factor-screening-tool)
12. [Portfolio Analytics Tool](#12-portfolio-analytics-tool)
13. [GRWTH Pipeline Tracker](#13-grwth-pipeline-tracker)
14. [Tasks & Time Tracker](#14-tasks--time-tracker)
15. [Document Intelligence Hub](#15-document-intelligence-hub)
16. [Ratio Analysis Tool](#16-ratio-analysis-tool)
17. [Common Size Statement Tool](#17-common-size-statement-tool)
18. [Turnaround Indicator Tool](#18-turnaround-indicator-tool)
19. [Hedging Mechanism Tool](#19-hedging-mechanism-tool)
20. [Valuation Philosophy Tool](#20-valuation-philosophy-tool)
21. [Industry Regulations Tracker](#21-industry-regulations-tracker)
22. [Industry Cost Driver Tool](#22-industry-cost-driver-tool)

---

## 1. DCF Valuation Tool

### 1.1 Purpose
Deterministic DCF (FCFF) valuation with Gordon growth and exit multiple terminal value methods. Real-time recalculation, sensitivity matrix, and audit trail.

### 1.2 Inputs
| Field | Type | Default | Validation |
|-------|------|---------|------------|
| Revenue (₹Cr) | number | - | > 0 |
| EBITDA Margin (%) | number | - | 0-100 |
| Tax Rate (%) | number | 25.17 | 0-50 |
| D&A % of Revenue | number | - | 0-20 |
| CapEx % of Revenue | number | - | 0-30 |
| ΔNWC % of Revenue | number | - | -10 to 10 |
| WACC (%) | number | 10.5 | 5-20 |
| Terminal Growth (%) | number | 4.0 | 0-8 |
| Projection Years | integer | 5 | 3-10 |
| Terminal Method | enum | gordon | gordon, exit_multiple |
| Exit Multiple (if applicable) | number | 12.0 | 5-25 |
| Net Debt (₹Cr) | number | 0 | any |
| Shares Outstanding (Cr) | number | - | > 0 |

### 1.3 Calculations

#### Free Cash Flow to Firm (FCFF)
```
FCFF = EBIT × (1 - Tax Rate) + D&A - CapEx - ΔNWC
```

#### Terminal Value (Gordon Growth)
```
TV = FCFF_n × (1 + g) / (WACC - g)
```

#### Terminal Value (Exit Multiple)
```
TV = Final Year EBITDA × Exit Multiple
```

#### Enterprise Value
```
EV = Σ(FCFF_t / (1+WACC)^t) + TV / (1+WACC)^n
```

#### Equity Value
```
Equity Value = EV - Net Debt
```

#### Fair Value Per Share
```
FV = Equity Value / Shares Outstanding
```

### 1.4 Outputs
| Output | Description |
|--------|-------------|
| Enterprise Value (₹Cr) | Total firm value |
| Equity Value (₹Cr) | Value to equity holders |
| Fair Value Per Share (₹) | Intrinsic value per share |
| WACC (%) | Weighted average cost of capital |
| PV of FCFF (₹Cr) | Present value of explicit period FCFF |
| PV of Terminal Value (₹Cr) | Present value of terminal value |
| Sensitivity Matrix | 2D table: WACC vs Terminal Growth |

### 1.5 Sensitivity Matrix
- **Rows**: WACC from base ± 2% in 0.5% steps (9 values)
- **Columns**: Terminal Growth from base ± 1% in 0.25% steps (9 values)
- **Cells**: Fair Value Per Share (₹)
- **Highlight**: Base case cell, invalid cells (WACC ≤ g) in red

### 1.6 UI Layout
```
┌─────────────────────────────────────────────────────────────┐
│ DCF Valuation - [SYMBOL]                                    │
├──────────────┬──────────────────────────────────────────────┤
│ INPUTS       │ RESULTS                                       │
│ ┌──────────┐ │ ┌──────────────┐ ┌──────────────┐ ┌────────┐ │
│ │ Revenue  │ │ │ Enterprise   │ │ Equity Value │ │ FV/Share│ │
│ │ EBITDA%  │ │ │ Value (₹Cr)  │ │ (₹Cr)        │ │ (₹)     │ │
│ │ ...      │ │ └──────────────┘ └──────────────┘ └────────┘ │
│ └──────────┘ │ ┌──────────────────────────────────────────┐ │
│ [Recalculate]│ │ SENSITIVITY MATRIX                        │ │
│              │ │ WACC ↓ / Growth →  2.0%  2.25%  2.5% ... │ │
│              │ │ 10.0%         1,245  1,312  1,389 ...    │ │
│              │ │ 10.5%         1,156  1,218  1,289 ...    │ │
│              │ │ ...                                    │ │
│              │ └──────────────────────────────────────────┘ │
│              │ [Audit Trail] [Export CSV] [Save Template]  │
└──────────────┴──────────────────────────────────────────────┘
```

### 1.6 Audit Trail
```json
{
  "calculation_id": "uuid",
  "model": "dcf_fcff",
  "timestamp": "2024-01-15T10:30:00Z",
  "inputs_hash": "sha256",
  "inputs": { ... },
  "outputs": { ... },
  "steps": [
    { "step": "fcff_calculation", "formula": "EBIT*(1-t)+DA-CapEx-dNWC", "inputs": {...}, "output": 1250 },
    { "step": "terminal_value", "formula": "FCFF*(1+g)/(WACC-g)", "inputs": {...}, "output": 45000 },
    { "step": "pv_calculation", "formula": "sum(FCFF/(1+WACC)^t) + TV/(1+WACC)^n", "output": 185000 }
  ],
  "version": "1.0.0"
}
```

---

## 2. Relative Valuation Tool

### 2.1 Purpose
Peer group comparison with multiple multiples (P/E, EV/EBITDA, P/B, EV/Sales). Automatic peer selection, football field chart, and implied valuation range.

### 2.2 Inputs
| Field | Type | Description |
|-------|------|-------------|
| Target Symbol | string | Company to value |
| Peer Universe | enum | Auto / Custom List |
| Sector Filter | string | Sector code |
| Market Cap Range | tuple | Min/Max ₹Cr |
| Max Peers | integer | 5-20 |
| Multiples to Use | multi-select | P/E, EV/EBITDA, P/B, EV/Sales |
| Aggregation Method | enum | Median, Harmonic Mean, Weighted |
| Weighting Scheme | enum | Equal, Market Cap, Inverse Distance |

### 2.3 Peer Selection Logic
```
1. Filter by sector (if specified)
2. Filter by market cap range (if specified)
3. Exclude target company
4. Sort by: Market Cap similarity → Revenue similarity → Geographic proximity
5. Take top N peers
```

### 2.4 Multiple Calculations
| Multiple | Formula |
|----------|---------|
| P/E | Market Cap / PAT |
| EV/EBITDA | (Market Cap + Net Debt) / EBITDA |
| P/B | Market Cap / Book Value |
| EV/Sales | (Market Cap + Net Debt) / Revenue |

### 2.5 Implied Valuation
```
For each multiple:
  Peer Median = median(peer_multiples)
  Implied Value = Peer Median × Target Metric

Weighted Average = Σ(Implied Value_i × Weight_i)
```

### 2.6 Football Field Chart
```
                    ┌─────────────────────────────────────┐
Current Price  ────►│      ████████████                   │
                    │  ████████████████████████████       │
P/E Implied    ────►│  ████████████████                   │
                    │  ████████████████████████████       │
EV/EBITDA      ────►│       ██████████████████████       │
                    │  ████████████████████████████████   │
SOTP Implied   ────►│  ████████████████████████████       │
                    │  ████████████████████████████       │
DCF Range      ────►│  ██████████████████████████████████ │
                    └─────────────────────────────────────┘
                     ₹800    ₹1000    ₹1200    ₹1400
```

### 2.7 UI Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Relative Valuation - [SYMBOL]                               │
├──────────────┬──────────────────────────────────────────────┤
│ PEER SELECTION│ FOOTBALL FIELD                             │
│ ┌────────────┐│                                            │
│ │ Auto/Manual││  [Visual chart as above]                  │
│ │ Sector: ☐  ││                                            │
│ │ Mcap: [ ]  ││  Implied Values:                          │
│ │ Peers: [10]││  P/E: ₹1,245  |  EV/EBITDA: ₹1,312        │
│ │ Multiples: ││  P/B: ₹1,156  |  EV/Sales: ₹1,089         │
│ │ [Search]   ││  Weighted Avg: ₹1,212                      │
│ └────────────┘│                                            │
│ PEER TABLE    │                                            │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ Peer    │ P/E  │ EV/EBITDA │ P/B  │ EV/Sales │ Weight │ │
│ │ RELIANCE│ 22.5 │ 14.2      │ 2.8  │ 3.1      │ 15%    │ │
│ │ ...     │ ...  │ ...       │ ...  │ ...      │ ...    │ │
│ └────────────────────────────────────────────────────────┘ │
└──────────────┴──────────────────────────────────────────────┘
```

---

## 3. SOTP Valuation Tool

### 3.1 Purpose
Sum-of-the-Parts valuation for conglomerates. Each segment valued independently with appropriate method, holding discounts applied.

### 3.2 Inputs
| Field | Type | Description |
|-------|------|-------------|
| Segments | array | Each segment: name, method, inputs, discount |
| Segment Methods | enum | DCF, Relative, Multiple, Book Value |
| Holding Discount | % per segment | 0-50% |
| Net Debt | ₹Cr | Consolidated net debt |
| Shares Outstanding | Cr | Total shares |

### 3.3 Segment Valuation Methods
| Method | Required Inputs |
|--------|-----------------|
| DCF | Revenue, EBITDA%, growth, WACC, terminal |
| Relative | Peer group, multiples |
| Multiple | Metric (EBITDA/Sales), multiple |
| Book Value | Equity book value |

### 3.4 Calculation
```
Segment Gross Value = method(segment_inputs)
Segment Net Value = Gross Value × (1 - Holding Discount)
Total EV = Σ Segment Net Values
Equity Value = Total EV - Net Debt
Fair Value/Share = Equity Value / Shares Outstanding
```

### 3.4 UI Layout
```
┌─────────────────────────────────────────────────────────────┐
│ SOTP Valuation - [SYMBOL]                                   │
├─────────────────────────────────────────────────────────────┤
│ SEGMENTS                                                    │
│ ┌──────┬──────────┬────────┬─────────┬────────┬──────────┐ │
│ │ Name │ Method   │ Gross  │ Discount│ Net    │ % of EV  │ │
│ │ O2C  │ DCF      │ 850,000│ 0%      │ 850,000│ 52%      │ │
│ │ Retail│ Relative │ 420,000│ 10%     │ 378,000│ 23%      │ │
│ │ Jio  │ DCF      │ 580,000│ 15%     │ 493,000│ 25%      │ │
│ │ NewE │ Cost     │ 75,000 │ 20%     │ 60,000 │ 3%       │ │
│ └─────────────────────────────────────────────────────────┘ │
│ TOTAL EV: ₹1,781,000 Cr  |  Net Debt: ₹80,000 Cr            │
│ Equity Value: ₹1,701,000 Cr  |  FV/Share: ₹2,850             │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Banking P/B-ROE Tool

### 4.1 Purpose
Banking-specific valuation using P/B vs ROE regression. Cross-check with residual income model.

### 4.2 Inputs
| Field | Type | Default |
|-------|------|---------|
| Target Symbol | string | - |
| Peer Universe | enum | Auto/Manual |
| Target ROE (%) | number | - |
| Target Book Value/Share | ₹ | - |
| Cost of Equity (%) | number | 13.5 |
| Terminal Growth (%) | number | 5.0 |
| Projection Years | integer | 5 |
| Regression Model | enum | Original/Revised/Emerging |

### 4.2 Regression
```
P/B = α + β × ROE

Indian Banking (calibrated):
  α = 0.8, β = 8.5 (R² ≈ 0.72)
  P/B = 0.8 + 8.5 × ROE
```

### 4.3 Residual Income Cross-Check
```
V0 = B0 + Σ(ROE_t - r) × B_{t-1} / (1+r)^t + TV
TV = (ROE_T - r) × B_{T-1} / (r - g)
```

### 4.3 UI Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Banking Valuation - [SYMBOL]                                │
├──────────────┬──────────────────────────────────────────────┤
│ INPUTS       │ REGRESSION & RESULTS                         │
│ ┌──────────┐ │ ┌──────────────────────────────────────────┐ │
│ │ Target ROE│ │ P/B = 0.8 + 8.5 × ROE                      │ │
│ │ Target BV │ │ R² = 0.72                                  │ │
│ │ CoE (%)   │ │ Predicted P/B: 2.15                        │ │
│ │ ...       │ │ Implied Price: ₹1,245                       │ │
│ └──────────┘ │ ├──────────────────────────────────────────┤ │
│ [Calculate]  │ │ RESIDUAL INCOME                           │ │
│              │ │ RI Value: ₹1,180                          │ │
│              │ │ PV RI: 420  |  PV Terminal: 380          │ │
│              │ │ Book Value: 380  |  Total: 1,180          │ │
│              │ ├──────────────────────────────────────────┤ │
│              │ │ PEER REGRESSION TABLE                     │ │
│              │ │ Peer    │ ROE  │ P/B  │ Pred  │ Residual │ │
│              │ │ HDFCBANK│ 16.2 │ 2.3  │ 2.17  │ +0.13    │ │
│              │ │ ICICI   │ 14.8 │ 2.1  │ 2.05  │ +0.05    │ │
│              │ │ ...     │ ...  │ ...  │ ...   │ ...      │ │
│              │ └──────────────────────────────────────────┘ │
└──────────────┴──────────────────────────────────────────────┘
```

---

## 5. Excess Return Tool

### 5.1 Purpose
Residual Income / EVA valuation. Projects ROE, book value, and residual income. Terminal value on residual income.

### 5.2 Inputs
| Field | Type | Default |
|-------|------|---------|
| Current Book Value/Share | ₹ | - |
| ROE Forecast (array) | %[] | 5 years |
| Payout Ratio (%) | number | 30 |
| Cost of Equity (%) | number | 13.5 |
| Terminal ROE (%) | number | 12.0 |
| Terminal Growth (%) | number | 5.0 |
| Projection Years | integer | 5 |
| Shares Outstanding | Cr | - |

### 5.2 Calculations
```
B_t = B_{t-1} × (1 + ROE_t × (1 - payout))
RI_t = (ROE_t - r) × B_{t-1}
PV(RI_t) = RI_t / (1+r)^t

Terminal RI = (ROE_T - r) × B_{T-1} / (r - g)
PV(Terminal RI) = Terminal RI / (1+r)^T

Equity Value = B_0 + Σ PV(RI_t) + PV(Terminal RI)
```

### 5.3 UI Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Excess Return Valuation - [SYMBOL]                          │
├─────────────────────────────────────────────────────────────┤
│ INPUTS        │ PROJECTION TABLE                            │
│ ┌──────────┐  │ Year │ B_t    │ ROE_t │ RI_t   │ PV(RI_t)  │ │
│ │ B0/Share │  │ 1    │ 145.2  │ 16.2% │ 18.2   │ 16.0      │ │
│ │ ROE Fcst │  │ 2    │ 158.4  │ 15.8% │ 16.8   │ 13.1      │ │
│ │ Payout % │  │ 3    │ 171.2  │ 15.2% │ 15.1   │ 10.4      │ │
│ │ CoE (%)  │  │ 4    │ 182.6  │ 14.8% │ 13.8   │ 8.4       │ │
│ │ Terminal │  │ 5    │ 192.8  │ 14.5% │ 12.9   │ 6.9       │ │
│ └──────────┘  │ TV   │       │ 14.0% │ 245.6  │ 112.4     │ │
│ [Calculate]   └─────────────────────────────────────────────┘ │
│ RESULTS                                                     │
│ ┌──────────────┬──────────────┬──────────────┬────────────┐ │
│ │ Book Value   │ PV of RI     │ PV Terminal  │ Equity Val │ │
│ │ ₹380 Cr      │ ₹48.8 Cr     │ ₹112.4 Cr    │ ₹641 Cr    │ │
│ │ FV/Share: ₹1,245                                        │ │
│ └──────────────┴──────────────┴──────────────┴────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Beneish M-Score Tool

### 6.1 Purpose
Earnings manipulation detection using 8-variable model.

### 6.1 Variables
| Variable | Formula | Interpretation |
|----------|---------|----------------|
| DSRI | (Rec_t/Rev_t) / (Rec_{t-1}/Rev_{t-1}) | Days Sales Receivable Index |
| GMI | GPM_{t-1} / GPM_t | Gross Margin Index |
| AQI | (1 - (CA+PPE+Sec)_t/TA_t) / (1 - (CA+PPE+Sec)_{t-1}/TA_{t-1}) | Asset Quality Index |
| SGI | Rev_t / Rev_{t-1} | Sales Growth Index |
| DEPI | (Dep_{t-1}/(Dep_{t-1}+PPE_{t-1})) / (Dep_t/(Dep_t+PPE_t)) | Depreciation Index |
| SGAI | (SGA_t/Rev_t) / (SGA_{t-1}/Rev_{t-1}) | SG&A Expense Index |
| LVGI | (Debt+Equity)_t / (Debt+Equity)_{t-1} | Leverage Index |
| TATA | (PAT - CFO) / TA | Total Accruals to Total Assets |

### 6.2 Formula
```
M = -4.84 + 0.92×DSRI + 0.528×GMI + 0.404×AQI + 0.892×SGI 
    + 0.115×DEPI - 0.172×SGAI + 4.679×TATA - 0.327×LVGI
```

### 6.2 Interpretation
- **M > -1.78**: Manipulation likely
- **M ≤ -1.78**: No manipulation detected

### 6.3 UI Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Beneish M-Score - [SYMBOL]                                  │
├─────────────────────────────────────────────────────────────┤
│ VARIABLE TABLE        │ RESULT                              │
│ ┌──────┬────────────┐ │ ┌────────────────────────────────┐ │
│ │ Var  │ Value      │ │ │ M-Score: -1.42                  │ │
│ │ DSRI │ 1.05       │ │ │ Status: ⚠️ MANIPULATION LIKELY  │ │
│ │ GMI  │ 1.02       │ │ │ Threshold: -1.78                │ │
│ │ AQI  │ 1.03       │ │ └────────────────────────────────┘ │
│ │ SGI  │ 1.08       │ │ INTERPRETATION                     │
│ │ DEPI │ 0.98       │ │ • DSRI > 1: Receivables growing    │
│ │ SGAI │ 1.01       │ │   faster than revenue              │
│ │ LVGI │ 1.03       │ │ • GMI > 1: Margin deterioration    │
│ │ TATA │ 0.04       │ │ • TATA > 0: Accruals > Cash flow   │
│ └──────┴────────────┘ │ • Recommendation: Deep dive needed │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. Altman Z-Score Tool

### 7.1 Models
| Model | Formula | Zones |
|-------|---------|-------|
| **Original** (Public Mfg) | Z = 1.2X₁ + 1.4X₂ + 3.3X₃ + 0.6X₄ + 1.0X₅ | Safe > 2.99, Grey 1.81-2.99, Distress < 1.81 |
| **Revised** (Private) | Z' = 0.717X₁ + 0.847X₂ + 3.107X₃ + 0.420X₄ + 0.998X₅ | Safe > 2.6, Grey 1.1-2.6, Distress < 1.1 |
| **Emerging Markets** | Z'' = 6.56X₁ + 3.26X₂ + 6.72X₃ + 1.05X₄ | Safe > 2.6, Grey 1.1-2.6, Distress < 1.1 |

### 7.1 Variables
| X | Formula |
|---|---------|
| X₁ | Working Capital / Total Assets |
| X₂ | Retained Earnings / Total Assets |
| X₃ | EBIT / Total Assets |
| X₄ | Market Cap / Total Liabilities |
| X₅ | Revenue / Total Assets |

### 7.2 UI Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Altman Z-Score - [SYMBOL]                                   │
├─────────────────────────────────────────────────────────────┤
│ MODEL: [Original ▼] [Revised] [Emerging]                   │
├─────────────────────────────────────────────────────────────┤
│ VARIABLES          │ Z-SCORE                               │
│ ┌────────────────┐ │ ┌────────────────────────────────────┐ │
│ │ X1 (WC/TA): 0.15│ │ Z-Score: 3.24                       │ │
│ │ X2 (RE/TA): 0.12│ │ Zone: ✅ SAFE ZONE                  │ │
│ │ X3 (EBIT/TA): 0.14│ │ Original: Safe > 2.99             │ │
│ │ X4 (MC/TL): 2.8  │ │ Grey: 1.81-2.99                   │ │
│ │ X5 (Rev/TA): 0.85│ │ Distress: < 1.81                  │ │
│ └────────────────┘ └─────────────────────────────────────┘ │
│ TREND (5 Years)                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 4.2 ┤     ●                                              │ │
│ │ 3.8 ┤   ●                                                │ │
│ │ 3.4 ┤ ●                                                  │ │
│ │ 3.0 ┤●                                                   │ │
│ │ 2.6 ┤                                                    │ │
│ │ 2.2 ┤                                                    │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. Piotroski F-Score Tool

### 8.1 Nine Signals
| Category | Signal | Condition |
|----------|--------|-----------|
| **Profitability (4)** | | |
| | F1: ROA > 0 | PAT > 0 |
| | F2: CFO > 0 | Operating Cash Flow > 0 |
| | F3: ΔROA > 0 | ROA_t > ROA_{t-1} |
| | F4: CFO > ROA | CFO > PAT |
| **Leverage/Liquidity (3)** | | |
| | F5: ΔLeverage < 0 | Debt/Equity_t < Debt/Equity_{t-1} |
| | F6: ΔLiquidity > 0 | Current Ratio_t > Current Ratio_{t-1} |
| | F7: No Dilution | Shares_t ≤ Shares_{t-1} |
| **Operating Efficiency (2)** | | |
| | F8: ΔMargin > 0 | Gross Margin_t > Gross Margin_{t-1} |
| | F9: ΔTurnover > 0 | Asset Turnover_t > Asset Turnover_{t-1} |

### 8.2 Scoring
- **8-9**: High Quality
- **5-7**: Medium Quality
- **0-4**: Low Quality

### 8.2 UI Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Piotroski F-Score - [SYMBOL]                                │
├─────────────────────────────────────────────────────────────┤
│ SCORE: 7/9  │  Category: MEDIUM QUALITY                    │
├─────────────────────────────────────────────────────────────┤
│ PROFITABILITY (4/4)     │ LEVERAGE/LIQUIDITY (2/3)        │
│ ✅ F1: ROA > 0          │ ❌ F5: Leverage Decreasing       │
│ ✅ F2: CFO > 0          │ ✅ F6: Liquidity Increasing      │
│ ✅ F3: ΔROA > 0         │ ✅ F7: No Dilution               │
│ ✅ F4: CFO > ROA        │                                  │
├─────────────────────────────────────────────────────────────┤
│ OPERATING EFFICIENCY (1/2) │ HISTORICAL TREND              │
│ ✅ F8: Margin Improving    │ 9 ┤ ● ● ● ● ●                 │
│ ❌ F9: Turnover Improving  │ 7 ┤   ● ● ●                  │
│                            │ 5 ┤     ● ●                  │
│                            │ 3 ┤       ●                  │
│                            └───────────────────────────────┘
└─────────────────────────────────────────────────────────────┘
```

---

## 9. Management Consistency Tracker

### 9.1 Purpose
Track management guidance vs actual delivery across quarters. Score management credibility.

### 9.1 Inputs
| Field | Type |
|-------|------|
| Quarter | string (e.g., Q4 FY24) |
| Guidance Promised | string |
| Actual Delivered | string |
| Variance | enum: Met/Beat/Missed |
| Reason | string |
| Score (1-5) | integer |

### 9.2 Consistency Score
```
Consistency % = (Met + Beat) / Total × 100
Average Score = Σ Score / Count
```

### 9.2 UI Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Management Consistency Tracker - [SYMBOL]                   │
├─────────────────────────────────────────────────────────────┤
│ OVERALL: 92% Consistency  │  Avg Score: 4.8/5             │
├─────────────────────────────────────────────────────────────┤
│ HISTORY                                                    │
│ ┌──────┬──────────────┬──────────────┬────────┬────┬─────┐ │
│ │ Qtr  │ Guidance     │ Actual       │ Var    │Scr │Reason│ │
│ │ Q4FY24│ O2C $12-14  │ $13.2        │ Met    │ 5  │Crack│ │
│ │ Q3FY24│ Jio ARPU₹180+│ ₹182         │ Met    │ 5  │Tariff│ │
│ │ Q2FY24│ Retail 200/q│ 220          │ Beat   │ 5  │Format│ │
│ │ Q1FY24│ NetDebt Zero│ Achieved     │ Met    │ 5  │Assets│ │
│ └────────────────────────────────────────────────────────┘ │
│ TRENDS                                                     │
│ • 4 quarters: 100% met/beat                                │
│ • Average score improving: 4.5 → 4.8                       │
│ • No misses in 2 years                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 10. Revenue Projection Engine

### 10.1 Purpose
Projects revenue by segment with driver-based assumptions. Links to valuation models.

### 10.1 Inputs
| Field | Type |
|-------|------|
| Segment | string |
| Historical Revenue (5yr) | ₹Cr[] |
| Growth Drivers | array of {driver, impact%, confidence} |
| Market Size | ₹Cr |
| Market Share | % |
| Price/Volume Split | % |

### 10.2 Projection Methods
| Method | Description |
|--------|-------------|
| **Driver-Based** | Revenue = Σ(Driver_i × Impact_i) |
| **Market Share** | Revenue = Market Size × Share |
| **S-Curve** | Penetration = L / (1 + e^(-k(t-t₀))) |
| **Historical Trend** | CAGR / Linear regression |

### 10.2 Outputs
| Output | Description |
|--------|-------------|
| 5-Year Revenue Forecast | By segment, by year |
| EBITDA Projection | Revenue × Margin% |
| Capex Requirement | Revenue × Capex Intensity |
| FCF Projection | EBITDA × (1-t) + DA - CapEx - ΔNWC |

### 10.2 UI Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Revenue Projections - [SYMBOL]                              │
├─────────────────────────────────────────────────────────────┤
│ SEGMENT: [O2C ▼]   │ HISTORICAL & PROJECTED               │
│ ┌────────────────┐ │                                     │
│ │ Driver     │Imp%│ │  8000 ┤           ●●●●●●●●●●●●●     │
│ │ Volume     │ 35%│ │  7000 ┤         ●●●●●●●●●●●●        │
│ │ Price      │ 25%│ │  6000 ┤       ●●●●●●●●●●●           │
│ │ Mix        │ 20%│ │  5000 ┤     ●●●●●●●●●               │
│ │ New Prod   │ 15%│ │  4000 ┤   ●●●●●●●                   │
│ │ Regulatory │  5%│ │  3000 ┤ ●●●●●                       │
│ └────────────────┘ └─────────────────────────────────────┘ │
│ PROJECTION TABLE                                            │
│ ┌──────┬────────┬────────┬────────┬────────┬────────┬─────┐ │
│ │ Seg  │ FY24   │ FY25E  │ FY26E  │ FY27E  │ FY28E │ CAGR│ │
│ │ O2C  │ 5,500  │ 6,200  │ 6,800  │ 7,300  │ 7,600 │ 8.5%│ │
│ │ Retail│ 2,100 │ 2,500  │ 2,900  │ 3,200  │ 3,400 │ 12.4%│ │
│ │ Jio  │ 1,400  │ 1,600  │ 1,900  │ 2,200  │ 2,400 │ 14.3%│ │
│ │ Total│ 9,200  │ 10,300 │ 11,600 │ 12,700 │ 13,400│ 9.8%│ │
│ └──────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 11. Multi-Factor Screening Tool

### 11.1 Factors (10 Standard)
| Factor | Formula | Direction | Weight |
|--------|---------|-----------|--------|
| P/E | Market Cap / PAT | Lower Better | 15% |
| EV/EBITDA | (MC+Debt-Cash)/EBITDA | Lower Better | 15% |
| FCF Yield | CFO / Market Cap | Higher Better | 10% |
| ROE | PAT / Equity | Higher Better | 15% |
| ROCE | EBIT / (TA-CL) | Higher Better | 10% |
| Debt/Equity | Debt / Equity | Lower Better | 10% |
| F-Score | Piotroski | Higher Better | 10% |
| Beneish M | M-Score | Lower Better | 5% |
| Altman Z | Z-Score | Higher Better | 5% |
| Momentum 6M | Price Change | Higher Better | 5% |

### 11.2 Screening Process
```
1. Apply hard filters (criteria)
2. For each factor: calculate percentile rank in universe
3. Score = Σ(percentile × weight)
4. Rank by total score (descending)
```

### 11.2 UI Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Multi-Factor Screening                                      │
├─────────────────────────────────────────────────────────────┤
│ FILTERS                  │ RESULTS                          │
│ ┌─────────────────────┐  │ ┌─────────────────────────────┐ │
│ │ P/E: [ ] - [25]    │  │ │ Rank │ Symbol │ Score │ P/E │ │
│ │ EV/EBITDA: [ ]-[15]│  │ │ 1    │ RELIANCE│ 87.2 │ 22.1│ │
│ │ FCF Yield: [3%] -  │  │ │ 2    │ TCS     │ 84.5 │ 28.4│ │
│ │ ROE: [15%] -       │  │ │ 3    │ HDFCBANK│ 82.1 │ 18.2│ │
│ │ ROCE: [12%] -      │  │ │ ...  │ ...     │ ...  │ ... │ │
│ │ D/E: [ ] - [1.0]   │  │ │ 50   │ SBIN    │ 45.2 │ 12.5│ │
│ │ F-Score: [6] -     │  │ └─────────────────────────────┘ │
│ │ Mkt Cap: [1000]-[ ]│  │ [Export CSV] [Add to Watchlist]  │
│ │ Category: [All ▼]  │  │ [Save Screen] [Load Template]    │
│ └─────────────────────┘  │                                 │
│ [Run Screening]                                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 12. Portfolio Analytics Tool

### 12.1 Metrics
| Metric | Formula |
|--------|---------|
| **TWR** | Π(1 + r_i) - 1 (sub-periods between cash flows) |
| **XIRR** | IRR with actual dates: Σ CF_t / (1+r)^((d_t-d_0)/365) = 0 |
| **Sharpe** | (μ - r_f) / σ × √252 |
| **Sortino** | (μ - r_f) / σ_downside × √252 |
| **Max DD** | max((peak - trough) / peak) |
| **VaR 95%** | 95th percentile of return distribution |
| **CVaR** | Mean of returns below VaR |
| **Beta** | Cov(portfolio, benchmark) / Var(benchmark) |
| **Factor Exposure** | Regression on factors (Market, Size, Value, Momentum) |

### 12.2 UI Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Portfolio Analytics - [Portfolio Name]                      │
├─────────────────────────────────────────────────────────────┤
│ PERFORMANCE METRICS                                         │
│ ┌─────────┬─────────┬─────────┬─────────┬─────────┬────────┐│
│ │ TWR     │ XIRR    │ Sharpe  │ Sortino │ Max DD  │ Beta   ││
│ │ 18.2%   │ 21.4%   │ 1.42    │ 1.89    │ -12.4%  │ 0.92   ││
│ └─────────┴─────────┴─────────┴─────────┴─────────┴────────┘│
│ ATTRIBUTION (Brinson)                                       │
│ ┌────────────┬────────────┬────────────┬──────────────────┐ │
│ │ Effect     │ Allocation │ Selection │ Interaction       │ │
│ │ Value      │ +1.2%      │ +0.8%     │ +0.3%             │ │
│ └────────────┴────────────┴────────────┴──────────────────┘ │
│ HOLDINGS TABLE                                              │
│ ┌────┬──────┬──────┬──────┬──────┬──────┬──────┬──────┐    │
│ │ #  │ Sym  │ Wt%  │ Cost │ Mkt  │ P&L% │ 52W  │ Act  │    │
│ │ 1  │RELI  │ 15.2%│ 2,100│ 2,450│+16.7%│ -8%  │ 🟢   │    │
│ └────┴──────┴──────┴──────┴──────┴──────┴──────┴──────┘    │
│ RISK METRICS                                                │
│ ┌────────┬────────┬────────┬────────┬────────┐             │
│ │ VaR 95%│ CVaR 95%│ Max DD │ Duration│ Corr    │          │
│ │ -3.2%  │ -4.8%   │ -12.4% │ 42 days │ 0.92    │          │
│ └────────┴────────┴────────┴────────┴────────┘             │
└─────────────────────────────────────────────────────────────┘
```

---

## 13. GRWTH Pipeline Tracker

*Detailed in SPEC_GRWTH_PIPELINE.md*

### 13.1 Summary
- **Stages**: 11 (Announced → Commercial)
- **Views**: Kanban / Gantt / Table
- **Revenue Accretion**: S-curve ramp modeling
- **Risk Scoring**: 5-factor model

---

## 14. Tasks & Time Tracker

*Detailed in SPEC_TASKS_TIME_TRACKER.md*

### 14.1 Summary
- **Views**: Kanban / List / Analytics
- **Timer**: Pomodoro (25/5/15) + manual entry
- **Analytics**: Time allocation, workload, efficiency
- **Integration**: Links to companies, documents

---

## 15. Document Intelligence Hub

*Detailed in SPEC_INGESTION_PIPELINE.md*

### 15.1 Summary
- **Sources**: Screener.in, BSE/NSE RSS, Manual upload
- **Classification**: 7 document types
- **Extraction**: Tables → CSV, Text → Chunks
- **PIT Storage**: Versioned, restatement detection
- **RAG**: Vector search + GPT-4o with citations

---

## 16. Ratio Analysis Tool

### 16.1 Purpose
Comprehensive ratio analysis across profitability, leverage, liquidity, efficiency, and valuation dimensions. Multi-year trend analysis with peer benchmarking.

### 16.2 Ratio Categories

| Category | Ratios |
|----------|--------|
| **Profitability** | ROE, ROCE, ROA, Net Margin, EBITDA Margin, Gross Margin, FCF Margin |
| **Leverage** | Debt/Equity, Debt/EBITDA, Interest Coverage, Net Debt/EBITDA |
| **Liquidity** | Current Ratio, Quick Ratio, Cash Ratio, Working Capital Cycle |
| **Efficiency** | Asset Turnover, Inventory Turnover, Receivables Turnover, Payables Turnover |
| **Valuation** | P/E, P/B, EV/EBITDA, EV/Sales, FCF Yield, Dividend Yield |
| **Growth** | Revenue CAGR, EBITDA CAGR, PAT CAGR, EPS CAGR |

### 16.3 Calculations
```python
# Key formulas
ROE = PAT / Avg Equity
ROCE = EBIT / (Total Assets - Current Liabilities)
Debt_EBITDA = Net Debt / EBITDA
Interest_Coverage = EBIT / Interest Expense
Current_Ratio = Current Assets / Current Liabilities
Asset_Turnover = Revenue / Avg Total Assets
```

### 16.4 UI Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Ratio Analysis - [SYMBOL]                                   │
├─────────────────────────────────────────────────────────────┤
│ PERIOD: [5Y ▼]  [Annual ▼]  [Peer Compare: ON ▼]          │
├──────────────┬──────────────┬──────────────┬───────────────┤
│ PROFITABILITY│ LEVERAGE     │ LIQUIDITY    │ EFFICIENCY    │
│ ROE: 22.5%   │ D/E: 0.45    │ Current: 1.8 │ Asset T/O: 1.2│
│ ROCE: 28.1%  │ D/EBITDA: 1.2│ Quick: 1.2   │ Inv T/O: 6.5  │
│ Margin: 15.2%│ Int Cov: 8.5 │ Cash: 0.8    │ Rec T/O: 4.2  │
├──────────────┼──────────────┼──────────────┼───────────────┤
│ VALUATION    │ GROWTH (5Y)  │ PEER RANK    │ TREND CHART   │
│ P/E: 28.5    │ Rev: 15.2%   │ ROE: 75th %  │ [Sparkline]   │
│ EV/EBITDA: 18│ EBITDA: 18.5%│ ROCE: 82nd % │ [5Y trend]    │
│ P/B: 4.2     │ PAT: 22.1%   │ D/E: 35th %  │               │
└──────────────┴──────────────┴──────────────┴───────────────┘
```

### 16.5 Peer Benchmarking
- Percentile rank for each ratio within sector
- Color coding: Green (top quartile), Yellow (middle), Red (bottom quartile)
- Sector median and best-in-class reference lines

---

## 17. Common Size Statement Tool

### 17.1 Purpose
Common-size financial statements (vertical analysis) where every line item is expressed as a percentage of a base figure (Revenue for P&L, Total Assets for Balance Sheet). Enables cross-company and cross-period comparison regardless of scale.

### 17.2 Statement Types

| Statement | Base | Key Outputs |
|-----------|------|-------------|
| **P&L** | Revenue (100%) | COGS%, Gross Margin%, EBITDA%, EBIT%, PAT%, Tax% |
| **Balance Sheet** | Total Assets (100%) | Current Assets%, Fixed Assets%, Equity%, Debt%, Liabilities% |
| **Cash Flow** | Revenue (100%) | CFO%, CFI%, CFF%, FCF% |

### 17.3 Calculations
```python
# P&L Common Size
for item in pl_items:
    common_size[item] = (item_value / revenue) * 100

# Balance Sheet Common Size
for item in bs_items:
    common_size[item] = (item_value / total_assets) * 100

# Trend: Year-over-year change in common-size %
```

### 17.4 UI Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Common Size Statements - [SYMBOL]                           │
├─────────────────────────────────────────────────────────────┤
│ STATEMENT: [P&L ▼]  PERIOD: [5Y]  FORMAT: [% ▼] [₹Cr ▼]   │
├─────────────────────────────────────────────────────────────┤
│ P&L COMMON SIZE (%)                                         │
│ ┌──────────────────┬──────┬──────┬──────┬──────┬──────┬───┐ │
│ │ Item             │ FY20 │ FY21 │ FY22 │ FY23 │ FY24 │Δ% │ │
│ ├──────────────────┼──────┼──────┼──────┼──────┼──────┼───┤ │
│ │ Revenue          │ 100% │ 100% │ 100% │ 100% │ 100% │ - │ │
│ │ COGS             │ 65%  │ 63%  │ 61%  │ 59%  │ 58%  │-7%│ │
│ │ Gross Profit     │ 35%  │ 37%  │ 39%  │ 41%  │ 42%  │+7%│ │
│ │ EBITDA           │ 18%  │ 20%  │ 22%  │ 23%  │ 24%  │+6%│ │
│ │ EBIT             │ 14%  │ 16%  │ 18%  │ 19%  │ 20%  │+6%│ │
│ │ PAT              │ 8%   │ 9%   │ 10%  │ 11%  │ 12%  │+4%│ │
│ └──────────────────┴──────┴──────┴──────┴──────┴──────┴───┘ │
│ BALANCE SHEET COMMON SIZE (%)                               │
│ ┌──────────────────┬──────┬──────┬──────┬──────┬──────┬───┐ │
│ │ Current Assets   │ 45%  │ 48%  │ 50%  │ 52%  │ 53%  │+8%│ │
│ │ Net Fixed Assets │ 55%  │ 52%  │ 50%  │ 48%  │ 47%  │-8%│ │
│ │ Equity           │ 40%  │ 42%  │ 45%  │ 47%  │ 49%  │+9%│ │
│ │ Total Debt       │ 30%  │ 28%  │ 25%  │ 23%  │ 22%  │-8%│ │
│ └──────────────────┴──────┴──────┴──────┴──────┴──────┴───┘ │
│ [Export CSV] [YoY Change Toggle] [Peer Comparison Overlay]  │
└─────────────────────────────────────────────────────────────┘
```

### 17.5 Red Flags
- Rising COGS% + falling Gross Margin% → margin pressure
- Rising Debt% + falling Equity% → leverage risk
- Falling CFO% while PAT% rising → earnings quality concern

---

## 18. Turnaround Indicator Tool

### 18.1 Purpose
Quantitative framework to identify potential turnaround candidates. Scores companies on catalysts, financial improvement signals, and management actions.

### 18.2 Scoring Framework (0-100)

| Pillar | Weight | Signals |
|--------|--------|---------|
| **Financial Inflection** | 35% | ROE improvement > 500bps, Margin expansion, FCF turning positive |
| **Balance Sheet Repair** | 25% | Debt reduction > 20%, Interest coverage > 3x, Asset monetization |
| **Operational Catalysts** | 20% | New capacity, Product launch, Market share gains, Cost program |
| **Management Quality** | 10% | Promoter buying, Credible guidance, Capital allocation discipline |
| **Valuation Support** | 10% | P/B < 1, EV/EBITDA < sector median, Dividend yield > 2% |

### 18.3 Signal Detection
```python
signals = {
    "roe_improvement": (roe_t - roe_t_1) > 5,
    "margin_expansion": (ebitda_margin_t - ebitda_margin_t_1) > 2,
    "debt_reduction": (debt_t / debt_t_1) < 0.8,
    "fcf_turn_positive": fcf_t > 0 and fcf_t_1 < 0,
    "promoter_buying": promoter_holding_t > promoter_holding_t_1,
    "capex_completion": capex_completed_flag,
}
```

### 18.4 UI Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Turnaround Indicator - [SYMBOL]                             │
├─────────────────────────────────────────────────────────────┤
│ SCORE: 72/100  │  Status: 🟡 EARLY STAGE TURNAROUND        │
├─────────────────────────────────────────────────────────────┤
│ PILLAR BREAKDOWN                  │ KEY SIGNALS           │
│ ┌────────────────────────────────┐│ ┌────────────────────┐│
│ │ Financial Inflection: 28/35  ██││ ✅ ROE +620bps YoY   ││
│ │ Balance Sheet Repair: 18/25 ███││ ✅ Debt -22% YoY     ││
│ │ Operational Catalysts: 15/20 ██││ ✅ FCF Turned +ve    ││
│ │ Management Quality: 8/10   ████││ ✅ Promoter Buying   ││
│ │ Valuation Support: 3/10    ███ ││ ❌ P/B > 1           ││
│ └────────────────────────────────┘│ ⚠️ EV/EBITDA High    ││
│ WEIGHTED TOTAL: 72/100            └────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│ TIMELINE                                                     │
│ Q4FY23 ──●──●──●──●──●── Q4FY24                             │
│          Debt  FCF  ROE  Margin  Promoter                   │
│          Red   Red  Red  Red     Red                         │
│                             Green  Green                     │
│ [Deep Dive] [Add to Watchlist] [Set Alert]                  │
└─────────────────────────────────────────────────────────────┘
```

### 18.5 Alert Rules
- Score > 70 + 2+ green signals → "Turnaround Watch"
- Score > 80 + FCF positive → "High Conviction Turnaround"
- Score drops > 15 points → "Turnaround Risk" alert

---

## 19. Hedging Mechanism Tool

### 19.1 Purpose
Portfolio-level and single-stock hedging strategies. Calculate optimal hedge ratios, cost of carry, and downside protection scenarios.

### 19.1 Strategies

| Strategy | Use Case | Instruments |
|----------|----------|-------------|
| **Protective Put** | Single stock downside | Long Put (OTM 5-10%) |
| **Collar** | Hold with capped upside | Long Put + Short Call |
| **Index Hedge** | Portfolio beta hedge | Nifty Futures / Put Spread |
| **Sector Hedge** | Sector concentration | Sector ETF Short / Put |
| **Pairs Hedge** | Relative value | Long/Short peer pair |

### 19.2 Calculations
```python
# Optimal Hedge Ratio (Minimum Variance)
h* = ρ × (σ_stock / σ_index) × (Value_stock / Value_index)

# Protective Put Cost
put_cost = Put_Premium × Lot_Size × Qty

# Collar Payoff
max_loss = (Stock_Price - Put_Strike) + Put_Premium
max_gain = (Call_Strike - Stock_Price) - Call_Premium

# Cost of Carry (Futures)
fair_future = Spot × (1 + r × T/365) - Div_Yield
```

### 19.3 UI Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Hedging Mechanism - [SYMBOL / PORTFOLIO]                    │
├─────────────────────────────────────────────────────────────┤
│ HEDGE TYPE: [Protective Put ▼]  PORTFOLIO BETA: 1.15       │
├─────────────────────────────────────────────────────────────┤
│ SINGLE STOCK HEDGE              │ PORTFOLIO HEDGE          │
│ ┌─────────────────────────────┐ │ ┌─────────────────────┐  │
│ │ Current Price: ₹2,950       │ │ Portfolio Value: ₹2.4Cr│ │
│ │ Put Strike: ₹2,800 (95%)   │ │ Nifty Hedge Ratio: 1.15│ │
│ │ Premium: ₹45 (1.5%)        │ │ Contracts: 12 lots     │ │
│ │ Cost: ₹6,750                │ │ Cost: ₹18,000         │ │
│ │ Max Loss: ₹150 (5.1%)      │ │ Max Portfolio DD: -8%  │ │
│ │ Breakeven: ₹2,845          │ │ Hedge Effectiveness: 85%│ │
│ └─────────────────────────────┘ │ ┌─────────────────────┐  │
│ PAYOFF CHART                    │ │ SCENARIO ANALYSIS   │  │
│ ┌─────────────────────────────┐ │ │ Nifty -10%: +₹2.1L  │  │
│ │ P&L                         │ │ │ Nifty -5%:  +₹0.9L  │  │
│ │     ▲                       │ │ │ Flat:     -₹0.2L   │  │
│ │    / \                      │ │ │ Nifty +5%: -₹1.1L  │  │
│ │   /   \                     │ │ │ Nifty +10%: -₹2.3L │  │
│ │  /     \_______             │ │ └─────────────────────┘  │
│ └─────────────────────────────┘ └─────────────────────────┘ │
│ [Execute Hedge] [Monitor] [Adjust Strikes]                  │
└─────────────────────────────────────────────────────────────┘
```

### 19.4 Risk Metrics
- **Hedge Ratio Effectiveness**: R² of hedged vs unhedged returns
- **Cost as % of Portfolio**: Annualized hedging cost
- **Tail Risk Reduction**: VaR improvement at 95%/99%

---

## 20. Valuation Philosophy Tool

### 20.1 Purpose
Structured framework to document and stress-test the analyst's valuation thesis. Forces explicit assumptions, identifies key value drivers, and enables scenario analysis.

### 20.2 Framework Components

| Component | Description |
|-----------|-------------|
| **Investment Thesis** | 2-3 sentence core thesis |
| **Key Value Drivers** | 3-5 factors that drive >80% of value |
| **Bear/Base/Bull Cases** | Explicit assumptions per case |
| **Margin of Safety** | Required discount to base case |
| **Catalysts & Timeline** | Events that close value gap |
| **Kill Criteria** | Conditions that invalidate thesis |

### 20.3 Scenario Matrix
```json
{
  "bear": {
    "probability": 0.25,
    "revenue_cagr": 5,
    "ebitda_margin": 18,
    "wacc": 13,
    "terminal_growth": 3,
    "fair_value": 850
  },
  "base": {
    "probability": 0.50,
    "revenue_cagr": 12,
    "ebitda_margin": 22,
    "wacc": 11,
    "terminal_growth": 4,
    "fair_value": 1250
  },
  "bull": {
    "probability": 0.25,
    "revenue_cagr": 18,
    "ebitda_margin": 25,
    "wacc": 10,
    "terminal_growth": 5,
    "fair_value": 1850
  }
}
```

### 20.4 UI Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Valuation Philosophy - [SYMBOL]                             │
├─────────────────────────────────────────────────────────────┤
│ THESIS: "Market leader in structural growth market,         │
│         pricing power + operating leverage = 25% EPS CAGR"  │
├─────────────────────────────────────────────────────────────┤
│ KEY VALUE DRIVERS (80% of value)                           │
│ 1. Volume growth in core segment (35%)                     │
│ 2. Margin expansion from mix shift (25%)                   │
│ 3. FCF conversion > 80% (20%)                              │
│ 4. Capital allocation optionality (20%)                    │
├─────────────────────────────────────────────────────────────┤
│ SCENARIO ANALYSIS                      │ EXPECTED VALUE    │
│ ┌────────┬──────────────────────────┐ │ EV = Σ(P × FV)     │
│ │ Case   │ FV   │ Prob │ Key Deltas │ │ = 0.25×850         │
│ ├────────┼──────┼──────┼────────────┤ │    +0.50×1250      │
│ │ Bear   │ 850  │ 25%  │ Rev -40%,  │ │    +0.25×1850      │
│ │        │      │      │ Margin -4% │ │ = ₹1,238            │
│ │ Base   │ 1250 │ 50%  │ As guided  │ │                     │
│ │ Bull   │ 1850 │ 25% │ Rev +30%,  │ │ MOS vs CMP: +38%   │
│ │        │      │      │ Margin +3% │ │                     │
│ └────────┴──────┴──────┴────────────┘ └─────────────────────┘
├─────────────────────────────────────────────────────────────┤
│ CATALYSTS & TIMELINE                │ KILL CRITERIA        │
│ Q2FY25: Capacity online (Mar 25)   │ ✗ Volume decline 2Q  │
│ Q3FY25: New product launch (Jun 25)│ ✗ Margin < 18%       │
│ Q4FY25: FCF inflection (Sep 25)    │ ✗ Capex overrun >20% │
│                                     │ ✗ Promoter selling   │
├─────────────────────────────────────────────────────────────┤
│ SENSITIVITY TO KEY DRIVERS                              │
│ Driver      │ -10%   │ -5%   │ Base │ +5%  │ +10%  │
│ Volume      │ 1,080  │ 1,165 │ 1,250│ 1,335│ 1,420 │
│ Margin      │ 1,120  │ 1,185 │ 1,250│ 1,315│ 1,380 │
│ WACC        │ 1,420  │ 1,330 │ 1,250│ 1,175│ 1,105 │
└─────────────────────────────────────────────────────────────┘
```

---

## 21. Industry Regulations Tracker

### 21.1 Purpose
Track regulatory changes, policy announcements, and compliance requirements affecting an industry. Maps regulation to company impact.

### 21.2 Data Model

| Field | Type |
|-------|------|
| Regulation Name | string |
| Authority | enum: Central/State/Regulator/Court |
| Status | enum: Draft/Enacted/Amended/Repealed |
| Effective Date | date |
| Industry Impact | enum: High/Medium/Low |
| Company Impact | enum: Positive/Neutral/Negative |
| Key Provisions | text |
| Compliance Deadline | date |
| Source Link | url |

### 21.3 UI Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Industry Regulations - [INDUSTRY]                           │
├─────────────────────────────────────────────────────────────┤
│ FILTERS: [Status ▼] [Authority ▼] [Impact ▼] [Search...]  │
├─────────────────────────────────────────────────────────────┤
│ REGULATION TIMELINE                                         │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Date       │ Regulation              │ Auth │ Impact    │ │
│ ├────────────┼─────────────────────────┼──────┼───────────┤ │
│ │ 2024-11-15 │ New Emission Norms BS7  │ MoRTH│ High ⚠️   │ │
│ │ 2024-10-20 │ PLI Scheme 2.0 Auto     │ DPIIT│ Pos ✅    │ │
│ │ 2024-09-01 │ Scrappage Policy        │ MoRTH│ Med ⚠️    │ │
│ │ 2024-07-15 │ FAME III Subsidies      │ DHI  │ Pos ✅    │ │
│ └────────────┴─────────────────────────┴──────┴───────────┘ │
├─────────────────────────────────────────────────────────────┤
│ COMPANY IMPACT MATRIX                                       │
│ ┌────────────┬─────────┬─────────┬─────────┬─────────┐     │
│ │ Company    │ BS7     │ PLI 2.0 │ Scrap   │ FAME III│     │
│ ├────────────┼─────────┼─────────┼─────────┼─────────┤     │
│ │ TATAMOTORS │ ⚠️ Cost │ ✅ Ben   │ ✅ Benef│ ✅ Benef│     │
│ │ M&M        │ ⚠️ Cost │ ✅ Ben   │ ⚠️ Mix  │ ✅ Benef│     │
│ │ BAJAJ AUTO │ ⚠️ Cost │ ⚠️ 2W    │ ⚠️ Mix  │ ⚠️ 2W   │     │
│ │ TVS MOTOR  │ ⚠️ Cost │ ⚠️ 2W    │ ⚠️ Mix  │ ⚠️ 2W   │     │
│ └────────────┴─────────┴─────────┴─────────┴─────────┘     │
│ [Add Regulation] [Set Alerts] [Export]                      │
└─────────────────────────────────────────────────────────────┘
```

### 21.4 Alert Rules
- New draft regulation → "Regulatory Watch"
- Status change to Enacted → "Compliance Deadline Alert" (90/60/30 days)
- Negative impact on watchlist company → "Portfolio Risk Alert"

---

## 22. Industry Cost Driver Tool

### 22.1 Purpose
Decompose industry cost structure by major input categories. Track cost inflation, substitution trends, and company-level cost advantages.

### 22.1 Cost Categories

| Category | Examples | Tracking |
|----------|----------|----------|
| **Raw Materials** | Steel, Aluminum, Crude, Chemicals | LME/MCX indices, Contract vs Spot |
| **Energy** | Power, Fuel, Gas | Exchange rates, Policy rates |
| **Logistics** | Freight, Rail, Port charges | Diesel index, Toll rates |
| **Labor** | Wages, Contractor costs | Minimum wage, PLFS data |
| **Finance** | Interest, Working capital | MCLR, Repo rate, T-bill |
| **Regulatory** | Duties, Taxes, Cess | Budget announcements |

### 22.2 Calculations
```python
# Cost Share
cost_share = category_cost / total_cogs

# Cost Inflation YoY
cost_inflation = (cost_t / cost_t_1 - 1) * 100

# Pass-through Ability
pass_through = (price_change / cost_change) * 100

# Company vs Industry
cost_advantage = industry_avg_cost - company_cost
```

### 22.3 UI Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Industry Cost Drivers - [INDUSTRY]                          │
├─────────────────────────────────────────────────────────────┤
│ PERIOD: [FY24]  VIEW: [Share % ▼] [Inflation ▼] [Trend ▼] │
├─────────────────────────────────────────────────────────────┤
│ COST STRUCTURE (Industry Avg)           │ COMPANY COMPARISON │
│ ┌──────────────┬──────┬──────┬────────┐ │ ┌────────────────┐ │
│ │ Category     │ Share│ YoY% │ Trend │ │ │ Company │ Cost% │ │
│ ├──────────────┼──────┼──────┼────────┤ │ ├────────────────┤ │
│ │ Raw Material │ 55%  │ +12% │ ████▲  │ │ │ TATAMOTORS│ 52% │ │
│ │ Steel        │ 28%  │ +15% │ ████▲  │ │ │ M&M       │ 58% │ │
│ │ Aluminum     │ 12%  │ +8%  │ ██▲    │ │ │ BAJAJ     │ 48% │ │
│ │ Chemicals    │ 15%  │ +10% │ ███▲   │ │ │ Industry  │ 55% │ │
│ │ Energy       │ 18%  │ +5%  │ ██▲    │ │ └────────────────┘ │
│ │ Power        │ 10%  │ +3%  │ █▲     │ │ PASS-THROUGH     │ │
│ │ Fuel         │ 8%   │ +8%  │ ██▲    │ │ Steel: 85%       │ │
│ │ Logistics    │ 12%  │ +6%  │ ██▲    │ │ Aluminum: 70%    │ │
│ │ Labor        │ 8%   │ +7%  │ ██▲    │ │ Chemicals: 60%   │ │
│ │ Finance      │ 5%   │ -2%  │ █▼     │ │ Energy: 40%      │ │
│ │ Other        │ 2%   │ +3%  │ █▲     │ └──────────────────┘ │
│ └──────────────┴──────┴──────┴────────┘ │ COST ADVANTAGE   │
│ [Input Price Indices] [Substitution Tracker] │ TATA vs Ind: -3%│
└─────────────────────────────────────────────────────────────┘
```

### 22.4 Substitution Tracker
- Alternative materials (e.g., Aluminum → Composites)
- Process changes (e.g., Coal → Gas)
- Technology adoption (e.g., EV → Lower maintenance)

---

## 📐 Implementation Standards

### Code Quality
- **TypeScript strict mode** enabled
- **Zod schemas** for all inputs/outputs
- **Golden vector tests** for every calculation
- **Audit trail** on every calculation

### UI/UX Standards
- **Responsive**: Mobile-first, breakpoints at 640/768/1024/1280
- **Dark mode**: Full support via CSS variables
- **Accessibility**: ARIA labels, keyboard nav, focus visible
- **Performance**: Code splitting, lazy loading, SWR caching

### Data Contracts
All tools share types from `src/lib/types.ts`:
```typescript
// Core entities shared across tools
interface CompanySnapshot { ... }
interface FinancialStatement { ... }
interface ValuationInputs { ... }
interface ValuationResult { ... }
interface ScreeningCriteria { ... }
interface ScreeningResult { ... }
interface CapexProject { ... }
interface ResearchTask { ... }
interface DocumentMetadata { ... }
```

### Testing Requirements
| Layer | Tool | Coverage |
|-------|------|----------|
| Math Engine | pytest + golden vectors | 100% |
| Frontend | Vitest + RTL | 80% components |
| Integration | Playwright | Critical paths |
| Ingestion | pytest + golden PDFs | 90% extraction |

---

## 📁 File Inventory
```
research-os-frontend/
├── SPEC_*.md (7 specs)
├── src/
│   ├── app/ (15 pages)
│   ├── components/
│   │   ├── ui/ (13 Radix primitives + metric-card)
│   │   ├── DashboardCanvas.tsx
│   │   ├── CompanyTabs.tsx
│   │   └── grwth/ (ProjectCard, MilestoneTimeline, etc.)
│   ├── lib/
│   │   ├── workspace-store.ts (Zustand + persist)
│   │   ├── types.ts (shared types)
│   │   └── mock-data.ts
│   └── hooks/
│
├── math-engine/
│   ├── src/math_engine/
│   │   ├── valuation/ (dcf, relative, sotp, banking, excess_return)
│   │   ├── forensics/ (beneish, altman, piotroski)
│   │   ├── portfolio/ (returns, risk, attribution)
│   │   ├── screening/ (factors, ranking, engine)
│   │   └── utils/ (interpolation, stats, dates, audit)
│   └── tests/ (36 golden vectors)
│
├── data-ingestion/
│   ├── src/data_ingestion/
│   │   ├── sources/, classifiers/, extractors/, storage/, pipeline/
│   └── tests/
│
└── docker-compose.yml
```

---

*Generated as part of Research OS specification-driven development. Each tool spec is a contract between product, engineering, and QA.*