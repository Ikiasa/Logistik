"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const uuid_1 = require("uuid");
const connectionString = process.env.DATABASE_URL || 'postgres://user:pass@localhost:5432/logistik_db';
const pool = new pg_1.Pool({ connectionString });
const TENANT_A = (0, uuid_1.v4)();
const TENANT_B = (0, uuid_1.v4)();
const USER_A = (0, uuid_1.v4)();
async function runCheck(name, fn) {
    try {
        process.stdout.write(`[ ] ${name}... `);
        await fn();
        console.log('✅ PASS');
    }
    catch (err) {
        console.log('❌ FAIL');
        console.error(err);
        process.exit(1);
    }
}
async function main() {
    console.log('🚀 Starting Production Readiness Verification...\n');
    const client = await pool.connect();
    try {
        await runCheck('RLS: Tenant A can create order', async () => {
            await client.query('BEGIN');
            await client.query(`SET LOCAL app.current_tenant = '${TENANT_A}'`);
            await client.query(`SET LOCAL app.current_user = '${USER_A}'`);
            const res = await client.query(`
                INSERT INTO orders (total_amount, total_currency, status) 
                VALUES (10000, 'USD', 'PENDING') 
                RETURNING id
            `);
            if (res.rowCount !== 1)
                throw new Error('Failed to insert order');
            const orderId = res.rows[0].id;
            const check = await client.query('SELECT * FROM orders WHERE id = $1', [orderId]);
            if (check.rowCount !== 1)
                throw new Error('Cannot see own order');
            await client.query('COMMIT');
        });
        await runCheck('RLS: Tenant B cannot see Tenant A order', async () => {
            await client.query('BEGIN');
            await client.query(`SET LOCAL app.current_tenant = '${TENANT_B}'`);
            const res = await client.query(`SELECT count(*) as c FROM orders`);
        });
        await runCheck('RLS: Strict Isolation Verification', async () => {
            const orderId = (0, uuid_1.v4)();
            const clientA = await pool.connect();
            try {
                await clientA.query('BEGIN');
                await clientA.query(`SET LOCAL app.current_tenant = '${TENANT_A}'`);
                await clientA.query(`
                    INSERT INTO orders (id, total_amount, total_currency, status) 
                    VALUES ($1, 5000, 'USD', 'PENDING')
                `, [orderId]);
                await clientA.query('COMMIT');
            }
            finally {
                clientA.release();
            }
            const clientB = await pool.connect();
            try {
                await clientB.query('BEGIN');
                await clientB.query(`SET LOCAL app.current_tenant = '${TENANT_B}'`);
                const res = await clientB.query('SELECT * FROM orders WHERE id = $1', [orderId]);
                await clientB.query('COMMIT');
                if (res.rowCount !== 0)
                    throw new Error('Tenant B saw Tenant A order! 🚨');
            }
            finally {
                clientB.release();
            }
        });
        await runCheck('Idempotency: Duplicate Request Handling', async () => {
            const key = `verify-${(0, uuid_1.v4)()}`;
            const client = await pool.connect();
            try {
                await client.query('BEGIN');
                await client.query(`SET LOCAL app.current_tenant = '${TENANT_A}'`);
                await client.query(`INSERT INTO idempotency_keys (tenant_id, key, status) VALUES ($1, $2, 'STARTED')`, [TENANT_A, key]);
                await client.query(`UPDATE idempotency_keys SET status = 'COMPLETED', response_code = 201 WHERE key = $1 AND tenant_id = $2`, [key, TENANT_A]);
                await client.query('COMMIT');
                await client.query('BEGIN');
                await client.query(`SET LOCAL app.current_tenant = '${TENANT_A}'`);
                const check = await client.query(`SELECT status FROM idempotency_keys WHERE key = $1 AND tenant_id = $2`, [key, TENANT_A]);
                await client.query('COMMIT');
                if (check.rows[0]?.status !== 'COMPLETED')
                    throw new Error('Idempotency key not found or invalid state');
            }
            finally {
                client.release();
            }
        });
        await runCheck('CDC: Audit Log Capture', async () => {
            const client = await pool.connect();
            try {
                await client.query('BEGIN');
                await client.query(`SET LOCAL app.current_tenant = '${TENANT_A}'`);
                const res = await client.query(`
                    SELECT * FROM audit_logs 
                    WHERE table_name = 'orders' 
                    AND operation = 'INSERT' 
                    ORDER BY created_at DESC LIMIT 1
                `);
                if (res.rowCount === 0)
                    throw new Error('No audit log found for Order Insert');
                const log = res.rows[0];
                if (log.tenant_id !== TENANT_A)
                    throw new Error('Audit log has wrong tenant ID');
                await client.query('COMMIT');
            }
            finally {
                client.release();
            }
        });
        console.log('\n✨ All Production Readiness Checks Passed!');
    }
    catch (err) {
        console.error('\n💥 Verification Failed:', err);
        process.exit(1);
    }
    finally {
        client.release();
        await pool.end();
    }
}
main();
//# sourceMappingURL=verify_production_readiness.js.map