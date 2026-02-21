import { Injectable, Logger } from '@nestjs/common';
import { Pool, QueryResult } from 'pg';

@Injectable()
export class DatabaseService {
    private readonly logger = new Logger(DatabaseService.name);

    constructor(private readonly pool: Pool) { }

    async query(text: string, params?: any[]): Promise<any[]> {
        const start = Date.now();
        try {
            const res: QueryResult = await this.pool.query(text, params);
            const duration = Date.now() - start;
            if (duration > 100) {
                this.logger.warn(`Slow query detected (${duration}ms): ${text.substring(0, 100)}...`);
            }
            return res.rows;
        } catch (err) {
            this.logger.error(`Database query error: ${err.message}`, { text, params });
            throw err;
        }
    }

    async getTransaction() {
        const client = await this.pool.connect();
        return client;
    }

    async runInTransaction<T>(fn: (client: any) => Promise<T>): Promise<T> {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            const result = await fn(client);
            await client.query('COMMIT');
            return result;
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }
}
