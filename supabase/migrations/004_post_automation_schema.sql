-- =====================================================
-- Post Automation Schema Migration
-- Adds automated post generation via Perplexity API
-- =====================================================

-- =====================================================
-- 1. Create post_topics table (topic queue for posts)
-- =====================================================
CREATE TABLE IF NOT EXISTS post_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  search_query TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  last_featured_date DATE,
  times_featured INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for topic selection query
CREATE INDEX IF NOT EXISTS idx_post_topics_active_priority
ON post_topics(is_active, priority DESC, last_featured_date NULLS FIRST, times_featured);

-- =====================================================
-- 2. Extend posts table with AI generation fields
-- =====================================================
ALTER TABLE posts ADD COLUMN IF NOT EXISTS topic_id UUID REFERENCES post_topics(id);
ALTER TABLE posts ADD COLUMN IF NOT EXISTS generated_by_ai BOOLEAN DEFAULT false;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS raw_perplexity JSONB;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS generation_status TEXT DEFAULT 'manual';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS quality_score INTEGER;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS quality_issues TEXT[];
ALTER TABLE posts ADD COLUMN IF NOT EXISTS tagline TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS key_takeaways TEXT[];
ALTER TABLE posts ADD COLUMN IF NOT EXISTS practical_tips TEXT[];
ALTER TABLE posts ADD COLUMN IF NOT EXISTS common_mistakes TEXT[];

-- Index for AI-generated posts
CREATE INDEX IF NOT EXISTS idx_posts_generated_by_ai ON posts(generated_by_ai);
CREATE INDEX IF NOT EXISTS idx_posts_generation_status ON posts(generation_status);

-- =====================================================
-- 3. RPC Functions
-- =====================================================

-- Check if today's AI-generated post exists
CREATE OR REPLACE FUNCTION has_todays_post()
RETURNS BOOLEAN AS $$
DECLARE
  post_exists BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM posts
    WHERE generated_by_ai = true
    AND DATE(published_at) = CURRENT_DATE
    AND generation_status IN ('published', 'ready')
  ) INTO post_exists;

  RETURN post_exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get next post topic to generate (intelligent selection)
CREATE OR REPLACE FUNCTION get_next_post_topic()
RETURNS TABLE(
  id UUID,
  name TEXT,
  slug TEXT,
  category TEXT,
  search_query TEXT,
  priority INTEGER,
  times_featured INTEGER,
  last_featured_date DATE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pt.id,
    pt.name,
    pt.slug,
    pt.category,
    pt.search_query,
    pt.priority,
    pt.times_featured,
    pt.last_featured_date
  FROM post_topics pt
  WHERE pt.is_active = true
  ORDER BY
    -- Priority 1: Topics never featured (NULL dates first)
    pt.last_featured_date IS NOT NULL,
    -- Priority 2: Higher priority topics
    pt.priority DESC,
    -- Priority 3: Least recently featured
    pt.last_featured_date ASC,
    -- Priority 4: Fewer times featured
    pt.times_featured ASC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 4. Row Level Security
-- =====================================================
ALTER TABLE post_topics ENABLE ROW LEVEL SECURITY;

-- Public read access for active topics
CREATE POLICY "Anyone can read active post topics"
ON post_topics FOR SELECT
USING (is_active = true);

-- Admin can manage topics (using existing auth pattern)
CREATE POLICY "Admins can manage post topics"
ON post_topics FOR ALL
USING (
  auth.uid() IN (
    SELECT user_id FROM profiles
    WHERE email IN ('tanner@thefiredev.com')
  )
);

-- Service role bypass for automation
CREATE POLICY "Service role can manage post topics"
ON post_topics FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- =====================================================
-- 5. Seed Initial Post Topics
-- =====================================================
INSERT INTO post_topics (name, slug, search_query, category, priority) VALUES
  ('How to validate your SaaS idea in 48 hours', 'validate-saas-idea-48-hours', 'how to validate SaaS startup idea quickly customer discovery', 'Startup', 10),
  ('AI tools every solo founder should use in 2025', 'ai-tools-solo-founders-2025', 'best AI tools for solo founders startups 2025', 'Tools', 10),
  ('From idea to MVP: A non-technical founder''s guide', 'idea-to-mvp-nontechnical-guide', 'how to build MVP without coding non-technical founder no-code', 'Tutorial', 9),
  ('Why most founders overcomplicate their tech stack', 'founders-overcomplicate-tech-stack', 'startup tech stack simplicity MVP development mistakes', 'Opinion', 8),
  ('The real cost of building a SaaS (breakdown)', 'real-cost-building-saas-breakdown', 'SaaS development costs breakdown infrastructure hosting', 'Business', 8),
  ('Automating your business with no-code + AI', 'automating-business-nocode-ai', 'no-code automation AI tools business processes Zapier Make', 'Tutorial', 7),
  ('Common mistakes when choosing your first framework', 'common-mistakes-choosing-framework', 'web framework selection mistakes React Next.js startup', 'Technical', 7),
  ('How to ship faster without burning out', 'ship-faster-without-burnout', 'developer productivity shipping fast avoiding burnout startup', 'Productivity', 6),
  ('Building in public: What actually works', 'building-in-public-what-works', 'build in public marketing strategy Twitter startup growth', 'Strategy', 6),
  ('When to hire vs when to automate', 'when-hire-vs-automate', 'hiring vs automation startup scaling AI tools efficiency', 'Business', 5)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- 6. Update timestamp trigger
-- =====================================================
CREATE OR REPLACE FUNCTION update_post_topics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_post_topics_updated_at ON post_topics;
CREATE TRIGGER update_post_topics_updated_at
  BEFORE UPDATE ON post_topics
  FOR EACH ROW
  EXECUTE FUNCTION update_post_topics_updated_at();
