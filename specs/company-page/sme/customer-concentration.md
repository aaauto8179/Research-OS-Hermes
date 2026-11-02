# Customer Concentration Tool Specification

**Tool Name:** Customer Concentration  
**Category:** SME Forensics  
**Sheet:** Company Page → SME  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Customer concentration analysis: table with top X customers dropdown, % of revenue per customer, trend over quarters, risk assessment. Links to Shareholding Pattern and Key Fragility Points.

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Customer Concentration - [SYMBOL]                               │
├─────────────────────────────────────────────────────────────────┤
│ TOP X CUSTOMERS: [Top 5 ▼] [Top 10] [Top 20]                   │
├─────────────────────────────────────────────────────────────────┤
│ CUSTOMER CONCENTRATION TABLE                                    │
│ ┌────┬──────────────────┬────────┬────────┬────────┬────────┐ │
│ │ #  │ Customer         │ % Rev  │ QoQ Δ  │ Trend  │ Risk  │ │
│ ├────┼──────────────────┼────────┼────────┼────────┼────────┤ │
│ │ 1  │ Customer A (Auto)│ 22%    │ +1%    │ ▲      │ High  │ │
│ │ 2  │ Customer B (Chem)│ 15%    │ -2%    │ ▼      │ High  │ │
│ │ 3  │ Customer C (Retail)│ 12%  │ +3%    │ ▲      │ Medium│ │
│ │ 4  │ Customer D (Infra)│ 8%    │ 0%     │ →      │ Medium│ │
│ │ 5  │ Customer E (Auto) │ 6%     │ -1%    │ ▼      │ Low   │ │
│ └────┴──────────────────┴────────┴────────┴────────┴────────┘ │
│ Top 5: 63%  │  Top 10: 78%  │  HHI: 0.12 (Moderate)           │
├─────────────────────────────────────────────────────────────────┤
│ QUARTERLY TREND                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Customer A  │ ████████░░░░░░ 22% → 23% → 22% → 22% → 22%   │ │
│ │ Customer B  │ ██████░░░░░░░░ 15% → 14% → 16% → 15% → 14%   │ │
│ │ Customer C  │ █████░░░░░░░░░ 12% → 11% → 12% → 12% → 11%   │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ RISK ASSESSMENT                                                 │
│ ⚠️ Top customer > 20%: Customer A (22%)                        │
│ ⚠️ Top 2 customers > 30%: A (22%) + B (15%) = 37%             │
│ ✅ HHI < 0.15: 0.12 (Moderate concentration)                   │
├─────────────────────────────────────────────────────────────────┤
│ [Add Customer] [Import from Doc AI] [Link to Shareholding] [Link to Fragility] │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Data Pipeline

### 3.1 Input Data
| Field | Type | Source |
|-------|------|--------|
| customers | CustomerConcentration[] | Manual / Doc AI |

### 3.2 Schema
```typescript
interface CustomerConcentration {
  id: string;
  name: string;
  industry: string;
  pctRevenue: number;
  qoqChange: number;
  trend: 'Up' | 'Down' | 'Stable';
  riskLevel: 'High' | 'Medium' | 'Low';
  contractExpiry?: string;
  notes: string;
}
```

### 3.3 Risk Metrics
```python
def calculate_hhi(concentrations):
    return sum(c**2 for c in concentrations)

def assess_risk(pct):
    if pct > 20: return 'High'
    elif pct > 10: return 'Medium'
    return 'Low'

def hhi_interpretation(hhi):
    if hhi < 0.15: return 'Low'
    elif hhi < 0.25: return 'Moderate'
    return 'High'
```

---

## 4. Engine Integration

### 4.1 Links
- **Shareholding Pattern:** Customer data sync
- **Key Fragility Points (Risk):** Cross-references concentration flags
- **Document AI:** Extracts from segment reporting, management commentary

---

## 4. API Contract

```typescript
interface CustomerConcentrationData {
  symbol: string;
  customers: CustomerConcentration[];
  summary: {
    top5: number;
    top10: number;
    hhi: number;
    hhiRating: 'Low' | 'Moderate' | 'High';
  };
  lastUpdated: string;
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Concentration table with sparklines, HHI calc | Week 1 |
| 2 | Quarterly trend sparklines, risk badges | Week 1 |
| 2 | Doc AI import (segment reporting), Shareholding sync | Week 2 |
| 3 | Fragility Points link, CSV export | Week 2 |

---

## 6. Testing
- HHI calculation accuracy
- Risk level auto-assessment
- Quarterly trend sparklines
- Cross-link to Shareholding, Fragility Points

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started*