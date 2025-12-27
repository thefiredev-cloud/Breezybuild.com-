-- =====================================================
-- Webhook Idempotency Schema
-- Prevents duplicate processing of Stripe webhooks
-- =====================================================

-- =====================================================
-- 1. Create webhook_events table for idempotency
-- =====================================================
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT UNIQUE NOT NULL,  -- Stripe event ID (evt_xxx)
  event_type TEXT NOT NULL,       -- e.g., 'checkout.session.completed'
  processed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  payload JSONB,                  -- Optional: store event payload for debugging
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for fast lookups by event_id
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_id ON webhook_events(event_id);

-- Index for cleanup queries (events older than X days)
CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at ON webhook_events(created_at);

-- =====================================================
-- 2. RLS Policies (service role only)
-- =====================================================
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- Only service role can manage webhook events
CREATE POLICY "Service role can manage webhook events"
ON webhook_events FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- =====================================================
-- 3. Cleanup function (optional - run periodically)
-- =====================================================
CREATE OR REPLACE FUNCTION cleanup_old_webhook_events(days_to_keep INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM webhook_events
  WHERE created_at < NOW() - (days_to_keep || ' days')::INTERVAL;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 4. Check if event was processed (RPC function)
-- =====================================================
CREATE OR REPLACE FUNCTION is_webhook_event_processed(stripe_event_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM webhook_events WHERE event_id = stripe_event_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
