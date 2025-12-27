-- Schema Alignment Migration
-- Migration: 005_schema_alignment
-- Description: Add 'starter' tier, llm_updates table, and tier-based content columns

-- ============================================
-- UPDATE SUBSCRIPTION TIER ENUM
-- ============================================
-- Note: PostgreSQL doesn't allow adding enum values in the middle easily,
-- so we check if it exists first

DO $$
BEGIN
    -- Check if 'starter' value already exists in the enum
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumlabel = 'starter'
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'subscription_tier')
    ) THEN
        -- Add 'starter' to the enum
        ALTER TYPE subscription_tier ADD VALUE IF NOT EXISTS 'starter';
    END IF;
EXCEPTION
    WHEN undefined_object THEN
        -- If the enum doesn't exist, create it with all values
        CREATE TYPE subscription_tier AS ENUM ('free', 'starter', 'pro', 'enterprise');
END $$;

-- ============================================
-- LLM_UPDATES TABLE
-- Tracks LLM/AI tool updates for potential newsletter content
-- ============================================
CREATE TABLE IF NOT EXISTS llm_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tool_name TEXT NOT NULL,
    version TEXT,
    update_type TEXT CHECK (update_type IN (
        'new_release',
        'feature',
        'breaking_change',
        'deprecation',
        'pricing',
        'api_change',
        'model_update'
    )),
    summary TEXT NOT NULL,
    raw_data JSONB,
    source_url TEXT,
    detected_at TIMESTAMPTZ DEFAULT NOW(),
    converted_to_tutorial BOOLEAN DEFAULT FALSE,
    tutorial_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_llm_updates_tool
    ON llm_updates(tool_name);
CREATE INDEX IF NOT EXISTS idx_llm_updates_detected
    ON llm_updates(detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_llm_updates_unconverted
    ON llm_updates(converted_to_tutorial, detected_at DESC)
    WHERE converted_to_tutorial = FALSE;
CREATE INDEX IF NOT EXISTS idx_llm_updates_type
    ON llm_updates(update_type, detected_at DESC);

-- ============================================
-- ADD TIER-BASED CONTENT COLUMNS TO DAILY_RESEARCH
-- ============================================
ALTER TABLE daily_research
    ADD COLUMN IF NOT EXISTS free_preview TEXT,
    ADD COLUMN IF NOT EXISTS starter_content TEXT,
    ADD COLUMN IF NOT EXISTS pro_content TEXT,
    ADD COLUMN IF NOT EXISTS subject_line TEXT;

-- Comment on columns for documentation
COMMENT ON COLUMN daily_research.free_preview IS 'Truncated preview content for free tier users';
COMMENT ON COLUMN daily_research.starter_content IS 'Full tutorial content for starter tier users';
COMMENT ON COLUMN daily_research.pro_content IS 'Deep-dive technical content for pro/enterprise tier users';
COMMENT ON COLUMN daily_research.subject_line IS 'Email subject line / headline for the content';

-- ============================================
-- ROW LEVEL SECURITY FOR LLM_UPDATES
-- ============================================
ALTER TABLE llm_updates ENABLE ROW LEVEL SECURITY;

-- Public read access for converted updates
CREATE POLICY "llm_updates_public_read" ON llm_updates
    FOR SELECT
    USING (converted_to_tutorial = TRUE);

-- Service role can do everything
CREATE POLICY "llm_updates_service_all" ON llm_updates
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ============================================
-- HELPER FUNCTION: Get content by tier
-- ============================================
CREATE OR REPLACE FUNCTION get_tiered_content(
    research_id UUID,
    user_tier TEXT
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    content TEXT,
    has_full_access BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        dr.id,
        dr.title,
        CASE
            WHEN user_tier = 'free' THEN COALESCE(dr.free_preview, LEFT(dr.content, 500))
            WHEN user_tier = 'starter' THEN COALESCE(dr.starter_content, dr.content)
            WHEN user_tier IN ('pro', 'enterprise') THEN
                COALESCE(dr.content || E'\n\n---\n\n' || COALESCE(dr.pro_content, ''), dr.content)
            ELSE COALESCE(dr.free_preview, LEFT(dr.content, 500))
        END AS content,
        CASE
            WHEN user_tier IN ('pro', 'enterprise') THEN TRUE
            WHEN user_tier = 'starter' THEN TRUE
            ELSE FALSE
        END AS has_full_access
    FROM daily_research dr
    WHERE dr.id = research_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- UPDATE SUBSCRIPTION_TIERS TABLE
-- Add starter tier configuration if not exists
-- ============================================
INSERT INTO subscription_tiers (tier, name, description, price_monthly, price_yearly, is_active, sort_order)
VALUES (
    'starter',
    'Starter',
    'Full Tool of the Day archive access with detailed tool analysis and scores',
    4.99,
    49.99,
    TRUE,
    2
)
ON CONFLICT (tier) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price_monthly = EXCLUDED.price_monthly,
    price_yearly = EXCLUDED.price_yearly;
