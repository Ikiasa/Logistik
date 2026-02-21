
const http = require('http');
const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, '..', 'sim_log_direct.txt');
fs.writeFileSync(logFile, '🚀 Starting GPS Simulation (Diagnostic Fixed)...\n');

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

async function simulateOne() {
    for (const v of VEHICLES) {
        v.lat += (Math.random() - 0.5) * 0.002;
        v.lng += (Math.random() - 0.5) * 0.002;
        const speed = Math.random() * 90;

        try {
            fs.appendFileSync(logFile, `Sending update for ${v.id}...\n`);
            // Attempt standard path
            const res = await post('http://localhost:3000/api/api/tracking/update', {
                vehicle_id: v.id,
                driver_id: v.driver,
                latitude: v.lat,
                longitude: v.lng,
                speed: speed,
                heading: Math.floor(Math.random() * 360),
                accuracy: 5
            }, TOKEN);

            fs.appendFileSync(logFile, `📡 Updated ${v.id}: Status ${res.status}\n`);
        } catch (err) {
            fs.appendFileSync(logFile, `❌ Error updating ${v.id}: ${err.message}\n`);
        }
    }
}

simulateOne().then(() => {
    fs.appendFileSync(logFile, 'Simulation tick finished. Exiting.\n');
    process.exit(0);
}).catch(err => {
    fs.appendFileSync(logFile, `FATAL: ${err.message}\n`);
    process.exit(1);
});
