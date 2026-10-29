# Research OS - GRWTH Pipeline Tracker Specification

## Overview
The GRWTH (Growth) Pipeline Tracker monitors capital expenditure projects from announcement to commercial operation. It translates capex milestones into revenue accretion forecasts and IRR calculations.

## Purpose
- Track 50-200 concurrent capex projects across portfolio companies
- Translate physical milestones into financial forecasts
- Early warning for delays/cost overruns
- Revenue accretion modeling for valuation inputs

## Data Model

### Project
```typescript
interface CapexProject {
  id: string;                          // UUID
  company_symbol: string;              // e.g., "RELIANCE"
  name: string;                        // "Jamnagar PX Expansion"
  description: string;
  
  // Financial
  capex_cr: Decimal;                   // Total capex in ₹Cr
  spent_cr: Decimal;                   // Cumulative spent
  remaining_cr: Decimal;               // Capex - spent
  
  // Timeline
  announced_date: Date;
  target_commissioning: Date;
  actual_commissioning?: Date;
  
  // Current Stage
  stage: ProjectStage;
  progress_pct: number;                // 0-100
  
  // Milestones
  milestones: Milestone[];
  
  // Economics
  capacity_addition: CapacityAddition;
  revenue_accretion: RevenueAccretion;
  irr: Decimal;                        // Project IRR
  payback_years: Decimal;
  
  // Risk
  risk_level: "LOW" | "MEDIUM" | "HIGH";
  key_risks: string[];
  
  // Metadata
  source_urls: string[];
  last_updated: Date;
  created_at: Date;
}

type ProjectStage = 
  | "ANNOUNCED"           // Publicly announced
  | "FEASIBILITY"         // Feasibility study
  | "ENV_CLEARANCE"       // Environmental clearance
  | "LAND_ACQUISITION"    // Land acquisition
  | "FINANCIAL_CLOSURE"   // Debt/equity tied up
  | "GROUND_BREAK"        // Construction started
  | "CONSTRUCTION"        // Under construction
  | "PRE_COMMISSIONING"   // Testing/trial runs
  | "COMMISSIONED"        // Commercial operation
  | "RAMP_UP"             // Ramping to full capacity
  | "COMMERCIAL"          // Full commercial
  | "DELAYED"             // Officially delayed
  | "CANCELLED";          // Cancelled

interface Milestone {
  id: string;
  project_id: string;
  name: string;
  stage: ProjectStage;
  target_date: Date;
  actual_date?: Date;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "DELAYED" | "CANCELLED";
  dependencies: string[];              // Other milestone IDs
  notes: string;
}

interface CapacityAddition {
  metric: string;                      // "MTPA", "MW", "KL/day", "stores"
  current: Decimal;
  additional: Decimal;
  unit: string;
}

interface RevenueAccretion {
  // Year-by-year revenue contribution
  yearly: YearlyRevenue[];
  assumptions: AccretionAssumptions;
}

interface YearlyRevenue {
  year: number;                        // FY2025, FY2026, etc.
  revenue_cr: Decimal;
  ebitda_cr: Decimal;
  margin_pct: Decimal;
}

interface AccretionAssumptions {
  utilization_ramp: YearlyUtilization[];
  price_assumption: PriceAssumption;
  opex_per_unit: Decimal;
  working_capital_days: number;
}

interface YearlyUtilization {
  year: number;
  utilization_pct: Decimal;
}

interface PriceAssumption {
  type: "LINKED_TO" | "FIXED" | "FORMULA";
  reference?: string;                  // "Brent", "Domestic gas", "APM"
  base_price: Decimal;
  escalation_pct: Decimal;
}
```

## Views

### 1. Kanban View (Default)
```
ANNOUNCED → FEASIBILITY → ENV_CLEARANCE → LAND_ACQUISITION → FINANCIAL_CLOSURE 
→ GROUND_BREAK → CONSTRUCTION → PRE_COMMISSIONING → COMMISSIONED → RAMP_UP → COMMERCIAL
```
- Drag-drop between stages
- Color-coded by risk level
- Progress bar on each card
- Filter by company, stage, risk

### 2. Gantt Chart View
- Timeline with milestones
- Critical path highlighting
- Delay visualization (red bars)
- Resource allocation view

### 3. Table View
- Sortable, filterable columns
- Bulk actions (export, update stage)
- Inline editing for progress/dates

## Revenue Accretion Engine

### Projection Logic
```python
def project_revenue_accretion(project: CapexProject) -> List[YearlyRevenue]:
    """
    1. Determine commercial operation date (COD)
    2. Model utilization ramp (S-curve)
    3. Apply price assumptions
    4. Calculate revenue, EBITDA, FCF
    """
    cod = project.actual_commissioning or project.target_commissioning
    
    # Utilization ramp: S-curve
    # Year 1: 40%, Year 2: 70%, Year 3: 90%, Year 4+: 95%
    utilization = {
        1: 0.40, 2: 0.70, 3: 0.90, 4: 0.95
    }
    
    results = []
    for year in range(1, project.capacity_addition.additional.life_years + 1):
        util = utilization.get(year, 0.95)
        capacity = project.capacity_addition.additional * util
        revenue = capacity * project.price_assumption.base_price * (1 + project.price_assumption.escalation) ** year
        ebitda = revenue * project.ebitda_margin
        results.append(YearlyRevenue(year=year, revenue=revenue, ebitda=ebitda))
    
    return results
```

### Integration with Valuation
- Projects feed into SOTP as separate segments
- Project IRR used for discount rate calibration
- Delay scenarios (base/bear/bull) for sensitivity

## Milestone Definitions (Standardized)

| Stage | Typical Duration | Key Deliverables | Risk Factors |
|-------|-----------------|------------------|--------------|
| ANNOUNCED | 0-3 mo | Board approval, press release | Low |
| FEASIBILITY | 3-6 mo | DPR, techno-economic study | Technical risk |
| ENV_CLEARANCE | 6-18 mo | EC, FC, CRZ clearance | Regulatory, NIMBY |
| LAND_ACQUISITION | 6-24 mo | Land parcels, R&R | Legal, compensation |
| FINANCIAL_CLOSURE | 3-6 mo | Loan agreements, equity commit | Market conditions |
| GROUND_BREAK | 0-1 mo | Ceremony, mobilization | Low |
| CONSTRUCTION | 12-48 mo | EPC contracts, milestones | Cost overrun, delay |
| PRE_COMMISSIONING | 3-6 mo | Trial runs, PG test | Performance risk |
| COMMISSIONED | 0-1 mo | COD certificate | Low |
| RAMP_UP | 12-24 mo | Utilization to 90%+ | Market demand |
| COMMERCIAL | Ongoing | Full operations | Market risk |

## Risk Scoring

```python
def calculate_project_risk(project: CapexProject) -> RiskLevel:
    score = 0
    
    # Stage risk
    stage_risk = {
        "ANNOUNCED": 1, "FEASIBILITY": 2, "ENV_CLEARANCE": 3,
        "LAND_ACQUISITION": 4, "FINANCIAL_CLOSURE": 2,
        "GROUND_BREAK": 1, "CONSTRUCTION": 3, "PRE_COMMISSIONING": 2,
        "COMMISSIONED": 1, "RAMP_UP": 2, "COMMERCIAL": 1
    }
    score += stage_risk.get(project.stage, 1)
    
    # Delay risk
    if project.actual_commissioning and project.target_commissioning:
        delay_months = (project.actual_commissioning - project.target_commissioning).days / 30
        if delay_months > 12: score += 3
        elif delay_months > 6: score += 2
        elif delay_months > 0: score += 1
    
    # Cost overrun
    if project.spent_cr > project.capex_cr * 1.1: score += 2
    elif project.spent_cr > project.capex_cr * 1.05: score += 1
    
    # Regulatory risk
    if project.stage in ["ENV_CLEARANCE", "LAND_ACQUISITION"]: score += 1
    
    # Market risk (for commodity-linked)
    if project.price_assumption.type == "LINKED_TO": score += 1
    
    if score >= 7: return "HIGH"
    if score >= 4: return "MEDIUM"
    return "LOW"
```

## Integration Points

### From Company Deep Dive
- Projects auto-linked via company_symbol
- Capex from financial statements (CFI)
- Segment revenue feeds accretion assumptions

### To Valuation (SOTP)
- Each project = separate segment
- Project IRR → discount rate
- Delay scenarios → SOTP sensitivity

### To Portfolio
- Aggregate capex by portfolio
- Capex intensity tracking
- FCF forecasting (CapEx drain → FCF recovery)

## UI Components

### ProjectCard (Kanban)
```tsx
<ProjectCard 
  project={project}
  onDragStart={...}
  onClick={...}
  stageColor={getStageColor(project.stage)}
/>
// Shows: name, company, capex, progress bar, risk badge, target date
```

### MilestoneTimeline (Gantt)
```tsx
<MilestoneTimeline 
  milestones={project.milestones}
  targetDate={project.target_commissioning}
  today={new Date()}
  onMilestoneClick={...}
/>
```

### RevenueAccretionChart
```tsx
<RevenueAccretionChart 
  data={project.revenue_accretion.yearly}
  onScenarioChange={...}  // base/bear/bull
/>
```

## API

```
GET    /api/grwth/projects              # List with filters
GET    /api/grwth/projects/:id          # Full project
POST   /api/grwth/projects              # Create
PATCH  /api/grwth/projects/:id          # Update
DELETE /api/grwth/projects/:id          # Delete

POST   /api/grwth/projects/:id/milestones     # Add milestone
PATCH  /api/grwth/milestones/:id              # Update milestone

GET    /api/grwth/projects/:id/accretion      # Revenue projection
POST   /api/grwth/projects/:id/scenario       # Run scenario

GET    /api/grwth/summary                     # Portfolio-level summary
```

## File Inventory
```
src/app/grwth/page.tsx              # Main page with 3 views
src/components/grwth/
  ├── ProjectCard.tsx
  ├── MilestoneTimeline.tsx
  ├── RevenueAccretionChart.tsx
  ├── StageBadge.tsx
  └── RiskBadge.tsx
src/lib/grwth/
  ├── types.ts
  ├── revenue-engine.ts
  ├── risk-scoring.ts
  └── mock-data.ts
src/app/api/grwth/                  # API routes
```

## Mock Data (10 Projects)
```typescript
const MOCK_PROJECTS = [
  { symbol: "RELIANCE", name: "Jamnagar PX Expansion", capex: 15000, stage: "CONSTRUCTION", ... },
  { symbol: "RELIANCE", name: "New Energy Solar Giga", capex: 75000, stage: "FINANCIAL_CLOSURE", ... },
  { symbol: "TATAMOTORS", name: "JLR EV Platform", capex: 15000, stage: "ENV_CLEARANCE", ... },
  { symbol: "TCS", name: "Data Center Expansion", capex: 5000, stage: "GROUND_BREAK", ... },
  { symbol: "HDFCBANK", name: "Branch Network 500", capex: 2000, stage: "COMMERCIAL", ... },
  { symbol: "BAJFINANCE", name: "Digital Lending Platform", capex: 1500, stage: "RAMP_UP", ... },
  { symbol: "TRENT", name: "Westside 200 Stores", capex: 3000, stage: "CONSTRUCTION", ... },
  { symbol: "DMART", name: "Distribution Center Network", capex: 4000, stage: "LAND_ACQUISITION", ... },
  { symbol: "PERSISTENT", name: "Cloud Migration Center", capex: 800, stage: "FEASIBILITY", ... },
  { symbol: "COFORGE", name: "Europe Delivery Center", capex: 1200, stage: "ANNOUNCED", ... },
];
```