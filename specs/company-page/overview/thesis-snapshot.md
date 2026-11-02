# Thesis Snapshot Tool Specification

**Tool Name:** Thesis Snapshot  
**Category:** Overview  
**Sheet:** Company Page → Overview  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
One-page snapshot of the investment thesis: core thesis statement, key value drivers (3-5), bear/base/bull scenarios with probabilities, margin of safety, and kill criteria. Forces explicit assumptions and enables scenario analysis.

### 1.2 Excel Source
| Field | Value |
|-------|-------|
| Sheet | Company Page |
| Category | Overview |
| Tool | Thesis Snapshot |
| Description | Investment thesis with scenario analysis and kill criteria |
| Data Source | Manual entry + Valuation models |

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Thesis Snapshot - [SYMBOL]                                      │
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
│ │ Base   │ 1250 │ 50%  │ As guided  │ │                        │
│ │ Bull   │ 1850 │ 25%  │ Rev +30%,  │ │ MOS vs CMP: +38%       │
│ │        │      │      │ Margin +3% │ │                        │
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

---

## 4. Data Sources
- **Thesis/Driver/Scenarios:** Manual entry (analyst)
- **FV per case:** From Valuation Suite engines (DCF, Relative, SOTP)
- **CMP:** Company Page header (real-time)

---

## 5. Component Spec

### 5.1 ThesisEditor (TextArea with character count)
### 5.2 DriverTable (Add/remove rows, % allocation must sum to 100%)
### 5.3 ScenarioTable (Bear/Base/Bull with probability validation = 100%)
### 5.4 CatalystTimeline (Date picker + text)
### 5.5 KillCriteria (Checkbox list with custom entries)
### 5.6 SensitivityMatrix (Read-only, driven by valuation engines)

---

## 6. Implementation Plan

### Phase 1: Component Structure (Week 1)
- [ ] Create `ThesisSnapshot.tsx` in `src/components/company/overview/`
- [ ] Sub-components: ThesisEditor, DriverTable, ScenarioTable, CatalystTimeline, KillCriteria
- [ ] Add to WidgetRegistry: `"thesis-snapshot"`

### Phase 2: Data Integration (Week 2)
- [ ] Connect to Valuation Suite for Base/Bear/Bull FV
- [ ] Persist to workspaceStore (companyWidgets)
- [ ] Auto-fetch CMP from CompanyContext

### Phase 3: Polish (Week 2-3)
- [ ] Validation: probabilities sum to 100%, drivers sum to 100%
- [ ] Export to PDF
- [ ] Dark mode / Accessibility

---

## 7. Testing
- Unit: Each sub-component renders, validation works
- Integration: FV auto-updates when valuation engines change
- E2E: Create thesis → Save → Reload → Verify persistence

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started*