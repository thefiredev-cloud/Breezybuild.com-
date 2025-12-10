# Daily Content Automation Pipeline

This documentation covers the Netlify scheduled functions that power BreezyBuild.com's daily tool research and content generation.

## Overview

The pipeline automatically generates daily tool research content using AI (Perplexity API) and stores it in Supabase. It runs on a scheduled basis and includes automatic retry logic for failures.

## Architecture

```
Daily (6 AM UTC)
└── daily-content-pipeline.mts
    ├── Checks if today's content exists
    ├── If not, triggers background generator
    └── Logs pipeline run

Background
└── generate-tool-content.mts
    ├── Gets next research topic
    ├── Calls Perplexity API
    ├── Parses structured JSON response
    ├── Saves to daily_research table
    └── Updates topic statistics

Every 4 Hours
└── retry-failed-content.mts
    ├── Finds failed runs (last 24h)
    ├── Retries up to 3 times
    └── Logs retry attempts
```

## Files Created

### Netlify Functions
- `/netlify/functions/daily-content-pipeline.mts` - Main scheduler (6 AM daily)
- `/netlify/functions/generate-tool-content.mts` - Background content generator
- `/netlify/functions/retry-failed-content.mts` - Failure recovery (every 4 hours)

### Database Migration
- `/supabase/migrations/002_content_pipeline_schema.sql` - Database schema

### Configuration
- `/netlify.toml` - Updated with function configurations

## Database Schema

### Tables

#### `research_topics`
Stores topics to be researched by the pipeline.

```sql
- id: UUID (primary key)
- name: TEXT (unique) - Display name
- slug: TEXT (unique) - URL-friendly identifier
- search_query: TEXT - Query for Perplexity API
- is_active: BOOLEAN - Enable/disable topic
- priority: INTEGER - Higher = researched sooner
- category: TEXT - Tool category
- last_featured_date: DATE - Last time featured
- times_featured: INTEGER - Total times featured
- created_at: TIMESTAMPTZ
```

#### `daily_research`
Stores generated research content with structured fields.

```sql
- id: UUID (primary key)
- topic_id: UUID (foreign key)
- research_date: DATE - When content was generated
- title: TEXT
- summary: TEXT
- content: TEXT
- tagline: TEXT - One-sentence description
- what_it_is: TEXT - Plain English explanation
- why_it_matters: TEXT - Why solo founders care
- use_cases: JSONB - Array of {title, description}
- quick_start_guide: JSONB - Array of {step, title, description}
- pro_tips: TEXT[] - Array of expert tips
- gotchas: TEXT[] - Array of common pitfalls
- score_learning_curve: INTEGER (1-5)
- score_ecosystem: INTEGER (1-5)
- score_maturity: INTEGER (1-5)
- score_cost_value: INTEGER (1-5)
- community_size: TEXT
- community_sentiment: TEXT
- notable_users: TEXT[]
- pricing_model: TEXT
- pricing_tiers: JSONB
- official_url: TEXT
- documentation_url: TEXT
- github_url: TEXT
- category: TEXT
- pipeline_status: TEXT (queued/researching/ready/published/failed)
- is_published: BOOLEAN
- is_featured: BOOLEAN
- raw_perplexity: JSONB
- created_at: TIMESTAMPTZ
```

#### `pipeline_runs`
Tracks pipeline execution for monitoring.

```sql
- id: UUID (primary key)
- run_type: TEXT (daily_scheduled/background_generation/retry_attempt/manual_trigger)
- status: TEXT (started/completed/failed/skipped)
- started_at: TIMESTAMPTZ
- completed_at: TIMESTAMPTZ
- topic_processed: TEXT
- content_generated: BOOLEAN
- error_type: TEXT
- error_message: TEXT
- perplexity_tokens_used: INTEGER
- created_at: TIMESTAMPTZ
```

### Database Functions

#### `has_todays_research()`
Returns BOOLEAN indicating if today's content exists.

```sql
SELECT has_todays_research(); -- Returns true/false
```

#### `get_next_research_topic()`
Returns the next topic to research based on priority and freshness.

```sql
SELECT * FROM get_next_research_topic(); -- Returns one topic
```

Algorithm:
1. Prioritize topics never featured
2. Then by priority (higher first)
3. Then by least recently featured
4. Then by times featured (fewer first)

## Setup Instructions

### 1. Apply Database Migration

Run the migration to create tables and functions:

```bash
# Using Supabase CLI
supabase db push

# Or manually in Supabase SQL Editor
# Copy contents of supabase/migrations/002_content_pipeline_schema.sql
```

### 2. Seed Research Topics

Add topics you want to research:

```sql
INSERT INTO research_topics (name, slug, search_query, category, priority) VALUES
    ('Supabase', 'supabase', 'Supabase database platform features pricing', 'database', 10),
    ('Cursor AI', 'cursor-ai', 'Cursor AI coding assistant IDE', 'ai_coding', 10),
    ('Vercel', 'vercel', 'Vercel deployment platform Next.js', 'devops', 8);
```

### 3. Environment Variables

Ensure these are set in Netlify:

```bash
# Already configured (as per your note)
PERPLEXITY_API_KEY=your_perplexity_api_key
PIPELINE_SECRET_KEY=your_random_secret_key
NEXT_PUBLIC_SUPABASE_URL=https://rubjoqohwwkswfrqpqfv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Deploy to Netlify

```bash
# Commit and push to trigger deploy
git add .
git commit -m "Add content automation pipeline"
git push
```

### 5. Verify Functions

Check Netlify dashboard:
- Go to Functions tab
- Verify three functions are deployed
- Check scheduled function logs

## Function Details

### 1. daily-content-pipeline.mts

**Schedule:** Daily at 6:00 AM UTC (cron: `0 6 * * *`)

**Purpose:** Main orchestrator that checks if content exists and triggers generation if needed.

**Flow:**
1. Check if today's content exists (`has_todays_research()`)
2. If exists, skip and log
3. If not exists, trigger `generate-tool-content` function
4. Log pipeline run to `pipeline_runs` table

**Response:**
```json
{
  "success": true,
  "message": "Content generation triggered successfully"
}
```

### 2. generate-tool-content.mts

**Trigger:** Invoked by `daily-content-pipeline` or `retry-failed-content`

**Security:** Requires `X-Pipeline-Secret` header matching `PIPELINE_SECRET_KEY`

**Purpose:** Generates content by calling Perplexity API and saving results.

**Flow:**
1. Verify secret key
2. Get next topic (`get_next_research_topic()`)
3. Call Perplexity API with structured prompt
4. Parse JSON response
5. Insert into `daily_research` table
6. Update `research_topics` statistics
7. Log to `pipeline_runs`

**Perplexity Configuration:**
- Model: `sonar-pro`
- Temperature: `0.1` (for factual accuracy)
- Max tokens: `4000`

**Response:**
```json
{
  "success": true,
  "topic": "Supabase",
  "tokensUsed": 2847,
  "message": "Content generated successfully"
}
```

### 3. retry-failed-content.mts

**Schedule:** Every 4 hours (cron: `0 */4 * * *`)

**Purpose:** Automatically retry failed content generation attempts.

**Flow:**
1. Check if today's content exists
2. If exists, skip
3. Query failed runs from last 24 hours
4. Filter runs with < 3 retry attempts
5. Retry most recent failed run
6. Log retry attempt

**Max Retries:** 3 attempts per failed run

**Response:**
```json
{
  "success": true,
  "message": "Successfully retried failed pipeline run",
  "retriedRun": {
    "id": "uuid",
    "originalError": "Error message",
    "retryCount": 2
  }
}
```

## Monitoring

### Check Pipeline Status

```sql
-- Recent pipeline runs
SELECT
    run_type,
    status,
    started_at,
    topic_processed,
    error_message
FROM pipeline_runs
ORDER BY started_at DESC
LIMIT 20;

-- Failed runs in last 24 hours
SELECT *
FROM pipeline_runs
WHERE status = 'failed'
AND started_at > NOW() - INTERVAL '24 hours'
ORDER BY started_at DESC;

-- Content generation statistics
SELECT
    DATE(created_at) as date,
    COUNT(*) as content_generated,
    SUM(CASE WHEN is_published THEN 1 ELSE 0 END) as published
FROM daily_research
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

### Token Usage

```sql
-- Perplexity API token usage
SELECT
    DATE(started_at) as date,
    SUM(perplexity_tokens_used) as total_tokens,
    AVG(perplexity_tokens_used) as avg_tokens_per_call
FROM pipeline_runs
WHERE perplexity_tokens_used IS NOT NULL
GROUP BY DATE(started_at)
ORDER BY date DESC;
```

### Topic Rotation

```sql
-- Most/least featured topics
SELECT
    name,
    times_featured,
    last_featured_date,
    priority
FROM research_topics
WHERE is_active = TRUE
ORDER BY times_featured DESC;
```

## Manual Testing

### Test Content Generation

```bash
# Trigger content generation manually
curl -X POST https://breezybuild.com/.netlify/functions/generate-tool-content \
  -H "Content-Type: application/json" \
  -H "X-Pipeline-Secret: your_secret_key" \
  -d '{"trigger": "manual_trigger"}'
```

### Test Daily Pipeline

```bash
# Trigger daily check manually
curl https://breezybuild.com/.netlify/functions/daily-content-pipeline
```

### Test Retry Logic

```bash
# Trigger retry check manually
curl https://breezybuild.com/.netlify/functions/retry-failed-content
```

## Troubleshooting

### Function Not Running

1. Check Netlify Functions dashboard for errors
2. Verify environment variables are set
3. Check function logs in Netlify dashboard
4. Verify scheduled functions are enabled

### Perplexity API Errors

1. Check API key is valid
2. Verify account has sufficient credits
3. Check rate limits (sonar-pro has generous limits)
4. Review error in `pipeline_runs` table

### Database Errors

1. Verify migration was applied successfully
2. Check RLS policies allow service role access
3. Verify database functions exist
4. Check connection from Netlify functions

### Content Not Generated

1. Check if topics exist in `research_topics`
2. Verify topics are `is_active = true`
3. Check for failed runs in `pipeline_runs`
4. Verify retry logic is running

## Cost Estimates

### Netlify Functions
- Scheduled functions: Free tier (100,000 invocations/month)
- Background function: Free tier (125,000 function hours/month)
- Expected usage: ~30 invocations/month (well within free tier)

### Perplexity API
- Model: sonar-pro
- Average tokens per request: ~3,000
- Monthly requests: 30
- Estimated monthly tokens: 90,000
- Cost: Check current Perplexity pricing

### Supabase
- Database operations: Minimal (within free tier)
- Storage: <1 MB per day (well within free tier)

## Future Enhancements

1. **Email Notifications:** Send alerts on pipeline failures
2. **Content Preview:** Admin dashboard to preview before publishing
3. **A/B Testing:** Test different Perplexity prompts
4. **Analytics:** Track which tools generate most engagement
5. **RSS Feed:** Auto-generate RSS from daily_research
6. **Manual Override:** Admin UI to trigger specific topics
7. **Quality Checks:** Automated content validation
8. **Image Generation:** Add AI-generated tool screenshots

## Support

For issues or questions:
1. Check pipeline_runs table for errors
2. Review Netlify function logs
3. Test functions manually with curl
4. Verify database schema is up to date
