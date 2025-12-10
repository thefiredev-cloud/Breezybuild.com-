-- Content Pipeline Database Schema
-- Migration: 002_content_pipeline_schema
-- Description: Tables and functions for daily content automation pipeline

-- ============================================
-- RESEARCH_TOPICS TABLE
-- Stores topics to be researched by the pipeline
-- ============================================
CREATE TABLE IF NOT EXISTS research_topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    search_query TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 0,
    category TEXT CHECK (category IN (
        'ai_coding',
        'ai_design',
        'devops',
        'productivity',
        'database',
        'hardware_robotics',
        'ai_general'
    )),
    last_featured_date DATE,
    times_featured INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient priority and active queries
CREATE INDEX IF NOT EXISTS idx_research_topics_active_priority
    ON research_topics(is_active, priority DESC, last_featured_date NULLS FIRST);

-- ============================================
-- DAILY_RESEARCH TABLE
-- Stores generated tool research content
-- ============================================
CREATE TABLE IF NOT EXISTS daily_research (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id UUID REFERENCES research_topics(id) ON DELETE SET NULL,
    research_date DATE NOT NULL DEFAULT CURRENT_DATE,
    title TEXT NOT NULL,
    summary TEXT,
    content TEXT NOT NULL,

    -- Structured tool content
    tagline TEXT,
    what_it_is TEXT,
    why_it_matters TEXT,
    use_cases JSONB,                    -- Array of {title, description}
    quick_start_guide JSONB,            -- Array of {step, title, description}
    pro_tips TEXT[],                    -- Array of strings
    gotchas TEXT[],                     -- Array of strings

    -- Scores (1-5 scale)
    score_learning_curve INTEGER CHECK (score_learning_curve BETWEEN 1 AND 5),
    score_ecosystem INTEGER CHECK (score_ecosystem BETWEEN 1 AND 5),
    score_maturity INTEGER CHECK (score_maturity BETWEEN 1 AND 5),
    score_cost_value INTEGER CHECK (score_cost_value BETWEEN 1 AND 5),

    -- Community
    community_size TEXT,                -- Small/Medium/Large/Very Large
    community_sentiment TEXT,           -- Growing/Stable/Declining
    notable_users TEXT[],               -- Array of company names

    -- Pricing
    pricing_model TEXT,                 -- Free/Freemium/Paid/Enterprise
    pricing_tiers JSONB,                -- Array of {name, price, features[]}

    -- Links
    official_url TEXT,
    documentation_url TEXT,
    github_url TEXT,

    -- Metadata
    category TEXT CHECK (category IN (
        'ai_coding',
        'ai_design',
        'devops',
        'productivity',
        'database',
        'hardware_robotics',
        'ai_general'
    )),
    pipeline_status TEXT DEFAULT 'queued' CHECK (pipeline_status IN (
        'queued',
        'researching',
        'ready',
        'published',
        'failed'
    )),
    is_published BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,

    -- Raw data for debugging
    raw_perplexity JSONB,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_daily_research_date
    ON daily_research(research_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_research_status
    ON daily_research(pipeline_status);
CREATE INDEX IF NOT EXISTS idx_daily_research_published
    ON daily_research(is_published, research_date DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_research_one_per_day
    ON daily_research(research_date) WHERE is_published = TRUE;

-- ============================================
-- PIPELINE_RUNS TABLE
-- Tracks pipeline execution for monitoring and debugging
-- ============================================
CREATE TABLE IF NOT EXISTS pipeline_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_type TEXT NOT NULL CHECK (run_type IN (
        'daily_scheduled',
        'background_generation',
        'retry_attempt',
        'manual_trigger'
    )),
    status TEXT NOT NULL CHECK (status IN (
        'started',
        'completed',
        'failed',
        'skipped'
    )),
    started_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    topic_processed TEXT,
    content_generated BOOLEAN DEFAULT FALSE,
    error_type TEXT,
    error_message TEXT,
    perplexity_tokens_used INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for monitoring recent runs
CREATE INDEX IF NOT EXISTS idx_pipeline_runs_started
    ON pipeline_runs(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_pipeline_runs_status
    ON pipeline_runs(status, started_at DESC);

-- ============================================
-- DATABASE FUNCTIONS
-- ============================================

-- Function: has_todays_research
-- Returns: Boolean indicating if today's content exists
CREATE OR REPLACE FUNCTION has_todays_research()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM daily_research
        WHERE research_date = CURRENT_DATE
        AND pipeline_status = 'ready'
    );
END;
$$ LANGUAGE plpgsql;

-- Function: get_next_research_topic
-- Returns: The next topic to research based on priority and freshness
CREATE OR REPLACE FUNCTION get_next_research_topic()
RETURNS TABLE (
    id UUID,
    name TEXT,
    slug TEXT,
    search_query TEXT,
    category TEXT,
    priority INTEGER,
    last_featured_date DATE,
    times_featured INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        rt.id,
        rt.name,
        rt.slug,
        rt.search_query,
        rt.category,
        rt.priority,
        rt.last_featured_date,
        rt.times_featured
    FROM research_topics rt
    WHERE rt.is_active = TRUE
    ORDER BY
        -- Prioritize topics never featured
        CASE WHEN rt.last_featured_date IS NULL THEN 0 ELSE 1 END,
        -- Then by priority (higher first)
        rt.priority DESC,
        -- Then by least recently featured
        rt.last_featured_date NULLS FIRST,
        -- Then by times featured (fewer first)
        rt.times_featured ASC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on new tables
ALTER TABLE research_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_research ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_runs ENABLE ROW LEVEL SECURITY;

-- Research Topics: Public read access
CREATE POLICY "research_topics_public_read" ON research_topics
    FOR SELECT
    USING (true);

-- Daily Research: Public read access for published content
CREATE POLICY "daily_research_public_read" ON daily_research
    FOR SELECT
    USING (is_published = TRUE);

-- Daily Research: Service role can do everything
CREATE POLICY "daily_research_service_all" ON daily_research
    FOR ALL
    USING (true);

-- Pipeline Runs: Service role only (no public access)
CREATE POLICY "pipeline_runs_service_only" ON pipeline_runs
    FOR ALL
    USING (true);

-- ============================================
-- SEED DATA (Optional - add your own topics)
-- ============================================

-- Example research topics (uncomment and customize as needed)
/*
INSERT INTO research_topics (name, slug, search_query, category, priority) VALUES
    ('Supabase', 'supabase', 'Supabase database platform features pricing', 'database', 10),
    ('Clerk Auth', 'clerk-auth', 'Clerk authentication for web apps', 'devops', 9),
    ('Vercel', 'vercel', 'Vercel deployment platform Next.js', 'devops', 8),
    ('Cursor AI', 'cursor-ai', 'Cursor AI coding assistant IDE', 'ai_coding', 10),
    ('v0 by Vercel', 'v0-by-vercel', 'v0 AI UI generator component builder', 'ai_design', 9),
    ('Tailwind CSS', 'tailwind-css', 'Tailwind CSS utility-first framework', 'productivity', 7),
    ('Stripe', 'stripe', 'Stripe payments API integration', 'productivity', 10),
    ('Raspberry Pi', 'raspberry-pi', 'Raspberry Pi hardware projects robotics', 'hardware_robotics', 8),
    ('Arduino', 'arduino', 'Arduino microcontroller programming', 'hardware_robotics', 7),
    ('OpenAI API', 'openai-api', 'OpenAI GPT API integration', 'ai_general', 10)
ON CONFLICT (slug) DO NOTHING;
*/
