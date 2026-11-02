# Spec Template — Research OS Tool Specification

**Tool Name:** [Tool Name]  
**Category:** [Category] / [Tab]  
**Sheet:** [Excel Sheet Name]  
**Spec Version:** 1.0.0  
**Status:** [✅ Complete / 🔄 In Progress / ⏳ Not Started / ❌ Blocked]  
**Owner:** [Owner Name]  
**Last Updated:** [YYYY-MM-DD]

---

## 1. Purpose & Scope

### 1.1 What this tool does
[2-3 sentences describing the tool's core function and value to the equity research workflow]

### 1.2 What this tool does NOT do
[Explicit boundaries to prevent scope creep]

### 1.3 User Stories
- As a [role], I want to [action], so that [benefit]
- As a [role], I want to [action], so that [benefit]

---

## 2. Excel Source Reference

| Field | Value |
|-------|-------|
| Sheet | [Sheet Name] |
| Category | [Category from Excel] |
| Tool Name | [Exact tool name from Excel] |
| Description | [Description from Excel] |
| Data Source | [Data source from Excel] |
| Sample Link | [Google Drive link from Excel] |

---

## 3. UI/UX Specification

### 3.1 Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│ [Tool Name] - [SYMBOL/PORTFOLIO/INDUSTRY]                   │
├─────────────────────────────────────────────────────────────┤
│ CONTROLS/INPUTS                    │ MAIN CONTENT           │
│ ┌─────────────────────────────┐    │ ┌───────────────────┐  │
│ │ [Control 1]                 │    │ │ [Primary View]    │  │
│ │ [Control 2]                 │    │ │                   │  │
│ │ [Control 3]                 │    │ │                   │  │
│ └─────────────────────────────┘    │ └───────────────────┘  │
│                                    │ ┌───────────────────┐  │
│ [Action Buttons]                   │ │ [Secondary View]  │  │
│ ┌─────────────────────────────┐    │ │                   │  │
│ │ [Save] [Export] [Reset]     │    │ └───────────────────┘  │
│ └─────────────────────────────┘    │ ┌───────────────────┐  │
│                                    │ │ [Details/Drawer]  │  │
└────────────────────────────────────┴─┴───────────────────┘  │
```

### 3.2 Component Breakdown
| Region | Component | Props/State | Interactions |
|--------|-----------|-------------|--------------|
| Header | ToolTitle | symbol, name, conviction | Click to navigate |
| Sidebar | InputPanel | form fields, validation | Real-time validation |
| Main | DataTable/Chart/Canvas | data, sorting, filtering | Row click → drawer |
| Footer | ActionBar | save, export, reset | Confirm on unsaved |

### 3.3 Responsive Behavior
| Breakpoint | Layout Change |
|------------|---------------|
| < 640px | Stack sidebar over main, drawer becomes bottom sheet |
| 640-1024px | Sidebar collapsible, main takes remaining width |
| > 1024px | Full three-panel layout |

### 3.4 Dark Mode & Accessibility
- All colors via CSS variables (`--foreground`, `--muted`, `--primary`, `--border`)
- ARIA labels on all interactive elements
- Keyboard navigation: Tab → Arrow keys → Enter/Space
- Focus visible outlines on all interactive elements
- Screen reader announcements for dynamic updates

---

## 4. Data Pipeline & Sources

### 4.1 Input Data Requirements
| Field | Type | Required | Source | Validation |
|-------|------|----------|--------|------------|
| symbol | string | Yes | Company Page context | NSE ticker format |
| [field] | [type] | [Y/N] | [source] | [rule] |

### 4.2 Data Sources Priority
1. **Primary:** [e.g., Company Page financial statements]
2. **Secondary:** [e.g., Screener.in API, BSE/NSE RSS]
3. **Tertiary:** [e.g., Manual entry, Document AI extraction]
4. **Fallback:** [e.g., Mock data for development]

### 4.3 Data Transformation Pipeline
```
Raw Source → [Extractor] → [Classifier] → [PIT Transformer] → [Chunker] → [Embedder] → Vector Store
                    ↓
              [Calculator Engine] → [Cache] → API Response
```

### 4.4 Point-in-Time (PIT) Compliance
- All data tagged with `filing_date` and `as_of_date`
- No forward-looking data in historical calculations
- Restatements create new records, preserve originals

---

## 5. Calculations & Logic

### 5.1 Core Formulas
```python
# Formula 1: [Name]
result = (input_a * input_b) / input_c
# Constraints: input_c != 0

# Formula 2: [Name]
# ...
```

### 5.2 Calculation Steps (Deterministic)
| Step | Operation | Inputs | Output | Validation |
|------|-----------|--------|--------|------------|
| 1 | [Operation] | [Inputs] | [Output] | [Rule] |
| 2 | [Operation] | [Inputs] | [Output] | [Rule] |

### 5.3 Edge Cases & Error Handling
| Scenario | Handling | User Feedback |
|----------|----------|---------------|
| Division by zero | Return null, flag in audit | "Insufficient data for calculation" |
| Missing input | Use default / skip | "Using default: X" |
| Out of bounds | Clamp to range | "Value capped at limit" |

### 5.4 Audit Trail Output
```json
{
  "calculation_id": "uuid",
  "tool": "[tool-name]",
  "timestamp": "ISO8601",
  "inputs_hash": "sha256",
  "inputs": { ... },
  "outputs": { ... },
  "steps": [
    { "step": 1, "formula": "...", "inputs": {...}, "output": ... }
  ],
  "version": "1.0.0"
}
```

---

## 6. API Contract

### 6.1 Frontend → Backend
```typescript
// Request
interface [Tool]Request {
  symbol: string;
  inputs: [Tool]Inputs;
  options?: [Tool]Options;
}

// Response
interface [Tool]Response {
  calculation_id: string;
  result: [Tool]Result;
  audit: AuditTrail;
  meta: { cached: boolean; latency_ms: number };
}
```

### 6.2 Backend Endpoint
| Method | Path | Auth | Rate Limit |
|--------|------|------|------------|
| POST | `/api/math-engine/[tool]` | JWT | 60/min |

### 6.3 Error Responses
| Code | Scenario | Response |
|------|----------|----------|
| 400 | Invalid inputs | `{ "error": "ValidationError", "details": [...] }` |
| 404 | Symbol not found | `{ "error": "NotFound", "symbol": "..." }` |
| 500 | Calculation error | `{ "error": "CalculationError", "calculation_id": "..." }` |

---

## 7. Testing Requirements

### 7.1 Golden Vector Tests (Backend)
| Test Case | Inputs | Expected Output | Tolerance |
|-----------|--------|-----------------|-----------|
| Base case | [inputs] | [outputs] | 1e-6 |
| Edge case 1 | [inputs] | [outputs] | 1e-6 |
| Edge case 2 | [inputs] | [outputs] | 1e-6 |
| Known regression | [inputs] | [outputs] | 1e-6 |

### 7.2 Frontend Component Tests
| Test | Description |
|------|-------------|
| Render with valid data | Component displays correctly |
| Render with missing data | Shows skeleton/placeholder |
| User interactions | Click, type, select work |
| Validation errors | Shows inline errors |
| Dark mode | Colors correct |
| Accessibility | ARIA labels, keyboard nav |

### 7.3 Integration Tests
| Test | Description |
|------|-------------|
| API → UI flow | Request → Response → Render |
| Cache behavior | Second request uses cache |
| Error handling | 500 shows friendly message |
| Loading states | Skeleton → Data transition |

### 7.4 Test File Locations
- Backend: `math-engine/tests/test_[tool].py`
- Frontend: `research-os-frontend/src/components/[tab]/[tool].test.tsx`
- E2E: `research-os-frontend/e2e/[tool].spec.ts`

---

## 8. Implementation Plan

### 8.1 Phase 1: Backend Engine (Week 1)
- [ ] Create engine module in `math-engine/src/math_engine/[domain]/`
- [ ] Implement calculation class with deterministic logic
- [ ] Add golden vector tests
- [ ] Add to engine registry
- [ ] Update API endpoint in `math-engine/api/main.py`

### 8.2 Phase 2: Frontend Component (Week 2)
- [ ] Create component in `src/components/[tab]/[tool].tsx`
- [ ] Add to WidgetRegistry
- [ ] Implement input validation with Zod
- [ ] Add loading/error/skeleton states
- [ ] Connect to API via SWR hook

### 8.3 Phase 3: Integration (Week 2-3)
- [ ] Add to Company Page tab layout
- [ ] Wire up data flow (context → API → component)
- [ ] Add persistence to workspace store
- [ ] Test end-to-end with real data

### 8.4 Phase 4: Polish (Week 3)
- [ ] Dark mode verification
- [ ] Accessibility audit
- [ ] Performance profiling
- [ ] Documentation update

---

## 9. Dependencies

| Dependency | Type | Version | Purpose |
|------------|------|---------|---------|
| [lib] | [npm/pip] | [ver] | [purpose] |

---

## 10. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| [Risk] | [H/M/L] | [H/M/L] | [Mitigation] |

---

## 11. Verification Checklist

### Spec Completeness
- [ ] All Excel fields mapped
- [ ] UI layout documented
- [ ] Calculations specified
- [ ] Data sources identified
- [ ] API contract defined
- [ ] Test cases listed

### Implementation Readiness
- [ ] Backend engine location decided
- [ ] Frontend component location decided
- [ ] Shared types defined
- [ ] Test infrastructure exists

### Quality Gates
- [ ] Golden vectors cover base + edge cases
- [ ] TypeScript strict mode passes
- [ ] ESLint clean
- [ ] Accessibility audit passed
- [ ] Dark mode verified

---

*Template Version: 1.0.0 | Use this template for every tool spec*