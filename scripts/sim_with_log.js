const http = require('http');
const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, 'sim_output.txt');

function log(msg) {
    const timestamp = new Date().toISOString();
    const line = `[${timestamp}] ${msg}\n`;
    fs.appendFileSync(logFile, line);
    console.log(msg); // Also try console
}

log('🚀 GPS Simulation Starting...');

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
                resolve({ status: res.statusCode, body: resData });
            });
        });

        req.on('error', (err) => reject(err));
        req.write(body);
        req.end();
    });
}

let count = 0;

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
            count++;
            log(`✅ ${v.id} -> Status ${res.status} [Total: ${count}]`);
        } catch (err) {
            log(`❌ ${v.id} FAILED: ${err.message}`);
        }
    }
}

log('Testing initial connection...');
sendUpdates().then(() => {
    log('Initial test successful. Starting interval...');
    setInterval(sendUpdates, 4000);
}).catch(err => {
    log(`ERROR: ${err.message}`);
    process.exit(1);
});
