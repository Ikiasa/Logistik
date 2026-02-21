import { Injectable, Logger } from "@nestjs/common";
import { CreateOrderDtoV2, AddressDto } from "./dto/create-order.v2.dto";
import * as crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import { Pool } from "pg";
import { TenantContext } from "../common/context/tenant.context";

@Injectable()
export class OrdersServiceV2 {
  private readonly logger = new Logger(OrdersServiceV2.name);

  // Inject DB Connection/Pool
  constructor(private readonly db: Pool) { }

  async create_v2(dto: CreateOrderDtoV2) {
    // 0. Enforce RLS Context (Capture early to avoid async context loss)
    const tenantId = TenantContext.getTenantId();
    if (!tenantId) {
      const store = (TenantContext as any).storage?.getStore();
      throw new Error(`Tenant Context Missing: Cannot process request securely. ID: ${tenantId}, Store: ${JSON.stringify(Array.from(store?.entries() || []))}`);
    }

    const client = await this.db.connect();
    try {
      await client.query("BEGIN");

      // Critical: Set the session variable for RLS
      await client.query(`SET LOCAL app.current_tenant = \'${tenantId}\'`);

      // 1. Resolve Master Address (Idempotent / Reuse)
      const addressId = await this.resolveMasterAddress(
        client,
        dto.delivery_address,
        tenantId, // Use Context ID, not DTO
      );

      // 2. Create Immutable Snapshot
      const addressSnapshot = JSON.stringify(dto.delivery_address);

      // 3. Insert Order (Atomic with Address resolution)
      const orderId = uuidv4();
      const insertOrderQuery = `
                INSERT INTO orders (
                    id, tenant_id, customer_name, 
                    delivery_address_id, delivery_address_country_code, delivery_address_snapshot,
                    delivery_validation_status, status, created_at
                ) VALUES (
                    $1, $2, $3, 
                    $4, $5, $6, 
                    'verified_rooftop', 'PENDING', NOW()
                )
                RETURNING id;
            `;

      const res = await client.query(insertOrderQuery, [
        orderId,
        tenantId,
        dto.customer_name,
        addressId,
        dto.delivery_address.country_code,
        addressSnapshot,
      ]);

      await client.query("COMMIT");

      this.logger.log(`Order created: ${orderId} with Address: ${addressId}`);
      return res.rows[0];
    } catch (err) {
      await client.query("ROLLBACK");
      this.logger.error("Failed to create order v2", err);
      throw err;
    } finally {
      client.release();
    }
  }

  async findAll() {
    const tenantId = TenantContext.getTenantId();
    console.log(`[OrdersServiceV2] Listing orders for Tenant: ${tenantId}`);
    if (!tenantId) {
      throw new Error("Tenant Context Missing in Service Layer");
    }

    const client = await this.db.connect();
    try {
      await client.query(`SET LOCAL app.current_tenant = \'${tenantId}\'`);
      const res = await client.query("SELECT * FROM orders ORDER BY created_at DESC");
      return res.rows;
    } finally {
      client.release();
    }
  }

  private async resolveMasterAddress(
    client: any,
    address: AddressDto,
    tenantId: string,
  ): Promise<string> {
    // 1. Generate Hash
    const hashInput = `${address.country_code}|${address.postal_code}|${address.street}|${address.number}`;
    const hash = crypto.createHash("sha256").update(hashInput).digest("hex");

    // 2. Optimistic Select (Cache efficient)
    const existing = await client.query(
      "SELECT id FROM addresses WHERE hash = $1 AND tenant_id = $2 AND country_code = $3",
      [hash, tenantId, address.country_code],
    );

    if (existing.rows.length > 0) {
      return existing.rows[0].id;
    }

    // 3. Upsert with ON CONFLICT (Concurrency Safety)
    // Even if Two threads pass step 2, DB Unique Constraint blocks duplicates.
    // We use ON CONFLICT DO NOTHING and then re-select to handle the race win/loss.
    const newId = uuidv4();

    const insertRes = await client.query(
      `
            INSERT INTO addresses (
                id, tenant_id, hash, structured_data, formatted_address, 
                validation_status, country_code, created_at
            ) VALUES (
                $1, $2, $3, $4, $5, 
                'unverified', $6, NOW()
            )
            ON CONFLICT (hash, tenant_id, country_code) DO NOTHING
            RETURNING id
        `,
      [
        newId,
        tenantId,
        hash,
        JSON.stringify(address),
        `${address.street} ${address.number}, ${address.city}`,
        address.country_code,
      ],
    );

    if (insertRes.rows.length > 0) {
      return insertRes.rows[0].id; // We won the race
    }

    // 4. We lost the race, fetch the winner
    const winner = await client.query(
      "SELECT id FROM addresses WHERE hash = $1 AND tenant_id = $2 AND country_code = $3",
      [hash, tenantId, address.country_code],
    );

    return winner.rows[0].id;
  }
}
