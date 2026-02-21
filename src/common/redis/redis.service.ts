import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private client: Redis;
    private readonly logger = new Logger(RedisService.name);
    private isConnected = false;

    onModuleInit() {
        this.client = new Redis({
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT) || 6379,
            retryStrategy: (times) => {
                if (times > 3) {
                    this.logger.warn('Redis connection failed after 3 attempts. Running without Redis cache.');
                    return null; // Stop retrying
                }
                return Math.min(times * 100, 2000);
            },
            maxRetriesPerRequest: 1,
            enableOfflineQueue: false,
            lazyConnect: true,
        });

        this.client.on('connect', () => {
            this.isConnected = true;
            this.logger.log('Redis connected successfully');
        });

        this.client.on('error', (err: any) => {
            this.isConnected = false;
            // Only log once, not repeatedly
            if (err.code === 'ECONNREFUSED') {
                this.logger.warn('Redis not available. Continuing without cache.');
            }
        });

        // Try to connect, but don't fail if it doesn't work
        this.client.connect().catch(() => {
            this.logger.warn('Redis connection failed. Running without cache.');
        });
    }

    onModuleDestroy() {
        if (this.client) {
            this.client.disconnect();
        }
    }

    async set(key: string, value: any, ttl?: number) {
        if (!this.isConnected) return;

        try {
            const stringValue = JSON.stringify(value);
            if (ttl) {
                await this.client.set(key, stringValue, 'EX', ttl);
            } else {
                await this.client.set(key, stringValue);
            }
        } catch (error) {
            this.logger.debug(`Redis set failed: ${error.message}`);
        }
    }

    async get(key: string): Promise<any | null> {
        if (!this.isConnected) return null;

        try {
            const value = await this.client.get(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            this.logger.debug(`Redis get failed: ${error.message}`);
            return null;
        }
    }

    async del(key: string) {
        if (!this.isConnected) return;

        try {
            await this.client.del(key);
        } catch (error) {
            this.logger.debug(`Redis del failed: ${error.message}`);
        }
    }
}
