-- =====================================================
-- Posts Table Migration - Add missing columns and policies
-- =====================================================

-- Add author_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'posts' AND column_name = 'author_id') THEN
    ALTER TABLE posts ADD COLUMN author_id UUID REFERENCES profiles(user_id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add other potentially missing columns
ALTER TABLE posts ADD COLUMN IF NOT EXISTS excerpt TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS content_text TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMPTZ;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS meta_description TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS featured_image_url TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS required_tier TEXT;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);

-- RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (idempotent)
DROP POLICY IF EXISTS "Anyone can read published posts" ON posts;
DROP POLICY IF EXISTS "Service role can manage posts" ON posts;

-- Recreate policies
CREATE POLICY "Anyone can read published posts"
ON posts FOR SELECT
USING (is_published = true);

CREATE POLICY "Service role can manage posts"
ON posts FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Update trigger
CREATE OR REPLACE FUNCTION update_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_posts_updated_at();
