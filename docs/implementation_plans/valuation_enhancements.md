# Implementation Plan - Valuation Enhancements

## Goal
Implement critical enterprise features that increase the "valuation" of the software asset by ensuring Data Integrity (CDC/Audit), Business Continuity (DR), and Enterprise Security (SSO).

## User Review Required
> [!NOTE]
> **SSO Strategy:** Since we lack a live IdP (Okta/Auth0), we will implement a **Mock SSO Strategy** using `passport-custom`. This allows us to simulate an enterprise login flow and verify that external identities are correctly mapped to internal `tenant_id` and `user_id` contexts.

## Proposed Changes

### 1. CDC & Audit Logging (Phase 1)
**Goal:** Complete historical visibility of data changes for compliance.
#### [NEW] [database/migrations/007_valuation_cdc_audit.sql](file:///d:/Project Code/Logistik/database/migrations/007_valuation_cdc_audit.sql)
-   Create `audit_logs` table:
    -   `id` (BigSerial/UUID)
    -   `table_name`, `record_id`, `operation` (INSERT, UPDATE, DELETE)
    -   `old_values` (JSONB), `new_values` (JSONB)
    -   `changed_by` (UUID, from `app.current_user` session var if available)
    -   `tenant_id` (RLS enforced)
    -   Partitioned by `created_at` (Monthly).
-   Create Generic Trigger Function `fn_audit_trigger()`.
-   Apply Trigger to `orders`, `financial_ledger`, `idempotency_keys`.

### 2. Disaster Recovery (Phase 2)
**Goal:** Proven ability to recover from catastrophic failure.
#### [NEW] [scripts/dr_backup.sh](file:///d:/Project Code/Logistik/scripts/dr_backup.sh)
-   Shell script to perform `pg_dump` with proper flags (preserving RLS, excluding audit logs if needed for speed).
#### [NEW] [scripts/dr_restore.sh](file:///d:/Project Code/Logistik/scripts/dr_restore.sh)
-   Shell script to restore the DB to a clean state.
#### [NEW] [docs/manuals/disaster_recovery_playbook.md](file:///d:/Project Code/Logistik/docs/manuals/disaster_recovery_playbook.md)
-   Step-by-step generic guide for Incident Response and Recovery.

### 3. SSO Integration (Phase 3)
**Goal:** Support for Enterprise Identity Providers.
#### [NEW] [src/common/auth/sso.strategy.ts](file:///d:/Project Code/Logistik/src/common/auth/sso.strategy.ts)
-   Implement a Passport strategy that simulates receiving a JWT/SAML assertion.
-   Validate correctness of email domains mapping to Tenants.
-   **Output:** Returns a User object compatible with `TenantContext`.

#### [MODIFY] [src/common/context/tenant.middleware.ts](file:///d:/Project Code/Logistik/src/common/context/tenant.middleware.ts)
-   Update middleware to prefer `user.tenant_id` from the auth token if available, falling back to `x-tenant-id` header only for public/scoped calls.

## Verification Plan

### Automated Tests
1.  **CDC Test:** Perform Insert/Update on `orders` -> Verify row appears in `audit_logs` with correct JSON diff.
2.  **SSO Test:** Unit test the Strategy to ensure it correctly maps "alice@corp-a.com" -> Tenant A.

### Manual Verification
1.  **DR Drill:** Run Backup -> Drop DB -> Run Restore -> Verify App works.
