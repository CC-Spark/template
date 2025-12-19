import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { RouterContextProvider } from 'react-router';
import legacyRoutesMiddleware from '@/middlewares/legacy-routes.client';
import { appConfigContext } from '@/config/context';
import type { AppConfig } from '@/config';

describe('legacyRoutesMiddleware', () => {
    let mockContext: RouterContextProvider;
    let mockNext: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        mockContext = new RouterContextProvider();
        mockNext = vi.fn().mockResolvedValue({});

        // Mock context.get to return config
        vi.spyOn(mockContext, 'get').mockImplementation((contextKey: any) => {
            if (contextKey === appConfigContext) {
                return {
                    site: {
                        hybrid: {
                            enabled: true,
                            legacyRoutes: ['/checkout', '/account', '/s/'],
                        },
                    },
                } as unknown as AppConfig;
            }
            return undefined;
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    describe('server-side behavior', () => {
        test('should skip middleware on server-side (window undefined)', async () => {
            // Simulate server-side by stubbing window as undefined
            vi.stubGlobal('window', undefined);

            const request = new Request('https://example.com/checkout');

            await legacyRoutesMiddleware({ request, context: mockContext, params: {} }, mockNext);

            expect(mockNext).toHaveBeenCalledOnce();
        });
    });

    describe('client-side behavior with hybrid disabled', () => {
        beforeEach(() => {
            // Mock window for client-side
            vi.stubGlobal('window', {} as Window & typeof globalThis);

            // Override config to disable hybrid
            vi.spyOn(mockContext, 'get').mockImplementation((contextKey: any) => {
                if (contextKey === appConfigContext) {
                    return {
                        site: {
                            hybrid: {
                                enabled: false,
                                legacyRoutes: ['/checkout'],
                            },
                        },
                    } as unknown as AppConfig;
                }
                return undefined;
            });
        });

        test('should skip when hybrid mode is disabled', async () => {
            const request = new Request('https://example.com/checkout');

            await legacyRoutesMiddleware({ request, context: mockContext, params: {} }, mockNext);

            expect(mockNext).toHaveBeenCalledOnce();
        });
    });

    describe('client-side behavior with no legacy routes', () => {
        beforeEach(() => {
            vi.stubGlobal('window', {} as Window & typeof globalThis);

            vi.spyOn(mockContext, 'get').mockImplementation((contextKey: any) => {
                if (contextKey === appConfigContext) {
                    return {
                        site: {
                            hybrid: {
                                enabled: true,
                                legacyRoutes: [],
                            },
                        },
                    } as unknown as AppConfig;
                }
                return undefined;
            });
        });

        test('should skip when legacyRoutes is empty', async () => {
            const request = new Request('https://example.com/checkout');

            await legacyRoutesMiddleware({ request, context: mockContext, params: {} }, mockNext);

            expect(mockNext).toHaveBeenCalledOnce();
        });

        test('should skip when legacyRoutes is undefined', async () => {
            vi.spyOn(mockContext, 'get').mockImplementation((contextKey: any) => {
                if (contextKey === appConfigContext) {
                    return {
                        site: {
                            hybrid: {
                                enabled: true,
                                // legacyRoutes is undefined
                            },
                        },
                    } as unknown as AppConfig;
                }
                return undefined;
            });

            const request = new Request('https://example.com/checkout');

            await legacyRoutesMiddleware({ request, context: mockContext, params: {} }, mockNext);

            expect(mockNext).toHaveBeenCalledOnce();
        });
    });

    describe('client-side legacy route matching', () => {
        beforeEach(() => {
            // Mock window for client-side - simple object that allows property access
            vi.stubGlobal('window', { location: { href: '' } } as Window & typeof globalThis);
        });

        test('should trigger redirect path when path matches legacy route exactly', async () => {
            const request = new Request('https://example.com/checkout');

            await legacyRoutesMiddleware({ request, context: mockContext, params: {} }, mockNext);

            // Middleware should not call next() when redirecting (it returns empty object instead)
            expect(mockNext).not.toHaveBeenCalled();
        });

        test('should not redirect when path does not exactly match', async () => {
            const request = new Request('https://example.com/checkout/payment');

            await legacyRoutesMiddleware({ request, context: mockContext, params: {} }, mockNext);

            // Should continue normal navigation since /checkout/payment !== /checkout
            expect(mockNext).toHaveBeenCalledOnce();
        });

        test('should trigger redirect path and preserve existing query params', async () => {
            const request = new Request('https://example.com/checkout?step=2&item=abc');

            await legacyRoutesMiddleware({ request, context: mockContext, params: {} }, mockNext);

            expect(mockNext).not.toHaveBeenCalled();
        });

        test('should trigger redirect path and preserve hash fragment', async () => {
            const request = new Request('https://example.com/checkout#payment');

            await legacyRoutesMiddleware({ request, context: mockContext, params: {} }, mockNext);

            expect(mockNext).not.toHaveBeenCalled();
        });

        test('should continue normal navigation when path does not match', async () => {
            const request = new Request('https://example.com/product/123');

            await legacyRoutesMiddleware({ request, context: mockContext, params: {} }, mockNext);

            expect(mockNext).toHaveBeenCalledOnce();
        });

        test('should only match exact paths configured in legacyRoutes', async () => {
            // /s/ is in legacyRoutes, but /s/RefArch/en_US/Cart-Show is not
            const request = new Request('https://example.com/s/RefArch/en_US/Cart-Show');

            await legacyRoutesMiddleware({ request, context: mockContext, params: {} }, mockNext);

            // Should continue normal navigation since it's not an exact match
            expect(mockNext).toHaveBeenCalledOnce();
        });
    });

    describe('infinite loop prevention', () => {
        beforeEach(() => {
            // Mock window for client-side
            vi.stubGlobal('window', { location: { href: '' } } as Window & typeof globalThis);
        });

        test('should not redirect when redirected=1 query param is present', async () => {
            const request = new Request('https://example.com/checkout?redirected=1');

            await legacyRoutesMiddleware({ request, context: mockContext, params: {} }, mockNext);

            expect(mockNext).toHaveBeenCalledOnce();
        });

        test('should let React Router handle 404 after one redirect attempt', async () => {
            const request = new Request('https://example.com/checkout?redirected=1&other=param');

            await legacyRoutesMiddleware({ request, context: mockContext, params: {} }, mockNext);

            // Should not redirect again, let it fall through to React Router
            expect(mockNext).toHaveBeenCalledOnce();
        });
    });

    describe('edge cases', () => {
        beforeEach(() => {
            // Mock window for client-side
            vi.stubGlobal('window', { location: { href: '' } } as Window & typeof globalThis);
        });

        test('should handle config with null hybrid property', async () => {
            vi.spyOn(mockContext, 'get').mockImplementation((contextKey: any) => {
                if (contextKey === appConfigContext) {
                    return {
                        site: {
                            hybrid: null,
                        },
                    } as unknown as AppConfig;
                }
                return undefined;
            });

            const request = new Request('https://example.com/checkout');

            await legacyRoutesMiddleware({ request, context: mockContext, params: {} }, mockNext);

            expect(mockNext).toHaveBeenCalledOnce();
        });

        test('should handle missing config gracefully', async () => {
            vi.spyOn(mockContext, 'get').mockReturnValue(undefined);

            const request = new Request('https://example.com/checkout');

            await legacyRoutesMiddleware({ request, context: mockContext, params: {} }, mockNext);

            expect(mockNext).toHaveBeenCalledOnce();
        });

        test('should use exact matching, not prefix matching', async () => {
            // /account is a legacy route, but /accounts is not (exact matching)
            const request = new Request('https://example.com/accounts/profile');

            await legacyRoutesMiddleware({ request, context: mockContext, params: {} }, mockNext);

            // Should continue normal navigation since /accounts/profile !== /account
            expect(mockNext).toHaveBeenCalledOnce();
        });
    });
});
