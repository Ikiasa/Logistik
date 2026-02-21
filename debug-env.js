
const fs = require('fs');
const { Pool } = require('pg');

console.log('--- DEBUG START ---');
console.log('Current Directory:', process.cwd());
try {
    const envContent = fs.readFileSync('.env', 'utf8');
    console.log('files .env content head:', envContent.split('\n')[0]);
} catch (e) {
    console.log('Could not read .env:', e.message);
}

console.log('process.env.DATABASE_URL:', process.env.DATABASE_URL);

if (process.env.DATABASE_URL) {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    console.log('Pool Config:', {
        user: pool.options.user,
        host: pool.options.host,
        database: pool.options.database,
        password: pool.options.password ? '***' : undefined,
        port: pool.options.port,
        connectionString: pool.options.connectionString
    });
} else {
    console.log('DATABASE_URL is not set in process.env');
}
console.log('--- DEBUG END ---');
