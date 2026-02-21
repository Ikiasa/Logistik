
import { Pool } from 'pg';

async function verify() {
    const pool = new Pool({
        connectionString: 'postgresql://postgres:postgres@localhost:5433/logistik'
    });

    try {
        console.log('Connecting to database...');
        const res = await pool.query('SELECT current_database(), now()');
        console.log('Connected:', res.rows[0]);

        console.log('\n--- HEATMAP TEST ---');
        const heatRes = await pool.query(`
            SELECT ST_Y(ST_Centroid(geom)) as lat, ST_X(ST_Centroid(geom)) as lng, count(*)::int as weight
            FROM (
                SELECT ST_SnapToGrid(ST_SetSRID(ST_Point(longitude, latitude), 4326), 0.005) as geom
                FROM vehicle_tracking
                LIMIT 100
            ) as clusters
            GROUP BY geom
        `);
        console.log(`Heatmap clusters found: ${heatRes.rows.length}`);

        console.log('\n--- UTILIZATION TEST ---');
        const utilRes = await pool.query(`
            SELECT vehicle_id, count(*) as total_pings
            FROM vehicle_tracking
            GROUP BY vehicle_id
            LIMIT 5
        `);
        console.log('Utilization data points:', utilRes.rows);

    } catch (err) {
        console.error('Verification failed:', err.message);
    } finally {
        await pool.end();
    }
}

verify();
