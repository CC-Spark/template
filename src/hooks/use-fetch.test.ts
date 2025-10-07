import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach, type MockedFunction } from 'vitest';
import { useFetcher } from 'react-router';
import { encodeBase64Url } from '@/lib/url';
import { useFetch } from './use-fetch';

vi.mock('react-router', () => ({
    useFetcher: vi.fn(),
}));

const mockUseFetcher = useFetcher as MockedFunction<typeof useFetcher>;

describe('useFetch', () => {
    let mockFetcher: {
        state: 'idle' | 'loading' | 'submitting';
        data: unknown;
        load: MockedFunction<(href: string) => void>;
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();

        mockFetcher = {
            state: 'idle',
            data: null,
            load: vi.fn(),
        };

        mockUseFetcher.mockReturnValue(mockFetcher as never);
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.clearAllMocks();
    });

    describe('initialization', () => {
        it('should initialize with correct state and load function', () => {
            const { result } = renderHook(() =>
                useFetch('ShopperBaskets', 'getBasket', { parameters: { basketId: 'test' } })
            );

            expect(result.current.state).toBe('idle');
            expect(typeof result.current.load).toBe('function');
        });

        it('should encode resource correctly with client, method, and parameters', () => {
            renderHook(() => useFetch('ShopperBaskets', 'getBasket', { parameters: { basketId: 'test' } }));
            expect(mockUseFetcher).toHaveBeenCalledWith({
                key: encodeBase64Url('["ShopperBaskets","getBasket",[{"parameters":{"basketId":"test"}}]]'),
            });
        });

        it('should handle empty parameters array', () => {
            renderHook(() => useFetch('ShopperProducts', 'getProducts'));
            expect(mockUseFetcher).toHaveBeenCalledWith({
                key: encodeBase64Url('["ShopperProducts","getProducts",[]]'),
            });
        });

        it('should handle complex parameter objects', () => {
            const complexParams = {
                parameters: {
                    basketId: 'test',
                    expand: ['items', 'billing_address'],
                    locale: 'en-US',
                },
                headers: {
                    'Custom-Header': 'value',
                },
            };

            renderHook(() => useFetch('ShopperBaskets', 'getBasket', complexParams));
            expect(mockUseFetcher).toHaveBeenCalledWith({
                key: encodeBase64Url(`["ShopperBaskets","getBasket",[${JSON.stringify(complexParams)}]]`),
            });
        });
    });

    describe('load function', () => {
        it('should call fetcher.load with correct resource URL', () => {
            const { result } = renderHook(() =>
                useFetch('ShopperBaskets', 'getBasket', { parameters: { basketId: 'test' } })
            );

            act(() => {
                void result.current.load();
            });

            expect(mockFetcher.load).toHaveBeenCalledWith(
                `/resource/api/client/${encodeBase64Url('["ShopperBaskets","getBasket",[{"parameters":{"basketId":"test"}}]]')}`
            );
        });

        it('should return a promise', () => {
            const { result } = renderHook(() =>
                useFetch('ShopperBaskets', 'getBasket', { parameters: { basketId: 'test' } })
            );
            expect(result.current.load()).toBeInstanceOf(Promise);
        });

        it('should call the underlying fetcher.load for each invocation', () => {
            const { result } = renderHook(() =>
                useFetch('ShopperBaskets', 'getBasket', { parameters: { basketId: 'test' } })
            );

            act(() => {
                void result.current.load();
            });

            act(() => {
                void result.current.load();
            });

            // Both calls should trigger fetcher.load
            const resource = encodeBase64Url('["ShopperBaskets","getBasket",[{"parameters":{"basketId":"test"}}]]');
            expect(mockFetcher.load).toHaveBeenCalledTimes(2);
            expect(mockFetcher.load).toHaveBeenNthCalledWith(1, `/resource/api/client/${resource}`);
            expect(mockFetcher.load).toHaveBeenNthCalledWith(2, `/resource/api/client/${resource}`);
        });
    });

    describe('promise resolution', () => {
        it('should resolve promise when fetcher returns successful response', () => {
            const mockData = { success: true, data: { basketId: 'test-basket' } };

            const { result, rerender } = renderHook(() =>
                useFetch('ShopperBaskets', 'getBasket', { parameters: { basketId: 'test' } })
            );

            const promise = result.current.load();

            // Simulate fetcher state and data change, then trigger re-render
            mockFetcher.state = 'idle';
            mockFetcher.data = mockData;
            rerender();

            return expect(promise).resolves.toEqual({ basketId: 'test-basket' });
        });

        it('should reject promise when fetcher returns error response', () => {
            const mockData = { success: false, error: 'Basket not found' };

            const { result, rerender } = renderHook(() =>
                useFetch('ShopperBaskets', 'getBasket', { parameters: { basketId: 'test' } })
            );

            const promise = result.current.load();

            // Simulate fetcher state and data change, then trigger re-render
            mockFetcher.state = 'idle';
            mockFetcher.data = mockData;
            rerender();

            return expect(promise).rejects.toBe('Basket not found');
        });

        it('should reject promise when fetcher returns error response without error message', () => {
            const mockData = { success: false };

            const { result, rerender } = renderHook(() =>
                useFetch('ShopperBaskets', 'getBasket', { parameters: { basketId: 'test' } })
            );

            const promise = result.current.load();

            // Simulate fetcher state and data change, then trigger re-render
            mockFetcher.state = 'idle';
            mockFetcher.data = mockData;
            rerender();

            return expect(promise).rejects.toBeUndefined();
        });
    });

    describe('timeout handling', () => {
        it('should reject promise when timeout is reached', () => {
            const { result } = renderHook(() =>
                useFetch('ShopperBaskets', 'getBasket', { parameters: { basketId: 'test' } })
            );

            const promise = result.current.load({ timeoutMs: 1000 });

            act(() => {
                vi.advanceTimersByTime(1000);
            });

            return expect(promise).rejects.toEqual(new Error('Request timeout after 1000ms'));
        });

        it('should not set timeout when timeoutMs is negative', () => {
            const { result, rerender } = renderHook(() =>
                useFetch('ShopperBaskets', 'getBasket', { parameters: { basketId: 'test' } })
            );

            const promise = result.current.load({ timeoutMs: -1 });

            act(() => {
                vi.advanceTimersByTime(5000);
            });

            // Promise should still be pending since no timeout was set
            const mockData = { success: true, data: { basketId: 'test' } };
            mockFetcher.state = 'idle';
            mockFetcher.data = mockData;
            rerender();

            return expect(promise).resolves.toEqual({ basketId: 'test' });
        });

        it('should set timeout when timeoutMs is 0', () => {
            const { result, rerender } = renderHook(() =>
                useFetch('ShopperBaskets', 'getBasket', { parameters: { basketId: 'test' } })
            );

            const promise = result.current.load({ timeoutMs: 0 });

            act(() => {
                vi.advanceTimersByTime(5000);
            });

            // Promise should still be pending since no timeout was set
            const mockData = { success: true, data: { basketId: 'test' } };
            mockFetcher.state = 'idle';
            mockFetcher.data = mockData;
            rerender();

            return expect(promise).rejects.toEqual(new Error('Request timeout after 0ms'));
        });

        it('should clear the timeout when request completes before timeout', async () => {
            let timeoutId: ReturnType<typeof setTimeout> | null = null;
            const originalSetTimeout = setTimeout;
            vi.spyOn(globalThis, 'setTimeout').mockImplementation(
                (callback: (_: void) => void, delay?: number): ReturnType<typeof setTimeout> => {
                    timeoutId = originalSetTimeout(callback, delay);
                    return timeoutId;
                }
            );
            const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
            const mockData = { success: true, data: { basketId: 'test' } };

            const { result, rerender } = renderHook(() =>
                useFetch('ShopperBaskets', 'getBasket', { parameters: { basketId: 'test' } })
            );

            const promise = result.current.load({ timeoutMs: 5000 });

            mockFetcher.state = 'idle';
            mockFetcher.data = mockData;
            rerender();

            await promise;

            expect(clearTimeoutSpy).toHaveBeenCalledTimes(1);
            expect(clearTimeoutSpy).toHaveBeenCalledWith(timeoutId);
        });
    });

    describe('concurrent requests', () => {
        it('should handle multiple concurrent requests correctly', async () => {
            const { result, rerender } = renderHook(() =>
                useFetch('ShopperBaskets', 'getBasket', { parameters: { basketId: 'test' } })
            );

            const promise1 = result.current.load();
            const promise2 = result.current.load();

            // Only the second request should be active
            const mockData = { success: true, data: { basketId: 'test' } };
            mockFetcher.state = 'idle';
            mockFetcher.data = mockData;
            rerender();

            // First promise should not resolve since it was superseded
            await expect(
                Promise.race([promise1.then(() => 'resolved'), promise2.then(() => Promise.resolve('timeout'))])
            ).resolves.toBe('timeout');

            // Second promise should resolve
            return expect(promise2).resolves.toEqual({ basketId: 'test' });
        });

        it('should only resolve the active request when multiple requests are made', async () => {
            const { result, rerender } = renderHook(() =>
                useFetch('ShopperBaskets', 'getBasket', { parameters: { basketId: 'test' } })
            );

            const promise1 = result.current.load();
            const promise2 = result.current.load();
            const promise3 = result.current.load();

            const mockData = { success: true, data: { basketId: 'test' } };
            mockFetcher.state = 'idle';
            mockFetcher.data = mockData;
            rerender();

            // Only the last promise should resolve
            await expect(promise3).resolves.toEqual({ basketId: 'test' });

            // Earlier promises should not resolve
            await expect(
                Promise.race([
                    promise1.then(() => 'resolved'),
                    promise2.then(() => 'resolved'),
                    promise3.then(() => Promise.resolve('timeout')),
                ])
            ).resolves.toBe('timeout');
        });
    });

    describe('state management', () => {
        it('should expose fetcher state', () => {
            mockFetcher.state = 'loading';

            const { result } = renderHook(() =>
                useFetch('ShopperBaskets', 'getBasket', { parameters: { basketId: 'test' } })
            );

            expect(result.current.state).toBe('loading');
        });

        it('should update state when fetcher state changes', () => {
            const { result, rerender } = renderHook(() =>
                useFetch('ShopperBaskets', 'getBasket', { parameters: { basketId: 'test' } })
            );

            expect(result.current.state).toBe('idle');

            mockFetcher.state = 'loading';
            rerender();

            expect(result.current.state).toBe('loading');
        });
    });

    describe('cleanup', () => {
        it('should clear pending requests on unmount', () => {
            let timeoutId: ReturnType<typeof setTimeout> | null = null;
            const originalSetTimeout = setTimeout;
            vi.spyOn(globalThis, 'setTimeout').mockImplementation(
                (callback: (_: void) => void, delay?: number): ReturnType<typeof setTimeout> => {
                    timeoutId = originalSetTimeout(callback, delay);
                    return timeoutId;
                }
            );
            const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');

            const { result, unmount } = renderHook(() =>
                useFetch('ShopperBaskets', 'getBasket', { parameters: { basketId: 'test' } })
            );

            act(() => {
                void result.current.load({ timeoutMs: 5000 });
            });

            unmount();

            expect(clearTimeoutSpy).toHaveBeenCalledTimes(1);
            expect(clearTimeoutSpy).toHaveBeenCalledWith(timeoutId);
        });

        it('should not resolve promises after unmount', () => {
            const { result, unmount } = renderHook(() =>
                useFetch('ShopperBaskets', 'getBasket', { parameters: { basketId: 'test' } })
            );

            const promise = result.current.load();

            unmount();

            const mockData = { success: true, data: { basketId: 'test' } };
            mockFetcher.state = 'idle';
            mockFetcher.data = mockData;

            // After unmount, we can't call rerender, so we simulate the state change
            // The promise should not resolve after unmount
            return expect(
                Promise.race([promise.then(() => 'resolved'), Promise.resolve().then(() => Promise.resolve('timeout'))])
            ).resolves.toBe('timeout');
        });
    });
});
