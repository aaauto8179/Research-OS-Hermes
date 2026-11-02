# Screening Engine Specification

**Tool Name:** Multi-Factor Screening Engine  
**Category:** Screening Engines  
**Sheet:** Tools (Master)  
**Spec Version:** 1.0.0  
**Status:** ✅ Complete  
**Owner:** Quant Team  
**Last Updated:** 2025-10-31

---

## 3. Calculations & Logic

### 3.1 Ten Standard Factors
| Factor | Formula | Direction | Weight |
|--------|---------|-----------|--------|
| P/E | Market Cap / PAT | Lower Better | 15% |
| EV/EBITDA | (MC+Debt-Cash)/EBITDA | Lower Better | 15% |
| FCF Yield | CFO / Market Cap | Higher Better | 10% |
| ROE | PAT / Equity | Higher Better | 15% |
| ROCE | EBIT / (TA-CL) | Higher Better | 10% |
| Debt/Equity | Debt / Equity | Lower Better | 10% |
| F-Score | Piotroski | Higher Better | 10% |
| Beneish M | M-Score | Lower Better | 5% |
| Altman Z | Z-Score | Higher Better | 5% |
| Momentum 6M | Price Change 6M | Higher Better | 5% |

### 3.2 Screening Process
```python
1. Apply hard filters (criteria: min_roe, max_pe, etc.)
2. For each factor: calculate percentile rank in universe
3. Score = Σ(percentile × weight)
4. Rank by total score (descending)
```

### 3.3 Output
```json
{
  "results": [
    { "symbol": "RELIANCE", "score": 87.2, "rank": 1,
      "factors": {"pe": 22.1, "ev_ebitda": 14.2, ...} },
    { "symbol": "TCS", "score": 84.5, "rank": 2, ... }
  ],
  "universe_size": 500,
  "filters_applied": {...}
}
```

---

## 4. Golden Vector Tests (4 vectors)

| Test Case | Universe | Filters | Expected Top | Tolerance |
|-----------|----------|---------|--------------|-----------|
| Base Screen | 500 | min_roe=15, max_pe=30 | RELIANCE rank 1 | 1e-6 |
| Quality Focus | 500 | min_fscore=7 | High F-score top | 1e-6 |
| Value Screen | 500 | max_pe=15, min_fcf=3% | Value names top | 1e-6 |
| Momentum | 500 | min_mom6m=20% | High momentum top | 1e-6 |

---

## 6. Implementation Status

- **Backend:** ✅ `math-engine/src/math_engine/screening/engine.py`
- **API:** ✅ `POST /screening`
- **Tests:** ✅ 4 golden vectors
- **Frontend:** ⏳ `src/app/screening/page.tsx`

---

*Spec Version: 1.0.0 | Implementation: ✅ Backend Complete*