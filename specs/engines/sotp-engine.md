# SOTP Valuation Engine Specification

**Tool Name:** SOTP (Sum-of-the-Parts) Valuation Engine  
**Category:** Valuation Engines  
**Sheet:** Tools (Master)  
**Spec Version:** 1.0.0  
**Status:** ✅ Complete  
**Owner:** Quant Team  
**Last Updated:** 2025-10-31

---

## 3. Calculations & Logic

### 3.1 Core Formulas

#### Segment Valuation
```python
# Each segment valued by its method
def value_segment(segment):
    if segment.method == "dcf":
        return DCFEngine().calculate(segment.dcf_inputs)
    elif segment.method == "relative":
        return RelativeEngine().calculate(segment.relative_inputs)
    elif segment.method == "multiple":
        return segment.metric * segment.multiple
    elif segment.method == "book_value":
        return segment.book_value
```

#### Holding Discount
```python
segment_net_value = segment_gross_value × (1 - holding_discount)
# holding_discount: 0-50% (0% = no discount, 50% = 50% discount)
```

#### Total Valuation
```python
total_ev = Σ(segment_net_value for all segments)
equity_value = total_ev - consolidated_net_debt
fv_per_share = equity_value / total_shares_outstanding
```

### 3.2 Segment Configuration
```json
{
  "segments": [
    {
      "name": "O2C",
      "method": "dcf",
      "dcf_inputs": { "fcf0": 50000, "growth_rate": 0.12, ... },
      "holding_discount": 0.0
    },
    {
      "name": "Retail",
      "method": "relative",
      "relative_inputs": { "peers": ["DMART", "TRENT"], ... },
      "holding_discount": 0.10
    },
    {
      "name": "Jio",
      "method": "dcf",
      "dcf_inputs": { "fcf0": 30000, "growth_rate": 0.18, ... },
      "holding_discount": 0.15
    }
  ],
  "net_debt": 80000,
  "shares_outstanding": 600
}
```

### 3.3 Output Table
| Name | Method | Gross Value (₹Cr) | Discount | Net Value (₹Cr) | % of EV |
|------|--------|-------------------|----------|-----------------|---------|
| O2C | DCF | 8,50,000 | 0% | 8,50,000 | 52% |
| Retail | Relative | 4,20,000 | 10% | 3,78,000 | 23% |
| Jio | DCF | 5,80,000 | 15% | 4,93,000 | 25% |
| **TOTAL** | | **18,50,000** | | **17,21,000** | **100%** |

---

## 4. API Contract

```typescript
interface SOTPRequest {
  segments: SegmentInput[];
  net_debt: number;
  shares_outstanding: number;
}

interface SOTPResponse {
  calculation_id: string;
  segments: SegmentOutput[];
  total_ev: number;
  equity_value: number;
  fair_value_per_share: number;
  audit: AuditTrail;
}
```

---

## 5. Golden Vector Tests (3 vectors)

| Test Case | Segments | Expected FV/Share | Tolerance |
|-----------|----------|-------------------|-----------|
| Base 3-segment | O2C(DCF), Retail(Rel), Jio(DCF) | 2850 | 1e-6 |
| Single segment | Single DCF | 1700 (matches DCF) | 1e-6 |
| Discount sensitivity | 20% discount on all | 2280 (-20%) | 1e-6 |

---

## 6. Implementation Status

- **Backend:** ✅ `math-engine/src/math_engine/valuation/sotp.py`
- **API:** ✅ `POST /sotp`
- **Tests:** ✅ 3 golden vectors
- **Frontend:** ⏳ `src/components/company/valuation/SOTPValuation.tsx`

---

*Spec Version: 1.0.0 | Implementation: ✅ Backend Complete*