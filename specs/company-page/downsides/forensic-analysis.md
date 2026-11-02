# Forensic Analysis Tool Specification

**Tool Name:** Forensic Analysis  
**Category:** Downsides & Exit Triggers  
**Sheet:** Company Page → Downsides  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Comprehensive forensic analysis dashboard aggregating all forensic engines: Beneish M-Score, Altman Z-Score, Piotroski F-Score, Red Flags, Accounting Quality. Unified dashboard with trend analysis, peer comparison, and alert system.

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Forensic Analysis - [SYMBOL]                                    │
├─────────────────────────────────────────────────────────────────┤
│ FORENSIC SCORECARD                                              │
│ ┌────────────────────┬────────┬────────┬────────┬─────────────┐ │
│ │ Engine             │ Score  │ Status │ Trend  │ Alert       │ │
│ ├────────────────────┼────────┼────────┼────────┼─────────────┤ │
│ │ Beneish M-Score    │ -2.45  │ ✅ Safe│ →      │ None        │ │
│ │ Altman Z-Score     │ 3.82   │ ✅ Safe│ ▲      │ None        │ │
│ │ Piotroski F-Score  │ 7/9    │ ✅ Good│ ▲      │ None        │ │
│ │ Management Consist.│ 92%    │ ✅ High│ ▲      │ None        │ │
│ │ Revenue Projection │ -      │ -      │ -      │ -           │ │
│ │ Red Flags          │ 3      │ ⚠️     │ →      │ 2 High      │ │
│ ├────────────────────┼────────┼────────┼────────┼─────────────┤ │
│ │ COMPOSITE          │ 85/100 │ 🟢 Low │ ▲      │             │ │
│ └────────────────────┴────────┴────────┴────────┴─────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ DETAILED ENGINE VIEWS (Tabs)                                    │
│ [Beneish] [Altman] [Piotroski] [Mgmt Consistency] [Red Flags]  │
├─────────────────────────────────────────────────────────────────┤
│ TREND ANALYSIS (5Y)                                             │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Composite Score: 78 ──●──●──●──●──●── 85 (Improving)        │ │
│ │ Beneish: -2.8 ──●──●──●──●──●── -2.45 (Improving)          │ │
│ │ Altman: 3.2 ──●──●──●──●──●── 3.82 (Improving)            │ │
│ │ Piotroski: 6 ──●──●──●──●──●── 7 (Improving)              │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ PEER COMPARISON                                                 │
│ ┌────────────┬────────┬────────┬────────┬────────┐            │
│ │ Engine     │ Company│ Peer Avg│ Sector │ Rank   │            │
│ ├────────────┼────────┼────────┼────────┼────────┤            │
│ │ Beneish    │ -2.45  │ -2.10   │ -2.20  │ 65th   │            │
│ │ Altman     │ 3.82   │ 3.10    │ 2.80   │ 78th   │            │
│ │ Piotroski  │ 7      │ 5.5     | 5.0    │ 82nd   │            │
│ └────────────┴────────┴────────┴────────┴────────┘            │
├─────────────────────────────────────────────────────────────────┤
│ ALERT RULES                                                     │
│ □ Beneish > -1.78 → "Manipulation Alert"                       │
│ □ Altman < 1.81 → "Distress Alert"                              │
│ □ Piotroski < 4 → "Quality Alert"                               │
│ □ Red Flags High > 2 → "Governance Alert"                       │
│ □ Composite < 50 → "High Risk Alert"                            │
├─────────────────────────────────────────────────────────────────┤
│ [Run Full Analysis] [Set Alerts] [Export Report] [Schedule]     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Data Pipeline

### 3.1 Input Data
| Field | Type | Source |
|-------|------|--------|
| forensic_scores | object | Engine outputs |
| red_flags | RedFlag[] | Red Flags tool |
| peer_comparison | PeerComparison[] | Screening Engine |

---

## 4. Engine Integration

### 4.1 Engines Consumed
| Engine | Source |
|--------|--------|
| Beneish M-Score | `math_engine.forensics.beneish` |
| Altman Z-Score | `math_engine.forensics.altman` |
| Piotroski F-Score | `math_engine.forensics.piotroski` |
| Management Consistency | `math_engine.analysis.concall_consistency` |
| Red Flags | `company-page/risk/red-flags` |

---

## 4. API Contract

```typescript
interface ForensicAnalysisData {
  symbol: string;
  compositeScore: number;
  grade: 'Low' | 'Moderate' | 'High';
  engines: EngineScore[];
  redFlags: RedFlag[];
  trend: TrendData;
  peerComparison: PeerComparison[];
  alerts: Alert[];
  lastUpdated: string;
}

interface EngineScore {
  name: string;
  score: number | string;
  status: 'Safe' | 'Warning' | 'Distress' | 'Good' | 'Moderate' | 'Poor';
  trend: 'Improving' | 'Stable' | 'Deteriorating';
  alert: string | null;
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Scorecard with 6 engines, composite score | Week 1 |
| 2 | Tabbed engine views, trend charts (5Y) | Week 1-2 |
| 2 | Peer comparison table, percentile ranks | Week 2 |
| 3 | Alert rules engine, scheduled runs | Week 2-3 |

---

## 6. Testing
- Composite score calculation (weighted average)
- Engine score status mapping
- Trend calculation (5Y)
- Peer percentile ranks
- Alert rule triggering

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started*