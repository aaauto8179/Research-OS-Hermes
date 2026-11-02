# Hedging Mechanism Engine Specification

**Tool Name:** Hedging Mechanism Engine  
**Category:** Risk Engines  
**Sheet:** Company Page → Downsides  
**Spec Version:** 1.0.0  
**Status:** ✅ Complete  
**Owner:** Quant Team  
**Last Updated:** 2025-10-31

---

## 3. Calculations & Logic

### 3.1 Strategies

| Strategy | Use Case | Payoff |
|----------|----------|--------|
| **Protective Put** | Single stock downside | Long Put (OTM 5-10%) |
| **Collar** | Hold with capped upside | Long Put + Short Call |
| **Index Hedge** | Portfolio beta hedge | Nifty Futures / Put Spread |
| **Sector Hedge** | Sector concentration | Sector ETF Short / Put |
| **Pairs Hedge** | Relative value | Long/Short peer pair |

### 3.2 Calculations

#### Optimal Hedge Ratio (Minimum Variance)
```python
h* = ρ × (σ_stock / σ_index) × (Value_stock / Value_index)
```

#### Protective Put
```python
max_loss = (Stock_Price - Put_Strike) + Put_Premium
breakeven = Stock_Price + Put_Premium
```

#### Collar
```python
max_loss = (Stock_Price - Put_Strike) + Put_Premium
max_gain = (Call_Strike - Stock_Price) - Call_Premium
```

#### Cost of Carry (Futures)
```python
fair_future = Spot × (1 + r × T/365) - Div_Yield
```

---

## 4. Golden Vector Tests (2 vectors)

| Test Case | Strategy | Expected Max Loss | Tolerance |
|-----------|----------|-------------------|-----------|
| Protective Put | Put 95% | -5.1% | 1e-6 |
| Collar | Put 95% + Call 105% | -5.1% / +4.8% | 1e-6 |

---

## 6. Implementation Status

- **Backend:** ✅ `math-engine/src/math_engine/risk/hedging.py`
- **API:** ✅ Embedded in risk endpoint
- **Tests:** ✅ 2 golden vectors
- **Frontend:** ⏳ `src/components/company/downsides/HedgingMechanism.tsx`

---

*Spec Version: 1.0.0 | Implementation: ✅ Backend Complete*