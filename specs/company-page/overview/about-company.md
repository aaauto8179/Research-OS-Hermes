# About the Company Tool Specification

**Tool Name:** About the Company  
**Category:** Overview  
**Sheet:** Company Page → Overview  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Structured overview of the company: business description, history, key milestones, geographic presence, employee count, and corporate structure. Serves as the foundation for all other analysis.

### 1.2 What this tool does NOT do
- Does not contain financial analysis (separate Financial Statements tool)
- Does not contain valuation (separate Valuation Suite)
- Does not contain management assessment (separate Management tab)

### 1.3 User Stories
- As an analyst, I want a quick company snapshot, so I can understand the business in 2 minutes
- As a portfolio manager, I want key facts at a glance, so I can screen efficiently

---

## 2. Excel Source Reference

| Field | Value |
|-------|-------|
| Sheet | Company Page |
| Category | Overview |
| Tool | About the Company |
| Description | Basis breakdown of the company |
| Data Source | Documents Upload, Document AI |
| Sample Link | — |

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ About the Company - [SYMBOL]                                    │
├─────────────────────────────────────────────────────────────────┤
│ BASIC INFO                    │ KEY METRICS                     │
│ ┌─────────────────────────┐   │ ┌──────────┐ ┌──────────┐      │
│ │ Company: [Name]         │   │ │ Employees│ │ Founded  │      │
│ │ Industry: [Sector]      │   │ │ [50,000] │ │ [1995]   │      │
│ │ HQ: [City, Country]     │   │ ├──────────┤ ├──────────┤      │
│ │ Website: [URL]          │   │ │ Listed   │ │ Market   │      │
│ │ CIN: [Number]           │   │ │ [NSE/BSE]│ │ Cap [₹Cr]│      │
│ └─────────────────────────┘   │ └──────────┘ └──────────┘      │
├─────────────────────────────────────────────────────────────────┤
│ BUSINESS DESCRIPTION                                           │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ [Rich text editor with formatting, auto-saved from Doc AI] │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ KEY MILESTONES                    │ GEOGRAPHIC PRESENCE          │
│ ┌────────┬──────────────────────┐  │ ┌────────────────────────┐ │
│ │ Year   │ Event                │  │ │ [Interactive map or     │ │
│ ├────────┼──────────────────────┤  │ │  table with countries]  │ │
│ │ 1995   │ Founded              │  │ │ India: 15 locations    │ │
│ │ 2005   │ IPO                  │  │ │ US: 3 locations        │ │
│ │ 2015   │ Acquired XYZ         │  │ │ Europe: 2 locations    │ │
│ └────────┴──────────────────────┘  │ └────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ CORPORATE STRUCTURE                                             │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ [Org chart or table: Parent → Subsidiaries → Associates]   │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Component Breakdown
| Region | Component | Type | Data Source |
|--------|-----------|------|-------------|
| Header | CompanyHeader | Display | Company Page context |
| Basic Info | KeyValueGrid | Display + Edit | Manual + Doc AI |
| Key Metrics | MetricCards | Display | Company Page |
| Description | RichTextEditor | Edit | Manual + Doc AI |
| Milestones | TimelineTable | Edit | Manual |
| Geographic | MapTable | Display | Manual |
| Structure | OrgChart | Display | Manual + Doc AI |

### 3.3 Rich Text Editor Features
- Bold, italic, underline, bullet points
- Auto-save to workspaceStore
- Doc AI import button (extracts from annual reports)
- Version history (last 10 edits)
- Character/word count

---

## 4. Data Pipeline & Sources

### 4.1 Input Data Requirements
| Field | Type | Required | Source | Validation |
|-------|------|----------|--------|------------|
| company_name | string | Yes | Company Page | NSE name |
| industry | string | Yes | Company Page | Sector classification |
| headquarters | string | Yes | Manual | City, Country |
| website | url | No | Manual | Valid URL |
| cin | string | Yes | Manual | 21-char CIN |
| founded_year | integer | Yes | Manual | 1800-current |
| employees | integer | No | Annual Report | > 0 |
| listed_exchanges | array | Yes | Company Page | NSE, BSE |
| market_cap_cr | number | Yes | Company Page | > 0 |

### 4.2 Data Sources Priority
1. **Primary:** Company Page context (symbol → basic info)
2. **Secondary:** Document AI extraction (annual reports, investor presentations)
3. **Tertiary:** Manual entry (analyst)
4. **Fallback:** Mock data for development

### 4.3 Doc AI Extraction
- **Source:** Annual reports, investor presentations, company website
- **Extractor:** `CompanyInfoExtractor` (to be built)
- **Fields:** Business description, history, milestones, locations, subsidiaries
- **Confidence:** Tag each field with extraction confidence (0-1)

---

## 5. API Contract

### 5.1 Frontend Store
```typescript
interface AboutCompanyData {
  symbol: string;
  basicInfo: {
    companyName: string;
    industry: string;
    headquarters: string;
    website: string;
    cin: string;
    foundedYear: number;
    employees: number;
    listedExchanges: string[];
    marketCapCr: number;
  };
  description: string;  // HTML from rich text editor
  milestones: Milestone[];
  geographicPresence: GeoPresence[];
  corporateStructure: CorporateEntity[];
}

interface Milestone {
  year: number;
  event: string;
  source: 'manual' | 'doc_ai';
  confidence?: number;
}

interface GeoPresence {
  country: string;
  locations: number;
  type: 'HQ' | 'Office' | 'Plant' | 'R&D' | 'Warehouse';
}

interface CorporateEntity {
  name: string;
  relationship: 'Parent' | 'Subsidiary' | 'Associate' | 'JV';
  ownership: number;  // percentage
  country: string;
}
```

### 5.2 Persistence
- **Storage:** `workspaceStore.companyWidgets[`about-company-${symbol}`]`
- **Sync:** Auto-save on blur (debounced 2s)
- **Export:** PDF with company letterhead

---

## 6. Implementation Plan

### Phase 1: Component Structure (Week 1)
- [ ] Create `AboutCompany.tsx` in `src/components/company/overview/`
- [ ] Sub-components: `BasicInfoGrid`, `DescriptionEditor`, `MilestoneTimeline`, `GeoPresenceMap`, `CorporateStructureChart`
- [ ] Add to WidgetRegistry: `"about-company"`
- [ ] TypeScript interfaces in `src/lib/types.ts`

### Phase 2: Data Integration (Week 2)
- [ ] Connect to `CompanyContext` for symbol, basic info
- [ ] Implement Doc AI import button (calls `/api/data-ingestion/extract`)
- [ ] Persist to `workspaceStore` with auto-save
- [ ] Load existing data on mount

### Phase 3: Doc AI Integration (Week 2-3)
- [ ] Build `CompanyInfoExtractor` in data-ingestion
- [ ] Add `/extract/company-info` endpoint
- [ ] Confidence scoring per field
- [ ] Review UI for low-confidence extractions

### Phase 4: Polish (Week 3)
- [ ] PDF export with company branding
- [ ] Dark mode / accessibility
- [ ] Mobile responsive (stack sections)
- [ ] Keyboard navigation

---

## 7. Testing Requirements

### 7.1 Unit Tests
- `BasicInfoGrid` renders all fields correctly
- `DescriptionEditor` saves to store on blur
- `MilestoneTimeline` adds/removes/reorders rows
- Doc AI import populates fields with confidence tags

### 7.2 Integration Tests
- Load → Edit → Save → Reload → Verify persistence
- Doc AI import → Review → Accept → Save → Verify
- Switch symbols → Data updates correctly

### 7.3 Test File Locations
- Component: `src/components/company/overview/AboutCompany.test.tsx`
- Doc AI: `data-ingestion/tests/test_company_info_extractor.py`

---

## 8. Dependencies

| Dependency | Type | Version | Purpose |
|------------|------|---------|---------|
| @tiptap/react | npm | ≥2.1.0 | Rich text editor |
| @tiptap/starter-kit | npm | ≥2.1.0 | Editor extensions |
| react-simple-maps | npm | ≥3.0.0 | Geographic map |
| d3-hierarchy | npm | ≥3.1.0 | Org chart layout |

---

## 9. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Doc AI extraction accuracy | High | Medium | Confidence scoring + manual review UI |
| Rich text editor performance | Low | Low | Lazy load editor, virtualize large content |
| Data sync conflicts | Medium | High | Optimistic locking, last-write-wins with notification |

---

## 10. Verification Checklist

- [ ] All Excel fields mapped to UI components
- [ ] UI layout documented with ASCII
- [ ] Data sources identified with priority
- [ ] Doc AI extraction fields defined
- [ ] Store persistence designed
- [ ] Export/import considered
- [ ] Accessibility requirements noted
- [ ] Dark mode compatible
- [ ] Mobile responsive (stack on <768px)

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started*