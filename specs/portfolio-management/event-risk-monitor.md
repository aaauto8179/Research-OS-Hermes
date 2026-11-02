# Event Risk Monitor Tool Specification

**Tool Name:** Event Risk Monitor  
**Category:** Portfolio Management → Risk  
**Sheet:** Portfolio management Page → Risk  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Event-driven risk monitoring: tracks upcoming corporate actions, earnings announcements, economic events, regulatory changes, and macro events that could impact portfolio holdings. Alerts for high-impact events.

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Event Risk Monitor - [Portfolio Name]                           │
├─────────────────────────────────────────────────────────────────┤
│ UPCOMING EVENTS (Next 30 Days)                                  │
│ ┌────┬────────┬────────────────────┬────────┬────────┬────────┐ │
│ │ #  │ Date   │ Event              │ Symbol │ Impact │ Action │ │
│ ├────┼────────┼────────────────────┼────────┼────────┼────────┤ │
│ │ 1  │ 2024-11-15│ Q2 Earnings      │ RELIANCE│ High   │ 🔔     │ │
│ │ 2  │ 2024-11-20│ RBI Policy       │ PORTFOLIO│ High   │ 🔔     │ │
│ │ 3  │ 2024-11-25│ Ex-Dividend      │ TCS     │ Medium │ 📅     │ │
│ │ 4  │ 2024-11-28│ Board Meeting    │ HDFC    │ Low    │ 👁     │ │
│ └────┴────────┴────────────────────┴────────┴────────┴────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ EVENT TYPES                                                     │
│ ☑ Earnings  ☑ Dividends  ☑ Splits/Bonus  ☑ Board Meetings      │
│ ☑ RBI/SEBI  ☑ Macro Data  ☑ Sector News  ☑ Analyst Actions    │
├─────────────────────────────────────────────────────────────────┤
│ ALERT SETTINGS                                                  │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ☑ Earnings (High)    │ ☑ Dividends (Medium) │ ☐ Splits (Low)│ │
│ │ ☑ RBI Policy         │ ☑ Macro Data         │ ☐ Sector News │ │
│ │ Delivery: [Push ▼] [Email ▼] [Slack ▼]                      │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Engine Integration

### 3.1 Event Sources
| Source | Events | Frequency |
|--------|--------|-----------|
| NSE/BSE Calendar | Earnings, Board Meetings, AGM | Daily |
| Corporate Announcements | Dividends, Splits, Bonus, Rights | Real-time |
| RBI/SEBI | Policy, Circulars, Regulations | Real-time |
| Macro Calendar | GDP, Inflation, IIP, PMI | Scheduled |
| Analyst Actions | Upgrades/Downgrades, Target Changes | Real-time |
| Sector News | Industry-specific | RSS/API |

### 3.2 Event Impact Scoring
```python
def calculate_event_impact(event, portfolio_holdings):
    base_impact = {
        'earnings': 'high',
        'dividend': 'medium',
        'split': 'low',
        'bonus': 'low',
        'rights': 'medium',
        'merger': 'high',
        'board_meeting': 'low',
        'rbi_policy': 'high',
        'macro_data': 'medium',
        'analyst_action': 'medium'
    }
    
    exposure = sum(h.weight for h in portfolio_holdings if h.symbol == event.symbol)
    impact = base_impact.get(event.type, 'low')
    
    if exposure > 0.1 and impact in ['high', 'medium']:
        return 'alert'
    elif exposure > 0.05:
        return 'watch'
    return 'info'
```

---

## 4. Engine Integration

### 4.1 Links
- **Calendar Integration:** Google Calendar, Outlook sync
- **Notification Engine:** Push, Email, Slack, In-app
- **Document AI:** Auto-extract events from filings
- **Macro Page:** Macro calendar sync

---

## 4. API Contract

```typescript
interface EventRiskData {
  portfolioId: string;
  events: RiskEvent[];
  alerts: Alert[];
  settings: AlertSettings;
}

interface RiskEvent {
  id: string;
  date: string;
  type: 'earnings' | 'dividend' | 'split' | 'bonus' | 'rights' | 'merger' | 
        'board_meeting' | 'rbi_policy' | 'macro_data' | 'analyst_action' | 'sector_news';
  symbol: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  portfolioExposure: number;  // % of portfolio
  source: string;
  sourceUrl?: string;
  alertEnabled: boolean;
}

interface Alert {
  eventId: string;
  event: RiskEvent;
  triggeredAt: string;
  acknowledged: boolean;
  deliveryChannel: 'push' | 'email' | 'slack' | 'in_app';
}

interface AlertSettings {
  enabledTypes: string[];
  channels: ('push' | 'email' | 'slack' | 'in_app')[];
  quietHours: { start: string; end: string };
  portfolioThreshold: number;  // min exposure % to alert
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Event data pipeline (NSE/BSE/RBI/SEBI calendars) | Week 1 |
| 2 | Event impact scoring, portfolio exposure calc | Week 1 |
| 2 | Alert engine (push/email/slack), settings UI | Week 2 |
| 3 | Calendar sync (Google/Outlook), export .ics | Week 2 |

---

## 5. Testing

| Test | Expected |
|------|----------|
| Event detection | All event types detected |
| Impact scoring | Correct exposure calculation |
| Alert delivery | Push/email/slack within 1 min |
| Deduplication | No duplicate alerts |
| Calendar sync | Events appear in Google/Outlook |

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started | Priority: HIGH*