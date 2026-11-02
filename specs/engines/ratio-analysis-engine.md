# Ratio Analysis Engine Specification

**Tool Name:** Ratio Analysis Engine  
**Category:** Analysis Engines  
**Sheet:** Company Page → Analysis  
**Spec Version:** 1.0.0  
**Status:** ✅ Complete  
**Owner:** Quant Team  
**Last Updated:** 2025-10-31

---

## 3. Calculations & Logic

### 3.1 Ratio Categories (25+ ratios)

| Category | Ratios |
|----------|--------|
| **Profitability** | ROE, ROCE, ROA, Net Margin, EBITDA Margin, Gross Margin, FCF Margin |
| **Leverage** | Debt/Equity, Debt/EBITDA, Interest Coverage, Net Debt/EBITDA |
| **Liquidity** | Current Ratio, Quick Ratio, Cash Ratio, Working Capital Cycle |
| **Efficiency** | Asset Turnover, Inventory Turnover, Receivables Turnover, Payables Turnover |
| **Valuation** | P/E, P/B, EV/EBITDA, EV/Sales, FCF Yield, Dividend Yield |
| **Growth** | Revenue CAGR, EBITDA CAGR, PAT CAGR, EPS CAGR |

### 3.2 Key Formulas
```python
ROE = PAT / Avg_Equity
ROCE = EBIT / (Total_Assets - Current_Liabilities)
Debt_EBITDA = Net_Debt / EBITDA
Interest_Coverage = EBIT / Interest_Expense
Current_Ratio = Current_Assets / Current_Liabilities
Asset_Turnover = Revenue / Avg_Total_Assets
```

### 3.3 Peer Benchmarking
- Percentile rank for each ratio within sector
- Color coding: Green (top quartile), Yellow (middle), Red (bottom quartile)
- Sector median and best-in-class reference lines

---

## 4. Golden Vector Tests (4 vectors)

| Test Case | Company | Expected ROE | Expected D/E | Tolerance |
|-----------|---------|--------------|--------------|-----------|
| RELIANCE | FY24 | 22.5% | 0.45 | 1e-6 |
| TCS | FY24 | 42.3% | 0.01 | 1e-6 |
| HDFCBANK | FY24 | 17.0% | N/A (bank) | 1e-6 |
| TATAMOTORS | FY24 | 8.2% | 1.85 | 1e-6 |

---

## 6. Implementation Status

- **Backend:** ✅ `math-engine/src/math_engine/analysis/ratio_analysis.py`
- **API:** ✅ Embedded in analysis endpoint
- **Tests:** ✅ 4 golden vectors
- **Frontend:** ⏳ `src/components/company/analysis/RatioAnalysis.tsx`

---

*Spec Version: 1.0.0 | Implementation: ✅ Backend Complete*