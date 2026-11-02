# Revenue Projection Engine Specification

**Tool Name:** Revenue Projection Engine  
**Category:** Projection Engines  
**Sheet:** Company Page → Financials (Step 3)  
**Spec Version:** 1.0.0  
**Status:** ✅ Complete  
**Owner:** Quant Team  
**Last Updated:** 2025-10-31

---

## 3. Calculations & Logic

### 3.1 Projection Methods

| Method | Formula | Use Case |
|--------|---------|----------|
| **Driver-Based** | Revenue = Σ(Driverᵢ × Impactᵢ) | When drivers known |
| **Market Share** | Revenue = Market Size × Share % | When TAM known |
| **S-Curve** | Penetration = L / (1 + e^(-k(t-t₀))) | New product ramp |
| **Historical Trend** | CAGR / Linear regression | Mature companies |

### 3.2 Segment Projection
```python
for segment in segments:
    revenue_t = revenue_{t-1} × (1 + growth_rate_t)
    ebitda_t = revenue_t × margin_t
    fcf_t = ebitda_t × (1-tax) + da - capex - Δnwc
```

### 3.3 Output
```json
{
  "segments": [
    { "name": "O2C", "historical": [5000,5500,6000], "projected": [6800,7500,8200], "cagr": 8.5% },
    { "name": "Retail", "historical": [2100,2500,2900], "projected": [3200,3400,3600], "cagr": 12.4% }
  ],
  "consolidated": { "revenue": [9200,10300,11600], "ebitda": [2100,2400,2700] }
}
```

---

## 4. Golden Vector Tests (3 vectors)

| Test Case | Method | Inputs | Expected | Tolerance |
|-----------|--------|--------|----------|-----------|
| Driver-Based | Volume×Price | vol=100, price=50, g=10% | 5500→6050 | 1e-6 |
| Market Share | TAM×Share | TAM=10000, share=20%, g=5% | 2000→2100 | 1e-6 |
| S-Curve | L=10000, k=0.5, t0=3 | Year 1-5 | S-shape ramp | 1e-6 |

---

## 6. Implementation Status

- **Backend:** ✅ `math-engine/src/math_engine/projection/revenue.py`
- **API:** ✅ Embedded in screening/portfolio
- **Tests:** ✅ 3 golden vectors
- **Frontend:** ⏳ `src/components/company/financials/RevenueProjection.tsx`

---

*Spec Version: 1.0.0 | Implementation: ✅ Backend Complete*