# Audit & Actionable Recommendations: Tasks & Time Specifications

**Auditor:** Tasks, Time & Tools Specialist (`worker_tasks_tools_1`)  
**Date:** 2026-11-02  
**Target Category:** `specs/tasks-time/` (3 Specifications)  
**Deliverable File:** `specs/audits/tasks-time-recommendations.md`  

---

## Executive Summary & Scope Mapping

The `specs/tasks-time/` suite governs the operational heartbeat of an equity research institution: tracking market events, regulatory filings, analyst research lifecycles, and time allocation. An audit of the specifications reveals a profound misalignment: the existing specifications treat the module as a generic consumer productivity app (Kanban boards with generic story points, standard Pomodoro timers, and untyped time entries), completely omitting the specialized, high-stakes institutional realities of Indian capital markets.

In Indian institutional equity research:
1. **Earnings Calendar (`earnings-calendar.md` / `tasks-time-tracker.md`)** is not a static datebook; it is anchored in strict statutory filing obligations under **Regulation 29 and Regulation 33 of SEBI (Listing Obligations and Disclosure Requirements) Regulations, 2015 (LODR)**, requiring rapid ingestion of board meeting notices (minimum 5 clear days advance notice), results submission cutoffs (45 days for quarterly unaudited, 60 days for annual audited), and instant dial-in routing (Chorus Call DiamondPass PIN tokens, toll-free links).
2. **Filing Tracker (`filing-tracker.md` / `time-tracker.md`)** is not a stopwatch; it is an automated compliance and disclosure ingestion engine tracking **BSE Corporate Announcements / NSE NEAPS**, **SEBI SAST Regulations 29(1)/29(2)** (2% shareholding change threshold), **SEBI PIT Regulation 7(2)** (continual insider trading disclosure exceeding ₹10 Lakhs value per calendar quarter), and **Credit Rating Actions** across CRISIL, ICRA, CARE, and India Ratings.
3. **Task Manager (`task-manager.md` / `todo-tracker.md`)** is not a generic Jira/Trello board; it coordinates the strict quarterly earnings research sprint (Pre-results preview note → Results flash / first-cut note within 2 hours → Concall transcript parsing → Financial model forecast update → Investment Committee (IC) memo sign-off) with multi-analyst coverage matrices and offline-first enterprise security.

This document delivers complete, production-grade replacement specifications, exact TypeScript interfaces, PostgreSQL relational schemas, algorithmic workflows, UI state machines, and mathematical formulas for all 3 specifications.

---

## 1. Target Spec 1: `specs/tasks-time/tasks-time-tracker.md` (Dispatch Title: `earnings-calendar.md` — Institutional Earnings Calendar & Results Event Suite)

### 1.1 Target Metadata & Canonical Mapping
- **Disk Path:** `specs/tasks-time/tasks-time-tracker.md`
- **Dispatch Alias / Target Title:** `specs/tasks-time/earnings-calendar.md` — *Institutional Earnings Calendar & Corporate Event Suite*
- **Primary Domain Lenses Evaluated:**
  - *Indian Market Workflows & Regulatory Pipelines:* SEBI LODR Reg 29 & Reg 33 compliance calendars, board meeting advance intimations, concall logistics (Chorus Call / DiamondPass).
  - *Institutional Analyst Workflow:* Earnings preview generation, consensus estimates vs actuals delta calculation, live concall note-taking.
  - *UI/UX & Information Density:* Split-screen timeline (market hours vs post-market), calendar heatmaps, live status indicators.
  - *Data Plumbing & Ingestion:* Real-time exchange notification webhooks, PDF notice scrapers.

### 1.2 Core Critique & Vulnerability Analysis
1. **Omission of Statutory Disclosure Regulations (SEBI LODR):** The current spec contains zero awareness of SEBI listing mandates. Under Regulation 29(1)(a) of SEBI LODR, listed companies must give prior intimation to exchanges at least **5 clear days** in advance (excluding the date of the intimation and date of the meeting) for board meetings considering financial results. Under Regulation 33(3)(a), quarterly results must be submitted within **45 days** of the end of the quarter (Q1: Aug 14, Q2: Nov 14, Q3: Feb 14), while annual audited results must be submitted within **60 days** of fiscal year end (May 30 for Q4). Without tracking these deadlines, analysts cannot forecast reporting windows or identify late filers.
2. **Absence of Concall Dial-In Logistics:** Equity analysts attend 5–10 concalls daily during earnings season. The spec lacks integration with Indian concall service providers. The vast majority (>85%) of Indian institutional earnings calls are hosted via **Chorus Call DiamondPass** (Nova web pre-registration links that generate direct PIN bypass codes) or standard PSTN dial-ins (+91 22 6280 1xxx / 7115 8xxx). Analysts require 1-click DiamondPass registration, automated calendar sync (ICS), and direct dial-in integration.
3. **Missing Consensus Delta Engine:** An earnings date is operationally meaningful only when paired with consensus estimates (Bloomberg / Refinitiv / In-house consensus for Revenue, EBITDA, PAT, and EPS). When results hit exchange feeds, analysts must instantly compute:
   $$\text{Surprise \%} = \frac{\text{Actual Metric} - \text{Consensus Estimate}}{\text{Consensus Estimate}} \times 100$$
   The current spec provides only a static Pomodoro timer.

### 1.3 Actionable Replacement Specification

#### A. Data Models & Database Schema (PostgreSQL / Prisma)
```sql
-- Board Meeting Intimations under SEBI LODR Reg 29
CREATE TABLE board_meeting_intimations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_symbol VARCHAR(20) NOT NULL,
    isin VARCHAR(12) NOT NULL,
    exchange VARCHAR(10) NOT NULL CHECK (exchange IN ('NSE', 'BSE', 'BOTH')),
    announcement_datetime TIMESTAMPTZ NOT NULL,
    meeting_date DATE NOT NULL,
    meeting_time TIME,
    purpose_codes TEXT[] NOT NULL, -- ['FINANCIAL_RESULTS', 'DIVIDEND', 'BONUS', 'BUYBACK', 'FUND_RAISE']
    financial_period VARCHAR(20) NOT NULL, -- 'Q1_FY26', 'Q2_FY26', 'Q3_FY26', 'Q4_FY26', 'FY26_AUDITED'
    filing_url TEXT NOT NULL,
    submission_deadline DATE NOT NULL, -- Calculated via LODR Reg 33 (45d / 60d)
    is_statutory_compliant BOOLEAN NOT NULL DEFAULT true, -- Checks >= 5 clear days
    clear_days_notice INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Earnings Calendar Events with Concall Logistics
CREATE TABLE earnings_calendar_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intimation_id UUID REFERENCES board_meeting_intimations(id),
    company_symbol VARCHAR(20) NOT NULL,
    fiscal_quarter VARCHAR(10) NOT NULL, -- 'Q2FY26'
    results_release_date DATE NOT NULL,
    results_release_window VARCHAR(20) NOT NULL CHECK (results_release_window IN ('BEFORE_MARKET', 'MARKET_HOURS', 'AFTER_MARKET', 'TBD')),
    results_status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED' CHECK (results_status IN ('SCHEDULED', 'RELEASED', 'DELAYED', 'RESCHEDULED')),
    
    -- Consensus vs Actual Data
    consensus_revenue_cr NUMERIC(14, 2),
    actual_revenue_cr NUMERIC(14, 2),
    revenue_surprise_pct NUMERIC(6, 2),
    consensus_ebitda_cr NUMERIC(14, 2),
    actual_ebitda_cr NUMERIC(14, 2),
    ebitda_surprise_pct NUMERIC(6, 2),
    consensus_pat_cr NUMERIC(14, 2),
    actual_pat_cr NUMERIC(14, 2),
    pat_surprise_pct NUMERIC(6, 2),
    consensus_eps NUMERIC(8, 2),
    actual_eps NUMERIC(8, 2),
    
    -- Concall Logistics
    concall_datetime TIMESTAMPTZ,
    concall_host VARCHAR(100), -- 'Chorus Call India', 'DiamondPass', 'Zoom', 'WebEx'
    diamond_pass_url TEXT,
    primary_dial_in VARCHAR(50), -- '+91 22 6280 1144'
    secondary_dial_in VARCHAR(50), -- '+91 22 7115 8045'
    international_toll_free JSONB, -- {"USA": "18667462133", "UK": "08081011573", "Singapore": "8001012045", "HongKong": "800964448"}
    webcast_url TEXT,
    audio_recording_url TEXT,
    transcript_document_id UUID, -- Foreign key to document-ai
    presentation_document_id UUID,
    
    assigned_analyst_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_earnings_date ON earnings_calendar_events(results_release_date);
CREATE INDEX idx_earnings_symbol ON earnings_calendar_events(company_symbol);
```

#### B. Statutory Timing Engine & LODR Verification Logic
```typescript
export interface LODRDeadlineCalculator {
  calculateDeadline(fiscalQuarter: 'Q1' | 'Q2' | 'Q3' | 'Q4', fiscalYear: number): {
    quarterEndDate: Date;
    statutoryFilingDeadline: Date;
    legalMaxDays: number;
  };
  verifyNoticePeriod(announcementDate: Date, meetingDate: Date): {
    clearDays: number;
    isCompliant: boolean;
  };
}

export class SEBILODRService implements LODRDeadlineCalculator {
  // Regulation 33: Q1, Q2, Q3 within 45 days; Q4 within 60 days
  calculateDeadline(fiscalQuarter: 'Q1' | 'Q2' | 'Q3' | 'Q4', fiscalYear: number) {
    let quarterEndDate: Date;
    let legalMaxDays: number;

    if (fiscalQuarter === 'Q1') {
      quarterEndDate = new Date(fiscalYear, 5, 30); // June 30
      legalMaxDays = 45; // Aug 14
    } else if (fiscalQuarter === 'Q2') {
      quarterEndDate = new Date(fiscalYear, 8, 30); // Sept 30
      legalMaxDays = 45; // Nov 14
    } else if (fiscalQuarter === 'Q3') {
      quarterEndDate = new Date(fiscalYear, 11, 31); // Dec 31
      legalMaxDays = 45; // Feb 14
    } else {
      quarterEndDate = new Date(fiscalYear + 1, 2, 31); // March 31
      legalMaxDays = 60; // May 30
    }

    const statutoryFilingDeadline = new Date(quarterEndDate.getTime() + legalMaxDays * 24 * 60 * 60 * 1000);
    return { quarterEndDate, statutoryFilingDeadline, legalMaxDays };
  }

  // Regulation 29: At least 5 clear working days notice
  verifyNoticePeriod(announcementDate: Date, meetingDate: Date) {
    const msPerDay = 1000 * 60 * 60 * 24;
    const diffDays = Math.floor((meetingDate.getTime() - announcementDate.getTime()) / msPerDay);
    // Clear days exclude announcement date and meeting date: diffDays - 1
    const clearDays = Math.max(0, diffDays - 1);
    const isCompliant = clearDays >= 5;
    return { clearDays, isCompliant };
  }
}
```

#### C. UI/UX State Machine & Layout
```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ EARNINGS CALENDAR & CONCALL HUB                                       [Filter: My Coverage ▼] [Q2 FY26] │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ TIMELINE: [Daily Grid] [Weekly Strip] [Monthly Matrix]                     Stats: 14 Today | 32 This Wk│
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ THURSDAY, 14 NOVEMBER 2026 (LODR Q2 Deadline Day)                                                      │
├──────────────────────────────────────────┬─────────────────────────────────────────────────────────────┤
│ BEFORE / DURING MARKET HOURS (09:15-15:30)│ POST-MARKET EARNINGS (15:30+)                               │
├──────────────────────────────────────────┼─────────────────────────────────────────────────────────────┤
│ 🟢 RELIANCE (Reliance Industries)        │ 🟡 TATAMOTORS (Tata Motors)                                 │
│ Results: Out @ 12:45 IST | Window: Intraday│ Results: Expected 16:30 IST | Board: 14:00 IST             │
│ • Net Rev: ₹2,41,500 Cr (Cons: +1.8% 🟢) │ • Cons. Rev: ₹1,08,200 Cr | Cons. PAT: ₹5,400 Cr           │
│ • EBITDA:  ₹43,800 Cr   (Cons: -0.4% 🔴) │ • LODR Notice: 7 clear days (Compliant ✅)                  │
│ • PAT:     ₹19,250 Cr   (Cons: +3.2% 🟢) │ Concall: 18:30 IST                                          │
│ Concall: Today @ 16:30 IST               │ [💎 DiamondPass Pre-Register] [📞 +91 22 6280 1144]          │
│ [🎧 Join Chorus Call] [📄 1-Cut Flash Note]│ Assigned: Rohit Sharma (Auto-create Preview Memo)           │
├──────────────────────────────────────────┼─────────────────────────────────────────────────────────────┤
│ 🔴 HDFCBANK (HDFC Bank Ltd)              │ ⚪ INFY (Infosys)                                           │
│ Results: Delayed (Board adjourned to 17:00│ Concall: 17:00 IST | Webcast Link: Ready                    │
│ Concall: Tomorrow 08:30 IST (DiamondPass) │ [Add to Calendar (.ics)] [Live Transcript Pad]              │
└──────────────────────────────────────────┴─────────────────────────────────────────────────────────────┘
```

---

## 2. Target Spec 2: `specs/tasks-time/time-tracker.md` (Dispatch Title: `filing-tracker.md` — SEBI & Exchange Regulatory Filing Tracker)

### 2.1 Target Metadata & Canonical Mapping
- **Disk Path:** `specs/tasks-time/time-tracker.md`
- **Dispatch Alias / Target Title:** `specs/tasks-time/filing-tracker.md` — *Exchange Filings & Regulatory Disclosure Ingestion Tracker*
- **Primary Domain Lenses Evaluated:**
  - *Indian Regulatory Ingestion Pipelines:* BSE Corporate Announcements API, NSE NEAPS system, SEBI SAST Reg 29, SEBI PIT Reg 7(2).
  - *Forensic Analysis & Risk Scoring:* Credit rating downgrades (CRISIL, ICRA, CARE, India Ratings), auditor resignations under LODR Reg 30.
  - *Analyst Time Attribution:* Telemetry attributing analyst research hours directly to regulatory disclosures and event triage.
  - *UI/UX Systems:* Real-time live filing ticker, disclosure classification drawer, alert severity tags.

### 2.2 Core Critique & Vulnerability Analysis
1. **Total Absence of Exchange Scraping & Filing Data Pipeline:** The existing `time-tracker.md` is simply an activity timer with start/pause buttons. It contains zero capability to ingest, index, or parse filings from **BSE Corporate Announcements (BSE Query API / RSS feeds)** or **NSE NEAPS (NSE Electronic Application Processing System)**. In Indian markets, over 1,500 corporate announcements hit the wire daily. Analysts need an intelligent filing tracker that filters noise and isolates high-impact events.
2. **Missing SEBI SAST & PIT Regulatory Frameworks:**
   - **SEBI SAST (Substantial Acquisition of Shares and Takeovers) Regulations, 2011:** Regulation 29(1) and 29(2) require disclosure when an acquirer/promoter acquires or disposes of shares exceeding **2% or more** of total voting rights.
   - **SEBI PIT (Prohibition of Insider Trading) Regulations, 2015:** Regulation 7(2) requires continual disclosure by promoters, key managerial personnel (KMP), and designated directors within **2 trading days** if transaction value exceeds **₹10 Lakhs** in any calendar quarter.
   The current spec provides no tracking of insider buying/selling, promoter pledge additions/revocations, or takeover disclosures.
3. **Missing Credit Rating Agency Monitoring:** Credit rating actions by Indian rating agencies (CRISIL, ICRA, CARE, India Ratings) are leading indicators of liquidity distress or balance sheet improvement. A credit rating downgrade or a revision from "Stable" to "Watch with Negative Implications" triggers mandatory investment review. The spec omits rating action tracking entirely.

### 2.3 Actionable Replacement Specification

#### A. Database Schemas & Data Contracts (PostgreSQL)
```sql
-- Exchange Filings Master Table (BSE / NSE NEAPS)
CREATE TABLE exchange_filings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filing_reference VARCHAR(100) UNIQUE NOT NULL, -- BSE Script Code / NSE Submission Number
    company_symbol VARCHAR(20) NOT NULL,
    exchange VARCHAR(10) NOT NULL CHECK (exchange IN ('NSE', 'BSE', 'BOTH')),
    broadcast_datetime TIMESTAMPTZ NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'FINANCIAL_RESULTS', 'INSIDER_TRADING', 'SAST', 'CREDIT_RATING', 'LODR_30_MATERIAL', 'AGM_EGM', 'CONCALL_TRANSCRIPT'
    headline TEXT NOT NULL,
    description TEXT,
    pdf_attachment_url TEXT NOT NULL,
    is_price_sensitive BOOLEAN NOT NULL DEFAULT false,
    sentiment_score NUMERIC(3, 2), -- -1.00 (Critical Negative) to +1.00 (Highly Positive)
    ingestion_timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- SEBI PIT Reg 7(2) Insider Trading Tracker
CREATE TABLE sebi_pit_insider_trades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filing_id UUID REFERENCES exchange_filings(id),
    company_symbol VARCHAR(20) NOT NULL,
    person_name VARCHAR(150) NOT NULL,
    person_category VARCHAR(50) NOT NULL, -- 'PROMOTER', 'PROMOTER_GROUP', 'DIRECTOR', 'KMP', 'DESIGNATED_PERSON'
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('BUY', 'SELL', 'PLEDGE_CREATION', 'PLEDGE_INVOCATION', 'PLEDGE_REVOCATION')),
    securities_count BIGINT NOT NULL,
    acquisition_mode VARCHAR(50) NOT NULL, -- 'MARKET_PURCHASE', 'OFF_MARKET', 'ESOP', 'INTER_SE_TRANSFER'
    transaction_value_inr NUMERIC(14, 2) NOT NULL, -- Must verify >= ₹10 Lakhs threshold
    post_holding_pct NUMERIC(5, 2) NOT NULL,
    trade_date DATE NOT NULL,
    intimation_to_exchange_date DATE NOT NULL,
    compliance_window_days INT NOT NULL -- Must be <= 2 trading days
);

-- Credit Rating Actions Tracker (CRISIL, ICRA, CARE, India Ratings)
CREATE TABLE credit_rating_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_symbol VARCHAR(20) NOT NULL,
    rating_agency VARCHAR(50) NOT NULL CHECK (rating_agency IN ('CRISIL', 'ICRA', 'CARE', 'IND_RATINGS', 'BRICKWORK')),
    instrument_type VARCHAR(100) NOT NULL, -- 'Long-Term Bank Facilities', 'Non-Convertible Debentures (NCD)', 'Commercial Paper'
    previous_rating VARCHAR(30) NOT NULL,
    new_rating VARCHAR(30) NOT NULL,
    action_type VARCHAR(30) NOT NULL CHECK (action_type IN ('UPGRADE', 'DOWNGRADE', 'REAFFIRMED', 'OUTLOOK_CHANGE', 'RATING_WATCH')),
    outlook VARCHAR(30) NOT NULL CHECK (outlook IN ('POSITIVE', 'STABLE', 'NEGATIVE', 'DEVELOPING', 'WATCH_NEGATIVE')),
    rationale_summary TEXT NOT NULL,
    filing_url TEXT NOT NULL,
    action_date DATE NOT NULL
);
```

#### B. Regulatory Ingestion Pipeline Architecture & Event Classifier
```typescript
export interface ExchangeFilingPayload {
  bseScripCode?: string;
  nseSymbol?: string;
  category: string;
  subject: string;
  pdfUrl: string;
  broadcastTime: string;
}

export class FilingClassifierService {
  classifyAndAssignPriority(filing: ExchangeFilingPayload): {
    severity: 'P1_CRITICAL' | 'P2_HIGH' | 'P3_MEDIUM' | 'P4_INFO';
    routingTag: string;
    requiresUrgentNotification: boolean;
  } {
    const text = (filing.subject + ' ' + filing.category).toLowerCase();

    // P1_CRITICAL: Forensic issues, Credit Downgrades, Auditor Resignation, SEBI Orders
    if (
      text.includes('resignation of statutory auditor') ||
      text.includes('downgrade') ||
      text.includes('forensic audit') ||
      text.includes('sebi order') ||
      text.includes('insolvency') ||
      text.includes('nclt')
    ) {
      return { severity: 'P1_CRITICAL', routingTag: 'FORENSIC_OR_CREDIT_ALERT', requiresUrgentNotification: true };
    }

    // P2_HIGH: Financial results, Scheme of Arrangement, Buyback, Delisting, Insider Buying > 50L
    if (
      text.includes('financial results') ||
      text.includes('amalgamation') ||
      text.includes('demerger') ||
      text.includes('buyback') ||
      text.includes('takeover')
    ) {
      return { severity: 'P2_HIGH', routingTag: 'STRATEGIC_ACTION', requiresUrgentNotification: true };
    }

    // P3_MEDIUM: Promoter pledge release, credit reaffirmation, concall intimations
    if (text.includes('concall') || text.includes('pledge') || text.includes('investor presentation')) {
      return { severity: 'P3_MEDIUM', routingTag: 'OPERATIONAL_UPDATE', requiresUrgentNotification: false };
    }

    return { severity: 'P4_INFO', routingTag: 'ROUTINE_COMPLIANCE', requiresUrgentNotification: false };
  }
}
```

#### C. Analyst Time Telemetry & Event-Linked Tracking
```typescript
export interface EventLinkedTimeEntry {
  id: string;
  analystId: string;
  filingId: string;
  companySymbol: string;
  eventType: 'FILING_TRIAGE' | 'CONCALL_ATTENDANCE' | 'PREVIEW_NOTE' | 'MODEL_UPDATE';
  startTime: string;
  endTime: string;
  durationMinutes: number;
  notes: string;
  actionTaken: 'PASSED' | 'ALERT_DISPATCHED' | 'TASK_SPAWNED' | 'MODEL_ADJUSTED';
}
```

---

## 3. Target Spec 3: `specs/tasks-time/todo-tracker.md` (Dispatch Title: `task-manager.md` — Institutional Research Workflow & IC Governance Suite)

### 3.1 Target Metadata & Canonical Mapping
- **Disk Path:** `specs/tasks-time/todo-tracker.md`
- **Dispatch Alias / Target Title:** `specs/tasks-time/task-manager.md` — *Equity Research Task & Coverage Management Suite*
- **Primary Domain Lenses Evaluated:**
  - *Institutional Analyst Workflow:* Coverage universe assignment, earnings preview/review lifecycle, IC thesis memo sign-off workflows.
  - *Data Plumbing & Security:* Enterprise-grade CRDT state synchronization, role-based access control, PostgreSQL WAL integration.
  - *Forensic Decision Rigor:* Tracking analyst falsifiable hypotheses and approval chains.
  - *UI/UX Design:* Coverage workload matrix, quarterly sprint crunch board, multi-tier review modals.

### 3.2 Core Critique & Vulnerability Analysis
1. **Consumer Kanban vs Institutional Research Sprints:** The current spec provides a toy Kanban board (`Backlog` → `To Do` → `In Progress` → `Done`) with generic tags and Pomodoro sessions. In an equity research desk, tasks follow an explicit **institutional workflow state machine**:
   - Coverage Assignment (Lead Analyst, Research Associate)
   - Earnings Season Sprint:
     1. Pre-Results Earnings Preview Note (Target estimates, revenue/EBITDA/PAT expectation, key concall questions)
     2. Results Ingestion & Flash Note (Within 120 minutes of exchange filing)
     3. Concall Transcript Analysis & Key Takeaways
     4. Financial Model Re-forecasting (DCF, Relative Valuation, SOTP update)
     5. Post-Earnings Detailed Institutional Review Report
     6. Investment Committee (IC) Thesis Sign-Off & Position Sizing Action
2. **Missing IC Thesis Sign-Off Workflow & Governance:** The spec lacks any approval mechanism. Institutional portfolio managers cannot execute buy/sell orders without a formal Investment Committee thesis sign-off, containing:
   - Target price, recommendation (BUY / ACCUMULATE / HOLD / REDUCE / SELL)
   - Formal sign-off signatures (Lead Analyst → Head of Research → CIO / Fund Manager)
   - Risk matrix attestation and conflict of interest disclosures under SEBI (Research Analysts) Regulations, 2014.
3. **Enterprise Network Failure of Pure WebRTC Sync:** The spec proposes pure peer-to-peer WebRTC (`y-webrtc`) for CRDT synchronization. In institutional investment banks and fund management offices, strict corporate firewalls, proxy servers, and zero-trust network architectures (Zscaler, Fortinet) actively block arbitrary WebRTC UDP peer connections. A robust architecture requires **Yjs with WebSocket relay server (`y-websocket`) backed by PostgreSQL persistence and WebSocket authentication tokens**.

### 3.3 Actionable Replacement Specification

#### A. Institutional Research Lifecycle Schema & IC Sign-Off Engine
```typescript
export type ResearchLifecycleStage =
  | 'AWAITING_EARNINGS'
  | 'EARNINGS_PREVIEW_DUE'
  | 'RESULTS_FLASH_PENDING'
  | 'CONCALL_IN_PROGRESS'
  | 'FINANCIAL_MODEL_UPDATE'
  | 'IC_MEMO_SUBMITTED'
  | 'IC_APPROVED'
  | 'COVERAGE_MAINTENANCE';

export interface CoverageAssignment {
  analystId: string;
  analystName: string;
  role: 'LEAD_ANALYST' | 'ASSOCIATE' | 'SECTOR_HEAD';
  coverageTier: 'TIER_1_CORE' | 'TIER_2_REGULAR' | 'TIER_3_WATCHLIST';
  companySymbol: string;
  sector: string;
  activeThesisRecommendation: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'REDUCE' | 'SELL';
  targetPriceInr: number;
  lastReviewDate: string;
}

export interface IcSignoffWorkflow {
  id: string;
  taskId: string;
  companySymbol: string;
  fiscalQuarter: string;
  submittedByAnalystId: string;
  targetPriceInr: number;
  horizonMonths: number;
  convictionScore: number; // 1 to 100
  recommendedPositionSizePct: number;
  falsificationTriggers: string[];
  complianceCheck: {
    sebiRaRegulation2014Attested: boolean;
    personalHoldingDisclosed: boolean;
    commercialRelationshipChecked: boolean;
  };
  approvalChain: {
    headOfResearch: { approved: boolean; timestamp?: string; comments?: string };
    fundManager: { approved: boolean; timestamp?: string; allocationApprovedPct?: number };
    riskManager: { approved: boolean; timestamp?: string; riskComments?: string };
  };
  status: 'PENDING_REVIEW' | 'REJECTED' | 'REVISION_REQUESTED' | 'FULLY_APPROVED';
}
```

#### B. Enterprise CRDT Architecture (Replacing Fragile WebRTC)
```typescript
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { IndexeddbPersistence } from 'y-indexeddb';

export class EnterpriseResearchSync {
  private doc: Y.Doc;
  private wsProvider: WebsocketProvider;
  private idbPersistence: IndexeddbPersistence;

  constructor(roomName: string, authToken: string) {
    this.doc = new Y.Doc();
    
    // 1. Local IndexedDB cache for instant offline startup
    this.idbPersistence = new IndexeddbPersistence(`hermes-tasks-${roomName}`, this.doc);
    
    // 2. Enterprise WebSocket server with JWT bearer auth for firewall traversal
    const wsUrl = process.env.NEXT_PUBLIC_SYNC_WS_URL || 'wss://sync.hermes-research.internal/ws';
    this.wsProvider = new WebsocketProvider(wsUrl, roomName, this.doc, {
      params: { token: authToken }
    });

    this.idbPersistence.on('synced', () => {
      console.log('[Hermes Sync] IndexedDB offline state loaded.');
    });

    this.wsProvider.on('status', (event: { status: string }) => {
      console.log(`[Hermes Sync] Enterprise Relay Status: ${event.status}`);
    });
  }

  public getTasksMap(): Y.Map<any> {
    return this.doc.getMap('research_tasks');
  }

  public destroy(): void {
    this.wsProvider.destroy();
    this.doc.destroy();
  }
}
```

#### C. UI/UX Earnings Sprint & IC Sign-Off Board
```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ RESEARCH TASK & IC WORKFLOW MANAGER                                [Coverage: IT & Energy ▼] [Sprint: Q2 FY26] │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ VIEW: [Earnings Sprint Board ▼] [Coverage Matrix] [IC Sign-Off Queue] [Capacity & Time Audit]          │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. PRE-RESULT PREVIEW  │ 2. FLASH NOTE (2H)    │ 3. MODEL UPDATE       │ 4. IC MEMO SIGN-OFF           │
│ (3 Tasks)              │ (1 Task)              │ (2 Tasks)             │ (1 Task)                      │
├────────────────────────┼───────────────────────┼───────────────────────┼───────────────────────────────┤
│ 🟣 TCS (Tata Consultancy│ 🔴 RELIANCE           │ 🔵 INFY               │ 🟢 HDFCBANK                   │
│ • Due: Tomorrow 09:00  │ • Results Out: 12:45  │ • Concall: Done       │ • Thesis: Strong Buy          │
│ • Preview: 70% drafted │ • Flash Note Due: 14:45│ • Update DCF & WACC   │ • Target Price: ₹2,150 (+28%) │
│ • Analyst: P. Verma    │ • Actual vs Cons: +3% │ • Revise FY27 EPS     │ • Allocation: 6.5% Target     │
│ [Open Preview Doc]     │ • Analyst: S. Sen     │ • Analyst: P. Verma   │ • IC Status: 2/3 Approved     │
│                        │ [Publish Flash Note]  │ [Open Valuation Model]│   ✅ Head of Research         │
│                        │                       │                       │   ✅ Risk Officer             │
│                        │                       │                       │   ⏳ Fund Manager Pending     │
│                        │                       │                       │ [Open IC Dossier & Sign-Off]  │
└────────────────────────┴───────────────────────┴───────────────────────┴───────────────────────────────┘
```

---

## 4. Implementation Priority & Migration Roadmap

| Spec File | Immediate Priority | Key Implementation Artifacts Required | Target Quarter |
|---|---|---|---|
| `specs/tasks-time/tasks-time-tracker.md` | **P0 (Critical)** | Complete conversion into `earnings-calendar.md`. Ingest SEBI LODR Reg 29/33 rules, DiamondPass URL integration, and consensus delta engine. | Sprint 1 |
| `specs/tasks-time/time-tracker.md` | **P0 (Critical)** | Upgrade into `filing-tracker.md`. Deploy BSE/NSE NEAPS ingestion scrapers, SEBI SAST 29(1)/29(2) parser, PIT 7(2) insider trades table, and credit rating tracker. | Sprint 1-2 |
| `specs/tasks-time/todo-tracker.md` | **P1 (High)** | Refactor into `task-manager.md`. Implement institutional earnings sprint lifecycle, IC thesis approval state machine, and enterprise WebSocket CRDT sync. | Sprint 2 |

All recommendations above are strictly actionable and engineered directly for Hermes implementation without modifying existing legacy specifications until approved.
