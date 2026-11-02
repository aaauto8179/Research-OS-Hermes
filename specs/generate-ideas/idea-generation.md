# Idea Generation Tool Specification

**Tool Name:** Idea Generation  
**Category:** Research  
**Sheet:** Generate ideas  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Systematic idea generation pipeline: Screening-based discovery → Deep dive queue → Research workspace → Thesis builder → Decision Terminal. Sources: Quantitative screens, Macro themes, Sector trends, Corporate actions, Management changes, Peer analysis, Document AI alerts. Outputs: Ranked idea list with thesis, valuation, risk, and conviction.

---

## 3. UI/UX Specification

### 3.1 Layout (Pipeline View)
```
┌─────────────────────────────────────────────────────────────────┐
│ Idea Generation Pipeline                                        │
├─────────────────────────────────────────────────────────────────┤
│ SOURCES: [Screens ▼] [Macro Themes] [Sector Trends] [CA] [Mgmt]│
├─────────────────────────────────────────────────────────────────┤
│ STAGE 1: DISCOVERY (Auto-populated from sources)                │
│ ┌────┬────────┬────────┬────────┬────────┬────────┬────────┐   │
│ │ #  │ Symbol │ Source │ Score  │ Metric │ Val    │ Act   │   │
│ ├────┼────────┼────────┼────────┼────────┼────────┼────────┤   │
│ │ 1  │ ABC    │ Screen │ 87/100 │ ROE 28%│ 12x PE │ [→]   │   │
│ │ 2  │ XYZ    │ Macro  │ 82/100 │ Infra  │ 15x EV │ [→]   │   │
│ │ 3  │ PQR    │ CA     │ 79/100 │ Demerger│ 8x PE │ [→]   │   │
│ └────┴────────┴────────┴────────┴────────┴────────┴────────┘   │
│ [Run Screens] [Refresh Macro] [Add Manual Idea]                 │
├─────────────────────────────────────────────────────────────────┤
│ STAGE 2: DEEP DIVE QUEUE                                        │
│ ┌────┬────────┬────────┬────────┬────────┬────────┬────────┐   │
│ │ #  │ Symbol │ Status │ Analyst│ Days   │ Thesis │ Act   │   │
│ ├────┼────────┼────────┼────────┼────────┼────────┼────────┤   │
│ │ 1  │ DEF    │ Research│ You   │ 3      │ Draft  │ [🔍]  │   │
│ │ 2  │ GHI    │ Valuing │ You   │ 7      │ Done   │ [📊]  │   │
│ │ 3  │ JKL    │ Review  │ You   │ 1      │ Done   │ [✅]  │   │
│ └────┴────────┴────────┴────────┴────────┴────────┴────────┘   │
├─────────────────────────────────────────────────────────────────┤
│ STAGE 3: RESEARCH WORKSPACE (per idea)                          │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Idea: ABC LTD  │ Score: 87/100  │ Stage: Research           │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ QUANTITATIVE: [Screening Output] [Peer Compare] [Financials]│ │
│ │ QUALITATIVE:  [Concall Notes] [Doc AI Insights] [News]      │ │
│ │ THESIS BUILDER:                                             │ │
│ │ 1. What: [Text area]                                        │ │
│ │ 2. Why Now: [Text area]                                     │ │
│ │ 3. Catalyst: [Text area]                                    │ │
│ │ 4. Risks: [Text area]                                       │ │
│ │ 5. Valuation: [Link to Valuation Suite]                     │ │
│ │ 6. Conviction: [High/Med/Low] [Slider 0-100]               │ │
│ │ [Save Thesis] [Run Fit Check] [Run Sizing] [To Decision]    │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ STAGE 4: DECISION TERMINAL                                      │
│ [Links to Weigh Decisions: Fit Check, Sizing, Scenario, Journal]│
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Data Pipeline

### 3.1 Idea Sources & Scoring
```python
IDEA_SOURCES = {
    'quant_screen': {
        'weight': 0.30,
        'screens': ['quality_growth', 'value', 'momentum', 'turnaround', 'smallcap_gems']
    },
    'macro_theme': {
        'weight': 0.20,
        'themes': ['capex_cycle', 'energy_transition', 'digital_india', 'manufacturing', 'financialization']
    },
    'sector_trend': {
        'weight': 0.15,
        'metrics': ['revenue_growth', 'margin_expansion', 'market_share_gains']
    },
    'corporate_action': {
        'weight': 0.15,
        'actions': ['demerger', 'merger', 'buyback', 'promoter_buying', 'insider_buying']
    },
    'management_change': {
        'weight': 0.10,
        'signals': ['new_ceo', 'promoter_exit', 'board_changes', 'auditor_change']
    },
    'peer_analysis': {
        'weight': 0.10,
        'signals': ['peer_outperformance', 'valuation_gap', 'catalyst_gap']
    }
}

def calculate_idea_score(symbol, source_data):
    score = 0
    for source, config in IDEA_SOURCES.items():
        source_score = run_source_scorer(symbol, source, source_data)
        score += source_score * config['weight']
    return min(100, round(score * 100))
```

---

## 4. Engine Integration

### 4.1 Links
- **Screening Engine:** Quantitative screens
- **Macro Page:** Macro themes
- **Industry Page:** Sector trends
- **Corporate Actions:** CA alerts
- **Document AI:** Insights, management changes
- **Valuation Suite:** Thesis valuation
- **Weigh Decisions:** Fit Check, Sizing, Journal

---

## 4. API Contract

```typescript
interface IdeaGenerationData {
  discovery: Idea[];
  deepDive: DeepDiveIdea[];
  researchWorkspace: ResearchWorkspace;
  sources: IdeaSource[];
  lastUpdated: string;
}

interface Idea {
  symbol: string;
  name: string;
  source: string;
  score: number;
  keyMetric: string;
  valuation: string;
  stage: 'discovery' | 'deep_dive' | 'research' | 'decision' | 'archived';
  addedAt: string;
}

interface ResearchWorkspace {
  symbol: string;
  quantitative: ScreeningOutput;
  qualitative: QualitativeData;
  thesis: ThesisDraft;
  valuation: ValuationLink;
  conviction: number;
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Idea source pipeline, scoring engine | Week 1 |
| 2 | Pipeline UI (4 stages), drag-drop between stages | Week 1 |
| 2 | Research workspace with thesis builder | Week 2 |
| 3 | Screening/Macro/Industry/CA integration | Week 2 |
| 3 | Decision Terminal links, export to portfolio | Week 3 |

---

## 5. Testing

| Test | Expected |
|------|----------|
| Source scoring | Weighted sum = 100 max |
| Pipeline drag-drop | Stage updates persist |
| Thesis builder | Auto-saves, links to Valuation |
| Fit Check link | Pre-fills symbol |
| Conviction slider | 0-100, saves |

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started | Priority: HIGH*