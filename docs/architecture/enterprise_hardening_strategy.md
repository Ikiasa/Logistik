# Enterprise Hardening Architecture: Module Boundaries & Tenant Isolation

## 1. Module Boundaries (The "Modular Monolith")

### Scope & Structure
The system will enforce a **Strict Modular Monolith** architecture. Code is organized into self-contained modules (`orders`, `transport`, `billing`) that encapsulate their own domain logic, persistence, and events.

-   **Modules:** High-level directories (`src/orders`, `src/transport`).
-   **Shared Kernel:** A dedicated generic module (`src/common`) for cross-cutting concerns (Money, RLS, Outbox, Logging).
-   **Public API:** Each module exports a specific `index.ts` (API Barrel).

### Rules of Engagement
1.  **Strict Layering:**
    -   **Modules** (e.g., `orders`) can import from `common`.
    -   **Modules** can import from other **Modules' Public API** (`../transport/index`) ONLY.
    -   **Common** (Shared Kernel) CANNOT import from Modules (No Upward Dependencies).
2.  **No Deep Imports:** `import { x } from '../orders/internal/service'` is **BANNED**.
3.  **Database Autonomy:** Modules own their schema. **Cross-module JOINS are FORBIDDEN.** Data access across boundaries must occur via Service calls or Eventual Consistency.
4.  **Circular Dependencies:** Enforced via `madge` in CI pipeline.

### Enforcement
-   **Compile-Time:** `eslint-plugin-import` with `no-restricted-paths`.
-   **Runtime:** NestJS `Module` scoping.

---

## 2. Tenant Isolation Model (RLS)

### Strategy: Defense in Depth
Security is not a feature; it is a constraint. We assume the Application Layer *will* contain bugs, so the Database Layer must provide the final safety net.

-   **Ubiquity:** `tenant_id UUID NOT NULL` is added to **ALL** business tables:
    -   `orders`, `order_items`, `addresses`
    -   **Critical:** `order_adjustments` (Ledger), `outbox_events` (Events)
-   **Performance:** Primary Keys become composite or Indexes include `tenant_id` (e.g., `idx_orders_tenant_id` or `(tenant_id, id)`).

### Database Enforcement Mechanism
1.  **Row-Level Security (RLS) - Hard Enforcement:**
    ```sql
    ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
    -- FORCE RLS prevents table owners/maintainers from bypassing policies accidentally
    ALTER TABLE orders FORCE ROW LEVEL SECURITY;
    
    CREATE POLICY tenant_isolation ON orders 
    USING (tenant_id = current_setting('app.current_tenant')::uuid);
    ```
2.  **Function Safety:** `SECURITY DEFINER` functions are **BANNED** unless strictly Audited, as they bypass RLS.
3.  **Connection Hygiene:**
    -   App connects as `app_user` (Least Privilege).
    -   **Session Context:** Middleware executes `SET LOCAL app.current_tenant = ?` at start of transaction.

### Worker Tenant Safety
The Outbox Worker must process events in the correct Tenant Context to avoid data leakage during side-effects.
-   **Strategy:** "Context Switching" per Batch/Event.
    1.  Worker fetches batch (System Level).
    2.  For each event:
        -   Extract `tenant_id` from Payload.
        -   Run processing logic wrapped in `TenantContext.run(tenant_id, () => { ... })`.
        -   This ensures any DB calls inside the handler result in `SET LOCAL app.current_tenant` being set effectively.

---

## 3. Migration Strategy for Tenant ID (Zero Downtime)

1.  **Add Column (Nullable):** `ALTER TABLE orders ADD COLUMN tenant_id UUID NULL;`
2.  **Backfill:** Update existing rows with a `DEFAULT_TENANT_UUID` or mapped value.
3.  **Enforce:** `ALTER TABLE orders ALTER COLUMN tenant_id SET NOT NULL;`
4.  **Enable RLS:** Activate policies only after data is consistent.

## 4. Testing Strategy: Adversarial Verification

We will prove RLS works by trying to break it.

1.  **The "Cross-Tenant Read" Test:**
    -   Create `Tenant A` and `Tenant B`.
    -   Insert Order `O1` for `Tenant A`.
    -   **Act:** Executive strict query `SELECT * FROM orders WHERE id = 'O1'` using `Tenant B`'s context.
    -   **Assert:** Returns `0` rows (Not Error, just Invisibility).
2.  **The "Raw SQL Bypass" Test:**
    -   Attempt manual injection via `EntityManager.query('SELECT * FROM orders')` with `Tenant B` context.
    -   **Assert:** Only Tenant B rows returned.
3.  **The "Missing WHERE" Test:**
    -   Service calls `repo.find()` without `where: { tenantId }`.
    -   **Assert:** DB automatically limits result set.

---

## 5. Implementation Roadmap (Task 11)

### Phase 1: Linting & Boundaries
-   Configure ESLint `no-restricted-paths`.
-   Setup `madge` for circular dependency check.

### Phase 2: RLS Schema Migration
-   Add `tenant_id` to `outbox_events`, `order_adjustments`, `addresses` (ensure generic tables handled).
-   Create RLS Policies.
-   Create `app_user` role.

### Phase 3: Runtime Context
-   Implement `TenantContextService` (AsyncLocalStorage).
-   Inject `SET LOCAL` into Database Connection flow.

This architecture ensures that architectural erosion (spaghetti code) and data leaks (cross-tenant access) are prevented systemically, not just by convention.
