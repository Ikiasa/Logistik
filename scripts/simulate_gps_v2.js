
const http = require('http');

const VEHICLES = [
    { id: '11111111-2222-3333-4444-555555555551', driver: '21111111-2222-3333-4444-555555555551', lat: -6.200000, lng: 106.816666 },
    { id: '11111111-2222-3333-4444-555555555552', driver: '21111111-2222-3333-4444-555555555552', lat: -6.210000, lng: 106.820000 },
];

const TENANT_ID = '11111111-1111-1111-1111-111111111111';
const TOKEN = `mock-jwt|user-1|${TENANT_ID}|admin@logistik.com`;

function post(url, data, token) {
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
            let resData = '';
            res.on('data', (chunk) => resData += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body: resData }));
        });

        req.on('error', (err) => reject(err));
        req.write(body);
        req.end();
    });
}

async function simulate() {
    console.log('🚀 Starting GPS Simulation (v2)...');

    // Try multiple paths just in case
    const paths = ['/api/api/tracking/update', '/api/tracking/update'];

    setInterval(async () => {
        for (const v of VEHICLES) {
            v.lat += (Math.random() - 0.5) * 0.002;
            v.lng += (Math.random() - 0.5) * 0.002;
            const speed = Math.random() * 90;

            for (const path of paths) {
                try {
                    const res = await post(`http://localhost:3000${path}`, {
                        vehicle_id: v.id,
                        driver_id: v.driver,
                        latitude: v.lat,
                        longitude: v.lng,
                        speed: speed,
                        heading: Math.floor(Math.random() * 360),
                        accuracy: 5
                    }, TOKEN);

                    if (res.status >= 200 && res.status < 300) {
                        console.log(`📡 [${path}] Updated ${v.id}: ${v.lat.toFixed(6)}, ${v.lng.toFixed(6)}`);
                        break; // Stop trying other paths if one works
                    } else {
                        console.error(`❌ [${path}] Failed ${v.id} (Status ${res.status})`);
                    }
                } catch (err) {
                    console.error(`❌ [${path}] Fetch Error:`, err.message);
                }
            }
        }
    }, 5000);
}

simulate();
