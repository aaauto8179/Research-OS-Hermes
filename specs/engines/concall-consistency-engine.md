# Concall Consistency Engine Specification

**Tool Name:** Concall Consistency Engine  
**Category:** Analysis Engines  
**Sheet:** Company Page → Management  
**Spec Version:** 1.0.0  
**Status:** ✅ Complete  
**Owner:** Quant Team  
**Last Updated:** 2025-10-31

---

## 3. Calculations & Logic

### 3.1 Inputs
| Field | Type | Description |
|-------|------|-------------|
| Quarter | string | e.g., "Q4 FY24" |
| Guidance Promised | string | Management guidance text |
| Actual Delivered | string | Actual results text |
| Variance | enum | Met / Beat / Missed |
| Reason | string | Explanation for variance |
| Score (1-5) | integer | Analyst assessment |

### 3.2 Consistency Score
```python
consistency_pct = (Met + Beat) / Total × 100
average_score = Σ Score / Count
```

### 3.3 Output
```json
{
  "consistency_pct": 92,
  "avg_score": 4.8,
  "history": [
    { "quarter": "Q4FY24", "guidance": "O2C $12-14B", "actual": "$13.2B", "variance": "Met", "score": 5 },
    { "quarter": "Q3FY24", "guidance": "Jio ARPU ₹180+", "actual": "₹182", "variance": "Met", "score": 5 }
  ],
  "trends": {
    "4q_met_beat": 100,
    "avg_score_trend": "4.5 → 4.8",
    "misses_2y": 0
  }
}
```

---

## 4. Golden Vector Tests (2 vectors)

| Test Case | History | Expected Consistency | Tolerance |
|-----------|---------|---------------------|-----------|
| Perfect Track Record | 4 Met/Beat | 100% | 1e-6 |
| Mixed | 2 Met, 1 Beat, 1 Miss | 75% | 1e-6 |

---

## 6. Implementation Status

- **Backend:** ✅ `math-engine/src/math_engine/analysis/concall_consistency.py`
- **API:** ✅ Embedded in analysis endpoint
- **Tests:** ✅ 2 golden vectors
- **Frontend:** ⏳ `src/components/company/management/ConcallConsistency.tsx`

---

*Spec Version: 1.0.0 | Implementation: ✅ Backend Complete*