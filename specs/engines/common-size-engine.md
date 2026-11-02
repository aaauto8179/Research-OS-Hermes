# Common Size Statement Engine Specification

**Tool Name:** Common Size Statement Engine  
**Category:** Analysis Engines  
**Sheet:** Company Page → Financials  
**Spec Version:** 1.0.0  
**Status:** ✅ Complete  
**Owner:** Quant Team  
**Last Updated:** 2025-10-31

---

## 3. Calculations & Logic

### 3.1 Statement Types

| Statement | Base | Key Outputs |
|-----------|------|-------------|
| **P&L** | Revenue (100%) | COGS%, Gross Margin%, EBITDA%, EBIT%, PAT%, Tax% |
| **Balance Sheet** | Total Assets (100%) | Current Assets%, Fixed Assets%, Equity%, Debt%, Liabilities% |
| **Cash Flow** | Revenue (100%) | CFO%, CFI%, CFF%, FCF% |

### 3.2 Calculations
```python
# P&L Common Size
for item in pl_items:
    common_size[item] = (item_value / revenue) * 100

# Balance Sheet Common Size
for item in bs_items:
    common_size[item] = (item_value / total_assets) * 100

# Trend: Year-over-year change in common-size %
```

### 3.3 Red Flags
- Rising COGS% + falling Gross Margin% → margin pressure
- Rising Debt% + falling Equity% → leverage risk
- Falling CFO% while PAT% rising → earnings quality concern

---

## 4. Golden Vector Tests (2 vectors)

| Test Case | Statement | Expected COGS% | Expected Equity% | Tolerance |
|-----------|-----------|----------------|------------------|-----------|
| RELIANCE FY24 | P&L | 58% | - | 1e-6 |
| TCS FY24 | BS | - | 49% | 1e-6 |

---

## 6. Implementation Status

- **Backend:** ✅ `math-engine/src/math_engine/analysis/common_size.py`
- **API:** ✅ Embedded in analysis endpoint
- **Tests:** ✅ 2 golden vectors
- **Frontend:** ⏳ `src/components/company/financials/CommonSizeStatement.tsx`

---

*Spec Version: 1.0.0 | Implementation: ✅ Backend Complete*