# Implementation Plan - Phase 3: Runtime Context & RLS Integration

## Goal
Implement the Runtime Context infrastructure required to enforce Tenant Isolation via Row-Level Security (RLS). This involves identifying the Tenant from the request and securely propagating it to the Database Session.

## User Review Required
> [!IMPORTANT]
> **Dependency Restoration:** The project seems to be missing `dependencies` in `package.json`. I will restore standard NestJS/PG dependencies (`@nestjs/common`, `pg`, `uuid`, `rxjs`, etc.) to ensure the application runs.

> [!WARNING]
> **Code Changes:** `OrdersServiceV2` (and future services) MUST be modified to execute `SET LOCAL app.current_tenant` within their transaction blocks. RLS is "Fail Closed", so existing queries *will fail* without this change.

## Proposed Changes

### 1. Project Configuration
#### [MODIFY] [package.json](file:///d:/Project Code/Logistik/package.json)
-   Add missing runtime dependencies: `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`, `pg`, `reflect-metadata`, `rxjs`, `uuid`.

### 2. Infrastructure (Shared Kernel)
#### [NEW] [src/common/context/tenant.context.ts](file:///d:/Project Code/Logistik/src/common/context/tenant.context.ts)
-   Implement `AsyncLocalStorage` to store `tenantId` (and potentially `userId`) for the duration of the request.
-   Export `TenantContext` class with `run`, `getTenantId` methods.

#### [NEW] [src/common/context/tenant.middleware.ts](file:///d:/Project Code/Logistik/src/common/context/tenant.middleware.ts)
-   NestJS Middleware.
-   Extracts `x-tenant-id` header (or JWT claim).
-   Validates UUID format.
-   Wraps request processing in `TenantContext.run()`.

### 3. Service Layer Integration
#### [MODIFY] [src/orders/orders.service.v2.ts](file:///d:/Project Code/Logistik/src/orders/orders.service.v2.ts)
-   Inject `TenantContext` (or manual header, but Context is cleaner).
-   **Critical:** Inside `create_v2`, after `BEGIN`, execute:
    ```typescript
    await client.query(`SET LOCAL app.current_tenant = '${tenantId}'`);
    ```
-   This ensures RLS policies pass.

## Verification Plan

### Automated Tests
1.  **Unit Test (`tenant.context.spec.ts`):** Verify `AsyncLocalStorage` propagation.
2.  **Integration Test (`orders.service.v2.spec.ts` or new `rls.spec.ts`):**
    -   Mock DB Client.
    -   Verify `SET LOCAL` is called with correct Tenant ID.
    -   Verify standard queries succeed.

### Manual Verification
1.  **Adversarial Check:**
    -   Try running `create_v2` *without* the `SET LOCAL` line (should fail/abort).
    -   Try with correct ID (success).
