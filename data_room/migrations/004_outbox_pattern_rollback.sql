-- Rollback: 004_outbox_pattern_schema
-- Description: Drops outbox_events table and indexes.

BEGIN;

DROP TABLE IF EXISTS outbox_events;

DROP TRIGGER IF EXISTS trg_update_outbox_timestamp ON outbox_events;
DROP FUNCTION IF EXISTS update_outbox_timestamp;

COMMIT;
