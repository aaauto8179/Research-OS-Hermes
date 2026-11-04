# Research OS - Development Guide

> Complete development setup, workflows, and best practices for Research OS.

## 🚀 Quick Start

### Prerequisites

| Tool | Version | Install Command |
|------|---------|-----------------|
| Node.js | 20.x LTS | `winget install OpenJS.NodeJS.LTS` |
| Python | 3.11+ | `winget install Python.Python.3.11` |
| PostgreSQL | 15+ | `winget install PostgreSQL.PostgreSQL` |
| pgvector | 0.5+ | Included in pgvector/pgvector docker |
| Docker | Latest | `winget install Docker.DockerDesktop` |
| Git | Latest | `winget install Git.Git` |

### One-Command Setup

```bash
# Clone and setup
git clone https://github.com/aaauto8179/Research-OS-Hermes.git
cd Research-OS-Hermes

# Run setup script (installs all deps, starts DB, runs migrations)
./scripts/setup-dev.sh
```

---

## 🛠️ Development Environment

### IDE Setup (VS Code Recommended)

**Required Extensions:**
```json
// .vscode/extensions.json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-python.python",
    "ms-python.pylint",
    "ms-python.black-formatter",
    "ms-python.isort",
    "vitest.explorer",
    "prisma.prisma",
    "docker.docker"
  ]
}
```

**Settings:**
```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "explicit"
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "python.linting.enabled": true,
  "python.linting.pylintEnabled": true,
  "python.formatting.provider": "black",
  "python.formatting.blackArgs": ["--line-length", "100"],
  "editor.tabSize": 2,
  "files.trimTrailingWhitespace": true
}
```

---

## 📦 Dependency Management

### Frontend (Node.js)

```bash
cd research-os-frontend

# Install dependencies
npm install

# Add new dependency
npm install <package>

# Add dev dependency
npm install -D <package>

# Update dependencies
npm update

# Audit security
npm audit
npm audit fix
```

**Key Dependencies:**
```json
// Core
"next": "^15.5.28",
"react": "^19.3.0",
"react-dom": "^19.3.0",
"typescript": "^5.x",

// UI
"@radix-ui/react-*": "latest",
"tailwindcss": "^3.4.0",
"clsx": "^2.1.1",
"tailwind-merge": "^3.7.0",
"class-variance-authority": "^0.7.1",
"lucide-react": "^1.61.0",

// State & Data
"zustand": "^5.0.16",
"swr": "^2.5.1",

// Charts & Tables
"recharts": "^3.10.1",
"@tanstack/react-table": "^9.3.1",
"react-grid-layout": "^1.5.0",
"@dnd-kit/core": "^6.3.1",

// Forms
"react-hook-form": "^7.91.0",
"@hookform/resolvers": "^6.0.0",
"zod": "^4.6.7",

// Auth
"next-auth": "^5.0.0-beta.32",
```

### Backend (Python)

```bash
cd math-engine
pip install -e .          # Install in editable mode

# Or with specific dependencies
pip install -r requirements.txt

# Add new dependency
pip install <package>
echo "<package>==$(pip show <package> | grep Version | cut -d' ' -f2)" >> requirements.txt

# Update dependencies
pip install --upgrade -r requirements.txt
```

**Key Dependencies (pyproject.toml):**
```toml
[project]
name = "fros-math-engine"
version = "0.1.0"
requires-python = ">=3.11"
dependencies = [
    "numpy>=1.26",
    "pandas>=2.1",
    "scipy>=1.11",
    "pydantic>=2.5",
    "fastapi>=0.109",
    "uvicorn>=0.27",
    "python-multipart>=0.0.6",
    "dataclasses-json>=0.6",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.4",
    "pytest-cov>=4.1",
    "hypothesis>=6.92",
    "black>=23.0",
    "isort>=5.12",
    "ruff>=0.1",
    "mypy>=1.0",
]
```

---

## 🏃 Running the Project

### Option 1: Docker Compose (Recommended)

```bash
# Start all services
docker-compose up --build -d

# View logs
docker-compose logs -f frontend
docker-compose logs -f math-engine
docker-compose logs -f data-ingestion

# Stop all
docker-compose down

# Reset everything (including volumes)
docker-compose down -v
docker-compose up --build -d
```

### Option 2: Local Services (Manual)

**Terminal 1 - Database:**
```bash
docker-compose up -d postgres qdrant
```

**Terminal 2 - Math Engine:**
```bash
cd math-engine
pip install -e .
uvicorn api.main:app --reload --port 8000
```

**Terminal 3 - Data Ingestion:**
```bash
cd data-ingestion
pip install -e .
uvicorn api.main:app --reload --port 8001
```

**Terminal 4 - Frontend:**
```bash
cd research-os-frontend
npm run dev
```

**Terminal 5 - Auto Agent (Optional):**
```bash
# Hermes auto-agent runs automatically via cron
# Manual trigger:
cd /c/Users/aaaut/research-os && python -m scripts.auto_agent
```

---

## 🧪 Testing

### Frontend Tests

```bash
cd research-os-frontend

# Run all tests
npm test

# Run with UI
npm run test:ui

# Run specific test
npm test -- smoke.test.ts

# Watch mode
npm run test:watch

# Coverage
npm test -- --coverage
```

**Test Structure:**
```
src/
├── **/*.test.ts          # Unit tests
├── **/*.test.tsx         # Component tests
├── vitest.config.ts      # Config
└── vitest.setup.ts       # Setup file
```

### Math Engine Tests

```bash
cd math-engine

# All tests
python -m pytest tests/ -v

# Specific test class
python -m pytest tests/test_math_engine.py::TestDCFEngine -v

# Specific test
python -m pytest tests/test_math_engine.py::TestDCFEngine::test_standard_dcf_case -v

# With coverage
python -m pytest tests/ --cov=math_engine --cov-report=html

# Parallel execution
python -m pytest tests/ -n auto
```

**Test Structure:**
```
tests/
├── test_math_engine.py    # All 36 tests in one file
├── conftest.py            # Fixtures (if needed)
```

### Data Ingestion Tests

```bash
cd data-ingestion

# All tests
python -m pytest tests/ -v

# Specific
python -m pytest tests/test_data_ingestion.py -v
python -m pytest tests/test_legal_extraction.py -v
```

---

## 🔧 Code Quality

### Linting & Formatting

**Frontend:**
```bash
cd research-os-frontend

# Lint
npm run lint

# Auto-fix
npm run lint:fix

# Type check
npm run typecheck

# Format (Prettier)
npx prettier --write .
```

**Backend:**
```bash
cd math-engine

# Format
black src/ tests/
isort src/ tests/

# Lint
ruff check src/ tests/
ruff check --fix src/ tests/

# Type check
mypy src/
```

### Pre-commit Hooks

```bash
# Install
pip install pre-commit
pre-commit install

# Run manually
pre-commit run --all-files
```

**.pre-commit-config.yaml:**
```yaml
repos:
  - repo: https://github.com/psf/black
    rev: 23.12.1
    hooks:
      - id: black
        args: [--line-length=100]

  - repo: https://github.com/pycqa/isort
    rev: 5.12.0
    hooks:
      - id: isort
        args: [--profile=black, --line-length=100]

  - repo: https://github.com/charliermarsh/ruff-pre-commit
    rev: v0.1.0
    hooks:
      - id: ruff
        args: [--fix]

  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.0.0
    hooks:
      - id: mypy
        args: [--strict]

  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.5.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-toml
```

---

## 🌿 Git Workflow

### Branch Strategy

```
main                 # Production-ready
├── antigravity-audit  # Antigravity audit branch
├── experiment/*       # Experimental features
├── feature/*          # Feature branches
├── fix/*              # Bug fixes
└── chore/*            # Maintenance
```

### Commit Convention

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation |
| `refactor` | Code restructuring |
| `test` | Tests |
| `chore` | Maintenance |
| `perf` | Performance |
| `style` | Formatting |

**Examples:**
```
feat(valuation): add SOTP holdco discount sensitivity table

fix(math-engine): fix SOTP equity value calculation for equity-value segments

docs(architecture): add API contract documentation

test(math-engine): add SOTP holdco sensitivity tests

chore(frontend): remove next-auth completely
```

### Branch Protection (GitHub)

```yaml
# .github/branch-protection.yml
branches:
  - name: main
    protection:
      required_status_checks:
        strict: true
        contexts:
          - "TypeScript Check"
          - "Python Tests"
          - "Build"
      enforce_admins: true
      required_pull_request_reviews:
        required_approving_review_count: 1
      restrictions: null
```

---

## 🐛 Debugging

### Frontend Debugging

```bash
# VS Code Launch Config (.vscode/launch.json)
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}"
    },
    {
      "name": "Vitest: debug test",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/vitest/vitest.mjs",
      "args": ["run", "smoke.test.ts"],
      "console": "integratedTerminal"
    }
  ]
}
```

### Backend Debugging

```bash
# VS Code Launch Config (.vscode/launch.json) - add to configurations
{
  "name": "Python: FastAPI debug",
  "type": "python",
  "request": "launch",
  "module": "uvicorn",
  "args": [
    "api.main:app",
    "--reload",
    "--port", "8000"
  ],
  "cwd": "${workspaceFolder}/math-engine",
  "jinja": true,
  "justMyCode": true
}
```

### Debugging Tips

1. **Frontend**: Use React DevTools + React Query DevTools
2. **Backend**: Use `pdb` breakpoints: `import pdb; pdb.set_trace()`
3. **API**: Use `curl` or Postman for endpoint testing
4. **Database**: Use `psql` or pgAdmin for direct queries
4. **Vector Search**: Test Qdrant directly at `http://localhost:6333/dashboard`

---

## 📁 File Organization Rules

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files (TS/TSX) | kebab-case | `company-tabs.tsx` |
| Components | PascalCase | `CompanyTabs.tsx` |
| Hooks | camelCase + `use` | `usePrices.ts` |
| Hooks (files) | kebab-case | `use-prices.ts` |
| Hooks (exports) | camelCase | `export const usePrices = ...` |
| Types | PascalCase | `interface CompanyData` |
| Interfaces | PascalCase + `Interface` | `interface CompanyDataInterface` |
| Types (utility) | PascalCase + `Type` | `type CompanyDataType` |
| Enums | PascalCase | `enum ValuationMethod` |
| Constants | UPPER_SNAKE_CASE | `const DEFAULT_TABS = [...]` |
| Functions | camelCase | `const calculateDCF = ...` |
| Variables | camelCase | `const currentSymbol = ...` |
| Private | underscore prefix | `const _internalHelper = ...` |

### Import Order

```typescript
// 1. External libraries
import React from 'react';
import { z } from 'zod';

// 2. Internal aliases (@/)
import { Button } from '@/components/ui/button';
import { useWorkspace } from '@/lib/workspace-store';

// 3. Relative imports
import { WidgetRenderer } from '@/components/widgets/WidgetRegistry';

// 4. Types (if needed)
import type { WidgetConfig } from '@/lib/types';
```

---

## 📦 Adding New Features

### Adding a New Math Engine

1. **Create engine file:**
```python
# math-engine/src/math_engine/valuation/new_engine.py
from dataclasses import dataclass
from typing import List
from .. import DeterministicCalculator, dataclasses

@dataclass
class NewEngineInputs:
    symbol: str
    # ... inputs

@dataclass
class NewEngineOutputs:
    result: float
    inputs_hash: str
    calculation_timestamp: str

class NewEngine(DeterministicCalculator):
    def calculate(self, inputs: NewEngineInputs) -> NewEngineOutputs:
        # Implementation
        return NewEngineOutputs(
            result=...,
            inputs_hash=self._hash_inputs(inputs),
            calculation_timestamp=datetime.now().isoformat()
        )

def run_new_engine(**kwargs) -> NewEngineOutputs:
    return NewEngine().calculate(NewEngineInputs(**kwargs))
```

2. **Register in `__init__.py`:**
```python
# math-engine/src/math_engine/valuation/__init__.py
from .new_engine import NewEngine, NewEngineInputs, NewEngineOutputs, run_new_engine

__all__ = [
    "NewEngine", "NewEngineInputs", "NewEngineOutputs",
    "run_new_engine",
]
```

3. **Add to registry:**
```python
# math-engine/src/math_engine/__init__.py
from .valuation import NewEngine, run_new_engine

MATH_ENGINE_REGISTRY = {
    # ...
    "new_engine": NewEngine,
}

def run_new_engine(**kwargs):
    return NewEngine().calculate(NewEngineInputs(**kwargs))
```

3. **Add API endpoint:**
```python
# math-engine/api/main.py
from math_engine import NewEngineInputs, NewEngineOutputs, run_new_engine

@app.post("/new-engine")
async def new_engine(request: Request):
    data = await request.json()
    inputs = NewEngineInputs(**data)
    outputs = run_new_engine(**data)
    return JSONResponse(content=dataclasses.asdict(outputs))
```

4. **Add tests:**
```python
# tests/test_math_engine.py
class TestNewEngine:
    def test_basic(self):
        inputs = NewEngineInputs(...)
        outputs = run_new_engine(...)
        assert outputs.result == expected
```

5. **Run tests:**
```bash
python -m pytest tests/test_math_engine.py::TestNewEngine -v
```

### Adding a New Frontend Widget

1. **Create widget component:**
```tsx
// src/components/widgets/NewWidget.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface NewWidgetProps {
  symbol?: string;
  // ... other props
}

export default function NewWidget({ symbol }: NewWidgetProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>New Widget</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Widget content */}
      </CardContent>
    </Card>
  );
}
```

2. **Register in WidgetRegistry:**
```typescript
// src/components/widgets/WidgetRegistry.tsx
const NewWidget = dynamic(() => import("./NewWidget"), { 
  loading: () => <WidgetSkeleton /> 
});

export const WIDGET_REGISTRY: Record<string, React.ComponentType<any>> = {
  // ...
  "new-widget": NewWidget,
};
```

3. **Add to company page tabs:**
```typescript
// src/app/company/[symbol]/page.tsx
const TAB_CONTENT: Record<string, string[]> = {
  valuation: [
    "dcf-valuation",
    "new-widget",  // Add here
    // ...
  ],
  // ...
};
```

4. **Add to industry page (if applicable):**
```typescript
// src/app/industry/page.tsx
const industryWidgets = [
  "industry-overview",
  "new-widget",  // Add here
];
```

---

## 🚀 Release Process

### Versioning (SemVer)

```
MAJOR.MINOR.PATCH
1.0.0

MAJOR: Breaking changes
MINOR: New features (backward compatible)
PATCH: Bug fixes (backward compatible)
```

### Release Checklist

- [ ] All tests pass (`npm test && python -m pytest`)
- [ ] TypeScript compiles (`npx tsc --noEmit`)
- [ ] Build succeeds (`npm run build`)
- [ ] Update CHANGELOG.md
- [ ] Update version in package.json / pyproject.toml
- [ ] Create git tag: `git tag v1.2.3`
- [ ] Push tag: `git push origin v1.2.3`
- [ ] GitHub Release with changelog
- [ ] Deploy to Vercel

---

## 📚 Resources

### Internal Documentation
- [Architecture](./ARCHITECTURE.md)
- [API Documentation](./API.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Widget Development](./WIDGET_DEVELOPMENT.md)

### External Resources
- [Next.js 15 Docs](https://nextjs.org/docs)
- [FastAPI](https://fastapi.tiangolo.com/)
- [Apache Hamilton](https://hamilton.dagworks.io/)
- [Riskfolio-Lib](https://riskfolio-lib.readthedocs.io/)
- [Qdrant](https://qdrant.tech/documentation/)
- [pgvector](https://github.com/pgvector/pgvector)
- [Zustand](https://github.com/pmndrs/zustand)
- [SWR](https://swr.vercel.app/)
- [Vitest](https://vitest.dev/)
- [Zod](https://zod.dev/)

---

## 🆘 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| `Module not found: @/components/...` | Check `tsconfig.json` paths, restart TS server |
| `Cannot find module 'math_engine'` | Run `pip install -e .` in math-engine |
| `Port 3000 already in use` | `npx kill-port 3000` or change port |
| `Database connection failed` | Check PostgreSQL running, check `.env` |
| `Qdrant connection failed` | Check Qdrant running on 6333 |
| `TypeScript errors in widgets` | Run `npx tsc --noEmit` for full check |
| `Vitest fails with jsdom error` | Install `jsdom`: `npm install -D jsdom` |

---

## 📞 Support

- **Internal Issues**: GitHub Issues
- **Architecture Questions**: @co-founder (Hermes)
- **Math Engine**: Check test cases in `tests/test_math_engine.py`
- **Frontend Patterns**: Check existing widgets in `src/components/widgets/`

---

*Last Updated: 2026-11-04*
*Version: 1.0.0*