# Fundamentals & Quality Tool Specification

**Tool Name:** Fundamentals & Quality  
**Category:** Portfolio Management → Portfolio Metrics  
**Sheet:** Portfolio management Page → 3) Portfolio Metrics → 5. Portfolio Fundamentals & Quality  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Portfolio-level fundamental quality metrics: weighted average ROE, ROCE, revenue growth, EPS growth, EBITDA growth, net profit margin, debt-to-equity. Quality scorecard with peer comparison.

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Portfolio Fundamentals & Quality - [Portfolio Name]             │
├─────────────────────────────────────────────────────────────────┤
│ QUALITY SCORECARD                                               │
│ ┌────────────────────────┬────────┬────────┬────────┬────────┐ │
│ │ Metric                 │ Port.  │ Bench. │ Pctl   │ Status │ │
│ ├────────────────────────┼────────┼────────┼────────┼────────┤ │
│ │ Portfolio ROE          │ 18.2%  │ 14.5%  │ 78th   │ ✅     │ │
│ │ Portfolio ROCE         │ 15.8%  │ 13.2%  │ 72nd   │ ✅     │ │
│ │ Revenue Growth (3Y)    │ 14.5%  │ 11.2%  │ 75th   │ ✅     │ │
│ │ EPS Growth (3Y)        │ 18.2%  │ 13.5%  │ 70th   │ ✅     │ │
│ │ EBITDA Growth (3Y)     │ 16.8%  │ 12.5%  │ 74th   │ ✅     │ │
│ │ Net Profit Margin      │ 12.5%  │ 9.8%   │ 68th   │ ✅     │ │
│ │ EBITDA Margin          │ 18.5%  │ 15.2%  │ 71st   │ ✅     │ │
│ │ Debt-to-Equity         │ 0.45   │ 0.68   │ 22nd   │ ✅ Low │ │
│ │ Interest Coverage      │ 8.2x   │ 5.1x   │ 82nd   │ ✅     │ │
│ │ FCF Conversion         │ 85%    │ 72%    │ 78th   │ ✅     │ │
│ └────────────────────────┴────────┴────────┴────────┴────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ QUALITY TRENDS (5Y)                                             │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ROE:      ▁▂▃▅▆▇ (14% → 18%)  ↗                             │ │
│ │ ROCE:     ▁▂▃▅▆▇ (12% → 16%)  ↗                             │ │
│ │ Margin:   ▁▂▃▄▅▆ (9% → 12.5%) ↗                             │ │
│ │ D/E:      ▇▆▅▄▃▂▁ (0.65 → 0.45) ↘                           │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ HOLDINGS QUALITY BREAKDOWN                                      │
│ ┌────┬────────┬──────┬──────┬──────┬──────┬──────┬──────┐     │
│ │ #  │ Symbol │ Wt%  │ ROE  │ ROCE │ D/E  │ FCF% │ Qual │     │
│ ├────┼────────┼──────┼──────┼──────┼──────┼──────┼──────┤     │
│ │ 1  │ RELIANCE│ 15%  │ 22%  │ 28%  │ 0.45 │ 85%  │ High │     │
│ │ 2  │ TCS     │ 12%  │ 42%  │ 45%  │ 0.01 │ 92%  │ High │     │
│ │ 3  │ HDFC    │ 10%  │ 17%  │ N/A  │ N/A  │ 78%  │ Med  │     │
│ └────┴────────┴──────┴──────┴──────┴──────┴──────┴──────┘     │
├─────────────────────────────────────────────────────────────────┤
│ [Export CSV] [Link to Screening] [Link to Ratio Analysis]       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Engine Integration

### 3.1 Calculations
```python
# Weighted averages (by market value)
portfolio_roe = sum(w_i * roe_i for w_i, roe_i in zip(weights, roes))
portfolio_roce = sum(w_i * roce_i for w_i, roce_i in zip(weights, roces))
portfolio_de = sum(w_i * de_i for w_i, de_i in zip(weights, des))

# Growth rates (3Y CAGR)
rev_cagr = (rev_now / rev_3y_ago) ** (1/3) - 1
eps_cagr = (eps_now / eps_3y_ago) ** (1/3) - 1

# Quality metrics
fcf_conversion = fcf / ebitda
interest_coverage = ebit / interest_expense
```

### 3.2 Quality Score
```python
quality_score = (
    percentile(roe) * 0.25 +
    percentile(roce) * 0.20 +
    percentile(fcf_conversion) * 0.20 +
    percentile(interest_coverage) * 0.15 +
    (1 - percentile(de)) * 0.10 +  # Lower D/E is better
    percentile(fcf_conversion) * 0.10
)
```

---

## 4. Engine Integration

### 4.1 Links
- **Screening Engine:** Quality factors
- **Ratio Analysis Engine:** Underlying ratios
- **Holdings:** Individual quality metrics

### 3.2 API Contract
```typescript
interface FundamentalsQualityData {
  portfolioId: string;
  scorecard: {
    roe: { value: number; benchmark: number; percentile: number; status: string };
    roce: { value: number; benchmark: number; percentile: number; status: string };
    revenueGrowth: { value: number; benchmark: number; percentile: number; status: string };
    epsGrowth: { value: number; benchmark: number; percentile: number; status: string };
    ebitdaGrowth: { value: number; benchmark: number; percentile: number; status: string };
    netMargin: { value: number; benchmark: number; percentile: number; status: string };
    ebitdaMargin: { value: number; benchmark: number; percentile: number; status: string };
    debtEquity: { value: number; benchmark: number; percentile: number; status: string };
    interestCoverage: { value: number; benchmark: number; percentile: number; status: string };
    fcfConversion: { value: number; benchmark: number; percentile: number; status: string };
  };
  trends: { roe: number[]; roce: number[]; margin: number[]; de: number[] };
  holdings: HoldingQuality[];
  overallQualityScore: number;  // 0-100
  qualityGrade: 'High' | 'Medium' | 'Low';
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Quality scorecard with 10 metrics, percentile calc | Week 1 |
| 2 | 5Y trend charts, holdings quality breakdown | Week 1 |
| 2 | Quality score algorithm, peer comparison | Week 2 |
| 3 | Export CSV, link to Screening/Ratio Analysis | Week 2 |

---

## 5. Testing

| Test | Expected |
|------|----------|
| Weighted ROE/ROCE | Matches manual calc |
| Percentile rank | Correct vs universe |
| Quality score | 0-100 range, matches manual |
| Trend direction | Correct up/down arrows |
| Holdings quality | Matches individual metrics |

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started | Priority: HIGH*