# Multidisciplinary Audit & Actionable Recommendations: Macro Page Specifications

**Target Directory:** `specs/macro-page/` (2 Specifications)  
**Audit Category:** Macroeconomic Indicators, Monetary Policy & Indian Market Microstructure  
**Auditor Archetype:** Teamwork Industry & Macro Specialist (`teamwork_worker`)  
**Date of Audit:** 2026-11-02  
**Status:** COMPLETE & ACTIONABLE  
**Output Reference:** Hermes Implementation Roadmap — Category 5  

---

## 1. Executive Summary & Category Audit Overview

The `specs/macro-page/` category comprises 2 critical specification files designed to give fundamental equity analysts and institutional portfolio managers a continuous macroeconomic and market microstructure cockpit:
1. `specs/macro-page/macro-dashboard.md`: High-level macroeconomic monitoring dashboard spanning sovereign yields, monetary transmission, economic indicators, and commodity cycles.
2. `specs/macro-page/market-metrics.md`: Real-time trading-hours market metrics widget tracking equity benchmarks, market breadth, volatility, sector rotation, and institutional (FII/DII) cash market flows.

### 1.1 Category Inventory Audited

| # | Spec File | Tool / Component Title | Primary Lenses Evaluated | Audit Verdict |
|---|---|---|---|---|
| 1 | `macro-dashboard.md` | Macro Dashboard Master Page | RBI Monetary Corridor, CCIL Yield Curve, CPI/WPI Inflation, Data Plumbing | Major Overhaul Required (Corridor & Multi-Tier Cache) |
| 2 | `market-metrics.md` | Indian Market Metrics Live Widget | Market Microstructure, Institutional Data Frequency, SEBI Halts, Breadth Math | Critical Refactoring (FII/DII Schedule & Circuit States) |

### 1.2 Summary of Critical Mathematical & Domain Defects Identified

1. **Outdated RBI Monetary Policy Architecture (`macro-dashboard.md`):** The spec tracks "Repo Rate" alone and references obsolete reverse repo conventions. Since April 2022, the Reserve Bank of India operates an asymmetric Liquidity Adjustment Facility (LAF) corridor: Standing Deposit Facility (SDF, 6.25%) as the uncollateralized floor, Policy Repo (6.50%), and Marginal Standing Facility (MSF, 6.75%) as the ceiling.
2. **Omission of Banking System Liquidity (`macro-dashboard.md`):** The spec completely ignores Net LAF Systemic Liquidity (Deficit/Surplus in ₹ Lakh Cr). Net liquidity is the primary intraday driver of short-term money market rates (TREPS, Call Money WACR, Commercial Paper, and Bank CD rates).
3. **Factual Failure Regarding FII / DII Flow Frequency (`market-metrics.md`):** The spec specifies FII/DII data updating every "15 min (intraday)". In the Indian equity market, NSE, BSE, NSDL, and CDSL do *not* provide intraday 15-minute cash market flows. Provisional data is released once daily between 16:30 and 17:00 IST; final depository settlement data is published between 18:00 and 20:30 IST. Polling every 15 minutes intraday produces 404 errors or stale previous-day numbers.
4. **Inflation Disaggregation Failure & Corporate Margin Spread (`macro-dashboard.md`):** Tracking headline CPI alone is inadequate in India, where Food & Beverages accounts for ~45.86% of the index. Analysts track Core CPI (ex-food & fuel) to assess demand persistence. Furthermore, the divergence between CPI and WPI (Wholesale Price Index) represents the macro driver of corporate gross margins ($\text{Margin Spread} = \text{CPI} - \text{WPI}$).
5. **Incomplete Market State Machine (`market-metrics.md`):** The status enum `'OPEN' | 'CLOSED' | 'PRE_OPEN' | 'POST_CLOSE'` ignores SEBI-mandated Index Circuit Breaker halts (10%, 15%, 20% triggers with cooling periods and 15-minute pre-open discovery re-openings), as well as pre-open session phases (09:00 - 09:08 order collection, 09:08 - 09:12 matching, 09:12 - 09:15 buffer).
6. **Monolithic API & Cache Churn Anti-Pattern (`macro-dashboard.md`):** Lumping quarterly GDP, monthly CPI, daily G-Sec yields, and 15-second stock ticks into a single monolithic API response (`MacroDashboardData`) violates performance and caching best practices.

---

## 2. In-Depth Specification Audits & Actionable Recommendations

```
================================================================================
SPECIFICATION 1 OF 2: macro-dashboard.md
================================================================================
```

### 1. Target Spec File Path & Title
- **File Path:** `specs/macro-page/macro-dashboard.md`
- **Title:** Macro Page Tool Specification (Master Dashboard)

### 2. Lenses Evaluated & Core Critique
- **Economic Knowledge & RBI Monetary Policy Framework:**
  - The spec represents the interest rate environment as a single scalar `"Repo Rate: 6.50%"`.
  - In India, monetary transmission operates through the **RBI LAF Corridor**:
    - **SDF (Standing Deposit Facility):** Floor rate at $\text{Repo} - 25\text{ bps} = 6.25\%$ (Introduced April 2022; replaces fixed reverse repo which is dormant at 3.35%).
    - **Policy Repo Rate:** $6.50\%$.
    - **MSF (Marginal Standing Facility):** Ceiling rate at $\text{Repo} + 25\text{ bps} = 6.75\%$.
    - **Reserve Ratios:** CRR ($4.50\%$) and SLR ($18.00\%$).
    - **Net Systemic Liquidity (LAF Net Position in ₹ Lakh Cr):** When banking liquidity is in deficit (e.g., $-\text{₹1.5 Lakh Cr}$ due to advance tax outflows or festive currency leakages), the Weighted Average Call Rate (WACR) trades near or above the MSF ceiling. When systemic liquidity is in surplus, WACR gravitates to SDF. Tracking net liquidity is vital for forecasting commercial bank NIMs and treasury yields.
- **Inflation Dynamics (CPI vs. Core CPI vs. WPI):**
  - Indian headline CPI is volatile due to high food weightage (Food & Beverages 45.86%), subject to seasonal monsoon and vegetable spikes (Tomato-Onion-Potato TOP cycles).
  - Equity analysts require **Core CPI** (CPI excluding Food & Beverages and Fuel & Light, weight ~47.30%) to gauge underlying demand inflation.
  - **CPI vs WPI Margin Spread:** WPI (Wholesale Price Index) has a 64.23% weight in manufactured products and 13.15% in fuel. When commodity prices crash, WPI can turn negative while CPI remains elevated. This divergence ($\text{CPI} - \text{WPI}$) directly predicts corporate gross margin expansion.
- **Sovereign Yield Curve & Credit Risk Spreads:**
  - Needs CCIL NDS-OM 10Y Benchmark G-Sec yield tracking (current on-the-run benchmark bond).
  - Yield curve term spreads: $2\text{Y}-10\text{Y}$ spread and $91\text{-day T-Bill to } 10\text{Y}$ spread. A flattening or inverted curve signals credit tightening.
  - Corporate bond credit spreads: AAA Corporate PSU Bond vs 10Y G-Sec spread, and AA- vs AAA credit spread.
- **External Sector Stability:**
  - Foreign exchange reserves (US$ Billion) and Import Cover (months of imports).
  - Current Account Deficit (CAD as % of GDP) and Trade Balance (Merchandise Deficit vs Services Surplus).
- **Data Plumbing & Caching Anti-Pattern:**
  - The spec defines a single monolithic API response (`MacroDashboardData`) combining quarterly GDP with 15-second delayed stock index data. This leads to high cache churn and API latency.

### 3. Actionable Replacements

#### 3.1 Indian Monetary Transmission & Liquidity Corridor Engine
Replace the single Repo rate widget with the full RBI Monetary Policy Corridor:

$$\text{SDF Rate} = \text{Policy Repo} - 0.25\% \quad (\text{LAF Floor})$$

$$\text{MSF Rate} = \text{Policy Repo} + 0.25\% \quad (\text{LAF Ceiling})$$

$$\text{WACR Position} = \frac{\text{WACR} - \text{SDF}}{\text{MSF} - \text{SDF}} \quad \in [0.0, 1.0] \quad (\text{Money Market Stress Indicator})$$

- **Net Systemic Liquidity Formulation:**
  $$\text{NetSystemicLiquidity} = \text{SDF Absorption} + \text{Variable Reverse Repo (VRR)} - \text{MSF Borrowing} - \text{Repo Injections}$$
  - $\text{NetLiquidity} > 0$: Banking system is in surplus $\implies$ downward pressure on short-term rates.
  - $\text{NetLiquidity} < 0$: Banking system is in deficit $\implies$ upward pressure on Treasury Bills, CPs, and bank CD rates.

#### 3.2 Inflation Dual-Basket & Macro Margin Spread Engine
Formulate the Macro Corporate Margin Spread:

$$\text{MacroMarginSpread}_t = \text{CPI Headline YoY}_t - \text{WPI Headline YoY}_t$$

$$\text{CoreCPI}_t = \frac{\sum_{i \notin \{\text{Food, Fuel}\}} w_i \cdot \text{Index}_{i, t}}{\sum_{i \notin \{\text{Food, Fuel}\}} w_i}$$

- **Analytical Interpretation:**
  - $\text{MacroMarginSpread} > +300\text{ bps}$: **Exceptional Gross Margin Tailwind** for Indian manufacturing (Raw material input costs falling faster than consumer prices).
  - $\text{MacroMarginSpread} < 0$: **Cost-Push Margin Squeeze** (Input costs inflating faster than end-product pricing power).

#### 3.3 Sovereign Yield Curve & Credit Spread Architecture
Formulate the CCIL Yield Curve Spreads:

$$\text{TermSpread}_{10\text{Y}-2\text{Y}} = \text{Yield}_{10\text{Y G-Sec}} - \text{Yield}_{2\text{Y G-Sec}}$$

$$\text{AAA Corporate Credit Spread} = \text{Yield}_{10\text{Y AAA PSU Bond}} - \text{Yield}_{10\text{Y G-Sec Benchmark}}$$

$$\text{Credit Risk Appetite Spread} = \text{Yield}_{10\text{Y AA- Corporate}} - \text{Yield}_{10\text{Y AAA Corporate}}$$

#### 3.4 UI/UX Layout Replacement: Institutional Macro Cockpit
Redesign the dashboard into a high-density, modular workbench:

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│ MACRO MONITOR | RBI Policy Stance: NEUTRAL | Banking Liquidity: DEFICIT (-₹1.2L Cr) | CAD: 1.2% │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ROW 1: MONETARY POLICY CORRIDOR & MONEY MARKET (RBI DBIE / CCIL)                                │
│ ┌──────────────────────┐ ┌──────────────────────┐ ┌──────────────────────┐ ┌──────────────────┐ │
│ │ Policy Repo Rate     │ │ SDF / MSF Corridor   │ │ Systemic Liquidity   │ │ WACR Overnight   │ │
│ │ 6.50%                │ │ 6.25% - 6.75%        │ │ -₹1,24,500 Cr        │ │ 6.68%            │ │
│ │ Stance: Neutral      │ │ Spread: 50 bps       │ │ Status: Deficit (▼)  │ │ Target: Repo+18bp│ │
│ └──────────────────────┘ └──────────────────────┘ └──────────────────────┘ └──────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ROW 2: INFLATION & MARGIN SPREAD (MOSPI Releases)                                               │
│ ┌──────────────────────┐ ┌──────────────────────┐ ┌──────────────────────┐ ┌──────────────────┐ │
│ │ CPI Headline (YoY)   │ │ Core CPI (ex Food/Fl)│ │ WPI Headline (YoY)   │ │ Macro Margin Sprd│ │
│ │ 5.42% (Food: 7.8%)   │ │ 3.40%                │ │ 1.84%                │ │ +3.58% (+358bps) │ │
│ │ [Sparkline 12M]      │ │ [Sparkline 12M]      │ │ [Sparkline 12M]      │ │ [Tailwind Regime]│ │
│ └──────────────────────┘ └──────────────────────┘ └──────────────────────┘ └──────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ROW 3: SOVEREIGN DEBT YIELD CURVE & CREDIT SPREADS (CCIL NDS-OM)                                │
│ ┌─────────────────────────────────────────────────────────────┐ ┌─────────────────────────────┐ │
│ │ G-SEC BENCHMARK YIELD CURVE (CCIL)                          │ │ CREDIT RISK SPREADS         │ │
│ │ • 91D T-Bill: 6.85%   • 2Y G-Sec:  7.02%                    │ │ • 10Y AAA Spread: +55 bps   │ │
│ │ • 5Y G-Sec:   7.08%   • 10Y G-Sec: 7.15% (7.18% GS 2033)    │ │ • AA- Credit Spread: +165 bp│ │
│ │ • Term Spread (10Y - 2Y): +13 bps (Normal Curve)            │ │ • US-India 10Y:   +275 bps  │ │
│ └─────────────────────────────────────────────────────────────┘ └─────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ROW 4: EXTERNAL SECTOR & COMMODITIES                                                            │
│ ┌──────────────────────┐ ┌──────────────────────┐ ┌──────────────────────┐ ┌──────────────────┐ │
│ │ RBI Forex Reserves   │ │ Import Cover         │ │ USD/INR Spot         │ │ Brent Crude Spot │ │
│ │ $688.2 Billion       │ │ 11.4 Months          │ │ ₹84.15 (-0.08%)      │ │ $74.20/bbl       │ │
│ └──────────────────────┘ └──────────────────────┘ └──────────────────────┘ └──────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
```

#### 3.5 Multi-Tier Caching Architecture & Endpoints
Replace the monolithic endpoint with tiered REST endpoints and independent Redis TTLs:

| Endpoint | Data Domain | Target Sources | Refresh / Invalidation | Redis Cache TTL |
|---|---|---|---|---|
| `/api/macro/monetary-corridor` | Repo, SDF, MSF, Net LAF, WACR | RBI DBIE / Money Market | Daily 09:15 IST (post-RBI liquidity release) | 1 hour |
| `/api/macro/inflation-matrix` | CPI Headline, Core CPI, WPI, Spreads | MOSPI / Office of Economic Adviser | Monthly on 12th & 14th at 17:30 IST | 12 hours |
| `/api/macro/yield-curve` | 91D to 30Y G-Secs, AAA Spreads | CCIL NDS-OM / FIMMDA | Hourly during market (09:00 - 17:00 IST) | 15 minutes |
| `/api/macro/external-sector` | Forex Reserves, Trade Deficit, CAD | RBI Weekly Statistical Supplement (WSS) / DGFT | Friday 17:00 IST | 6 hours |
| `/api/macro/high-frequency` | FX Spot, Crude, Gold, Base Metals | MCX / Refinitiv / RBI Ref Rate | Real-time SSE stream | 15 seconds |

#### 3.6 Data Contract (TypeScript Schema)
```typescript
export interface MacroDashboardPayload {
  monetaryCorridor: {
    repoRatePct: number;
    sdfRatePct: number;
    msfRatePct: number;
    crrPct: number;
    slrPct: number;
    netSystemicLiquidityRupeesCr: number; // Positive = Surplus, Negative = Deficit
    liquidityStatus: 'SURPLUS' | 'MILD_DEFICIT' | 'ACUTE_DEFICIT';
    wacrOvernightPct: number;
    wacrSpreadOverRepoBps: number;
    lastPolicyDate: string;
    nextMpcDate: string;
  };
  inflationEngine: {
    cpiHeadlineYoY: number;
    cpiFoodYoY: number;
    coreCpiYoY: number; // ex-food, ex-fuel
    wpiHeadlineYoY: number;
    wpiManufacturingYoY: number;
    macroMarginSpreadBps: number; // (CPI - WPI) in bps
    marginRegime: 'MARGIN_EXPANSION_TAILWIND' | 'BALANCED' | 'INPUT_COST_SQUEEZE';
    cpiReleaseMonth: string;
  };
  sovereignYieldCurve: {
    tBill91DYield: number;
    gSec2YYield: number;
    gSec5YYield: number;
    gSec10YYield: number; // On-the-run benchmark
    benchmarkBondDescription: string; // e.g. "7.18% GS 2033"
    termSpread10Minus2Bps: number;
    yieldCurveSlope: 'STEEP' | 'NORMAL' | 'FLAT' | 'INVERTED';
    corporateBondSpreads: {
      aaaPsuSpreadBps: number;
      aaMinusSpreadBps: number;
    };
    sovereignSpreadUs10YBps: number;
  };
  externalSector: {
    forexReservesUsdBillion: number;
    importCoverMonths: number;
    cadToGdpPct: number;
    merchandiseTradeDeficitUsdBillion: number;
    servicesSurplusUsdBillion: number;
    usdInrSpot: number;
    reer40CurrencyIndex: number;
  };
  lastSynchronizedAt: string;
}
```

---

```
================================================================================
SPECIFICATION 2 OF 2: market-metrics.md
================================================================================
```

### 1. Target Spec File Path & Title
- **File Path:** `specs/macro-page/market-metrics.md`
- **Title:** Indian Market Metrics Tool Specification (Live Widget)

### 2. Lenses Evaluated & Core Critique
- **Indian Market Microstructure & FII / DII Flow Realities:**
  - Section 1.1 states: `"FII/DII flows. Auto-refreshes every 15 minutes during market hours."`
  - Section 4.1 claims: `"FII/DII | NSDL/CDSL / SEBI | 15 min (intraday) / EOD | T-1 data"`.
  - Section 5.2 lists: `"FII/DII | 15 min | Scheduled job"`.
  - **Critical Domain Error:** In the Indian equity market, NSE, BSE, NSDL, and CDSL **do not release 15-minute intraday net institutional flow data**.
    - During trading hours (09:15 - 15:30 IST), institutional trading is anonymous. No public exchange feed publishes intraday FII or DII net cash purchases.
    - At ~16:30 - 17:00 IST: NSE and BSE publish **Provisional Cash Market Figures** (Gross Buy, Gross Sell, Net for FII and DII).
    - At ~18:00 - 20:30 IST: NSDL and CDSL publish **Final Custodial FPI/DII Settlement Data** (including debt, hybrid, and sub-accounts).
    - Scheduling a job to poll FII/DII every 15 minutes intraday is an engineering mistake that generates failed API requests and misleadingly displays stale historical data as if it were an intraday tick.
- **SEBI Trading Session States & Circuit Breakers:**
  - Spec defines: `marketStatus: 'OPEN' | 'CLOSED' | 'PRE_OPEN' | 'POST_CLOSE'`.
  - **Omission of Indian Circuit Breaker Regimes:** Under SEBI Master Circular on Index-based Circuit Breakers:
    - 10%, 15%, and 20% index triggers on NIFTY/SENSEX enforce mandatory market halts (ranging from 15 minutes to market closure for the remainder of the day), followed by a 15-minute pre-open call auction session.
    - The Pre-Open Session is multi-phased: 09:00 - 09:08 (order entry/cancellation), 09:08 - 09:12 (order matching & discovery of opening price), 09:12 - 09:15 (buffer period before regular trading at 09:15).
    - Treating pre-open as a monolithic status leads to display glitches during the 09:08 - 09:12 price discovery freeze.
- **Market Breadth Mathematical Rigor:**
  - Advance/Decline Ratio: $\text{ADR} = \frac{\text{Advances}}{\text{Declines}}$.
  - When Declines = 0 (rare rally day) or in specific sector baskets, division by zero crashes the calculation.
  - Furthermore, equal-weighted breadth is easily distorted by penny stocks. Institutional analysts evaluate **Market-Cap Weighted Breadth** alongside simple counts to determine whether index gains are broad-based or driven by 3-4 mega-cap stocks.

### 3. Actionable Replacements

#### 3.1 Institutional Flow Data Release Schedule & State Engine
Replace the imaginary 15-minute polling loop with the actual Indian institutional data pipeline:

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│ INDIAN INSTITUTIONAL FLOW PIPELINE (FII / DII CASH MARKET)                                     │
├────────────────────────────────┬────────────────────────────────────────────────────────────────┤
│ TIME WINDOW (IST)              │ PIPELINE ACTION & UI DISPLAY STATE                             │
├────────────────────────────────┼────────────────────────────────────────────────────────────────┤
│ 09:15 - 16:30 (Market Hours)   │ Display FINAL T-1 SETTLEMENT DATA.                             │
│                                │ UI Badge: "EOD Final (T-1: [Yesterday's Date])"                │
│                                │ Polling: DISABLED (No bogus intraday requests).                │
├────────────────────────────────┼────────────────────────────────────────────────────────────────┤
│ 16:30 - 17:30 (Post-Market)    │ Ingest PROVISIONAL CASH FIGURES from NSE/BSE scrapers.        │
│                                │ UI Badge: "PROVISIONAL TODAY ([Current Date] 17:00 IST)"       │
│                                │ Re-poll interval: 5 minutes until provisional values present.  │
├────────────────────────────────┼────────────────────────────────────────────────────────────────┤
│ 18:00 - 21:00 (Evening)        │ Ingest FINAL FPI/DII SETTLEMENT DATA from NSDL/CDSL portals.   │
│                                │ Reconcile provisional vs final variance.                       │
│                                │ UI Badge: "FINAL VERIFIED (NSDL/CDSL [Date])"                  │
│                                │ Re-poll interval: 15 minutes until final data locked.          │
└────────────────────────────────┴────────────────────────────────────────────────────────────────┘
```

#### 3.2 SEBI Trading Session & Circuit Breaker State Machine
Update the market status state machine to adhere strictly to SEBI exchange guidelines:

```typescript
export type IndianMarketSessionState =
  | 'PRE_OPEN_COLLECTION'      // 09:00 - 09:08: Order entry, modification, cancellation
  | 'PRE_OPEN_MATCHING'        // 09:08 - 09:12: Order matching & equilibrium price discovery
  | 'PRE_OPEN_BUFFER'          // 09:12 - 09:15: Transition buffer
  | 'CONTINUOUS_NORMAL'        // 09:15 - 15:30: Normal continuous trading
  | 'CIRCUIT_HALT_10_PCT'      // SEBI 10% index circuit breaker halt active
  | 'CIRCUIT_HALT_15_PCT'      // SEBI 15% index circuit breaker halt active
  | 'CIRCUIT_HALT_20_PCT'      // SEBI 20% index circuit breaker (Market closed for remainder of day)
  | 'CIRCUIT_REOPENING_AUCTION'// 15-minute pre-open re-opening call auction post circuit cooling
  | 'CLOSING_SESSION'          // 15:30 - 15:40: VWAP closing price calculation
  | 'POST_CLOSING_TRADE'       // 15:40 - 16:00: Trading at closing price
  | 'MARKET_CLOSED';           // 16:00 - 09:00 next business day
```

#### 3.3 Enhanced Market Breadth Engine Formulations
Implement zero-division safe Advance/Decline calculations and Market-Cap Weighted Breadth:

$$\text{ADR}_{\text{Smoothed}} = \frac{\text{Advances} + 1}{\text{Declines} + 1}$$

$$\text{MarketBreadthPct} = \frac{\text{Advances}}{\text{Advances} + \text{Declines} + \text{Unchanged}} \times 100\%$$

$$\text{CapWeightedBreadthPct} = \frac{\sum_{i \in \text{Advances}} \text{MarketCap}_i}{\sum_{i \in \text{Advances}} \text{MarketCap}_i + \sum_{j \in \text{Declines}} \text{MarketCap}_j} \times 100\%$$

$$\text{BreadthDivergence} = \text{CapWeightedBreadthPct} - \text{MarketBreadthPct}$$

- **Breadth Divergence Interpretation:**
  - $\text{BreadthDivergence} > +20\%$: **Mega-Cap Distortion / Narrow Rally** (A few giants like Reliance or HDFC Bank are pulling the index up while the majority of stocks are declining).
  - $\text{BreadthDivergence} < -20\%$: **Broad-Based Mid-Cap Rally** despite mega-cap drag.

#### 3.4 India VIX Volatility Regime Mapping
Formulate volatility regimes:

$$\text{VIX Regime} = \begin{cases} 
\text{COMPLACENT / LOW RISK} & \text{if } \text{VIX} < 13.0 \\
\text{NORMAL / BALANCED} & \text{if } 13.0 \le \text{VIX} \le 18.0 \\
\text{ELEVATED CAUTION} & \text{if } 18.0 < \text{VIX} \le 24.0 \\
\text{ACUTE TURMOIL / CRASH RISK} & \text{if } \text{VIX} > 24.0
\end{cases}$$

#### 3.5 UI/UX Component Layout (Live Widget)
Replace the simple card layout with a high-density, real-time widget:

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│ MARKET METRICS | Session: CONTINUOUS_NORMAL | SSE: CONNECTED (50ms) | Next Close: 15:30 IST    │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ROW 1: EQUITY BENCHMARKS & VOLATILITY                                                           │
│ ┌──────────────────────┐ ┌──────────────────────┐ ┌──────────────────────┐ ┌──────────────────┐ │
│ │ NIFTY 50             │ │ SENSEX               │ │ NIFTY MIDCAP 150     │ │ INDIA VIX        │ │
│ │ 24,540.20            │ │ 80,980.50            │ │ 16,840.10            │ │ 14.15            │ │
│ │ ▲ +192.40 (+0.79%)   │ │ ▲ +580.20 (+0.72%)   │ │ ▲ +210.50 (+1.26%)   │ │ ▼ -0.72 (-4.84%) │ │
│ │ Day: 24,380 - 24,560 │ │ Day: 80,450 - 81,020 │ │ Day: 16,650 - 16,860 │ │ Regime: NORMAL   │ │
│ └──────────────────────┘ └──────────────────────┘ └──────────────────────┘ └──────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ROW 2: ADVANCE / DECLINE & MARKET BREADTH                                                       │
│ ┌──────────────────────────────────────────────┐ ┌────────────────────────────────────────────┐ │
│ │ NSE MARKET BREADTH (1,940 Stocks Tracked)    │ │ CAPITAL-WEIGHTED DIVERGENCE                │ │
│ │ • Advances: 1,280 (66.0%)                    │ │ • Equal-Weighted Breadth:  66.0% Advancing │ │
│ │ • Declines:   580 (29.9%)                    │ │ • Cap-Weighted Breadth:    74.2% Advancing │ │
│ │ • Unchanged:   80  (4.1%)                    │ │ • Divergence: +8.2% (Healthy broad rally)  │ │
│ │ • Smoothed ADR: 2.20 : 1                     │ │ [Progress Bar: Adv ███████████ Dec ████]   │ │
│ └──────────────────────────────────────────────┘ └────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ROW 3: INSTITUTIONAL CASH FLOWS (FII vs DII)                                                    │
│ ┌─────────────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ Status: PROVISIONAL TODAY (Ingested at 16:45 IST) | Final NSDL Settlement at 20:30 IST     │ │
│ │ ┌──────────────────────┬──────────────────────┬──────────────────────┬────────────────────┐ │ │
│ │ │ FII Net Cash (Today) │ DII Net Cash (Today) │ Combined Net Flow    │ FII MTD Total      │ │ │
│ │ │ +₹1,845.20 Cr        │ +₹920.40 Cr          │ +₹2,765.60 Cr (▲)    │ -₹12,450.00 Cr     │ │ │
│ │ └──────────────────────┴──────────────────────┴──────────────────────┴────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ROW 4: SECTOR ROTATION MATRIX (NSE Sectoral Indices)                                            │
│ [Auto: +2.1%] [Metal: +1.8%] [IT: +1.4%] [Bank: +0.6%] [FMCG: -0.3%] [Pharma: -0.7%] [Realty: +2.8%]│
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
```

#### 3.6 Data Contract (TypeScript Schema)
```typescript
export interface MarketMetricsLiveData {
  sessionStatus: IndianMarketSessionState;
  exchangeTimestamp: string;
  indices: {
    nifty50: IndexTick;
    sensex: IndexTick;
    niftyMidcap150: IndexTick;
    indiaVix: {
      currentValue: number;
      changePoints: number;
      changePct: number;
      historicalPercentile30D: number;
      regime: 'COMPLACENT_LOW_RISK' | 'NORMAL_BALANCED' | 'ELEVATED_CAUTION' | 'ACUTE_TURMOIL';
    };
  };
  marketBreadth: {
    totalTracked: number;
    advances: number;
    declines: number;
    unchanged: number;
    advanceDeclineRatio: number; // Smoothed formula (A+1)/(D+1)
    equalWeightedAdvancePct: number;
    capWeightedAdvancePct: number;
    breadthDivergencePct: number; // CapWeighted - EqualWeighted
    divergenceInterpretation: 'HEALTHY_BROAD_PARTICIPATION' | 'MEGA_CAP_DISTORTION' | 'SMALL_CAP_OUTPERFORMANCE';
  };
  institutionalCashFlows: {
    pipelineStage: 'T_MINUS_1_FINAL' | 'TODAY_PROVISIONAL' | 'TODAY_FINAL_VERIFIED';
    flowDate: string;
    fiiNetRupeesCr: number;
    diiNetRupeesCr: number;
    combinedNetRupeesCr: number;
    fiiGrossBuyCr?: number;
    fiiGrossSellCr?: number;
    diiGrossBuyCr?: number;
    diiGrossSellCr?: number;
    fiiMtdRupeesCr: number;
    diiMtdRupeesCr: number;
    lastIngestionTimestamp: string;
  };
  sectorRotation1D: {
    sectorName: string;
    changePct: number;
    marketCapWeightPct: number;
    leadingConstituentSymbol: string;
    laggingConstituentSymbol: string;
  }[];
  streamLatencyMs: number;
}

export interface IndexTick {
  symbol: string;
  currentValue: number;
  changePoints: number;
  changePct: number;
  dayHigh: number;
  dayLow: number;
  yearHigh52W: number;
  yearLow52W: number;
  sparklineIntraday: number[];
}
```

---

## 3. Prioritized Implementation Roadmap for Hermes

| Priority | Spec Target | Key Modification Required | Impact on System |
|---|---|---|---|
| **P0 (Immediate)** | `market-metrics.md` | Eliminate bogus 15-minute intraday FII/DII polling; implement official Indian release schedule (`T-1 Final` $\to$ `16:30 Provisional` $\to$ `20:30 Verified`). | Stops thousands of failing API requests and eliminates misleading data. |
| **P0 (Immediate)** | `market-metrics.md` | Add SEBI index circuit breaker states and 3-stage pre-open session state machine. | Eliminates UI freezing during market halts and pre-open price discovery. |
| **P0 (Immediate)** | `macro-dashboard.md` | Overhaul monetary policy corridor to include SDF (6.25%), Repo (6.50%), MSF (6.75%), and Net LAF Systemic Liquidity in ₹ Lakh Cr. | Brings system up to current post-2022 RBI operating framework. |
| **P1 (High)** | `macro-dashboard.md` | Add Core CPI (ex-food/fuel) and Macro Corporate Margin Spread ($\text{CPI} - \text{WPI}$). | Gives fundamental equity analysts clear foresight into corporate gross margin cycles. |
| **P1 (High)** | `macro-dashboard.md` | Integrate CCIL G-Sec yield curve (91D to 30Y) and Corporate AAA/AA- credit risk spreads. | Enables accurate cost-of-capital and credit cycle monitoring. |
| **P1 (High)** | `market-metrics.md` | Implement smoothed zero-division-safe ADR and Market-Cap Weighted Breadth Divergence. | Instantly alerts analysts when 3 mega-caps are falsely propping up the index. |
| **P2 (Medium)** | `macro-dashboard.md` | Deconstruct monolithic API into tiered caching endpoints (Real-time, Daily 09:15, Monthly 12th/14th). | Reduces server load and optimizes Redis cache performance. |
