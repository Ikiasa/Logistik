# Database Schema Design

## Overview
This document details the database schema for the Logistics Management System. 
**Database Engine**: PostgreSQL 16+
**Conventions**: 
- `snake_case` for table and column names.
- `uuid` for all primary keys.
- `created_at`, `updated_at` (automatic timestamps).
- `deleted_at` (soft delete) for all major entities.
- `tenant_id` (UUID) on all multi-tenant tables.

## 1. Core / IAM

### `tenants`
- `id`: UUID (PK)
- `name`: VARCHAR(255)
- `slug`: VARCHAR(50) (Unique)
- `subscription_tier`: ENUM('standard', 'enterprise')
- `settings`: JSONB (Custom configurations, logos, colors)

### `users`
- `id`: UUID (PK)
- `tenant_id`: UUID (FK -> tenants.id)
- `email`: VARCHAR(255) (Unique per tenant)
- `password_hash`: VARCHAR
- `full_name`: VARCHAR
- `role_id`: UUID (FK -> roles.id)
- `status`: ENUM('active', 'inactive', 'invited')

### `roles`
- `id`: UUID (PK)
- `tenant_id`: UUID (FK)
- `name`: VARCHAR(50)
- `permissions`: JSONB (List of resource:action grants)

## 2. Fleet Management

### `vehicles`
- `id`: UUID (PK)
- `tenant_id`: UUID (FK)
- `registration_number`: VARCHAR(20)
- `vin`: VARCHAR(50)
- `type`: ENUM('truck', 'van', 'bike', 'scooter')
- `capacity_volume`: DECIMAL (m3)
- `capacity_weight`: DECIMAL (kg)
- `current_status`: ENUM('active', 'maintenance', 'inactive')
- `gps_device_id`: VARCHAR

### `drivers`
- `id`: UUID (PK)
- `tenant_id`: UUID (FK)
- `user_id`: UUID (FK -> users.id, optional login)
- `license_number`: VARCHAR(50)
- `license_expiry`: DATE
- `status`: ENUM('available', 'on_trip', 'off_duty')

## 3. Order & Shipment Management

### `orders`
- `id`: UUID (PK)
- `tenant_id`: UUID (FK)
- `external_order_id`: VARCHAR (Ref from ERP)
- `customer_name`: VARCHAR
- `delivery_address`: TEXT
- `delivery_location`: GEOGRAPHY(POINT)
- `status`: ENUM('pending', 'scheduled', 'dispatched', 'delivered', 'failed', 'cancelled')
- `delivery_window_start`: TIMESTAMP
- `delivery_window_end`: TIMESTAMP
- `weight_kg`: DECIMAL
- `volume_m3`: DECIMAL
- `priority`: INT (1-5)

### `order_items`
- `id`: UUID (PK)
- `order_id`: UUID (FK)
- `sku`: VARCHAR
- `quantity`: INT
- `description`: VARCHAR

### `shipments`
(Logical grouping of orders for a single trip/route segment)
- `id`: UUID (PK)
- `tenant_id`: UUID (FK)
- `route_id`: UUID (FK -> routes.id, nullable)
- `driver_id`: UUID (FK, nullable)
- `status`: ENUM('planning', 'loading', 'in_transit', 'completed')
- `start_time`: TIMESTAMP
- `end_time`: TIMESTAMP

## 4. Route Optimization

### `routes`
- `id`: UUID (PK)
- `tenant_id`: UUID (FK)
- `vehicle_id`: UUID (FK)
- `driver_id`: UUID (FK)
- `date`: DATE
- `status`: ENUM('draft', 'optimized', 'assigned', 'started', 'completed')
- `total_distance_km`: DECIMAL
- `total_duration_min`: INT
- `polyline`: TEXT (Encoded path)

### `route_stops`
- `id`: UUID (PK)
- `route_id`: UUID (FK)
- `order_id`: UUID (FK, nullable) (Pickup or Dropoff)
- `sequence`: INT
- `type`: ENUM('pickup', 'delivery', 'break')
- `planned_arrival`: TIMESTAMP
- `actual_arrival`: TIMESTAMP
- `location`: GEOGRAPHY(POINT)

## 5. Warehouse (WMS)

### `inventories`
- `id`: UUID (PK)
- `tenant_id`: UUID (FK)
- `warehouse_id`: UUID (FK)
- `sku`: VARCHAR
- `quantity_on_hand`: INT
- `quantity_allocated`: INT
- `bin_location`: VARCHAR

## 6. Proof of Delivery (PoD)

### `delivery_proofs`
- `id`: UUID (PK)
- `order_id`: UUID (FK)
- `driver_id`: UUID (FK)
- `timestamp`: TIMESTAMP
- `signature_url`: VARCHAR (S3/Blob URL)
- `photo_urls`: ARRAY[VARCHAR]
- `location_captured`: GEOGRAPHY(POINT)
- `notes`: TEXT
