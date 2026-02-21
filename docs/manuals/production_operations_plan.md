# Logistik Platform - Production Deployment & Operations Plan

**Version:** 1.0
**Status:** Enterprise Ready
**Audience:** DevOps, System Administrators, Compliance Officers

This document outlines the end-to-end strategy for deploying, verifying, and operating the hardened Logistik platform.

---

## 1. Production Deployment

### 1.1. Prerequisites
- [ ] **Infrastructure:** PostgreSQL 15+, Redis 7+, RabbitMQ 3.12+ provisioning confirmed.
- [ ] **Security:** SSL/TLS certificates installed for LB/API Gateway.
- [ ] **Secrets:** `production.env` populated (See `deployment_validation_checklist.md` for required keys).

### 1.2. Database Migration Sequence
*Critical: Execute in exact order.*

1.  **Address Normalization:**
    ```bash
    psql "$DATABASE_URL" -f database/migrations/001_address_normalization_schema.sql
    ```
2.  **Financial Integrity (Ledger):**
    ```bash
    psql "$DATABASE_URL" -f database/migrations/003_financial_integrity_schema.sql
    ```
3.  **Enterprise Hardening (RLS):**
    ```bash
    psql "$DATABASE_URL" -f database/migrations/005_enterprise_hardening_schema.sql
    ```
4.  **API Hardening (Idempotency):**
    ```bash
    psql "$DATABASE_URL" -f database/migrations/006_api_hardening_idempotency.sql
    ```
5.  **Valuation (Audit/CDC):**
    ```bash
    psql "$DATABASE_URL" -f database/migrations/007_valuation_cdc_audit.sql
    ```

### 1.3. Application Rollout
- [ ] **Backend Services:** Deploy `logistik-api` (Scale: 2+ replicas).
- [ ] **Workers:** Deploy `logistik-worker` (Scale: Based on queue depth).
- [ ] **Mobile Apps:** Push Driver App v2.0 to App Store/Play Store (Internal/TestFlight first).
- [ ] **Health Check:** `curl https://api.logistik.com/health` -> `{"status":"ok"}`.

---

## 2. Operational Verification (Smoke Tests)

### 2.1. Critical Journeys
- [ ] **Order Lifecycle:** Admin creates Order -> Driver accepts -> Route optimized -> Delivered.
- [ ] **Financials:** Verify Ledger updates in `order_adjustments` upon delivery.
- [ ] **Tenant Isolation:** Ensure User A (Tenant X) cannot query Order B (Tenant Y).

### 2.2. Reliability Checks
- [ ] **Idempotency:** Replay a `POST /orders` request with the same `Idempotency-Key`. Confirm single DB entry.
- [ ] **Disaster Recovery Drill:**
    1.  Backup: `./scripts/dr_backup.sh ./tmp`
    2.  Restore (Staging): `./scripts/dr_restore.sh ./tmp/backup.sql`
    3.  Verify: Row counts match.

---

## 3. Monitoring & Observability

### 3.1. Key Metrics
| Metric | Threshold | Alert Severity |
| :--- | :--- | :--- |
| **API Error Rate (5xx)** | > 1% | High |
| **API Latency (p95)** | > 500ms | Medium |
| **DB Transaction Failures** | > 0.1% | High |
| **Dead Letter Queue** | > 10 msgs | High |
| **RLS Violations** | > 0 | **Critical** (Security Breach) |

### 3.2. Logs & Auditing
-   **Application Logs:** Stream to ELK/Datadog. Filter for `TenantMiddleware` errors.
-   **Audit Logs:** Monitor `audit_logs` table growth (Partition monthly).

---

## 4. Acquisition & Inspection Readiness

### 4.1. Documentation Package
Prepare a data room containing:
-   `walkthrough.md` (System capabilities).
-   `docs/architecture/` (Diagrams & Decisions).
-   `docs/manuals/disaster_recovery_playbook.md`.
-   `docs/manuals/deployment_validation_checklist.md`.

### 4.2. Valuation Reports
Generate these reports for due diligence:
-   **Financial Integrity:** "0 Discrepancies in Immutable Ledger".
-   **Security Posture:** "100% RLS Coverage on PII/Financial Tables".
-   **Operational Uptime:** "99.9% Success Rate regarding Idempotency".

---

## 5. Future Roadmap

### 5.1. Immediate Post-Live
-   [ ] **SSO:** Swap `MockSSOStrategy` for Auth0/Okta integration.
-   [ ] **Analytics:** Deploy Metabase/Superset on Read Replica.

### 5.2. Maintenance Schedule
-   **Daily:** Automated DB Backups (Retain 30 days).
-   **Weekly:** Review Low-Priority Alerts.
-   **Quarterly:** Full Disaster Recovery Simulation.
