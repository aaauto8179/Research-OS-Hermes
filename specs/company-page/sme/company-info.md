# Company Info Tool Specification

**Tool Name:** Company Info  
**Category:** SME Forensics  
**Sheet:** Company Page → SME  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
IR company details, expos/events participation, analyst coverage, credit ratings, registrar & transfer agent, compliance calendar. Auto-populated from Document AI and manual updates.

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Company Info - [SYMBOL]                                         │
├─────────────────────────────────────────────────────────────────┤
│ BASIC INFO                                                      │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ CIN: [________]  │ ISIN: [________]  │ BSE: [____]  NSE: [____] │ │
│ │ Incorporation: [____]  │ Listing Date: [____]  │ Face Value: [__] │ │
│ │ Registered Office: [________________________________________] │ │
│ │ Website: [________]  │ Email: [________]  │ Phone: [________] │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ IR & ANALYST COVERAGE                                           │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ IR Contact: [Name]  │ Email: [____]  │ Phone: [____]       │ │
│ │ Analyst Coverage: [#]  │ Top Analysts: [List]              │ │
│ │ Next Earnings Call: [Date]  │ Next AGM: [Date]             │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ EVENTS & EXPOS                                                  │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Date       │ Event                    │ Location    │ Type  │ │
│ ├────────────┼──────────────────────────┼─────────────┼───────┤ │
│ │ 2024-11-15 │ Analyst Meet             │ Mumbai      │ IR    │ │
│ │ 2024-10-10 │ India Investment Summit  │ Singapore   │ Conf  │ │
│ │ 2024-09-05 │ AGM                      │ Virtual     │ AGM   │ │
│ └────────────┴──────────────────────────┴─────────────┴───────┘ │
│ [Add Event] [Import from Doc AI] [Export Calendar]             │
├─────────────────────────────────────────────────────────────────┤
│ CREDIT RATINGS & COMPLIANCE                                     │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Agency    │ Rating  │ Outlook │ Date       │ Instrument    │ │
│ ├───────────┼─────────┼─────────┼────────────┼───────────────┤ │
│ │ CRISIL    │ AA+     │ Stable  │ 2024-10-15 │ Long-term     │ │
│ │ ICRA      │ AA+     │ Stable  │ 2024-09-20 │ Long-term     │ │
│ │ CARE      │ AA+     │ Positive│ 2024-08-10 │ Short-term    │ │
│ └───────────┴─────────┴─────────┴────────────┴───────────────┘ │
│ Registrar: [________]  │ Compliance Officer: [________]        │
│ [Import from Doc AI] [Export CSV] [Set Reminders]              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Data Pipeline

### 3.1 Input Data
| Field | Type | Source |
|-------|------|--------|
| basic_info | object | Manual / Doc AI |
| ir_coverage | object | Manual |
| events | Event[] | Manual / Doc AI |
| credit_ratings | Rating[] | Manual / Doc AI |

### 3.2 Doc AI Extraction
- **Source:** Annual reports, credit rating letters, exchange filings
- **Extractor:** `CompanyInfoExtractor`
- **Output:** Structured company metadata

---

## 4. Engine Integration

### 4.1 Links
- **Document AI:** Auto-extract from annual reports, credit rating letters
- **Events Calendar:** Syncs with Tasks & Time tab
- **Compliance Calendar:** Links to Regulations Tracker (Industry Page)

---

## 4. API Contract

```typescript
interface CompanyInfoData {
  symbol: string;
  basicInfo: {
    cin: string;
    isin: string;
    bseCode: string;
    nseCode: string;
    incorporationDate: string;
    listingDate: string;
    faceValue: number;
    registeredOffice: string;
    website: string;
    email: string;
    phone: string;
  };
  irCoverage: {
    contactName: string;
    email: string;
    phone: string;
    analystCount: number;
    topAnalysts: string[];
    nextEarningsCall: string;
    nextAGM: string;
  };
  events: CompanyEvent[];
  creditRatings: CreditRating[];
  registrar: string;
  complianceOfficer: string;
  lastUpdated: string;
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Basic info form, IR coverage, credit ratings table | Week 1 |
| 2 | Events table with calendar view, Doc AI import | Week 2 |
| 3 | Compliance calendar sync, CSV export | Week 2 |

---

## 6. Testing
- Basic info validation (CIN format, ISIN checksum)
- Event date sorting
- Credit rating format validation
- Doc AI extraction accuracy
- Calendar sync

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started*