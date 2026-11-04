# Research OS - Deployment Guide

> Complete deployment guide for Research OS across environments.

## 🚀 Deployment Overview

### Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                        DEPLOYMENT ARCHITECTURE                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐  │
│  │   Vercel    │    │   Vercel    │    │      Vercel           │  │
│  │  Frontend   │    │ Math Engine │    │  Data Ingestion       │  │
│  │  (Next.js)  │    │  (FastAPI)  │    │  (FastAPI)            │  │
│  └──────┬──────┘    └──────┬──────┘    └──────────┬────────────┘  │
│         │                  │                      │               │
│         ▼                  ▼                      ▼               │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                    EXTERNAL SERVICES                          │  │
│  ├──────────────┬──────────────┬──────────────┬────────────────┤  │
│  │  PostgreSQL  │    Qdrant    │   File       │    Redis       │  │
│  │  + pgvector  │  (Vectors)   │  Storage     │   (Optional)   │  │
│  │  (Supabase/  │  (Qdrant     │  (Local/     │                │  │
│  │   Neon/      │   Cloud/     │   S3/MinIO)  │                │  │
│  │   Railway)   │   Self-host) │              │                │  │
│  └──────────────┴──────────────┴──────────────┴────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Vercel Deployment (Recommended)

### Prerequisites
- Vercel account
- GitHub repo connected to Vercel
- PostgreSQL database (Supabase/Neon/Railway)
- Qdrant Cloud account or self-hosted Qdrant

### Step 1: Prepare Repository

```bash
# Ensure all changes committed
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### Step 2: Deploy Frontend (research-os-frontend)

1. **Import Project in Vercel:**
   - Go to Vercel Dashboard → Add New Project
   - Import `aaauto8179/Research-OS-Hermes`
   - **Root Directory**: `research-os-frontend`

2. **Configure Build Settings:**
   ```
   Framework Preset: Next.js
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   Development Command: npm run dev
   ```

3. **Environment Variables:**
   ```
   NEXT_PUBLIC_MATH_ENGINE_URL=https://math-engine-api.vercel.app
   NEXT_PUBLIC_DATA_INGESTION_URL=https://data-ingestion-api.vercel.app
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
   ```

4. **Deploy:**
   - Click Deploy
   - Wait for build to complete
   - Note the deployment URL (e.g., `https://research-os-hermes.vercel.app`)

### Step 3: Deploy Math Engine (Python/FastAPI)

1. **Create New Vercel Project:**
   - Add New Project → Import same repo
   - **Root Directory**: `math-engine`

2. **Configure:**
   ```
   Framework Preset: Other
   Build Command: pip install -r requirements.txt
   Output Directory: (leave empty)
   Install Command: pip install -r requirements.txt
   ```

3. **Environment Variables:**
   ```
   DATABASE_URL=postgresql://user:pass@host:5432/db
   QDRANT_URL=https://your-cluster.qdrant.io
   QDRANT_API_KEY=your-api-key
   ```

3. **Configure `vercel.json` in math-engine:**
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "api/main.py",
         "use": "@vercel/python",
         "config": {
           "maxLambdaSize": "50mb",
           "runtime": "python3.11"
         }
       }
     ],
     "routes": [
       { "src": "/(.*)", "dest": "/api/main.py" }
     ]
   }
   ```

4. **Deploy** and note URL (e.g., `https://math-engine-api.vercel.app`)

### Step 4: Deploy Data Ingestion (Python/FastAPI)

1. **Create New Vercel Project:**
   - Root Directory: `data-ingestion`

2. **Configure** (same as Math Engine)

3. **Environment Variables:**
   ```
   DATABASE_URL=postgresql://user:pass@host:5432/db
   QDRANT_URL=https://your-cluster.qdrant.io
   QDRANT_API_KEY=your-api-key
   ```

4. **Deploy** and note URL (e.g., `https://data-ingestion-api.vercel.app`)

### Step 5: Update Frontend Environment

```bash
# Update research-os-frontend/.env.production
NEXT_PUBLIC_MATH_ENGINE_URL=https://math-engine-api.vercel.app
NEXT_PUBLIC_DATA_INGESTION_URL=https://data-ingestion-api.vercel.app
```

Redeploy frontend to pick up new URLs.

---

## 🐳 Docker Deployment (Self-Hosted)

### Quick Start with Docker Compose

```bash
# Clone
git clone https://github.com/aaauto8179/Research-OS-Hermes.git
cd Research-OS-Hermes

# Start all services
docker-compose up --build -d

# Verify
docker-compose ps
curl http://localhost:3000/api/health
curl http://localhost:8000/health
curl http://localhost:8001/health
```

### Docker Compose Services

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: pgvector/pgvector:pg16
    container_name: research-os-postgres
    environment:
      POSTGRES_DB: research_os
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./postgres/init:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  qdrant:
    image: qdrant/qdrant:v1.7
    container_name: research-os-qdrant
    ports:
      - "6333:6333"
      - "6334:6334"
    volumes:
      - qdrant_data:/qdrant/storage
    environment:
      - QDRANT__SERVICE__HTTP_PORT=6333
      - QDRANT__SERVICE__GRPC_PORT=6334
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:6333/health"]
      interval: 10s
      timeout: 5s
      retries: 5

  math-engine:
    build: ./math-engine
    container_name: research-os-math-engine
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://postgres:${POSTGRES_PASSWORD:-postgres}@postgres:5432/research_os
      QDRANT_URL: http://qdrant:6333
      PYTHONPATH: /app/src
    depends_on:
      postgres:
        condition: service_healthy
      qdrant:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  data-ingestion:
    build: ./data-ingestion
    container_name: research-os-data-ingestion
    ports:
      - "8001:8001"
    environment:
      DATABASE_URL: postgresql://postgres:${POSTGRES_PASSWORD:-postgres}@postgres:5432/research_os
      QDRANT_URL: http://qdrant:6333
      PYTHONPATH: /app/src
    depends_on:
      postgres:
        condition: service_healthy
      qdrant:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8001/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build: ./research-os-frontend
    container_name: research-os-frontend
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_MATH_ENGINE_URL: http://math-engine:8000
      NEXT_PUBLIC_DATA_INGESTION_URL: http://data-ingestion:8001
      NEXT_PUBLIC_SUPABASE_URL: ${NEXT_PUBLIC_SUPABASE_URL}
      NEXT_PUBLIC_SUPABASE_ANON_KEY: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
    depends_on:
      math-engine:
        condition: service_healthy
      data-ingestion:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  postgres_data:
  qdrant_data:

networks:
  default:
    name: research-os-network
```

### Environment File (.env)

```bash
# .env
POSTGRES_PASSWORD=secure_password_here
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
```

### Production Optimizations

```yaml
# docker-compose.prod.yml (extends docker-compose.yml)
services:
  math-engine:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 4G
        reservations:
          cpus: '1'
          memory: 2G
    command: uvicorn api.main:app --host 0.0.0.0 --port 8000 --workers 4

  data-ingestion:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 4G
        reservations:
          cpus: '1'
          memory: 2G
    command: uvicorn api.main:app --host 0.0.0.0 --port 8001 --workers 4

  frontend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 2G
        reservations:
          cpus: '0.5'
          memory: 1G
    command: npm run start

  postgres:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 4G
    command: postgres -c max_connections=200 -c shared_buffers=1GB

  qdrant:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 4G
```

### Production Deploy

```bash
# Deploy production stack
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d

# Scale services
docker-compose up --scale math-engine=3 --scale data-ingestion=2 -d

# View logs
docker-compose logs -f math-engine
```

---

## ☁️ Cloud Provider Specific

### AWS (ECS Fargate + RDS + ElastiCache)

```json
// task-definition-math-engine.json
{
  "family": "research-os-math-engine",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "2048",
  "memory": "4096",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::account:role/ecsTaskRole",
  "containerDefinitions": [{
    "name": "math-engine",
    "image": "account.dkr.ecr.region.amazonaws.com/research-os-math-engine:latest",
    "portMappings": [{"containerPort": 8000, "protocol": "tcp"}],
    "environment": [
      {"name": "DATABASE_URL", "value": "postgresql://user:pass@rds-endpoint:5432/db"},
      {"name": "QDRANT_URL", "value": "https://qdrant-endpoint:6333"}
    ],
    "logConfiguration": {
      "logDriver": "awslogs",
      "options": {
        "awslogs-group": "/ecs/research-os-math-engine",
        "awslogs-region": "us-east-1",
        "awslogs-stream-prefix": "ecs"
      }
    },
    "healthCheck": {
      "command": ["CMD-SHELL", "curl -f http://localhost:8000/health || exit 1"],
      "interval": 30,
      "timeout": 10,
      "retries": 3
    }
  }]
}
```

### GCP (Cloud Run)

```yaml
# cloudrun-math-engine.yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: math-engine
  annotations:
    run.googleapis.com/ingress: all
spec:
  template:
    metadata:
      annotations:
        autoscaling.knative.dev/minScale: "1"
        autoscaling.knative.dev/maxScale: "10"
        run.googleapis.com/cpu-throttling: "false"
    spec:
      containerConcurrency: 80
      timeoutSeconds: 300
      containers:
      - image: gcr.io/project/research-os-math-engine:latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
        - name: QDRANT_URL
          value: "https://qdrant-endpoint:6333"
        resources:
          limits:
            cpu: "2000m"
            memory: "4Gi"
          requests:
            cpu: "1000m"
            memory: "2Gi"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 10
          periodSeconds: 30
```

---

## 🔧 Database Setup

### PostgreSQL + pgvector Setup

```bash
# Create database
createdb research_os

# Enable pgvector
psql -d research_os -c "CREATE EXTENSION IF NOT EXISTS vector;"

# Run migrations
psql -d research_os -f postgres/init/01_schema.sql
```

### Qdrant Setup

```bash
# Create collection
curl -X PUT "http://localhost:6333/collections/document_chunks" \
  -H "Content-Type: application/json" \
  -d '{
    "vectors": {
      "size": 1024,
      "distance": "Cosine"
    },
    "optimizers_config": {
      "default_segment_number": 2
    },
    "hnsw_config": {
      "m": 16,
      "ef_construct": 100
    }
  }'
```

### Supabase Setup (Alternative)

```sql
-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Create tables (run 01_schema.sql)
-- Enable Row Level Security
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_statements ENABLE ROW LEVEL SECURITY;
-- ... etc

-- Create policies
CREATE POLICY "Public read access" ON companies FOR SELECT USING (true);
-- ... etc
```

---

## 🔐 Secrets Management

### Vercel Environment Variables

```bash
# Vercel CLI
vercel env add NEXT_PUBLIC_MATH_ENGINE_URL production
vercel env add NEXT_PUBLIC_DATA_INGESTION_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add DATABASE_URL production
vercel env add QDRANT_URL production
vercel env add QDRANT_API_KEY production

# List
vercel env ls

# Pull for local dev
vercel env pull .env.local
```

### GitHub Actions Secrets

```yaml
# .github/workflows/deploy.yml
env:
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
  QDRANT_URL: ${{ secrets.QDRANT_URL }}
  QDRANT_API_KEY: ${{ secrets.QDRANT_API_KEY }}
  NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}
  VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: research-os-frontend/package-lock.json
      
      - name: Install frontend deps
        run: cd research-os-frontend && npm ci
      
      - name: TypeScript check
        run: cd research-os-frontend && npx tsc --noEmit
      
      - name: Run frontend tests
        run: cd research-os-frontend && npm test
      
      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
          cache: 'pip'
          cache-dependency-path: math-engine/requirements.txt
      
      - name: Install math-engine deps
        run: cd math-engine && pip install -e . -q
      
      - name: Run math-engine tests
        run: cd math-engine && python -m pytest tests/ -v
      
      - name: Install data-ingestion deps
        run: cd data-ingestion && pip install -e . -q
      
      - name: Run data-ingestion tests
        run: cd data-ingestion && python -m pytest tests/ -v

  deploy-frontend:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_FRONTEND_PROJECT_ID }}
          vercel-args: '--prod'
        working-directory: ./research-os-frontend

  deploy-math-engine:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_MATH_ENGINE_PROJECT_ID }}
          vercel-args: '--prod'
        working-directory: ./math-engine

  deploy-data-ingestion:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_DATA_INGESTION_PROJECT_ID }}
          vercel-args: '--prod'
        working-directory: ./data-ingestion
```

---

## 🔍 Health Checks & Monitoring

### Health Check Endpoints

```bash
# Frontend
curl -f http://localhost:3000/api/health

# Math Engine
curl -f http://localhost:8000/health

# Data Ingestion
curl -f http://localhost:8001/health
```

### Expected Responses

```json
// Frontend
{ "status": "healthy", "service": "frontend" }

// Math Engine
{ "status": "healthy", "service": "math-engine", "version": "0.1.0" }

// Data Ingestion
{ "status": "healthy", "service": "data-ingestion", "version": "0.1.0" }
```

### Monitoring Stack (Optional)

```yaml
# docker-compose.monitoring.yml
services:
  prometheus:
    image: prom/prometheus:v2.47
    ports: ["9090:9090"]
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus

  grafana:
    image: grafana/grafana:10.2
    ports: ["3001:3000"]
    environment:
      GF_SECURITY_ADMIN_PASSWORD: admin
    volumes:
      - grafana_data:/var/lib/grafana

  alertmanager:
    image: prom/alertmanager:v0.26
    ports: ["9093:9093"]
    volumes:
      - ./alertmanager.yml:/etc/alertmanager/alertmanager.yml
```

---

## 🔒 Security Checklist

- [ ] All secrets in environment variables (not code)
- [ ] HTTPS enforced in production
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Database SSL required
- [ ] Qdrant API key secured
- [ ] pgvector extension enabled
- [ ] Regular security updates
- [ ] Dependency scanning (npm audit, pip-audit)
- [ ] Secret scanning in CI/CD

---

## 📋 Deployment Checklist

- [ ] All tests pass locally
- [ ] TypeScript compiles without errors
- [ ] Build succeeds
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Qdrant collections created
- [ ] Health checks pass
- [ ] SSL certificates valid
- [ ] DNS configured
- [ ] CDN configured (if applicable)
- [ ] Monitoring alerts configured
- [ ] Backup strategy defined
- [ ] Rollback plan documented

---

## 📞 Support

- **Deployment Issues**: Check Vercel/GCP/AWS logs
- **Database Issues**: Check PostgreSQL logs
- **Vector Search Issues**: Check Qdrant dashboard
- **Build Failures**: Check GitHub Actions logs
- **Performance**: Check Vercel Analytics / CloudWatch