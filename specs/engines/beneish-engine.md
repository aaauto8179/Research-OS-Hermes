# Beneish M-Score Engine Specification

**Tool Name:** Beneish M-Score Engine  
**Category:** Forensics Engines  
**Sheet:** Tools (Master)  
**Spec Version:** 1.0.0  
**Status:** ✅ Complete  
**Owner:** Quant Team  
**Last Updated:** 2025-10-31

---

## 3. Calculations & Logic

### 3.1 Eight Variables

| Variable | Formula | Description |
|----------|---------|-------------|
| DSRI | (Recₜ/Revₜ) / (Recₜ₋₁/Revₜ₋₁) | Days Sales Receivable Index |
| GMI | GPMₜ₋₁ / GPMₜ | Gross Margin Index |
| AQI | (1 - (CA+PPE+Sec)ₜ/TAₜ) / (1 - (CA+PPE+Sec)ₜ₋₁/TAₜ₋₁) | Asset Quality Index |
| SGI | Revₜ / Revₜ₋₁ | Sales Growth Index |
| DEPI | (Depₜ₋₁/(Depₜ₋₁+PPEₜ₋₁)) / (Depₜ/(Depₜ+PPEₜ)) | Depreciation Index |
| SGAI | (SGAₜ/Revₜ) / (SGAₜ₋₁/Revₜ₋₁) | SG&A Expense Index |
| LVGI | (Debt+Equity)ₜ / (Debt+Equity)ₜ₋₁ | Leverage Index |
| TATA | (PAT - CFO) / TA | Total Accruals to Total Assets |

### 3.2 M-Score Formula
```python
M = -4.84 + 0.92×DSRI + 0.528×GMI + 0.404×AQI + 0.892×SGI \
    + 0.115×DEPI - 0.172×SGAI + 4.679×TATA - 0.327×LVGI
```

### 3.3 Interpretation
| M-Score | Signal |
|---------|--------|
| > -1.78 | ⚠️ Manipulation Likely |
| ≤ -1.78 | ✅ No Manipulation Detected |

### 3.4 Output
```json
{
  "m_score": -1.42,
  "signal": "MANIPULATION_LIKELY",
  "threshold": -1.78,
  "variables": {
    "dsri": 1.05, "gmi": 1.02, "aqi": 1.03, "sgi": 1.08,
    "depi": 0.98, "sgai": 1.01, "lvgi": 1.03, "tata": 0.04
  },
  "interpretation": [
    "DSRI > 1: Receivables growing faster than revenue",
    "GMI > 1: Margin deterioration",
    "TATA > 0: Accruals exceed cash flow"
  ]
}
```

---

## 4. Golden Vector Tests (3 vectors)

| Test Case | Variables | Expected M-Score | Tolerance |
|-----------|-----------|------------------|-----------|
| Manipulator | All high | -1.20 | 1e-6 |
| Clean | All ~1.0 | -2.45 | 1e-6 |
| Borderline | Mix | -1.78 | 1e-6 |

---

## 6. Implementation Status

- **Backend:** ✅ `math-engine/src/math_engine/forensics/beneish.py`
- **API:** ✅ `POST /beneish`
- **Tests:** ✅ 3 golden vectors
- **Frontend:** ⏳ `src/components/company/analysis/BeneishMScore.tsx`

---

*Spec Version: 1.0.0 | Implementation: ✅ Backend Complete*