-- Migration: 004_outbox_pattern_schema
-- Description: Implements Transactional Outbox Pattern for Reliable Event Publishing.
-- Author: Logistik Architect
-- Date: 2026-02-14

BEGIN;

-- 1. Create Outbox Table
-- Stores events that MUST be published to the Message Broker.
-- Inserted in the same transaction as the business state change.
CREATE TABLE IF NOT EXISTS outbox_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aggregate_type VARCHAR(50) NOT NULL, -- e.g. 'Order'
    aggregate_id UUID NOT NULL, -- e.g. Order ID
    event_type VARCHAR(100) NOT NULL, -- e.g. 'OrderCreated'
    payload JSONB NOT NULL, -- The Event Data (Fact)
    occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Processing State
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PUBLISHED', 'FAILED')),
    retry_count INT DEFAULT 0,
    next_attempt_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- For Exponential Backoff
    last_error TEXT,
    processed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() -- For auditing state changes
);

-- 2. Indexes for Performance
-- Critical for Worker Polling (SELECT ... WHERE status='PENDING' AND next_attempt_at <= NOW())
CREATE INDEX IF NOT EXISTS idx_outbox_poll ON outbox_events(status, next_attempt_at);

-- For Tracing / Debugging history of an Aggregate
CREATE INDEX IF NOT EXISTS idx_outbox_aggregate ON outbox_events(aggregate_type, aggregate_id);

-- 3. Maintenance / Housekeeping
-- A partial index to easily find FAILED events for alerting
CREATE INDEX IF NOT EXISTS idx_outbox_failed ON outbox_events(status) WHERE status = 'FAILED';

-- 4. Auto-update Trigger
CREATE OR REPLACE FUNCTION update_outbox_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_outbox_timestamp ON outbox_events;
CREATE TRIGGER trg_update_outbox_timestamp
BEFORE UPDATE ON outbox_events
FOR EACH ROW
EXECUTE FUNCTION update_outbox_timestamp();

COMMIT;
