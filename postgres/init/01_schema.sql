-- Research OS Core Schema
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================
-- CORE ENTITIES
-- ============================================

-- Companies (the central entity)
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol VARCHAR(20) NOT NULL UNIQUE,           -- NSE/BSE symbol (e.g., RELIANCE, TCS)
    name VARCHAR(255) NOT NULL,
    isin VARCHAR(20),
    sector VARCHAR(100),
    industry VARCHAR(100),
    market_cap_category VARCHAR(20),              -- LARGE, MID, SMALL, MICRO
    exchange VARCHAR(10) DEFAULT 'NSE',           -- NSE, BSE
    status VARCHAR(20) DEFAULT 'ACTIVE',          -- ACTIVE, DELISTED, MERGED
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_companies_symbol ON companies(symbol);
CREATE INDEX idx_companies_sector ON companies(sector);
CREATE INDEX idx_companies_trgm ON companies USING gin(name gin_trgm_ops);

-- Documents (all uploaded files)
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    title VARCHAR(500) NOT NULL,
    doc_type VARCHAR(50) NOT NULL,                -- ANNUAL_REPORT, CONCALL_TRANSCRIPT, INVESTOR_PRESENTATION, QUARTERLY_RESULT, CREDIT_RATING, NEWS, OTHER
    source VARCHAR(100),                          -- SCREENER, BSE, NSE, COMPANY_WEBSITE, MANUAL_UPLOAD, LINK
    source_url TEXT,
    file_path TEXT,                               -- local path or object storage key
    file_hash VARCHAR(64),                        -- SHA256 for dedup
    mime_type VARCHAR(100),
    file_size_bytes BIGINT,
    pages INT,
    language VARCHAR(10) DEFAULT 'en',
    fiscal_year INT,
    fiscal_quarter VARCHAR(10),                   -- Q1, Q2, Q3, Q4, FY
    period_end_date DATE,
    parsed_status VARCHAR(20) DEFAULT 'PENDING',  -- PENDING, PARSING, PARSED, FAILED
    parsed_at TIMESTAMPTZ,
    parsing_error TEXT,
    meta JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_documents_company ON documents(company_id);
CREATE INDEX idx_documents_type ON documents(doc_type);
CREATE INDEX idx_documents_fiscal ON documents(fiscal_year, fiscal_quarter);
CREATE INDEX idx_documents_hash ON documents(file_hash);
CREATE INDEX idx_documents_trgm ON documents USING gin(title gin_trgm_ops);

-- Document chunks (for RAG)
CREATE TABLE document_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    chunk_index INT NOT NULL,
    content TEXT NOT NULL,
    content_hash VARCHAR(64),
    token_count INT,
    embedding vector(1024),                       -- BGE-M3 = 1024 dims
    chunk_type VARCHAR(30),                       -- TEXT, TABLE, CHART, HEADER, FOOTNOTE
    page_number INT,
    bbox JSONB,                                   -- {x1, y1, x2, y2} for visual grounding
    meta JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chunks_document ON document_chunks(document_id);
CREATE INDEX idx_chunks_embedding ON document_chunks USING hnsw (embedding vector_cosine_ops);
CREATE INDEX idx_chunks_type ON document_chunks(chunk_type);

-- ============================================
-- GRWTH PIPELINE
-- ============================================

-- Research ideas (Generate stage)
CREATE TABLE research_ideas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    title VARCHAR(500) NOT NULL,
    source VARCHAR(100),                          -- SCREENER, NEWS, PEER, MANAGEMENT_MEET, CONFERENCE, OTHER
    source_detail TEXT,
    tags TEXT[],                                  -- user-defined tags
    stage VARCHAR(20) DEFAULT 'GENERATE',         -- GENERATE, RESEARCH, WEIGH, TRACK, HARVEST
    conviction_score DECIMAL(3,2),                -- 0.00 to 10.00
    priority INT DEFAULT 0,
    assigned_to VARCHAR(100),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX idx_ideas_stage ON research_ideas(stage);
CREATE INDEX idx_ideas_company ON research_ideas(company_id);
CREATE INDEX idx_ideas_tags ON research_ideas USING gin(tags);

-- GRWTH Kanban columns (configurable stages)
CREATE TABLE grwth_stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) NOT NULL UNIQUE,             -- GENERATE, RESEARCH, WEIGH, TRACK, HARVEST
    name VARCHAR(50) NOT NULL,
    description TEXT,
    position INT NOT NULL,
    wip_limit INT,
    entry_criteria JSONB DEFAULT '{}',
    exit_criteria JSONB DEFAULT '{}',
    color VARCHAR(7),                             -- hex color
    is_active BOOLEAN DEFAULT TRUE
);

INSERT INTO grwth_stages (code, name, description, position, wip_limit, color) VALUES
('GENERATE', 'Generate Ideas', 'New ideas entering the funnel', 1, 50, '#3B82F6'),
('RESEARCH', 'Research & Review', 'Deep dive analysis in progress', 2, 10, '#8B5CF6'),
('WEIGH', 'Weigh Decisions', 'Conviction scoring & portfolio fit', 3, 5, '#F59E0B'),
('TRACK', 'Track', 'Active monitoring post-decision', 4, 20, '#10B981'),
('HARVEST', 'Harvest', 'Exit / position management', 5, 10, '#EF4444');

-- Idea stage history (audit trail)
CREATE TABLE idea_stage_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    idea_id UUID NOT NULL REFERENCES research_ideas(id) ON DELETE CASCADE,
    from_stage VARCHAR(20),
    to_stage VARCHAR(20) NOT NULL,
    reason TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_stage_history_idea ON idea_stage_history(idea_id);

-- ============================================
-- COMPANY PAGE TABS (Deep Dive)
-- ============================================

-- Overview tab
CREATE TABLE company_overview (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    about_company TEXT,
    entry_rationale TEXT,
    exit_rationale TEXT,
    thesis_snapshot TEXT,
    decision_terminal JSONB DEFAULT '{}',         -- {conviction, time_horizon, position_size}
    tracking_table JSONB DEFAULT '{}',            -- flexible key-factor tracking
    latest_changes JSONB DEFAULT '[]',            -- [{date, event, impact, notes}]
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (company_id)
);

-- Management & Execution
CREATE TABLE company_management (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    background JSONB DEFAULT '[]',                -- [{name, role, since, education, experience}]
    shareholding_pattern JSONB DEFAULT '[]',      -- [{entity, category, pct, change, notes}]
    track_record JSONB DEFAULT '[]',              -- [{year, milestone, metric, value}]
    concall_consistency JSONB DEFAULT '[]',       -- [{quarter, guidance, actual, variance, notes}]
    capital_allocation JSONB DEFAULT '[]',        -- [{year, capex, acquisitions, dividends, buybacks, roic}]
    red_flags JSONB DEFAULT '[]',                 -- [{type, severity, description, date, source_doc_id}]
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (company_id)
);

-- Story (Business Model, Moat, Growth Drivers)
CREATE TABLE company_story (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    business_model TEXT,
    economic_moat TEXT,
    current_growth_drivers JSONB DEFAULT '[]',    -- [{driver, market_size, market_size_source, confidence}]
    future_growth_drivers JSONB DEFAULT '[]',
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (company_id)
);

-- Industry Analysis
CREATE TABLE company_industry (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    market_sizing JSONB DEFAULT '[]',             -- [{year, market_size, cagr, assumptions, source_doc_id}]
    competitors JSONB DEFAULT '[]',               -- [{symbol, name, revenue, market_share, notes}]
    value_chain JSONB DEFAULT '{}',               -- nodes/edges for canvas
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (company_id)
);

-- Risk Framework
CREATE TABLE company_risk (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    business_risk JSONB DEFAULT '[]',             -- [{risk, assumptions, score, impact, duration}]
    financial_risk JSONB DEFAULT '[]',
    valuation_risk JSONB DEFAULT '[]',
    governance_risk JSONB DEFAULT '[]',
    macro_risk JSONB DEFAULT '[]',
    industry_red_flags JSONB DEFAULT '[]',
    risk_scores JSONB DEFAULT '{}',               -- {business: 7, financial: 5, ...}
    key_fragility_points JSONB DEFAULT '[]',
    legal_checks JSONB DEFAULT '[]',              -- [{issue, status, contingency, source_doc_id}]
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (company_id)
);

-- Analysis (Concall, Ratios, Events, Turnaround, Exit)
CREATE TABLE company_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    concall_tracker JSONB DEFAULT '[]',           -- [{quarter, template_data, source_doc_id}]
    ratio_analysis JSONB DEFAULT '{}',            -- computed ratios by period
    recent_events JSONB DEFAULT '[]',             -- [{date, type, description, impact, source_doc_id}]
    turnaround_indicators JSONB DEFAULT '[]',
    exit_checklist JSONB DEFAULT '[]',            -- [{parameter, threshold, current, triggered, notes}]
    valuation_philosophy TEXT,
    dcf_model JSONB DEFAULT '{}',
    relative_model JSONB DEFAULT '{}',
    sotp_model JSONB DEFAULT '{}',
    banking_model JSONB DEFAULT '{}',
    excess_return_model JSONB DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (company_id)
);

-- Financials (Statements, Projections, Common Size)
CREATE TABLE company_financials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    financial_statements JSONB DEFAULT '{}',      -- {pl, bs, cf, notes} by period
    segment_breakup JSONB DEFAULT '[]',           -- [{segment, revenue, pct, yoy, notes}] by period
    revenue_projections JSONB DEFAULT '[]',       -- [{year, scenario, revenue, assumptions}]
    common_size JSONB DEFAULT '{}',               -- % of revenue / total assets
    cost_breakup JSONB DEFAULT '[]',
    wc_breakup JSONB DEFAULT '[]',
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (company_id)
);

-- SME / Forensics
CREATE TABLE company_sme (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    company_info JSONB DEFAULT '{}',              -- IR contacts, expos, etc.
    promoter_forensics JSONB DEFAULT '{}',        -- board structure, compensation, etc.
    fs_health JSONB DEFAULT '{}',                 -- template-based metrics
    other_forensics JSONB DEFAULT '{}',
    on_ground_research JSONB DEFAULT '[]',        -- [{date, person, interaction, notes}]
    corporate_governance JSONB DEFAULT '{}',      -- compensation, board structure, auditor
    customer_concentration JSONB DEFAULT '[]',    -- [{customer, pct, top_x}]
    screening_checklist JSONB DEFAULT '[]',       -- [{item, checked, notes}]
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (company_id)
);

-- Downsides / Exit Triggers
CREATE TABLE company_downsides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    key_events JSONB DEFAULT '[]',                -- [{event, trigger_condition, action}]
    hedging_mechanism JSONB DEFAULT '{}',
    forensic_analysis JSONB DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (company_id)
);

-- ============================================
-- WEIGH DECISIONS
-- ============================================

CREATE TABLE weigh_decisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    idea_id UUID NOT NULL REFERENCES research_ideas(id) ON DELETE CASCADE,
    portfolio_fit JSONB DEFAULT '{}',             -- sector concentration, promoter overlap, etc.
    risk_correlation JSONB DEFAULT '{}',          -- risk bucket contributions, correlations
    valuation_allocation JSONB DEFAULT '{}',      -- bear/bull/base cases, MOS, liquidity
    behavioural_audit JSONB DEFAULT '[]',         -- [{bias, check, justification, passed}]
    final_summary JSONB DEFAULT '{}',             -- recommended allocation, review triggers
    decision VARCHAR(20),                         -- INVEST, PASS, MONITOR, EXIT
    decided_at TIMESTAMPTZ,
    decided_by VARCHAR(100),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (idea_id)
);

-- ============================================
-- PORTFOLIO MANAGEMENT
-- ============================================

-- Portfolios (multiple supported)
CREATE TABLE portfolios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    benchmark_symbol VARCHAR(20) DEFAULT 'NIFTY50',
    base_currency VARCHAR(3) DEFAULT 'INR',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Holdings (current positions)
CREATE TABLE holdings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
    quantity DECIMAL(20,4) NOT NULL DEFAULT 0,
    avg_cost DECIMAL(20,4) NOT NULL DEFAULT 0,
    current_price DECIMAL(20,4),
    current_value DECIMAL(20,4),
    unrealized_pnl DECIMAL(20,4),
    unrealized_pnl_pct DECIMAL(10,4),
    asset_class VARCHAR(20) DEFAULT 'EQUITY',     -- EQUITY, DEBT, MF, ETF, CASH
    sector VARCHAR(100),
    market_cap_category VARCHAR(20),
    entry_date DATE,
    entry_rationale TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (portfolio_id, company_id)
);

CREATE INDEX idx_holdings_portfolio ON holdings(portfolio_id);

-- Transactions (trade history)
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
    txn_type VARCHAR(20) NOT NULL,                -- BUY, SELL, DIVIDEND, SPLIT, BONUS, MERGER, TRANSFER_IN, TRANSFER_OUT, MTF
    txn_date DATE NOT NULL,
    quantity DECIMAL(20,4) NOT NULL,
    price DECIMAL(20,4) NOT NULL,
    value DECIMAL(20,4) GENERATED ALWAYS AS (quantity * price) STORED,
    charges DECIMAL(20,4) DEFAULT 0,
    net_value DECIMAL(20,4) GENERATED ALWAYS AS (quantity * price + charges) STORED,
    realized_pnl DECIMAL(20,4),
    entry_rationale TEXT,
    exit_rationale TEXT,
    source VARCHAR(50),                           -- MANUAL, LEDGER_UPLOAD, HOLDING_UPLOAD, CAPITAL_GAINS
    source_doc_id UUID REFERENCES documents(id),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transactions_portfolio ON transactions(portfolio_id);
CREATE INDEX idx_transactions_company ON transactions(company_id);
CREATE INDEX idx_transactions_date ON transactions(txn_date);

-- Import batches (for reconciliation)
CREATE TABLE import_batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    import_type VARCHAR(30) NOT NULL,             -- CAPITAL_GAINS, LEDGER_NORMAL, LEDGER_MTF, HOLDINGS, TRANSACTIONS
    file_name VARCHAR(255),
    file_hash VARCHAR(64),
    status VARCHAR(20) DEFAULT 'PENDING',         -- PENDING, PROCESSING, COMPLETED, FAILED, RECONCILED
    records_total INT,
    records_processed INT,
    records_failed INT,
    reconciliation_result JSONB DEFAULT '{}',
    error_details JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Corporate actions
CREATE TABLE corporate_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    action_type VARCHAR(30) NOT NULL,             -- SPLIT, BONUS, RIGHTS, MERGER, DEMERGER, DIVIDEND, TRANSFER_IN, TRANSFER_OUT, MTF, INTRADAY_ADJ
    ex_date DATE,
    record_date DATE,
    ratio_numerator DECIMAL(10,4),
    ratio_denominator DECIMAL(10,4),
    dividend_per_share DECIMAL(10,4),
    details JSONB DEFAULT '{}',
    source VARCHAR(50),
    source_doc_id UUID REFERENCES documents(id),
    is_processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_corp_actions_company ON corporate_actions(company_id);
CREATE INDEX idx_corp_actions_date ON corporate_actions(ex_date);

-- Portfolio metrics snapshots
CREATE TABLE portfolio_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    snapshot_date DATE NOT NULL,
    metric_category VARCHAR(30) NOT NULL,         -- PERFORMANCE, RISK, CONSTRUCTION, VALUATION, FUNDAMENTALS
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(20,6),
    benchmark_value DECIMAL(20,6),
    metadata JSONB DEFAULT '{}',
    UNIQUE (portfolio_id, snapshot_date, metric_category, metric_name)
);

-- Portfolio risk aggregation
CREATE TABLE portfolio_risk (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    snapshot_date DATE NOT NULL,
    risk_bucket VARCHAR(50) NOT NULL,             -- BUSINESS, FINANCIAL, VALUATION, GOVERNANCE, MACRO, INDUSTRY
    risk_score DECIMAL(5,2),                      -- 0-100 aggregated
    contribution_pct DECIMAL(5,2),
    details JSONB DEFAULT '{}',
    UNIQUE (portfolio_id, snapshot_date, risk_bucket)
);

-- ============================================
-- MACRO / INDUSTRY (Standalone)
-- ============================================

CREATE TABLE macro_indicators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    indicator_code VARCHAR(50) NOT NULL,          -- GDP_GROWTH, REPO_RATE, CPI, IIP, etc.
    name VARCHAR(100) NOT NULL,
    value DECIMAL(20,6),
    unit VARCHAR(20),
    period DATE NOT NULL,
    frequency VARCHAR(10),                        -- DAILY, WEEKLY, MONTHLY, QUARTERLY, ANNUAL
    source VARCHAR(50),                           -- RBI, MOSPI, WORLD_BANK, TRADING_ECONOMICS
    source_url TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (indicator_code, period)
);

CREATE TABLE market_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_code VARCHAR(50) NOT NULL,             -- NIFTY50, SENSEX, NIFTY_PE, NIFTY_PB, VIX, ADV_DECL
    name VARCHAR(100) NOT NULL,
    value DECIMAL(20,6),
    change_value DECIMAL(20,6),
    change_pct DECIMAL(10,4),
    period DATE NOT NULL,
    frequency VARCHAR(10) DEFAULT 'DAILY',
    source VARCHAR(50),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (metric_code, period)
);

-- Industry pages (standalone, not per-company)
CREATE TABLE industries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) NOT NULL UNIQUE,             -- AUTO, PHARMA, IT_SERVICES, etc.
    name VARCHAR(100) NOT NULL,
    description TEXT,
    demand_drivers JSONB DEFAULT '[]',            -- [{driver, impact_pct, notes}]
    supply_dynamics JSONB DEFAULT '[]',           -- [{header, rows: [{metric, value, unit}]}]
    risk_factors JSONB DEFAULT '[]',
    regulations JSONB DEFAULT '[]',
    demand_drivers_detail JSONB DEFAULT '[]',
    cost_drivers JSONB DEFAULT '[]',
    cost_comparison JSONB DEFAULT '{}',
    supply_chain_map JSONB DEFAULT '{}',          -- canvas nodes/edges
    market_sizing JSONB DEFAULT '[]',             -- [{year, size, cagr, assumptions}]
    company_symbols TEXT[],                       -- array of symbols in this industry
    aggregate_financials JSONB DEFAULT '{}',      -- summed revenue, profit, fcff, etc.
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- WATCHLISTS
-- ============================================

CREATE TABLE watchlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    columns JSONB DEFAULT '[]',                   -- [{key, label, visible, order}]
    company_symbols TEXT[],                       -- ordered array
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TASKS / COLLABORATION
-- ============================================

CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'TODO',            -- TODO, IN_PROGRESS, REVIEW, DONE, BLOCKED
    priority INT DEFAULT 0,
    assignee VARCHAR(100),
    due_date TIMESTAMPTZ,
    estimated_hours DECIMAL(5,2),
    actual_hours DECIMAL(5,2) DEFAULT 0,
    tags TEXT[],
    related_idea_id UUID REFERENCES research_ideas(id),
    related_company_id UUID REFERENCES companies(id),
    parent_task_id UUID REFERENCES tasks(id),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_assignee ON tasks(assignee);
CREATE INDEX idx_tasks_idea ON tasks(related_idea_id);

-- Time tracking
CREATE TABLE time_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id VARCHAR(100) NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    duration_minutes INT GENERATED ALWAYS AS (EXTRACT(EPOCH FROM (end_time - start_time))/60) STORED,
    category VARCHAR(50),                         -- RESEARCH, ANALYSIS, MEETING, ADMIN, OTHER
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- DOCUMENT AI / RAG LOGS
-- ============================================

CREATE TABLE rag_queries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question TEXT NOT NULL,
    context_chunks UUID[],                        -- chunk IDs used
    answer TEXT,
    model_used VARCHAR(100),
    latency_ms INT,
    feedback_score INT,                           -- 1-5 user rating
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- UPDATED_AT TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_research_ideas_updated_at BEFORE UPDATE ON research_ideas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_company_overview_updated_at BEFORE UPDATE ON company_overview FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_company_management_updated_at BEFORE UPDATE ON company_management FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_company_story_updated_at BEFORE UPDATE ON company_story FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_company_industry_updated_at BEFORE UPDATE ON company_industry FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_company_risk_updated_at BEFORE UPDATE ON company_risk FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_company_analysis_updated_at BEFORE UPDATE ON company_analysis FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_company_financials_updated_at BEFORE UPDATE ON company_financials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_company_sme_updated_at BEFORE UPDATE ON company_sme FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_company_downsides_updated_at BEFORE UPDATE ON company_downsides FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_weigh_decisions_updated_at BEFORE UPDATE ON weigh_decisions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_portfolios_updated_at BEFORE UPDATE ON portfolios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_holdings_updated_at BEFORE UPDATE ON holdings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_industries_updated_at BEFORE UPDATE ON industries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_watchlists_updated_at BEFORE UPDATE ON watchlists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();