# Implementation Plan - Address Normalization & Geospatial Validation

## 1. Objective
Replace legacy free-text address fields with a structured, normalized, and geospatially validated address model. This is a critical prerequisite for accurate Route Optimization and Enterprise-grade data integrity.

## 2. Data Model & Ownership Boundaries

### 2.1. Master Data vs. Transactional Snapshot
To balance reusability with legal auditing, we will use a **Hybrid Approach**:
1.  **Master Address (`addresses` table):** Fully normalized, reusable entity. Represents a physical location. Shared across Orders/Customers if hash matches.
2.  **Transactional Snapshot (`orders.delivery_address_json`):** A **frozen JSONB copy** of the address at the moment of dispatch.
    -   *Why?* If the "Master Address" is corrected later (e.g., "Main St" -> "Main Street"), historical delivery records must *not* change.

### 2.2. Immutability Rules
-   **Draft/Pending:** Address is editable. modifying it links to a new/existing `address_id`.
-   **Routed/Dispatched:** Address is **LOCKED**.
    -   *Exception:* "Redirection" workflow required. This cancels the current route leg, updates the order, and triggers re-optimization.
-   **Audit:** All changes to `order.address_id` are logged in `audit_logs` (Who, When, Old ID, New ID).

## 3. Geospatial Validation Rules

### 3.1. Polygon Implementation
-   **Storage:** We will source open data (e.g., GADM or OpenStreetMap) for administrative boundaries and store them in `geo_regions` as `GEOGRAPHY(POLYGON)`.
-   **Logic:** `ST_Contains(region.boundary, input_point)`.

### 3.2. Fallback & Override (Non-Blocking Ingestion)
-   **Rule:** **Never block ERP ingestion.**
-   **Flow:**
    1.  ERP sends Order.
    2.  System checks validation.
    3.  If Fail: Order checks in as `WARNING` state (or `UNVERIFIED`). `addresses.validation_status = 'failed'`.
    4.  **Operations Dashboard:** Dispatchers see "Unverified Addresses" queue.
    5.  **Manual Override:** Dispatcher drags pin on map or clicks "Force Accept". This action is **Audited**.

## 4. Partitioning & Indexing Strategy

### 4.1. Partitioning (Declarative)
-   **Strategy:** Native PostgreSQL List Partitioning by `country_code`.
    -   `addresses_us` VALUES ('US')
    -   `addresses_de` VALUES ('DE')
    -   `addresses_default` (Catch-all for low volume regions).
-   **Multi-Country Tenants:** Fully supported. Tenant ID is orthogonal to Country Code.

### 4.2. Indexing
-   **Geospatial:** `CREATE INDEX idx_addresses_location ON addresses USING GIST (location);` (Crucial for "Find orders in polygon").
-   **Lookup:** `CREATE INDEX idx_addresses_hash ON addresses (hash);` (For rapid deduplication).
-   **Region:** `CREATE INDEX idx_addresses_region_lookup ON addresses (country_code, postal_code, city);`

## 5. Migration Risk Controls

### 5.1. Rollback Strategy
-   **Phase 1 (Dual Write):** If bugs found, simply stop writing to new tables.
-   **Phase 2 (Backfill):** If performance degrades, pause the worker.
-   **Phase 3 (Cutover):** The `v1` endpoint will remaining active but internally mapped to `v2` logic.
    -   *Emergency Rollback:* A Feature Flag `ENABLE_LEGACY_ADDRESS_READ` will force the API to read from the `orders.legacy_text` column instead of `addresses` relation.

### 5.2. Validation Metrics (Dashboard)
-   **Metric 1:** % of Orders with `validation_status = 'verified'`.
-   **Metric 2:** Avg Latency of `POST /orders` (Ensure Geocoding check doesn't slow ingestion).
-   **Metric 3:** "Address Redirection" rate (Indicates bad upstream data).

## 6. API Versioning
-   **Timeline:** v1 supported for 12 months.
-   **Deprecation:** `Warning` header added immediately.
-   **Docs:** OpenAPI spec updated to show `address` object as required in v2.
