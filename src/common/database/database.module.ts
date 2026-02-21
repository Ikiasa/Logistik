
import { Module, Global } from '@nestjs/common';
import { Pool } from 'pg';

import { DatabaseService } from './database.service';

@Global()
@Module({
    providers: [
        {
            provide: Pool,
            useFactory: () => {
                const connectionString = process.env.DATABASE_URL;
                if (!connectionString) {
                    throw new Error('DATABASE_URL environment variable is required');
                }
                return new Pool({ connectionString });
            },
        },
        DatabaseService
    ],
    exports: [Pool, DatabaseService],
})
export class DatabaseModule { }
