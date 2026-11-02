# Industry Red Flags Tool Specification

**Tool Name:** Industry Red Flags  
**Category:** Risk  
**Sheet:** Company Page → Risk  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Industry-level red flags: disruptive technology, regulatory overhang, structural decline, excess capacity, commoditization risk, ESG headwinds. Links to Industry Page red flags and Regulations Tracker.

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Industry Red Flags - [SYMBOL]                                   │
├─────────────────────────────────────────────────────────────────┤
│ INDUSTRY RED FLAGS                                              │
│ ┌────┬────────────────────────┬────────┬────────┬────────────┐ │
│ │ #  │ Flag                   │ Severity│ Status │ Action     │ │
│ ├────┼────────────────────────┼────────┼────────┼────────────┤ │
│ │ 1  │ EV disruption (Auto)   │ 🔴 High │ Monitor│ Track EV % │ │
│ │ 2  │ Carbon tax risk        │ 🟡 Med  │ Watch  │ Scenario   │ │
│ │ 3  │ Excess capacity (Steel)│ 🟡 Med  │ Monitor│ Util. rate │ │
│ │ 4  │ ESG reporting mandate  │ 🟢 Low  │ Comply │ Prepare    │ │
│ └────┴────────────────────────┴────────┴────────┴────────────┘ │
│ [Add Flag] [Import from Industry Page] [Export CSV]             │
├─────────────────────────────────────────────────────────────────┤
│ FLAG DETAIL (on click)                                          │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Flag: EV disruption (Auto)                                  │ │
│ │ Industry: Auto                                              │ │
│ │ Description: Rapid EV adoption threatening ICE demand.      │ │
│ │ Timeline: 2025-2030 transition risk                         │ │
│ │ Company Exposure: 65% revenue from ICE components           │ │
│ │ Mitigation: Diversifying to EV components, JV with battery  │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ [Link to Industry Page Red Flags] [Link to Regulations Tracker] │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Data Pipeline

### 3.1 Input Data
| Field | Type | Source |
|-------|------|--------|
| industry_flags | IndustryFlag[] | Industry Page / Manual |

### 3.2 Flag Schema
```typescript
interface IndustryRedFlag {
  id: string;
  title: string;
  description: string;
  severity: 'High' | 'Medium' | 'Low';
  status: 'Monitor' | 'Watch' | 'Prepare' | 'Action';
  industryImpact: 'High' | 'Medium' | 'Low';
  companyExposure: number;  // 0-100%
  mitigation: string;
  source: 'industry_page' | 'manual' | 'doc_ai';
}
```

---

## 4. Engine Integration

### 4.1 Links
- **Industry Page:** Red Flags section, Regulations Tracker
- **Risk Score Engine:** Feeds Industry Risk category
- **Regulations Tracker:** Regulatory red flags

---

## 4. API Contract

```typescript
interface IndustryRedFlagsData {
  symbol: string;
  industry: string;
  flags: IndustryRedFlag[];
  lastUpdated: string;
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Flag table with severity, exposure %, mitigation | Week 1 |
| 2 | Industry Page sync (auto-sync flags) | Week 1 |
| 2 | Detail modal with exposure analysis | Week 2 |
| 3 | CSV export, Risk Score link | Week 2 |

---

## 6. Testing
- Industry Page sync accuracy
- Exposure % calculation
- Cross-page navigation
- CSV export

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started*