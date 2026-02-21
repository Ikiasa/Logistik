-- Rollback: 007_valuation_cdc_audit

BEGIN;

DROP TRIGGER IF EXISTS trg_audit_orders ON orders;
DROP TRIGGER IF EXISTS trg_audit_order_adjustments ON order_adjustments;
DROP TRIGGER IF EXISTS trg_audit_idempotency_keys ON idempotency_keys;

DROP FUNCTION IF EXISTS fn_audit_trigger;
DROP TABLE IF EXISTS audit_logs;

COMMIT;
