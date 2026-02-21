-- Migration: 002_address_hardening
-- Description: Enforces DB-level Uniqueness on Master Addresses and Immutability on Order Snapshots.
-- Author: Logistik Architect
-- Date: 2026-02-14

-- 1. Enforce Master Address Uniqueness (Concurrency Safety)
-- Prevents duplicate master records for the same hash + tenant within a partition.
-- Note: Check constraint on 'validation_status' was added in 001.

ALTER TABLE addresses
    ADD CONSTRAINT uq_addresses_hash_tenant_country 
    UNIQUE (hash, tenant_id, country_code);

-- 2. Enforce Snapshot Immutability (Legal Integrity)
-- Prevent updates to 'delivery_address_snapshot' once Order is beyond 'PENDING' stage.

CREATE OR REPLACE FUNCTION protect_order_snapshot()
RETURNS TRIGGER AS $$
BEGIN
    -- Allow updates only if Status is PENDING or DRAFT
    IF OLD.status NOT IN ('PENDING', 'DRAFT') THEN
        IF OLD.delivery_address_snapshot IS DISTINCT FROM NEW.delivery_address_snapshot THEN
            RAISE EXCEPTION 'Legal Integrity Violation: Cannot modify delivery_address_snapshot for Order % in status %', OLD.id, OLD.status;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_protect_order_snapshot
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION protect_order_snapshot();

-- 3. Add Deprecation Headers Support (Optional DB metadata or just App Layer)
-- (No DB change needed for headers, strictly App Layer)
