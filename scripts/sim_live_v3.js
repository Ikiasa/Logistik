const http = require('http');

const TENANT_ID = '00000000-0000-0000-0000-000000000000';
const VEHICLES = [
    { id: 'V-ALPHA-1', driver: 'D-001', lat: -6.2088, lng: 106.8456 },
    { id: 'V-BETA-2', driver: 'D-002', lat: -6.1751, lng: 106.8272 },
    { id: 'V-GAMMA-3', driver: 'D-003', lat: -6.2146, lng: 106.8451 },
];

const TOKEN = `mock-jwt|user-1|${TENANT_ID}|admin@logistik.com`;

function post(data) {
    const body = JSON.stringify(data);
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: 'localhost',
            port: 3000,
            path: '/api/api/tracking/update',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body),
                'Authorization': `Bearer ${TOKEN}`
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

console.log('🚀 LIVE SIMULATION V3 STARTING...');
console.log(`📡 Targeting Tenant: ${TENANT_ID}`);

setInterval(async () => {
    for (const v of VEHICLES) {
        v.lat += (Math.random() - 0.5) * 0.0005;
        v.lng += (Math.random() - 0.5) * 0.0005;
        const speed = 40 + Math.random() * 20;

        try {
            const res = await post({
                vehicle_id: v.id,
                driver_id: v.driver,
                latitude: v.lat,
                longitude: v.lng,
                speed: speed,
                heading: Math.floor(Math.random() * 360),
                accuracy: 5
            });
            console.log(`✅ [${new Date().toLocaleTimeString()}] Updated ${v.id} (Status ${res.status})`);
        } catch (err) {
            console.error(`❌ [${v.id}] Error: ${err.message}`);
        }
    }
}, 3000);
