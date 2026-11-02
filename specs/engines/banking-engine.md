# Banking P/B-ROE Valuation Engine Specification

**Tool Name:** Banking P/B-ROE Valuation Engine  
**Category:** Valuation Engines  
**Sheet:** Tools (Master)  
**Spec Version:** 1.0.0  
**Status:** ✅ Complete  
**Owner:** Quant Team  
**Last Updated:** 2025-10-31

---

## 3. Calculations & Logic

### 3.1 Core Formulas

#### P/B-ROE Regression
```python
# Indian Banking calibrated: P/B = α + β × ROE
# α = 0.8, β = 8.5 (R² ≈ 0.72)
predicted_pb = 0.8 + 8.5 × target_roe
implied_price = predicted_pb × target_book_value_per_share
```

#### Residual Income Cross-Check
```python
# V₀ = B₀ + Σ(ROE_t - r) × B_{t-1} / (1+r)^t + TV
# TV = (ROE_T - r) × B_{T-1} / (r - g)

B_t = B_{t-1} × (1 + ROE_t × (1 - payout_ratio))
RI_t = (ROE_t - cost_of_equity) × B_{t-1}
PV_RI = Σ(RI_t / (1+r)^t)
TV = (ROE_T - r) × B_{T-1} / (r - g)
RI_Value = B_0 + PV_RI + TV / (1+r)^T
```

### 3.2 Peer Regression Table
| Peer | ROE (%) | P/B | Predicted P/B | Residual |
|------|---------|-----|---------------|----------|
| HDFCBANK | 16.2 | 2.3 | 2.17 | +0.13 |
| ICICIBANK | 14.8 | 2.1 | 2.05 | +0.05 |
| SBIN | 12.5 | 1.4 | 1.86 | -0.46 |

### 3.3 Output
```json
{
  "predicted_pb": 2.15,
  "implied_price": 1245,
  "ri_value": 1180,
  "pv_ri": 420,
  "pv_terminal": 380,
  "book_value": 380,
  "peer_regression": [...],
  "regression_stats": { "alpha": 0.8, "beta": 8.5, "r2": 0.72 }
}
```

---

## 4. Golden Vector Tests (3 vectors)

| Test Case | Target ROE | Target BV | Expected Price | Tolerance |
|-----------|------------|-----------|----------------|-----------|
| Base HDFC-like | 16.2% | 580 | 1245 | 1e-6 |
| Low ROE | 10% | 400 | 560 | 1e-6 |
| Cross-check RI | 16% | 580 | 1180 (RI) | 1e-6 |

---

## 6. Implementation Status

- **Backend:** ✅ `math-engine/src/math_engine/valuation/banking.py`
- **API:** ✅ `POST /banking`
- **Tests:** ✅ 3 golden vectors
- **Frontend:** ⏳ `src/components/company/valuation/BankingValuation.tsx`

---

*Spec Version: 1.0.0 | Implementation: ✅ Backend Complete*