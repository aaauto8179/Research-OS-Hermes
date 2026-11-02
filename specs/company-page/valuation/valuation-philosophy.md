# Valuation Philosophy Tool Specification

**Tool Name:** Valuation Philosophy  
**Category:** Valuation  
**Sheet:** Company Page → Valuation  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Structured framework to document and stress-test the analyst's valuation thesis. Forces explicit assumptions, identifies key value drivers, and enables scenario analysis with bear/base/bull cases. Links to all valuation engines (DCF, Relative, SOTP, Banking, Excess Return) for auto-populated fair values.

### 1.2 What this tool does NOT do
- Does not run valuation calculations (consumes outputs from valuation engines)
- Does not replace detailed engine inputs (those live in respective engine UIs)
- Does not make buy/sell recommendations (outputs to Decision Terminal)

### 1.3 User Stories
- As an analyst, I want to articulate my thesis in 2-3 sentences, so I can communicate it clearly
- As an analyst, I want to see bear/base/bull valuations side-by-side, so I can assess risk/reward
- As a portfolio manager, I want to see margin of safety vs current price, so I can size positions
- As a compliance officer, I want kill criteria documented, so I can monitor thesis validity

---

## 2. Excel Source Reference

| Field | Value |
|-------|-------|
| Sheet | Company Page |
| Category | Valuation |
| Tool | Valuation Philosophy |
| Description | This will be a text box |
| Data Source | Manual |
| Sample Link | https://drive.google.com/file/d/12R3RAz_lMl0RherNp3qK-t3ZU3eIpqOZ/view |

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Valuation Philosophy - [SYMBOL]                                 │
├─────────────────────────────────────────────────────────────────┤
│ THESIS: "Market leader in structural growth market, pricing    │
│         power + operating leverage = 25% EPS CAGR"             │
├─────────────────────────────────────────────────────────────────┤
│ KEY VALUE DRIVERS (80% of value)                               │
│ 1. Volume growth in core segment (35%)                         │
│ 2. Margin expansion from mix shift (25%)                       │
│ 3. FCF conversion > 80% (20%)                                  │
│ 4. Capital allocation optionality (20%)                        │
├─────────────────────────────────────────────────────────────────┤
│ SCENARIO ANALYSIS                      │ EXPECTED VALUE        │
│ ┌────────┬──────────────────────────┐ │ EV = Σ(P × FV)         │
│ │ Case   │ FV   │ Prob │ Key Deltas │ │ = 0.25×850             │
│ ├────────┼──────┼──────┼────────────┤ │    +0.50×1250          │
│ │ Bear   │ 850  │ 25%  │ Rev -40%,  │ │    +0.25×1850          │
│ │        │      │      │ Margin -4% │ │ = ₹1,238                │
│ │ Base   │ 1250 │ 50%  │ As guided  │ │                         │
│ │ Bull   │ 1850 │ 25%  │ Rev +30%,  │ │ MOS vs CMP: +38%       │
│ │        │      │      │ Margin +3% │ │                         │
│ └────────┴──────┴──────┴────────────┘ └────────────────────────┘
├─────────────────────────────────────────────────────────────────┤
│ CATALYSTS & TIMELINE                │ KILL CRITERIA            │
│ Q2FY25: Capacity online (Mar 25)   │ ✗ Volume decline 2Q      │
│ Q3FY25: New product launch (Jun 25)│ ✗ Margin < 18%           │
│ Q4FY25: FCF inflection (Sep 25)    │ ✗ Capex overrun >20%     │
│                                     │ ✗ Promoter selling       │
├─────────────────────────────────────────────────────────────────┤
│ SENSITIVITY TO KEY DRIVERS                                     │
│ Driver      │ -10%   │ -5%   │ Base │ +5%  │ +10%  │
│ Volume      │ 1,080  │ 1,165 │ 1,250│ 1,335│ 1,420 │
│ Margin      │ 1,120  │ 1,185 │ 1,250│ 1,315│ 1,380 │
│ WACC        │ 1,420  │ 1,330 │ 1,250│ 1,175│ 1,105 │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Components
| Component | Type | Description |
|-----------|------|-------------|
| ThesisEditor | TextArea | 2-3 sentence thesis with char count |
| DriverTable | EditableTable | Add/remove drivers, % allocation must sum to 100% |
| ScenarioTable | EditableTable | Bear/Base/Bull with probability validation (sum=100%) |
| CatalystTimeline | DatePicker + Text | Date + description + impact |
| KillCriteria | Checklist | Pre-defined + custom items |
| SensitivityMatrix | ReadOnlyGrid | Driven by valuation engines |

### 3.3 Validation Rules
| Rule | Error Message |
|------|---------------|
| Sum of driver contributions ≠ 100% | "Total contribution must equal 100%" |
| Sum of scenario probabilities ≠ 100% | "Probabilities must sum to 100%" |
| Any driver contribution < 0 or > 100 | "Contribution must be 0-100%" |
| Any probability < 0 or > 100 | "Probability must be 0-100%" |
| Bear FV ≥ Bull FV | "Bear case must be lower than Bull case" |

---

## 4. Data Pipeline

### 4.1 Input Data
| Field | Type | Source |
|-------|------|--------|
| thesis | string (HTML) | Manual entry |
| drivers | Driver[] | Manual entry |
| scenarios | Scenario[] | Manual entry |
| catalysts | Catalyst[] | Manual entry |
| kill_criteria | KillCriterion[] | Manual entry |
| fv_scenarios | object | Auto from Valuation Suite |

### 4.2 Data Dependencies
- **Reads from:** Valuation Suite engines (DCF, Relative, SOTP, Banking, Excess Return) for Base/Bear/Bull FV
- **Reads from:** Company Page header for CMP
- **Writes to:** workspaceStore (`valuation-philosophy-${symbol}`)

### 4.3 Doc AI Integration (Future)
- Auto-extract thesis from management commentary in annual reports
- Extract guidance numbers for scenario building
- Identify stated catalysts from concall transcripts

---

## 5. Engine Integration

### 5.1 Valuation Engine Inputs
| Engine | Output Used |
|--------|-------------|
| DCF Engine | Bear/Base/Bull FV per share |
| Relative Valuation | Implied valuation range |
| SOTP | Segment-level valuations |
| Banking P/B-ROE | Implied price |
| Excess Return | Equity value per share |

### 5.2 Auto-Population Logic
```typescript
// When Valuation Philosophy loads:
async function loadValuationPhilosophy(symbol: string) {
  const [dcf, relative, sotp, banking, excess] = await Promise.all([
    fetchDCF(symbol),
    fetchRelative(symbol),
    fetchSOTP(symbol),
    fetchBanking(symbol),
    fetchExcessReturn(symbol)
  ]);
  
  // Auto-populate scenarios if empty
  if (!philosophy.scenarios.length) {
    philosophy.scenarios = [
      { case: 'Bear', fv: dcf.bear_fv, probability: 0.25 },
      { case: 'Base', fv: dcf.base_fv, probability: 0.50 },
      { case: 'Bull', fv: dcf.bull_fv, probability: 0.25 }
    ];
  }
}
```

---

## 5. API Contract

```typescript
interface ValuationPhilosophyData {
  symbol: string;
  thesis: string;  // HTML
  drivers: Driver[];
  scenarios: Scenario[];
  catalysts: Catalyst[];
  killCriteria: KillCriterion[];
  sensitivityMatrix: SensitivityRow[];
  expectedValue: number;
  marginOfSafety: number;
  lastUpdated: string;
}

interface Driver {
  id: string;
  description: string;
  contributionPct: number;  // 0-100
  confidence: 'High' | 'Medium' | 'Low';
  evidence: string;
}

interface Scenario {
  id: string;
  name: 'Bear' | 'Base' | 'Bull' | string;
  fvPerShare: number;
  probability: number;  // 0-100, sum = 100
  keyDeltas: string;  // e.g., "Rev -40%, Margin -4%"
}

interface Catalyst {
  id: string;
  date: string;  // ISO
  description: string;
  impact: 'Positive' | 'Neutral' | 'Negative';
  source: string;
}

interface KillCriterion {
  id: string;
  description: string;
  trigger: string;  // e.g., "Volume decline 2 consecutive quarters"
  severity: 'High' | 'Medium' | 'Low';
  status: 'Active' | 'Triggered' | 'Resolved';
}

interface SensitivityRow {
  driver: string;
  values: { pct: number; fv: number }[];  // -10%, -5%, Base, +5%, +10%
}
```

---

## 6. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | ThesisEditor, DriverTable, ScenarioTable components | Week 1 |
| 2 | CatalystTimeline, KillCriteria, SensitivityMatrix | Week 1 |
| 2 | Valuation Engine integration (auto-fetch FV) | Week 2 |
| 3 | Validation (sum=100%), PDF export, Decision Terminal link | Week 2 |

---

## 6. Testing Requirements

### 6.1 Unit Tests
- Driver contribution sum validation (real-time)
- Scenario probability sum validation (real-time)
- Scenario FV ordering (Bear ≤ Base ≤ Bull)
- Sensitivity matrix calculation accuracy
- Expected value calculation: EV = Σ(P × FV)

### 6.2 Integration Tests
- Valuation engine auto-population
- Decision Terminal cross-link navigation
- PDF export with all sections
- Data persistence across sessions

### 6.3 E2E Tests
- Create philosophy → Save → Reload → Verify persistence
- Edit driver → Verify sum validation → Fix → Save
- Empty philosophy → Auto-populate from engines → Edit → Save

---

## 7. Dependencies

| Dependency | Type | Version | Purpose |
|------------|------|---------|---------|
| @tiptap/react | npm | ≥2.1.0 | Rich text editor for thesis |
| @tiptap/starter-kit | npm | ≥2.1.0 | Editor extensions |
| recharts | npm | ≥2.10.0 | Sensitivity matrix visualization |
| date-fns | npm | ≥2.30.0 | Date formatting for catalysts |

---

## 8. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Valuation engines not ready when Philosophy loads | Medium | High | Graceful degradation: show "Engine calculating..." with retry |
| User enters invalid probabilities | High | Medium | Real-time validation with inline errors |
| Sensitivity matrix performance | Low | Low | Memoize calculations, only 5×5=25 cells |
| Cross-engine data consistency | Medium | High | Version stamps on engine outputs |

---

## 9. Verification Checklist

- [ ] All Excel fields mapped to UI components
- [ ] UI layout documented with ASCII wireframes
- [ ] Data sources identified with priority
- [ ] API contract defined with TypeScript interfaces
- [ ] Test cases listed for unit/integration/E2E
- [ ] Implementation plan with phases
- [ ] Dependencies listed
- [ ] Risks identified with mitigations

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started | Priority: HIGH (last Company Page tool)*