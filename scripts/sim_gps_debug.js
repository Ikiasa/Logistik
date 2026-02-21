const http = require('http');

const TENANT_ID = '00000000-0000-0000-0000-000000000000';
const VEHICLES = [
    { id: 'V-ALPHA-1', driver: 'D-001', lat: -6.1751, lng: 106.8272 },
    { id: 'V-BETA-2', driver: 'D-002', lat: -6.2, lng: 106.8166 },
    { id: 'V-GAMMA-3', driver: 'D-003', lat: -6.21, lng: 106.82 },
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
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve({ status: res.statusCode, body: resData, path: '/api/api/tracking/update' });
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${resData}`));
                }
            });
        });

        req.on('error', (err) => {
            reject(err);
        });

        req.write(body);
        req.end();
    });
}

console.log('🚀 GPS SIMULATION STARTING...');
console.log(`📡 Target: http://localhost:3000/api/api/tracking/update`);
console.log(`🔑 Tenant: ${TENANT_ID}`);
console.log(`🚗 Vehicles: ${VEHICLES.length}`);
console.log('---');

let updateCount = 0;
let errorCount = 0;

async function sendUpdates() {
    for (const v of VEHICLES) {
        v.lat += (Math.random() - 0.5) * 0.002;
        v.lng += (Math.random() - 0.5) * 0.002;

        try {
            const res = await post({
                vehicle_id: v.id,
                driver_id: v.driver,
                latitude: v.lat,
                longitude: v.lng,
                speed: 40 + Math.random() * 40,
                heading: Math.floor(Math.random() * 360),
                accuracy: 5
            });
            updateCount++;
            console.log(`✅ [${new Date().toLocaleTimeString()}] ${v.id} -> ${res.path} (${res.status}) [Total: ${updateCount}]`);
        } catch (err) {
            errorCount++;
            console.error(`❌ [${new Date().toLocaleTimeString()}] ${v.id} FAILED: ${err.message} [Errors: ${errorCount}]`);
        }
    }
}

// Initial test
console.log('🧪 Running initial connectivity test...');
sendUpdates().then(() => {
    console.log('✅ Initial test complete. Starting continuous updates every 4 seconds...\n');
    setInterval(sendUpdates, 4000);
}).catch((err) => {
    console.error('❌ Initial test failed:', err.message);
    console.error('💡 Make sure the backend is running on http://localhost:3000');
    process.exit(1);
});

// Keep alive
process.on('SIGINT', () => {
    console.log('\n🛑 Simulation stopped by user');
    console.log(`📊 Stats: ${updateCount} updates sent, ${errorCount} errors`);
    process.exit(0);
});
