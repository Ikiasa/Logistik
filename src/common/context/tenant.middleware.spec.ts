
import { TenantMiddleware } from './tenant.middleware';
import { BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantContext } from './tenant.context';

describe('TenantMiddleware', () => {
    let middleware: TenantMiddleware;
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        middleware = new TenantMiddleware();
        req = { headers: {} };
        res = {};
        next = jest.fn();
    });

    it('should throw if header is missing', () => {
        expect(() => middleware.use(req as Request, res as Response, next)).toThrow(BadRequestException);
    });

    it('should throw if invalid UUID', () => {
        req.headers['x-tenant-id'] = 'invalid-uuid';
        expect(() => middleware.use(req as Request, res as Response, next)).toThrow(BadRequestException);
    });

    it('should set context and call next', () => {
        const validId = '123e4567-e89b-12d3-a456-426614174000';
        req.headers['x-tenant-id'] = validId;

        // Mock TenantContext.run since it executes callback
        const runSpy = jest.spyOn(TenantContext, 'run').mockImplementation((id, cb) => cb());

        middleware.use(req as Request, res as Response, next);

        expect(runSpy).toHaveBeenCalledWith(validId, expect.any(Function));
        expect(next).toHaveBeenCalled();

        runSpy.mockRestore();
    });
});
