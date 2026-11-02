# Altman Z-Score Engine Specification

**Tool Name:** Altman Z-Score Engine  
**Category:** Forensics Engines  
**Sheet:** Tools (Master)  
**Spec Version:** 1.0.0  
**Status:** ✅ Complete  
**Owner:** Quant Team  
**Last Updated:** 2025-10-31

---

## 3. Calculations & Logic

### 3.1 Three Models

| Model | Formula | Zones |
|-------|---------|-------|
| **Original** (Public Mfg) | Z = 1.2X₁ + 1.4X₂ + 3.3X₃ + 0.6X₄ + 1.0X₅ | Safe > 2.99, Grey 1.81-2.99, Distress < 1.81 |
| **Revised** (Private) | Z' = 0.717X₁ + 0.847X₂ + 3.107X₃ + 0.420X₄ + 0.998X₅ | Safe > 2.6, Grey 1.1-2.6, Distress < 1.1 |
| **Emerging Markets** | Z'' = 6.56X₁ + 3.26X₂ + 6.72X₃ + 1.05X₄ | Safe > 2.6, Grey 1.1-2.6, Distress < 1.1 |

### 3.2 Variables
| X | Formula |
|---|---------|
| X₁ | Working Capital / Total Assets |
| X₂ | Retained Earnings / Total Assets |
| X₃ | EBIT / Total Assets |
| X₄ | Market Cap / Total Liabilities |
| X₅ | Revenue / Total Assets |

### 3.3 Output
```json
{
  "model": "original",
  "z_score": 3.24,
  "zone": "SAFE",
  "thresholds": { "safe": 2.99, "grey": 1.81, "distress": 1.81 },
  "variables": { "x1": 0.15, "x2": 0.12, "x3": 0.14, "x4": 2.8, "x5": 0.85 },
  "trend": [4.2, 3.8, 3.4, 3.0, 3.24]  // 5-year history
}
```

---

## 4. Golden Vector Tests (3 vectors)

| Test Case | Model | Variables | Expected Z | Tolerance |
|-----------|-------|-----------|------------|-----------|
| Safe Manufacturer | Original | Healthy | 3.85 | 1e-6 |
| Distressed Private | Revised | Weak | 0.95 | 1e-6 |
| Emerging Market | Emerging | Mixed | 2.10 | 1e-6 |

---

## 6. Implementation Status

- **Backend:** ✅ `math-engine/src/math_engine/forensics/altman.py`
- **API:** ✅ `POST /altman`
- **Tests:** ✅ 3 golden vectors
- **Frontend:** ⏳ `src/components/company/analysis/AltmanZScore.tsx`

---

*Spec Version: 1.0.0 | Implementation: ✅ Backend Complete*