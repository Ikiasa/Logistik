# Implementation Plan - API Hardening

## Goal
Enhance the reliability and maintainability of the API by implementing **Idempotency** (to prevent duplicate operations during retries) and **Versioning** (to safely evolve the API without breaking clients).

## User Review Required
> [!NOTE]
> **Idempotency Store:** We will use **PostgreSQL** for the Idempotency Store to avoid adding a new dependency (like Redis). This ensures transactional integrity with the `orders` creation.

## Proposed Changes

### 1. Idempotency (Phase 1)
#### [NEW] [database/migrations/006_api_hardening_idempotency.sql](file:///d:/Project Code/Logistik/database/migrations/006_api_hardening_idempotency.sql)
-   Create `idempotency_keys` table:
    -   `key` (User provided header)
    -   `tenant_id` (RLS enforced)
    -   `status` ('STARTED', 'COMPLETED', 'FAILED')
    -   `response_code` (INT)
    -   `response_body` (JSONB)
    -   `recovery_point` (JSONB - Optional, for storing intermediate state if needed)

#### [NEW] [src/common/idempotency/idempotency.middleware.ts](file:///d:/Project Code/Logistik/src/common/idempotency/idempotency.middleware.ts) (or Interceptor)
-   **Intercept Request:**
    1.  Check `Idempotency-Key` header.
    2.  If missing -> 400 Bad Request (for POST/PATCH).
    3.  If present -> Lock Row in DB.
        -   If Locked ('STARTED' < 30s ago): Return 409/425 (Concurrency safety).
        -   If Completed: Return cached `response_body` & `response_code`.
        -   If New: Insert 'STARTED' and Proceed.
-   **Intercept Response:**
    1.  On Success: Update Row to 'COMPLETED' with body.
    2.  On Error: Update Row to 'FAILED' (or delete to allow retry).

### 2. Versioning & Deprecation (Phase 2)
#### [NEW] [src/common/interceptors/deprecation.interceptor.ts](file:///d:/Project Code/Logistik/src/common/interceptors/deprecation.interceptor.ts)
-   Global or Controller-bound interceptor.
-   Adds `Draft-Deprecation` or standard `Warning` headers to V1 endpoints.
-   Format: `Warning: 299 - "This endpoint is deprecated. Use /v2/orders instead."`

#### [MODIFY] [src/orders/orders.controller.v1.ts](file:///d:/Project Code/Logistik/src/orders/orders.controller.v1.ts)
-   Refactor V1 controller to use the Deprecation Interceptor.

## Verification Plan

### Automated Tests
1.  **Idempotency Test:**
    -   Send Request A (Key: X) -> Success (201).
    -   Send Request A (Key: X) again -> Cached Success (201 or 200).
    -   Send Request A (Key: X) concurrent -> 409 Conflict.
2.  **Versioning Test:**
    -   Call V1 -> Check Headers for Warning.

### Manual Verification
1.  Use `curl` to simulate network retries and verify no duplicate orders are created in the DB.
