# API Strategy & Standards

## 1. Design Philosophy
-   **API First**: All functionality is exposed via API first; the Web and Mobile clients are just consumers.
-   **RESTful Core**: Resource-oriented URLs, standard HTTP methods (GET, POST, PATCH, DELETE).
-   **GraphQL Option**: For complex, nested data fetching (e.g., Dashboard widgets), GraphQL is supported but REST is the primary interface for integrations.

## 2. Standards

### URL Structure
`https://api.domain.com/v1/{tenant_slug}/{resource}`
-   Versioned (`v1`, `v2`)
-   Tenant-aware URL path (or header `X-Tenant-ID`)

### Standard Response Envelope
```json
{
  "status": "success", // or "error"
  "data": { ... },     // The actual payload
  "meta": {            // Pagination, etc.
    "page": 1,
    "limit": 20,
    "total": 150
  },
  "timestamp": "2023-10-27T10:00:00Z"
}
```

### Error Handling
```json
{
  "status": "error",
  "code": "ORDER_NOT_FOUND",
  "message": "Order with ID 123 does not exist.",
  "details": [] 
}
```

## 3. Key Endpoints (Examples)

### Fleet Module
-   `GET /fleets/vehicles`: List all vehicles (filterable by status, type).
-   `POST /fleets/vehicles`: Register a new vehicle.
-   `GET /fleets/drivers/{id}/performance`: Get driver score and history.

### Order Module
-   `POST /orders/ingest`: Bulk upload orders (JSON/CSV).
-   `GET /orders/{id}/tracking`: Public tracking info (no auth required, specific token).

### Route Module
-   `POST /routes/optimize`: Trigger route optimization engine.
    -   *Input*: List of Order IDs, Available Vehicles.
    -   *Output*: Job ID (Async process).
-   `GET /routes/{id}/manifest`: Get the ordered list of stops for a driver.

## 4. Security Headers
-   `Authorization`: Bearer <JWT>
-   `X-Tenant-ID`: UUID (If not in URL)

## 5. Documentation
-   **Swagger/OpenAPI 3.0**: Auto-generated from NestJS decorators.
-   **Compodoc**: For internal code documentation.
