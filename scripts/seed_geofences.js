const { Pool } = require('pg');

const pool = new Pool({
    connectionString: "postgresql://logistik_user:secure_password@localhost:5434/logistik_db"
});

async function seed() {
    const tenantId = '550e8400-e29b-41d4-a716-446655440000';

    // 1. Jakarta Logistics Hub
    await pool.query(`
        INSERT INTO geofences (tenant_id, name, type, area, address) 
        VALUES ($1, 'Jakarta Logistics Hub', 'WAREHOUSE', 
        ST_GeomFromText('POLYGON((106.840 -6.200, 106.850 -6.200, 106.850 -6.210, 106.840 -6.210, 106.840 -6.200))', 4326),
        'Jl. Gatot Subroto No. 1, Jakarta')
        ON CONFLICT DO NOTHING
    `, [tenantId]);

    // 2. Tanjung Priok Port
    await pool.query(`
        INSERT INTO geofences (tenant_id, name, type, area, address) 
        VALUES ($1, 'Tanjung Priok Port', 'PORT', 
        ST_GeomFromText('POLYGON((106.870 -6.100, 106.900 -6.100, 106.900 -6.130, 106.870 -6.130, 106.870 -6.100))', 4326),
        'Tanjung Priok, North Jakarta')
        ON CONFLICT DO NOTHING
    `, [tenantId]);

    console.log('Sample Geofences Seeded Successfully.');
    process.exit(0);
}

seed().catch(err => {
    console.error(err);
    process.exit(1);
});
