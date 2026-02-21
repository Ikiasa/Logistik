
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class DeprecationInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            tap(() => {
                const response = context.switchToHttp().getResponse();
                // Standard HTTP Warning Header
                // 299 - "Miscellaneous Persistent Warning"
                response.header('Warning', '299 - "This endpoint is deprecated. Please switch to v2 API."');
                // Optional: Draft-Deprecation header
                response.header('Deprecation', 'true');
            }),
        );
    }
}
