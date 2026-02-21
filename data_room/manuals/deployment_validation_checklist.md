# Enterprise Deployment & Validation Checklist

This document serves as the final gate for deploying the Logistik platform to production and preparing for acquisition due diligence.

## 1. Environment Preparation
**Objective:** Ensure the infrastructure is secure and configured for the hardened application.

- [ ] **Environment Variables:** Verify the following are set in `production.env` or CI/CD secrets:
    - `NODE_ENV=production`
    - `DATABASE_URL=postgres://user:pass@host:5432/logistik_db?sslmode=require`
    - `REDIS_URL=redis://:pass@host:6379`
    - `RABBITMQ_URL=amqp://user:pass@host:5672`
    - `JWT_SECRET` (High entropy, >32 chars)
    - `SSO_ISSUER_URL` (If integrating real IdP)
- [ ] **Infrastructure Reachability:**
    - `cntrl+z` -> `nc -zv <db-host> 5432` (Verify DB connection)
    - `nc -zv <redis-host> 6379` (Verify Redis connection)
- [ ] **Runtime Dependencies:**
    - Ensure Node.js v18+ is installed.
    - Ensure `pg_dump` and `psql` client tools are available for DR scripts.

## 2. Database Migration & Backfill
**Objective:** Apply all hardening schemas and ensure data integrity.

> **Critical:** Run these in order. Failure at any step requires immediate rollback investigation.

- [ ] **Address Normalization:**
    ```bash
    psql "$DATABASE_URL" -f database/migrations/001_address_normalization_schema.sql
    ```
- [ ] **Financial Integrity (Ledger):**
    ```bash
    psql "$DATABASE_URL" -f database/migrations/003_financial_integrity_schema.sql
    ```
- [ ] **Enterprise Hardening (RLS & Tenant ID):**
    ```bash
    psql "$DATABASE_URL" -f database/migrations/005_enterprise_hardening_schema.sql
    ```
    - *Validation:* `SELECT COUNT(*) FROM orders WHERE tenant_id IS NULL;` should return **0**.
- [ ] **API Hardening (Idempotency):**
    ```bash
    psql "$DATABASE_URL" -f database/migrations/006_api_hardening_idempotency.sql
    ```
- [ ] **Valuation Enhancements (CDC & Audit):**
    ```bash
    psql "$DATABASE_URL" -f database/migrations/007_valuation_cdc_audit.sql
    ```

## 3. Operational Verification (Smoke Test)
**Objective:** Confirm core functionality and hardening measures in the production environment.

### Security & Isolation
- [ ] **Tenant Isolation Check:**
    - Log in as Tenant A. Create Order A1.
    - Log in as Tenant B. Query Order A1.
    - **Expected:** Order A1 is **NOT** found (RLS enforced).
- [ ] **Idempotency Check:**
    - Send `POST /v2/orders` with `Idempotency-Key: test-key-1`. -> **201 Created**.
    - Send exact same request again. -> **200/201 (Cached Response)**.
    - **Validation:** `SELECT COUNT(*) FROM orders WHERE ...` should show only **1** record.

### Business Logic
- [ ] **Delivery Workflow:**
    - Create Order -> Assign Route -> Mark Delivered.
    - **Validation:** Check `order_events` or `outbox_events` for corresponding state changes.
- [ ] **Financial Integrity:**
    - Attempt to update `total_amount` on a `CONFIRMED` order.
    - **Expected:** Database Error (Trigger Violation: `protect_financial_integrity`).

### Disaster Recovery (Drill)
- [ ] **Backup & Restore:**
    1. Run `./scripts/dr_backup.sh ./tmp_backup`.
    2. (Optional/Staging) Drop Database.
    3. Run `./scripts/dr_restore.sh ./tmp_backup/logistik_backup_....sql`.
    4. Verify application/DB connectivity.

## 4. Acquisition / Inspection Readiness
**Objective:** Prepare artifacts for technical due diligence.

- [ ] **Architecture Documentation:**
    - Export `docs/architecture/` folder.
    - Include `docs/implementation_plans/`.
- [ ] **Code Quality:**
    - Run `npm run lint`. Ensure 0 errors.
    - Run `npm run lint:boundaries` (Madge). Ensure no circular dependencies.
- [ ] **Test Coverage:**
    - Run `npm test`. Ensure all Unit/Integration tests pass.
- [ ] **Walkthrough Artifact:**
    - Review `walkthrough.md` to ensure it covers all phases (Module Boundaries, RLS, API Hardening, Valuation).

## 5. Optional Enhancements (Post-Deployment)
- [ ] **SSO:** Configure real `SamlStrategy` or `OidcStrategy` replacing `MockSSOStrategy`.
- [ ] **Monitoring:** Set up alerts for:
    - RLS Policy Violations (Log patterns).
    - Idempotency Conflicts (409 rates).
    - Dead Letter Queue growth (RabbitMQ).
