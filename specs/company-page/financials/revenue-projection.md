# Revenue Projection Tool Specification (Financials Tab UI)

**Tool Name:** Revenue Projection (UI)  
**Category:** Financial Statements  
**Sheet:** Company Page → Financials (Step 3)  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Revenue projection by segment with driver-based assumptions. Links to Revenue Projection Engine for quantitative modeling. Includes historical data, driver assumptions, and projected financials.

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Revenue Projection - [SYMBOL]                                   │
├─────────────────────────────────────────────────────────────────┤
│ SEGMENT: [O2C ▼]  METHOD: [Driver-Based ▼]  PERIOD: [5Y]      │
├─────────────────────────────────────────────────────────────────┤
│ DRIVER ASSUMPTIONS                                              │
│ ┌──────────────────────┬──────┬──────────┬────────────────────┐ │
│ │ Driver               │ Imp% │ Market   │ Notes              │ │
│ ├──────────────────────┼──────┼──────────┼────────────────────┤ │
│ │ Volume growth        │ 35%  │ ₹50,000Cr│ Capacity +15% YoY  │ │
│ │ Price improvement    │ 25%  │ ₹20,000Cr│ Cyclical recovery  │ │
│ │ Product mix          │ 20%  │ ₹15,000Cr│ High-margin shift  │ │
│ │ New products         │ 15%  │ ₹8,000Cr │ Green hydrogen     │ │
│ │ Regulatory tailwind  │ 5%   │ ₹5,000Cr │ Policy support     │ │
│ └──────────────────────┴──────┴──────────┴────────────────────┘ │
│ [Add Driver] [Import from Story Tab] [Link to Revenue Engine]   │
├─────────────────────────────────────────────────────────────────┤
│ PROJECTION TABLE                                                │
│ ┌──────┬────────┬────────┬────────┬────────┬────────┬─────┐    │
│ │ Seg  │ FY24   │ FY25E  │ FY26E  │ FY27E  │ FY28E │ CAGR │    │
│ ├──────┼────────┼────────┼────────┼────────┼────────┼─────┤    │
│ │ O2C  │ 5,500  │ 6,200  │ 6,800  │ 7,300  │ 7,600 │ 8.5% │    │
│ │ Retail│ 2,100 │ 2,500  │ 2,900  │ 3,200  │ 3,400 │ 12.4%│    │
│ │ Jio  │ 1,400  │ 1,600  │ 1,900  │ 2,200  │ 2,400 │ 14.3%│    │
│ │ Total│ 9,200  │ 10,300 │ 11,600 │ 12,700 │ 13,400│ 9.8% │    │
│ └──────┴────────┴────────┴────────┴────────┴────────┴─────┘    │
├─────────────────────────────────────────────────────────────────┤
│ EBITDA & FCF PROJECTION                                         │
│ ┌──────┬────────┬────────┬────────┬────────┬────────┬─────┐    │
│ │ Seg  │ FY24   │ FY25E  │ FY26E  │ FY27E  │ FY28E │ CAGR │    │
│ ├──────┼────────┼────────┼────────┼────────┼────────┼─────┤    │
│ │ EBITDA│ 2,100 │ 2,400  │ 2,700  │ 3,000  │ 3,200 │ 11%  │    │
│ │ FCF   │ 1,200  │ 1,400  │ 1,600  │ 1,800  │ 2,000 │ 14%  │    │
│ └──────┴────────┴────────┴────────┴────────┴────────┴─────┘    │
│ [Export CSV] [Link to Revenue Engine] [Link to Valuation Suite] │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Data Pipeline

### 3.1 Input Data
| Field | Type | Source |
|-------|------|--------|
| segment | string | Manual / Story Tab |
| historical_revenue | number[] | Financial Statements |
| drivers | Driver[] | Manual / Story Tab |
| market_size | number | Story Tab |
| market_share | number | Manual |
| price_volume_split | object | Manual |

### 3.2 Driver Schema
```typescript
interface Driver {
  name: string;
  contributionPct: number;
  marketSizeCr: number;
  confidence: 'High' | 'Medium' | 'Low';
  notes: string;
}
```

### 3.3 Projection Methods
| Method | Formula |
|--------|---------|
| Driver-Based | Revenue = Σ(Driverᵢ × Impactᵢ) |
| Market Share | Revenue = Market Size × Share % |
| S-Curve | Penetration = L / (1 + e^(-k(t-t₀))) |
| Historical Trend | CAGR / Linear regression |

---

## 4. Engine Integration

### 4.1 Engine
- **RevenueProjectionEngine** in `math-engine/src/math_engine/projection/revenue.py`
- **API:** Embedded in screening/portfolio endpoints

### 4.2 Links
- **Story Tab (Growth Drivers):** Driver assumptions
- **Valuation Suite:** Feeds into DCF, SOTP
- **Valuation Philosophy:** Scenario assumptions

---

## 4. API Contract

```typescript
interface RevenueProjectionRequest {
  segments: SegmentInput[];
  method: 'driver_based' | 'market_share' | 's_curve' | 'historical_trend';
  years: number;
}

interface SegmentInput {
  name: string;
  historical: number[];
  drivers: Driver[];
  marketSize?: number;
  marketShare?: number;
}

interface RevenueProjectionResponse {
  segments: SegmentProjection[];
  consolidated: ConsolidatedProjection;
}

interface SegmentProjection {
  name: string;
  historical: number[];
  projected: number[];
  cagr: number;
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Segment selector, driver table with % sum validation | Week 1 |
| 2 | Projection table with historical + projected | Week 1 |
| 2 | EBITDA/FCF projection from Revenue Engine | Week 2 |
| 3 | Story Tab link, Valuation Suite link, CSV export | Week 2 |

---

## 6. Testing
- Driver contribution sum = 100% validation
- Projection formula accuracy
- EBITDA/FCF derivation from Revenue Engine
- Cross-tab links (Story, Valuation)

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started*