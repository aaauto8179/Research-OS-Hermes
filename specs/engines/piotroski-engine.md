# Piotroski F-Score Engine Specification

**Tool Name:** Piotroski F-Score Engine  
**Category:** Forensics Engines  
**Sheet:** Tools (Master)  
**Spec Version:** 1.0.0  
**Status:** ✅ Complete  
**Owner:** Quant Team  
**Last Updated:** 2025-10-31

---

## 3. Calculations & Logic

### 3.1 Nine Signals

| Category | Signal | Condition | Score |
|----------|--------|-----------|-------|
| **Profitability (4)** | | | |
| F1 | ROA > 0 | PAT > 0 | 1/0 |
| F2 | CFO > 0 | Operating Cash Flow > 0 | 1/0 |
| F3 | ΔROA > 0 | ROAₜ > ROAₜ₋₁ | 1/0 |
| F4 | CFO > ROA | CFO > PAT | 1/0 |
| **Leverage/Liquidity (3)** | | | |
| F5 | ΔLeverage < 0 | Debt/Equityₜ < Debt/Equityₜ₋₁ | 1/0 |
| F6 | ΔLiquidity > 0 | Current Ratioₜ > Current Ratioₜ₋₁ | 1/0 |
| F7 | No Dilution | Sharesₜ ≤ Sharesₜ₋₁ | 1/0 |
| **Operating Efficiency (2)** | | | |
| F8 | ΔMargin > 0 | Gross Marginₜ > Gross Marginₜ₋₁ | 1/0 |
| F9 | ΔTurnover > 0 | Asset Turnoverₜ > Asset Turnoverₜ₋₁ | 1/0 |

### 3.2 Scoring
| Total Score | Category |
|-------------|----------|
| 8-9 | High Quality |
| 5-7 | Medium Quality |
| 0-4 | Low Quality |

### 3.3 Output
```json
{
  "f_score": 7,
  "category": "MEDIUM_QUALITY",
  "signals": {
    "profitability": {"f1": 1, "f2": 1, "f3": 1, "f4": 1},
    "leverage_liquidity": {"f5": 0, "f6": 1, "f7": 1},
    "operating_efficiency": {"f8": 1, "f9": 0}
  },
  "trend": [6, 7, 5, 8, 7]  // 5-year history
}
```

---

## 4. Golden Vector Tests (3 vectors)

| Test Case | Signals | Expected Score | Tolerance |
|-----------|---------|----------------|-----------|
| High Quality | 8 positive | 8 | 1e-6 |
| Medium Quality | 6 positive | 6 | 1e-6 |
| Low Quality | 3 positive | 3 | 1e-6 |

---

## 6. Implementation Status

- **Backend:** ✅ `math-engine/src/math_engine/forensics/piotroski.py`
- **API:** ✅ `POST /piotroski`
- **Tests:** ✅ 3 golden vectors
- **Frontend:** ⏳ `src/components/company/analysis/PiotroskiFScore.tsx`

---

*Spec Version: 1.0.0 | Implementation: ✅ Backend Complete*