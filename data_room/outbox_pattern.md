# Implementation Plan - Transactional Outbox Pattern

## Goal
To guarantee **Reliable Event Delivery** and **At-Least-Once** processing semantics by decoupling the database transaction from the message broker publishing. This ensures that no event is lost if the broker is unreachable, and no event is published if the business transaction fails.

## 1. Core Architecture

### 1.1. Transaction Coupling
-   **Principle:** The "Outbox Insert" MUST occur within the **same Application Transaction (`BEGIN...COMMIT`)** as the Business State change.
-   **Atomicity:** If the Order creation fails, the Outbox event is rolled back. If it succeeds, the event is guaranteed to exist.

### 1.2. Dispatch Strategy: Batched Polling with `SKIP LOCKED`
-   **Decision:** Active Polling Worker using `SELECT ... FOR UPDATE SKIP LOCKED`.
-   **Justification:** 
    -   **Simplicity:** No external infrastructure (Kafka Connect/Debezium) required initially.
    -   **Concurrency:** `SKIP LOCKED` allows multiple reliable-publisher instances to run in parallel without race conditions or double-processing.
    -   **Reliability:** Native Postgres feature, extremely robust.
    -   **Latency:** Configurable polling interval (e.g., 200ms) provides near real-time performance sufficient for logistics.

## 2. Schema Design

### 2.1. `outbox_events` Table
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | Unique Event ID (Consumer Idempotency Key) |
| `aggregate_type` | `VARCHAR(50)` | `NOT NULL` | Aggregate Root Name (e.g., 'Order') |
| `aggregate_id` | `UUID` | `NOT NULL` | Aggregate Root ID (e.g., Order UUID) |
| `event_type` | `VARCHAR(100)` | `NOT NULL` | Event Name |
| `payload` | `JSONB` | `NOT NULL` | Full Event Data |
| `occurred_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Creation timestamp |
| `status` | `VARCHAR(20)` | `DEFAULT 'PENDING'` | Enum: `PENDING`, `PUBLISHED`, `FAILED` |
| `retry_count` | `INT` | `DEFAULT 0` | Retry tracker |
| `next_attempt_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Execution scheduler (Backoff) |
| `last_error` | `TEXT` | `NULL` | Debug logs |
| `processed_at` | `TIMESTAMPTZ` | `NULL` | Completion timestamp |

### 2.2. Indexing Strategy
-   `idx_outbox_poll`: `(status, next_attempt_at) ASC` (Optimized for `WHERE status='PENDING' AND next_attempt_at <= NOW()`)
-   `idx_outbox_aggregate`: `(aggregate_type, aggregate_id)` (Tracing history)
-   `pk_outbox_id`: `id` (Implicit unique constraint)

## 3. Worker Implementation

### 3.1. Dispatch Loop (At-Least-Once)
1.  **Poll:** 
    ```sql
    SELECT id, payload FROM outbox_events 
    WHERE status = 'PENDING' AND next_attempt_at <= NOW()
    ORDER BY next_attempt_at ASC 
    LIMIT 50 
    FOR UPDATE SKIP LOCKED; 
    ```
2.  **Publish:** Send to Broker. **Message Body MUST include `id` as `messageId`**.
3.  **Commit:** 
    -   Success: `UPDATE ... SET status = 'PUBLISHED', processed_at = NOW()`
    -   Failure: `UPDATE ... SET status = 'PENDING', retry_count = retry_count + 1, next_attempt_at = NOW() + (interval '1 second' * power(2, retry_count))`

### 3.2. Worker Safety
-   **Crash Recovery:** If worker crashes after `SELECT` but before `UPDATE`, the Transaction aborts, lock releases. Event remains `PENDING` and is picked up immediately by next worker.
-   **Duplicate Risk:** If worker publishes but crashes before DB commit, event remains `PENDING` and *will be published again*.
-   **Mitigation:** Consumers **MUST** use the event `id` for deduplication. This is standard At-Least-Once delivery.

### 3.3. Failure Handling
-   **Transient Failures:** 
    -   Update `status = 'PENDING'`, increment `retry_count`.
    -   Exponential Backoff: `next_poll > NOW() + power(2, retries)`.
-   **Dead Letter Queue (DLQ):** 
    -   Max Retries (e.g., 5).
    -   If exceeded, set `status = 'FAILED'`.
    -   Alerting system monitors count of `FAILED` events.

## 4. Observability & Metrics

-   `outbox_pending_count`: Gauge (Should stay near 0).
-   `outbox_oldest_age_seconds`: Gauge (Lag monitoring).
-   `outbox_process_latency`: Histogram (DB Insert -> Publish).
-   `outbox_failure_count`: Counter (Alert trigger).

## 5. Migration Strategy
1.  Create `outbox_events` table.
2.  Integrate `OutboxService` into `OrdersServiceV2` (Transaction injection).
3.  Deploy `OutboxWorker` (NestJS Scheduled Task / Standalone Microservice).
