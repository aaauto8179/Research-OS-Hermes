# Simple Text Box Tool Specification

**Tool Name:** Simple Text Box  
**Category:** UI Components  
**Sheet:** Additional tools  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
A simple text box component with header and description. Used for notes, commentary, disclaimers, or any free-form text in dashboards and pages. Part of the UI Primitives library.

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Simple Text Box                                                 │
├─────────────────────────────────────────────────────────────────┤
│ HEADER: [Optional Title]                                        │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Description text goes here. Supports basic formatting:      │ │
│ │ • Bold, Italic, Underline                                   │ │
│ │ • Bullet points                                             │ │
│ │ • Links                                                     │ │
│ │ • Line breaks                                               │ │
│ └─────────────────────────────────────────────────────────────┘ │
│ [Optional: Character count] [Optional: Edit/View toggle]       │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Variants
| Variant | Use Case |
|---------|----------|
| `readonly` | Display only (default) |
| `editable` | Rich text editor (TipTap/ProseMirror) |
| `markdown` | Markdown input, rendered output |
| `compact` | Single line, expand on click |

---

## 4. Engine Integration

### 3.1 Component API
```typescript
interface SimpleTextBoxProps {
  header?: string;
  content: string;
  variant?: 'readonly' | 'editable' | 'markdown' | 'compact';
  placeholder?: string;
  maxLength?: number;
  onChange?: (content: string) => void;
  className?: string;
}
```

### 3.2 Persistence
- **LocalStorage** (dev): Auto-save on blur
- **Postgres** (prod): Save to `user_notes` table with `page_context`, `widget_id`

---

## 4. Engine Integration

### 4.1 Links
- **DashboardCanvas:** As a widget
- **Company Page Tabs:** Notes sections
- **Decision Journal:** Decision rationale
- **Research Workspace:** Idea notes

---

## 4. API Contract

```typescript
// No backend API - pure frontend component
// Exported from @research-os/ui or src/components/widgets
export const SimpleTextBox: React.FC<SimpleTextBoxProps>;
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Readonly variant with header, content, styling | Day 1 |
| 2 | Editable variant (TipTap), markdown support | Day 2 |
| 2 | Auto-save, character count, compact mode | Day 2 |
| 3 | Storybook docs, accessibility, tests | Day 3 |

---

## 5. Testing

| Test | Expected |
|------|----------|
| Readonly render | Header + content display |
| Editable mode | TipTap toolbar works |
| Auto-save | Persists on blur |
| Markdown | Renders correctly |
| Character count | Updates real-time |
| Accessibility | WCAG AA |

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started | Priority: MEDIUM*