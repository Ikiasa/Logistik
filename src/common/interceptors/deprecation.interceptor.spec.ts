
import { DeprecationInterceptor } from './deprecation.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';

describe('DeprecationInterceptor', () => {
    let interceptor: DeprecationInterceptor;

    beforeEach(() => {
        interceptor = new DeprecationInterceptor();
    });

    it('should add warning headers', async () => {
        const mockHeader = jest.fn();
        const context = {
            switchToHttp: () => ({
                getResponse: () => ({
                    header: mockHeader,
                }),
            }),
        } as unknown as ExecutionContext;

        const next: CallHandler = {
            handle: () => of('data'),
        };

        const obs = interceptor.intercept(context, next);
        await obs.toPromise(); // Trigger tap

        expect(mockHeader).toHaveBeenCalledWith('Warning', expect.stringContaining('299'));
        expect(mockHeader).toHaveBeenCalledWith('Deprecation', 'true');
    });
});
