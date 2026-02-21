# Enterprise Logistics System - Architecture Design Document

## 1. Executive Summary
This document outlines the technical architecture for a white-label, enterprise-grade Logistics Management System (LMS). The system is designed to be modular, scalable, and secure, suitable for acquisition by large corporations. It supports multi-tenancy, high-volume transaction processing, and seamless integration with existing ERPs.

## 2. System Overview
The system follows a **Modular Monolith** architecture, which allows for rapid development and simplified deployment while maintaining clear boundaries between modules. This prepares the system for a future transition to **Microservices** as specific modules scale independently.

### High-Level Architecture
-   **Client Layer**: 
    -   Web Portal (React + TypeScript) for Admin, Dispatchers, and Customers.
    -   Mobile App (Flutter) for Drivers and Field Staff.
-   **API Gateway**: Nginx / Kong (Optional for future) or NestJS internal routing.
-   **Application Layer**: NestJS (Node.js) serving REST and GraphQL APIs.
-   **Data Layer**: PostgreSQL (Primary DB), Redis (Cache), RabbitMQ (Message Queue).
-   **Infrastructure**: Dockerized containers orchestrated via Kubernetes (K8s).

## 3. Technology Stack

| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Backend** | **NestJS** (TypeScript) | Strongly typed, modular architecture (Modules, Controllers, Services), excellent scalable patterns, native support for Microservices. |
| **Frontend** | **React + TypeScript** | Industry standard, high performance, rich ecosystem for UI components (e.g., Maps, Charts). |
| **Mobile** | **Flutter** | Single codebase for iOS and Android, high performance aimed at drivers/field ops. |
| **Database** | **PostgreSQL** | Reliable, ACID compliant, supports JSONB for flexible data (e.g., custom form fields), strong geospatial support (PostGIS). |
| **Cache** | **Redis** | High-speed caching for sessions, real-time vehicle tracking, and frequent lookups. |
| **Queue** | **RabbitMQ** | Asynchronous processing for rigorous tasks like Route Optimization and Notification dispatch. |
| **Search** | **Elasticsearch** (Optional) | For advanced text search across millions of orders/shipments (Phase 2). |

## 4. Core Modules & Functionality

### 4.1. Core Kernel (Shared)
-   **Tenancy Management**: Schema-based or Column-based multi-tenancy.
-   **IAM (Identity & Access Management)**:
    -   RBAC (Role-Based Access Control) with granular permissions (Resource + Action).
    -   Integration with OIDC/SAML (Keycloak) for Enterprise SSO.
-   **Audit Logging**: Immutable log of all user actions (Who, What, When, Previous Value, New Value).

### 4.2. Fleet Management
-   **Entities**: Vehicles (Trucks, Vans, Bikes), Trailers, Drivers.
-   **Features**: Vehicle Maintenance Scheduling, Fuel Tracking, Driver Performance & Licensing, Real-time GPS Tracking ingestion.

### 4.3. Order & Shipment Management
-   **Entities**: Orders, Line Items, Shipments, Parcels.
-   **Features**:
    -   Order Ingestion (Excel upload, API, EDI).
    -   Smart Grouping (grouping orders into shipments based on destination/SLA).
    -   Label Generation (Barcode/QR).

### 4.4. Route Optimization (TMS)
-   **Engine**: Integration with VRP (Vehicle Routing Problem) engines like OR-Tools or commercial APIs.
-   **Features**:
    -   Auto-dispatch based on constraints (Volume, Weight, Time Windows).
    -   Route Manifest generation.
    -   Zone-based Planning.

### 4.5. Warehouse (WMS Lite)
-   **Entities**: Warehouses, Zones, Bins, Inventory.
-   **Features**: Inbound/Outbound scanning, Stock movement, Cross-docking support.

### 4.6. Proof of Delivery (PoD)
-   **Mobile Features**:
    -   Digital Signature capture.
    -   Photo evidence (Safe drop, Damaged goods).
    -   Geofencing check (ensure driver is at location).
    -   Offline mode support.

### 4.7. Analytics & Reporting
-   **Dashboard**: Real-time operational metrics (On-time delivery rate, Fleet utilization).
-   **Reports**: Custom report builder, Export to PDF/Excel.

## 5. Data Architecture (PostgreSQL)

### Schema Design Guidelines
-   **UUIDs** for Primary Keys to prevent enumeration attacks and facilitate merging.
-   **Audit Columns**: `created_at`, `updated_at`, `created_by`, `deleted_at` (Soft Delete).
-   **Geospatial**: Use PostGIS type `GEOGRAPHY(POINT)` for locations.

### Key Entity Relationships (Simplified ERD)
-   `Tenant` 1---* `User`
-   `Tenant` 1---* `Order`
-   `Order` 1---* `Shipment` (One order may be split, or multiple grouped)
-   `Shipment` *---1 `Route`
-   `Route` *---1 `Driver`
-   `Route` *---1 `Vehicle`

## 6. Security & Scalability

### Security
1.  **Transport**: TLS 1.3 everywhere.
2.  **Data at Rest**: AES-256 encryption for sensitive columns (PII).
3.  **API Security**: Rate limiting per tenant/IP, Helmet headers, Input validation (Zod/Class-validator).
4.  **Compliance**: GDPR/CCPA ready (Right to be forgotten implementation).

### Scalability Strategy
1.  **Horizontal Scaling**: Stateless NestJS services behind Load Balancer.
2.  **Database**:
    -   Read Replicas for Reporting/Analytics.
    -   Partitioning for high-volume tables (e.g., `audit_logs`, `gps_traces`).
3.  **Async Processing**:
    -   Heavy operations (e.g., "Generate End of Day Report", "Optimize Route") offloaded to Worker Queues via RabbitMQ.
4.  **Caching**:
    -   Cache frequently accessed reference data (Zones, Vehicle Types) in Redis.

## 7. Integration Layer
-   **Webhooks**: Outbound webhooks to notify client ERPs of status changes (e.g., `SHIPMENT_DELIVERED`).
-   **Public API**: Versioned REST API with Swagger documentation.
-   **EDI**: Support for standard EDI formats (X12, EDIFACT) via adapter pattern.

## 8. Deployment (DevOps)
-   **Containerization**: Dockerfiles for all services.
-   **Orchestration**: Kubernetes Helm Charts for standard deployment.
-   **CI/CD**: GitHub Actions / GitLab CI pipelines running Tests, Linting, and Build.
