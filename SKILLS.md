# BreezyBuild Agent Skills

Agent capabilities and specializations for BreezyBuild.com development.

---

## content-pipeline

**Purpose**: Daily research automation and content generation

**Tools**:
- `mcp__supabase__execute_sql` - Query pipeline_runs, daily_research tables
- `mcp__supabase__get_logs` - Check edge function logs
- Supabase Edge Functions - Trigger daily-research function

**Tasks**:
- Debug failed pipeline runs
- Trigger manual content generation
- Check cron job status (`SELECT * FROM cron.job_run_details`)
- Monitor Perplexity API usage and responses
- Verify research topic rotation

**Key Tables**:
- `daily_research` - Generated content storage
- `research_topics` - Topic queue and rotation
- `pipeline_runs` - Execution logs
- `cron.job_run_details` - Scheduler history

---

## database-ops

**Purpose**: Schema management and data operations

**Tools**:
- `mcp__supabase__execute_sql` - Run queries
- `mcp__supabase__apply_migration` - Schema changes
- `mcp__supabase__list_tables` - Table inventory
- `mcp__supabase__list_extensions` - Extension management

**Tasks**:
- Create and modify tables
- Manage RLS policies
- Add indexes for performance
- Enable extensions (pg_cron, pg_net, vector)
- Debug query performance
- Backup and restore data

**Common Queries**:
```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'table_name';

-- Check indexes
SELECT * FROM pg_indexes WHERE tablename = 'table_name';

-- Enable extension
CREATE EXTENSION IF NOT EXISTS extension_name;
```

---

## stripe-billing

**Purpose**: Payments, subscriptions, and billing

**Tools**:
- `mcp__stripe__list_products` - View products
- `mcp__stripe__list_prices` - View pricing
- `mcp__stripe__list_customers` - Customer management
- `mcp__stripe__list_subscriptions` - Subscription status
- `mcp__stripe__create_payment_link` - Generate checkout URLs

**Tasks**:
- Create products and prices
- Manage customer subscriptions
- Generate payment links
- Handle subscription upgrades/downgrades
- Debug webhook issues
- Create coupons and discounts

**Key IDs** (BreezyBuild):
- Starter: `price_1SbvAa9LqIc44cczpf32LN9H`
- Pro: `price_1SbvB69LqIc44cczguXARdC6`
- Enterprise: `price_1SbvCO9LqIc44cczhZYfnYLZ`

---

## deployment

**Purpose**: Build, deploy, and environment management

**Tools**:
- `mcp__netlify__netlify-deploy-services-reader` - Check deploy status
- `mcp__netlify__netlify-deploy-services-updater` - Trigger deploys
- `mcp__netlify__netlify-project-services-updater` - Manage env vars

**Tasks**:
- Check deployment status
- View function logs
- Manage environment variables
- Debug build failures
- Configure scheduled functions
- Manage domains and SSL

**Key Info** (BreezyBuild):
- Site ID: `aa73c841-0458-4880-9519-7a8c86635488`
- URL: https://breezybuild.com
- Functions: daily-content-pipeline, generate-tool-content, retry-failed-content

---

## frontend-dev

**Purpose**: Next.js/React UI development

**Tools**:
- `Read` - View component code
- `Write` / `Edit` - Modify files
- `Glob` - Find files by pattern
- `Grep` - Search code content
- `Bash(npm:*)` - Run npm scripts

**Tasks**:
- Create React components
- Implement pages and layouts
- Add client-side interactivity
- Style with Tailwind CSS
- Manage state and hooks
- Optimize performance

**Project Structure**:
```
app/
├── (dashboard)/     # Authenticated pages
├── (marketing)/     # Public pages
├── api/             # API routes
└── components/      # Shared components
```

---

## api-dev

**Purpose**: Backend endpoints and serverless functions

**Tools**:
- Supabase Edge Functions (Deno)
- Netlify Functions (Node.js)
- Next.js API routes

**Tasks**:
- Create REST API endpoints
- Implement webhook handlers
- Add authentication middleware
- Connect to external APIs
- Handle file uploads
- Manage CORS and security

**Function Locations**:
- Edge Functions: `supabase/functions/`
- Netlify Functions: `netlify/functions/`
- API Routes: `app/api/`

---

## Quick Reference

### Check Daily Pipeline Status
```sql
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 5;
SELECT * FROM daily_research ORDER BY research_date DESC LIMIT 5;
```

### Trigger Manual Content Generation
```bash
curl -X POST "https://rubjoqohwwkswfrqpqfv.supabase.co/functions/v1/daily-research" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json"
```

### Check Netlify Deploy Status
Use `mcp__netlify__netlify-deploy-services-reader` with site ID.

### List Stripe Subscriptions
Use `mcp__stripe__list_subscriptions` with status filter.

---

## Troubleshooting

| Issue | Agent | First Check |
|-------|-------|-------------|
| No daily content | content-pipeline | `cron.job_run_details` |
| Payment failed | stripe-billing | `list_payment_intents` |
| Deploy failed | deployment | Netlify function logs |
| Page not loading | frontend-dev | Browser console |
| API 500 error | api-dev | Edge function logs |
| DB query slow | database-ops | EXPLAIN ANALYZE |
