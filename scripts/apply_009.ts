
import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

const connectionString = process.env.DATABASE_URL || 'postgres://logistik_user:secure_password@localhost:5434/logistik_db';
const pool = new Pool({ connectionString });

async function main() {
    const filePath = path.join(__dirname, '../database/migrations/009_command_center_intelligence.sql');
    console.log(`🚀 Applying manual migration: 009_command_center_intelligence.sql`);

    if (!fs.existsSync(filePath)) {
        console.error(`Migration file not found: ${filePath}`);
        process.exit(1);
    }

    const sql = fs.readFileSync(filePath, 'utf8');
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('COMMIT');
        console.log('✅ Applied successfully.');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('💥 Migration failed:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

main();
