-- ============================================
-- Skills Metadata Schema
-- Migration: 003_skills_metadata_schema
-- Description: Track Claude skill metadata in Supabase
-- ============================================

-- ============================================
-- SKILLS TABLE
-- Stores metadata for Claude skill MD files
-- ============================================
CREATE TABLE IF NOT EXISTS skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    allowed_tools TEXT[],
    markdown_content TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    storage_location TEXT NOT NULL CHECK (storage_location IN ('global', 'local')),
    file_path TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_synced_at TIMESTAMPTZ,

    -- Ensure unique slug per location
    CONSTRAINT unique_slug_location UNIQUE (slug, storage_location)
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_skills_location ON skills(storage_location);
CREATE INDEX IF NOT EXISTS idx_skills_active ON skills(is_active);
CREATE INDEX IF NOT EXISTS idx_skills_slug ON skills(slug);
CREATE INDEX IF NOT EXISTS idx_skills_tags ON skills USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_skills_name_search ON skills USING GIN(to_tsvector('english', name || ' ' || description));

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_skills_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS skills_updated_at_trigger ON skills;
CREATE TRIGGER skills_updated_at_trigger
    BEFORE UPDATE ON skills
    FOR EACH ROW
    EXECUTE FUNCTION update_skills_updated_at();

-- ============================================
-- ADMIN ACTIVITY LOGS TABLE
-- Tracks admin actions for audit trail
-- ============================================
CREATE TABLE IF NOT EXISTS admin_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT NOT NULL,
    action TEXT NOT NULL CHECK (action IN (
        'created',
        'updated',
        'deleted',
        'published',
        'unpublished',
        'synced',
        'activated',
        'deactivated'
    )),
    entity_type TEXT NOT NULL CHECK (entity_type IN (
        'skill',
        'topic',
        'post',
        'pipeline',
        'settings'
    )),
    entity_id TEXT,
    entity_name TEXT,
    changes JSONB,  -- Store before/after values
    metadata JSONB, -- Additional context
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for activity logs
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON admin_activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON admin_activity_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON admin_activity_logs(user_email, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON admin_activity_logs(action);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Skills table RLS
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

-- Public can read active skills (for potential future public API)
CREATE POLICY "skills_public_read" ON skills
    FOR SELECT
    USING (is_active = TRUE);

-- Service role can do everything (admin operations via API)
CREATE POLICY "skills_service_all" ON skills
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Activity logs table RLS
ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- Only service role can access activity logs
CREATE POLICY "activity_logs_service_only" ON admin_activity_logs
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to log admin activity
CREATE OR REPLACE FUNCTION log_admin_activity(
    p_user_email TEXT,
    p_action TEXT,
    p_entity_type TEXT,
    p_entity_id TEXT DEFAULT NULL,
    p_entity_name TEXT DEFAULT NULL,
    p_changes JSONB DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO admin_activity_logs (
        user_email,
        action,
        entity_type,
        entity_id,
        entity_name,
        changes,
        metadata
    ) VALUES (
        p_user_email,
        p_action,
        p_entity_type,
        p_entity_id,
        p_entity_name,
        p_changes,
        p_metadata
    )
    RETURNING id INTO v_log_id;

    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get skill statistics
CREATE OR REPLACE FUNCTION get_skill_stats()
RETURNS TABLE (
    total_skills BIGINT,
    global_skills BIGINT,
    local_skills BIGINT,
    active_skills BIGINT,
    inactive_skills BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::BIGINT as total_skills,
        COUNT(*) FILTER (WHERE storage_location = 'global')::BIGINT as global_skills,
        COUNT(*) FILTER (WHERE storage_location = 'local')::BIGINT as local_skills,
        COUNT(*) FILTER (WHERE is_active = TRUE)::BIGINT as active_skills,
        COUNT(*) FILTER (WHERE is_active = FALSE)::BIGINT as inactive_skills
    FROM skills;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE skills IS 'Metadata for Claude skill MD files stored in global (~/.claude/skills/) or local (./skills/) directories';
COMMENT ON COLUMN skills.slug IS 'URL-safe identifier derived from skill name';
COMMENT ON COLUMN skills.storage_location IS 'Where the skill file is stored: global (user-wide) or local (project-specific)';
COMMENT ON COLUMN skills.file_path IS 'Full filesystem path to the SKILL.md file';
COMMENT ON COLUMN skills.last_synced_at IS 'When the database was last synced with the filesystem';

COMMENT ON TABLE admin_activity_logs IS 'Audit trail for admin actions in the dashboard';
COMMENT ON FUNCTION log_admin_activity IS 'Helper to create activity log entries';
COMMENT ON FUNCTION get_skill_stats IS 'Returns aggregate statistics about skills';
