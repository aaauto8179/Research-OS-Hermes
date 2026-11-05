-- =====================================================================
-- RESEARCH OS: WORKSTATION PERSISTENCE SCHEMA (R3, R4, R5)
-- Compatible with PostgreSQL 15+, pgvector, and Supabase
-- =====================================================================

-- Ensure necessary extensions exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Ensure trigger function exists if run standalone
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ---------------------------------------------------------------------
-- 1. USER WORKSTATION LAYOUTS (Requirement R3 & R5)
-- Persists user/analyst tab and responsive widget grid configurations
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_workstation_layouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(100) NOT NULL DEFAULT 'default_user',
    symbol VARCHAR(20) NOT NULL,
    active_tab_id VARCHAR(100) NOT NULL DEFAULT 'overview',
    tabs JSONB NOT NULL DEFAULT '[]'::jsonb,
    layouts JSONB NOT NULL DEFAULT '{}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_user_symbol_layout UNIQUE (user_id, symbol)
);

-- Indexes for retrieval by user and company symbol
CREATE INDEX IF NOT EXISTS idx_user_workstation_layouts_user_symbol 
    ON user_workstation_layouts(user_id, symbol);

CREATE INDEX IF NOT EXISTS idx_user_workstation_layouts_symbol 
    ON user_workstation_layouts(symbol);

CREATE INDEX IF NOT EXISTS idx_user_workstation_layouts_tabs 
    ON user_workstation_layouts USING gin(tabs);

-- Automated updated_at trigger
DROP TRIGGER IF EXISTS update_user_workstation_layouts_updated_at ON user_workstation_layouts;
CREATE TRIGGER update_user_workstation_layouts_updated_at 
    BEFORE UPDATE ON user_workstation_layouts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ---------------------------------------------------------------------
-- 2. CARD NOTES (Requirement R4 & R5)
-- Persists qualitative analyst notes and annotations per card and symbol
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS card_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol VARCHAR(20) NOT NULL,
    card_id VARCHAR(100) NOT NULL,
    user_id VARCHAR(100) NOT NULL DEFAULT 'default_user',
    title VARCHAR(255) NOT NULL DEFAULT '',
    content TEXT NOT NULL DEFAULT '',
    tags TEXT[] DEFAULT '{}'::text[],
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for card notes filtering and full-text / trigram searching
CREATE INDEX IF NOT EXISTS idx_card_notes_symbol_card 
    ON card_notes(symbol, card_id);

CREATE INDEX IF NOT EXISTS idx_card_notes_user_symbol 
    ON card_notes(user_id, symbol);

CREATE INDEX IF NOT EXISTS idx_card_notes_tags 
    ON card_notes USING gin(tags);

CREATE INDEX IF NOT EXISTS idx_card_notes_content_trgm 
    ON card_notes USING gin(content gin_trgm_ops);

-- Automated updated_at trigger
DROP TRIGGER IF EXISTS update_card_notes_updated_at ON card_notes;
CREATE TRIGGER update_card_notes_updated_at 
    BEFORE UPDATE ON card_notes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ---------------------------------------------------------------------
-- 3. CARD ATTACHMENTS (Requirement R4 & R5)
-- Persists multi-modal file attachments and metadata per card and symbol
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS card_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol VARCHAR(20) NOT NULL,
    card_id VARCHAR(100) NOT NULL,
    user_id VARCHAR(100) NOT NULL DEFAULT 'default_user',
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL DEFAULT 'application/octet-stream',
    file_url TEXT,
    file_data BYTEA,
    storage_path TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for attachments retrieval
CREATE INDEX IF NOT EXISTS idx_card_attachments_symbol_card 
    ON card_attachments(symbol, card_id);

CREATE INDEX IF NOT EXISTS idx_card_attachments_user_symbol 
    ON card_attachments(user_id, symbol);

CREATE INDEX IF NOT EXISTS idx_card_attachments_created_at 
    ON card_attachments(created_at DESC);


-- ---------------------------------------------------------------------
-- 4. SUPABASE ROW LEVEL SECURITY (RLS) POLICIES
-- Ensures safe compatibility with Supabase Cloud & Local Auth
-- ---------------------------------------------------------------------
ALTER TABLE user_workstation_layouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_attachments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access to user_workstation_layouts') THEN
        CREATE POLICY "Allow all access to user_workstation_layouts" 
            ON user_workstation_layouts FOR ALL USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access to card_notes') THEN
        CREATE POLICY "Allow all access to card_notes" 
            ON card_notes FOR ALL USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access to card_attachments') THEN
        CREATE POLICY "Allow all access to card_attachments" 
            ON card_attachments FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;
