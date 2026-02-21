const http = require('http');

console.log('Starting simple test...');

const data = JSON.stringify({
    vehicle_id: 'TEST-1',
    driver_id: 'D-TEST',
    latitude: -6.2,
    longitude: 106.8,
    speed: 50,
    heading: 180,
    accuracy: 5
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/api/tracking/update',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        'Authorization': 'Bearer mock-jwt|user-1|00000000-0000-0000-0000-000000000000|admin@logistik.com'
    }
};

console.log('Making request to:', `http://${options.hostname}:${options.port}${options.path}`);

const req = http.request(options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);

    let body = '';
    res.on('data', (chunk) => {
        body += chunk;
    });

    res.on('end', () => {
        console.log('Response:', body);
        console.log('Test complete!');
    });
});

req.on('error', (error) => {
    console.error('Error:', error.message);
});

req.write(data);
req.end();
