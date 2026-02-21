
import { Module, Global } from '@nestjs/common';
import { DeprecationInterceptor } from './interceptors/deprecation.interceptor';
import { DatabaseModule } from './database/database.module';
import { IdempotencyInterceptor } from './idempotency/idempotency.interceptor';
import { RedisService } from './redis/redis.service';

@Global()
@Module({
    imports: [DatabaseModule],
    providers: [DeprecationInterceptor, IdempotencyInterceptor, RedisService],
    exports: [DeprecationInterceptor, IdempotencyInterceptor, DatabaseModule, RedisService],
})
export class CommonModule { }
