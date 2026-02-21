-- Migration: 000_base_schema
-- Description: Core tables for the Logistik ERP (Tenants, Orders, Items)
-- Date: 2026-02-16

BEGIN;

CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    subscription_tier VARCHAR(20) DEFAULT 'standard',
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- tenant_id will be added by migration 005
    external_order_id VARCHAR,
    customer_name VARCHAR,
    delivery_address TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- tenant_id will be added by migration 005
    order_id UUID NOT NULL REFERENCES orders(id),
    sku VARCHAR,
    quantity INT,
    description VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed System Tenant
INSERT INTO tenants (id, name, slug, subscription_tier)
VALUES ('00000000-0000-0000-0000-000000000000', 'System', 'system', 'enterprise')
ON CONFLICT (id) DO NOTHING;

COMMIT;
