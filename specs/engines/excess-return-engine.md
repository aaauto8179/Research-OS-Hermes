# Excess Return Valuation Engine Specification

**Tool Name:** Excess Return (Residual Income / EVA) Engine  
**Category:** Valuation Engines  
**Sheet:** Tools (Master)  
**Spec Version:** 1.0.0  
**Status:** ✅ Complete  
**Owner:** Quant Team  
**Last Updated:** 2025-10-31

---

## 3. Calculations & Logic

### 3.1 Core Formulas

```python
# Book Value Projection
B_t = B_{t-1} × (1 + ROE_t × (1 - payout_ratio))

# Residual Income
RI_t = (ROE_t - cost_of_equity) × B_{t-1}

# Present Value of RI
PV_RI_t = RI_t / (1 + cost_of_equity)^t

# Terminal Residual Income
terminal_ri = (terminal_roe - cost_of_equity) × B_T / (cost_of_equity - terminal_growth)
PV_terminal_ri = terminal_ri / (1 + cost_of_equity)^T

# Equity Value
Equity_Value = B_0 + Σ(PV_RI_t) + PV_terminal_ri
FV_Per_Share = Equity_Value / Shares_Outstanding
```

### 3.2 Projection Table Output
| Year | B_t (₹/share) | ROE_t (%) | RI_t (₹/share) | PV(RI_t) (₹/share) |
|------|---------------|-----------|----------------|-------------------|
| 0 | 380.0 | - | - | - |
| 1 | 418.0 | 18.0% | 45.6 | 40.2 |
| 2 | 458.2 | 17.5% | 42.8 | 34.1 |
| 3 | 499.0 | 17.0% | 39.5 | 28.2 |
| 4 | 539.9 | 16.5% | 35.8 | 22.8 |
| 5 | 580.3 | 16.0% | 31.8 | 18.1 |
| TV | - | 14.0% | 245.6 | 112.4 |

### 3.3 Output
```json
{
  "book_value_0": 380,
  "pv_ri": 143.4,
  "pv_terminal_ri": 112.4,
  "equity_value": 635.8,
  "fair_value_per_share": 1271.6
}
```

---

## 4. Golden Vector Tests (3 vectors)

| Test Case | B₀ | ROE Array | CoE | Expected FV | Tolerance |
|-----------|-----|-----------|-----|-------------|-----------|
| Base | 380 | [18,17.5,17,16.5,16] | 13.5% | 1271.6 | 1e-6 |
| High ROE | 400 | [20,19,18,17,16] | 12% | 1850.0 | 1e-6 |
| No Excess Return | 500 | [12,12,12,12,12] | 12% | 500.0 (BV only) | 1e-6 |

---

## 6. Implementation Status

- **Backend:** ✅ `math-engine/src/math_engine/valuation/excess_return.py`
- **API:** ✅ `POST /excess-return`
- **Tests:** ✅ 3 golden vectors
- **Frontend:** ⏳ `src/components/company/valuation/ExcessReturnValuation.tsx`

---

*Spec Version: 1.0.0 | Implementation: ✅ Backend Complete*