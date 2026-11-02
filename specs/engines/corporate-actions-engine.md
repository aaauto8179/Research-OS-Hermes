# Corporate Actions Engine Specification

**Tool Name:** Corporate Actions Engine  
**Category:** Portfolio Engines  
**Sheet:** Portfolio management Page → Corporate Actions  
**Spec Version:** 1.0.0  
**Status:** ✅ Complete  
**Owner:** Quant Team  
**Last Updated:** 2025-10-31

---

## 3. Calculations & Logic

### 3.1 Action Types & Adjustments

| Action | Adjustment Logic |
|--------|------------------|
| **Split** | qty' = qty × ratio; avg_price' = avg_price / ratio |
| **Bonus** | qty' = qty × (1 + ratio); avg_price' = avg_price / (1 + ratio) |
| **Rights** | qty' = qty + rights_entitled; avg_price' = (qty×avg + rights×price) / qty' |
| **Merger** | qty' = qty × swap_ratio; avg_price' = avg_price / swap_ratio |
| **Dividend** | cash_received += qty × dividend_per_share; no qty/avg change |

### 3.2 Portfolio Adjustment
```python
def adjust_holdings(holdings, action):
    for h in holdings:
        if h.symbol == action.symbol:
            if action.type == "split":
                h.qty = int(h.qty * action.ratio)
                h.avg_price = h.avg_price / action.ratio
            elif action.type == "bonus":
                h.qty = int(h.qty * (1 + action.ratio))
                h.avg_price = h.avg_price / (1 + action.ratio)
            # ... other actions
    return holdings
```

### 3.3 Output
```json
{
  "adjusted_holdings": [...],
  "action_log": [
    {"symbol": "RELIANCE", "type": "split", "ratio": 2.0, "date": "2024-11-01"}
  ]
}
```

---

## 4. Golden Vector Tests (2 vectors)

| Test Case | Action | Holdings Before | Holdings After | Tolerance |
|-----------|--------|-----------------|----------------|-----------|
| 2:1 Split | Split 2:1 | REL: 100 @ ₹2500 | REL: 200 @ ₹1250 | 1e-6 |
| 1:1 Bonus | Bonus 1:1 | REL: 100 @ ₹2500 | REL: 200 @ ₹1250 | 1e-6 |

---

## 6. Implementation Status

- **Backend:** ✅ `math-engine/src/math_engine/portfolio/corporate_actions.py`
- **API:** ✅ `POST /corporate-actions`
- **Tests:** ✅ 2 golden vectors
- **Frontend:** ⏳ `src/components/portfolio/CorporateActions.tsx`

---

*Spec Version: 1.0.0 | Implementation: ✅ Backend Complete*