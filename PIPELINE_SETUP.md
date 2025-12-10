# Content Pipeline Setup Checklist

Quick setup guide for the BreezyBuild.com daily content automation pipeline.

## Prerequisites

- [x] Netlify project connected to repository
- [x] Supabase project created (ID: rubjoqohwwkswfrqpqfv)
- [x] Environment variables configured in Netlify
- [x] Perplexity API account with credits

## Setup Steps

### 1. Apply Database Migration

```bash
# Option A: Using Supabase CLI (recommended)
cd "/Users/tanner-osterkamp/Breezybuild.com /Breezybuild.com /"
supabase db push

# Option B: Manual via Supabase Dashboard
# 1. Go to https://supabase.com/dashboard/project/rubjoqohwwkswfrqpqfv/sql
# 2. Open supabase/migrations/002_content_pipeline_schema.sql
# 3. Copy and paste the entire file
# 4. Click "Run"
```

### 2. Verify Database Functions

```sql
-- Test has_todays_research function
SELECT has_todays_research();
-- Should return: false (until content is generated)

-- Test get_next_research_topic function
SELECT * FROM get_next_research_topic();
-- Should return: null (no topics yet)
```

### 3. Add Research Topics

```sql
INSERT INTO research_topics (name, slug, search_query, category, priority) VALUES
    ('Supabase', 'supabase', 'Supabase database platform features pricing 2024', 'database', 10),
    ('Cursor AI', 'cursor-ai', 'Cursor AI coding assistant IDE features', 'ai_coding', 10),
    ('Vercel', 'vercel', 'Vercel deployment platform Next.js hosting', 'devops', 9),
    ('v0 by Vercel', 'v0-by-vercel', 'v0 AI UI component generator', 'ai_design', 9),
    ('Clerk Auth', 'clerk-auth', 'Clerk authentication platform features', 'devops', 8),
    ('Stripe', 'stripe', 'Stripe payments API integration', 'productivity', 10),
    ('Tailwind CSS', 'tailwind-css', 'Tailwind CSS utility-first framework', 'productivity', 7),
    ('Raspberry Pi 5', 'raspberry-pi-5', 'Raspberry Pi 5 hardware projects specs', 'hardware_robotics', 8),
    ('Arduino', 'arduino', 'Arduino microcontroller programming projects', 'hardware_robotics', 7),
    ('OpenAI API', 'openai-api', 'OpenAI GPT-4 API integration pricing', 'ai_general', 10),
    ('Anthropic Claude', 'anthropic-claude', 'Anthropic Claude AI API features', 'ai_general', 10),
    ('GitHub Copilot', 'github-copilot', 'GitHub Copilot AI code assistant', 'ai_coding', 9),
    ('Figma', 'figma', 'Figma design tool collaboration features', 'ai_design', 8),
    ('Notion', 'notion', 'Notion workspace productivity platform', 'productivity', 8),
    ('Linear', 'linear', 'Linear issue tracking project management', 'productivity', 7)
ON CONFLICT (slug) DO NOTHING;
```

### 4. Verify Topics Added

```sql
-- Check all active topics
SELECT name, slug, priority, category, is_active
FROM research_topics
WHERE is_active = TRUE
ORDER BY priority DESC;

-- Test topic selection
SELECT * FROM get_next_research_topic();
-- Should return: highest priority topic that was never featured
```

### 5. Deploy to Netlify

```bash
# Make sure you're in the project directory
cd "/Users/tanner-osterkamp/Breezybuild.com /Breezybuild.com /"

# Stage all changes
git add netlify/functions/
git add supabase/migrations/002_content_pipeline_schema.sql
git add netlify.toml
git add PIPELINE_DOCUMENTATION.md
git add PIPELINE_SETUP.md

# Commit
git commit -m "Add daily content automation pipeline

- Add 3 Netlify scheduled functions
- Add database schema migration
- Add pipeline documentation"

# Push to trigger deployment
git push origin main
```

### 6. Verify Deployment

1. Go to Netlify dashboard: https://app.netlify.com
2. Navigate to your site
3. Click "Functions" tab
4. Verify these functions appear:
   - `daily-content-pipeline` (scheduled)
   - `generate-tool-content` (background)
   - `retry-failed-content` (scheduled)

### 7. Check Environment Variables

In Netlify dashboard, go to Site Settings > Environment Variables and verify:

```
PERPLEXITY_API_KEY=sk-...
PIPELINE_SECRET_KEY=your_random_secret_key
NEXT_PUBLIC_SUPABASE_URL=https://rubjoqohwwkswfrqpqfv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### 8. Test Functions Manually

```bash
# Test content generation (replace with your values)
curl -X POST https://your-site.netlify.app/.netlify/functions/generate-tool-content \
  -H "Content-Type: application/json" \
  -H "X-Pipeline-Secret: your_pipeline_secret_key" \
  -d '{"trigger": "manual_trigger"}'

# Expected response:
# {
#   "success": true,
#   "topic": "Cursor AI",
#   "tokensUsed": 2847,
#   "message": "Content generated successfully"
# }
```

### 9. Verify Content Generated

```sql
-- Check if content was created
SELECT
    title,
    tagline,
    research_date,
    pipeline_status,
    created_at
FROM daily_research
ORDER BY created_at DESC
LIMIT 1;

-- Check pipeline run logs
SELECT
    run_type,
    status,
    topic_processed,
    perplexity_tokens_used,
    error_message,
    started_at
FROM pipeline_runs
ORDER BY started_at DESC
LIMIT 5;
```

### 10. Enable Scheduled Functions

Scheduled functions should start automatically after deployment. To verify:

1. Go to Netlify Functions dashboard
2. Click on `daily-content-pipeline`
3. Check "Function logs" for scheduled runs
4. Next run should be at 6:00 AM UTC tomorrow

## Testing Schedule

- **daily-content-pipeline**: Runs daily at 6:00 AM UTC
- **retry-failed-content**: Runs every 4 hours (0, 4, 8, 12, 16, 20 UTC)

Convert to your timezone:
- 6:00 AM UTC = 10:00 PM PST (previous day)
- 6:00 AM UTC = 11:00 PM PDT (previous day)
- 6:00 AM UTC = 1:00 AM EST
- 6:00 AM UTC = 2:00 AM EDT

## Monitoring Queries

```sql
-- Daily content generation status
SELECT
    research_date,
    title,
    pipeline_status,
    is_published
FROM daily_research
ORDER BY research_date DESC
LIMIT 7;

-- Pipeline health check (last 24 hours)
SELECT
    run_type,
    status,
    COUNT(*) as count
FROM pipeline_runs
WHERE started_at > NOW() - INTERVAL '24 hours'
GROUP BY run_type, status
ORDER BY run_type, status;

-- Perplexity API usage (last 30 days)
SELECT
    DATE(started_at) as date,
    SUM(perplexity_tokens_used) as total_tokens,
    COUNT(*) as api_calls
FROM pipeline_runs
WHERE perplexity_tokens_used IS NOT NULL
AND started_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(started_at)
ORDER BY date DESC;

-- Topic rotation fairness
SELECT
    name,
    times_featured,
    last_featured_date,
    priority,
    is_active
FROM research_topics
ORDER BY times_featured ASC, last_featured_date NULLS FIRST;
```

## Troubleshooting

### Function Not Found Error
- Clear Netlify build cache
- Redeploy: `netlify deploy --prod`
- Check Functions tab in Netlify dashboard

### Database Connection Error
- Verify environment variables in Netlify
- Test connection using Supabase SQL editor
- Check service role key has correct permissions

### Perplexity API Error
- Verify API key is valid
- Check account credits: https://www.perplexity.ai/settings/api
- Review rate limits (should be generous for sonar-pro)

### No Content Generated
- Check pipeline_runs for errors
- Verify research_topics has active topics
- Test get_next_research_topic() returns a topic
- Manually trigger function to see detailed error

## Success Criteria

- [ ] Migration applied successfully
- [ ] 10+ research topics added
- [ ] Functions deployed to Netlify
- [ ] Manual test generates content
- [ ] Content appears in daily_research table
- [ ] Pipeline run logged successfully
- [ ] Scheduled functions show in Netlify dashboard

## Next Steps

After successful setup:

1. Monitor first scheduled run (6 AM UTC tomorrow)
2. Check content quality and adjust prompts if needed
3. Add more research topics based on your audience
4. Set up monitoring alerts (optional)
5. Build frontend to display daily_research content
6. Add publishing workflow (manual review → set is_published=true)

## Support Resources

- **Netlify Functions**: https://docs.netlify.com/functions/overview/
- **Supabase**: https://supabase.com/docs
- **Perplexity API**: https://docs.perplexity.ai/
- **Cron Syntax**: https://crontab.guru/

---

**Project Location:** `/Users/tanner-osterkamp/Breezybuild.com /Breezybuild.com /`

**Supabase Project:** https://supabase.com/dashboard/project/rubjoqohwwkswfrqpqfv
