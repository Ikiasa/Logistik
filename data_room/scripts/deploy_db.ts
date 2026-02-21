
import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

const connectionString = process.env.DATABASE_URL || 'postgres://user:pass@localhost:5432/logistik_db';
const pool = new Pool({ connectionString });

const MIGRATIONS = [
    '001_address_normalization_schema.sql',
    '003_financial_integrity_schema.sql',
    '005_enterprise_hardening_schema.sql',
    '006_api_hardening_idempotency.sql',
    '007_valuation_cdc_audit.sql'
];

async function main() {
    console.log('🚀 Starting Database Deployment...');
    const client = await pool.connect();

    try {
        for (const file of MIGRATIONS) {
            const filePath = path.join(__dirname, '../database/migrations', file);
            console.log(`\n📄 Applying: ${file}`);

            if (!fs.existsSync(filePath)) {
                throw new Error(`Migration file not found: ${filePath}`);
            }

            const sql = fs.readFileSync(filePath, 'utf8');
            await client.query('BEGIN');
            await client.query(sql);
            await client.query('COMMIT');
            console.log('✅ Applied successfully.');
        }
        console.log('\n✨ Database Deployment Complete!');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('\n💥 Deployment Failed:', err);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

main();
