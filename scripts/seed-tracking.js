
const http = require('http');

async function post(url, data, token) {
    const urlObj = new URL(url);
    const body = JSON.stringify(data);

    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: urlObj.hostname,
            port: urlObj.port,
            path: urlObj.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body),
                'Authorization': `Bearer ${token}`
            }
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body: data }));
        });

        req.on('error', (err) => reject(err));
        req.write(body);
        req.end();
    });
}

async function seed() {
    const tenantId = '550e8400-e29b-41d4-a716-446655440000';
    const vehicleIds = ['unit-001', 'unit-002', 'unit-003'];
    const token = `mock-jwt|admin-001|${tenantId}|admin@logistik.com`;

    console.log('--- STARTING SEED SCRIPT (Native HTTP) ---');

    for (const vehicleId of vehicleIds) {
        console.log(`Sending start simulate request for ${vehicleId}...`);
        try {
            const res = await post(`http://localhost:3000/api/tracking/simulate/start`, { vehicleId }, token);
            console.log(`Response for ${vehicleId} (Status ${res.status}):`, res.body);
        } catch (error) {
            console.error(`Error for ${vehicleId}:`, error.message);
        }
    }

    console.log('--- SEED SCRIPT FINISHED ---');
}

seed();
