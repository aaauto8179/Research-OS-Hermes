# Turnaround Indicator Engine Specification

**Tool Name:** Turnaround Indicator Engine  
**Category:** Analysis Engines  
**Sheet:** Company Page → Analysis  
**Spec Version:** 1.0.0  
**Status:** ✅ Complete  
**Owner:** Quant Team  
**Last Updated:** 2025-10-31

---

## 3. Calculations & Logic

### 3.1 Five-Pillar Scoring (0-100)

| Pillar | Weight | Signals |
|--------|--------|---------|
| **Financial Inflection** | 35% | ROE improvement > 500bps, Margin expansion, FCF turning positive |
| **Balance Sheet Repair** | 25% | Debt reduction > 20%, Interest coverage > 3x, Asset monetization |
| **Operational Catalysts** | 20% | New capacity, Product launch, Market share gains, Cost program |
| **Management Quality** | 10% | Promoter buying, Credible guidance, Capital allocation discipline |
| **Valuation Support** | 10% | P/B < 1, EV/EBITDA < sector median, Dividend yield > 2% |

### 3.2 Signal Detection
```python
signals = {
    "roe_improvement": (roe_t - roe_t_1) > 5,
    "margin_expansion": (ebitda_margin_t - ebitda_margin_t_1) > 2,
    "debt_reduction": (debt_t / debt_t_1) < 0.8,
    "fcf_turn_positive": fcf_t > 0 and fcf_t_1 < 0,
    "promoter_buying": promoter_holding_t > promoter_holding_t_1,
    "capex_completion": capex_completed_flag,
}
score = Σ(signal_weight × signal_activated)
```

### 3.3 Output
```json
{
  "score": 72,
  "status": "EARLY_STAGE_TURNAROUND",
  "pillars": {
    "financial_inflection": 28, "balance_sheet_repair": 18,
    "operational_catalysts": 15, "management_quality": 8, "valuation_support": 3
  },
  "signals": { "roe_improvement": true, "debt_reduction": true, ... }
}
```

---

## 4. Golden Vector Tests (2 vectors)

| Test Case | Signals | Expected Score | Tolerance |
|-----------|---------|----------------|-----------|
| Strong Turnaround | 6 positive | 82 | 1e-6 |
| Early Stage | 3 positive | 55 | 1e-6 |

---

## 6. Implementation Status

- **Backend:** ✅ `math-engine/src/math_engine/analysis/turnaround.py`
- **API:** ✅ Embedded in analysis endpoint
- **Tests:** ✅ 2 golden vectors
- **Frontend:** ⏳ `src/components/company/analysis/TurnaroundIndicator.tsx`

---

*Spec Version: 1.0.0 | Implementation: ✅ Backend Complete*