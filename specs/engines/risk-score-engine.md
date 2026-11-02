# Risk Score Engine Specification

**Tool Name:** Risk Score Engine  
**Category:** Risk Engines  
**Sheet:** Company Page → Risk  
**Spec Version:** 1.0.0  
**Status:** ✅ Complete  
**Owner:** Quant Team  
**Last Updated:** 2025-10-31

---

## 3. Calculations & Logic

### 3.1 Risk Categories & Weights

| Category | Weight | Components |
|----------|--------|------------|
| **Business Risk** | 25% | Revenue concentration, Cyclicality, Regulation, Competition |
| **Financial Risk** | 25% | Leverage, Interest coverage, Liquidity, Cash flow volatility |
| **Valuation Risk** | 20% | P/E vs history, EV/EBITDA vs peers, Price vs DCF |
| **Governance Risk** | 15% | Promoter pledge, Board independence, Auditor quality, Related party |
| **Macro/Industry Risk** | 15% | Cycle position, Commodity exposure, FX sensitivity, Policy risk |

### 3.2 Scoring (0-100, lower = better)
```python
risk_score = Σ(category_score × weight)
# Each category scored 0-100 based on component metrics
```

### 3.3 Output
```json
{
  "total_score": 42,
  "grade": "MODERATE",
  "categories": {
    "business": 35, "financial": 48,
    "valuation": 55, "governance": 28, "macro": 40
  },
  "flags": ["High promoter pledge", "Sector cyclical"]
}
```

---

## 4. Golden Vector Tests (2 vectors)

| Test Case | Inputs | Expected Score | Tolerance |
|-----------|--------|----------------|-----------|
| Conservative | Low leverage, diversified | 25 | 1e-6 |
| Aggressive | High leverage, cyclical | 68 | 1e-6 |

---

## 6. Implementation Status

- **Backend:** ✅ `math-engine/src/math_engine/risk/risk_score.py`
- **API:** ✅ Embedded in risk endpoint
- **Tests:** ✅ 2 golden vectors
- **Frontend:** ⏳ `src/components/company/risk/RiskScore.tsx`

---

*Spec Version: 1.0.0 | Implementation: ✅ Backend Complete*