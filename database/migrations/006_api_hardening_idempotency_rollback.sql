-- Rollback: 006_api_hardening_idempotency

BEGIN;

DROP TABLE IF EXISTS idempotency_keys;

COMMIT;
