/**
 * PageViewTracker Component Tests
 *
 * Tests the page view tracking functionality including:
 * - Page view event tracking
 * - Blocklist functionality
 * - Duplicate tracking prevention
 * - User context handling
 * - Error handling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { PageViewTracker } from './page-view-tracker';
import type { SessionData } from '@/lib/api/types';
import { createEvent, sendViewPageEvent, getEventMediator } from '@salesforce/storefront-next-runtime/events';
import { getAllAdapters } from '@/lib/adapters';
import { initializeEngagementAdapters } from '@/adapters';
import { ensureAdaptersInitialized } from '@/lib/adapters/initialize-adapters';

// Mock dependencies
const mockUseAuth = vi.fn();
const mockUseConfig = vi.fn();

// Don't mock useLocation - let it use the actual router location

vi.mock('@/providers/auth', () => ({
    useAuth: () => mockUseAuth(),
}));

vi.mock('@/config', () => ({
    useConfig: () => mockUseConfig(),
}));

// Mock dynamic imports - these are loaded asynchronously
vi.mock('@salesforce/storefront-next-runtime/events', async () => {
    const actual = await vi.importActual('@salesforce/storefront-next-runtime/events');
    return {
        ...actual,
        createEvent: vi.fn(),
        sendViewPageEvent: vi.fn(),
        getEventMediator: vi.fn(),
    };
});

vi.mock('@/lib/adapters', () => ({
    getAllAdapters: vi.fn(),
}));

vi.mock('@/adapters', () => ({
    initializeEngagementAdapters: vi.fn(),
}));

vi.mock('@/lib/adapters/initialize-adapters', () => ({
    ensureAdaptersInitialized: vi.fn(),
}));

describe('PageViewTracker', () => {
    const mockEventMediator = {
        track: vi.fn(),
    };

    const mockEvent = {
        eventType: 'view_page' as const,
        path: '/test-page',
        payload: {
            userType: 'guest' as const,
            usid: undefined,
        },
    };

    const defaultConfig = {
        engagement: {
            analytics: {
                pageViewsBlocklist: [],
            },
        },
    };

    beforeEach(() => {
        vi.clearAllMocks();

        // Setup default mocks
        mockUseAuth.mockReturnValue(undefined);
        mockUseConfig.mockReturnValue(defaultConfig);

        // Setup dynamic import mocks
        vi.mocked(createEvent).mockReturnValue(mockEvent);
        vi.mocked(sendViewPageEvent).mockImplementation(() => {});
        vi.mocked(getAllAdapters).mockReturnValue([]);
        vi.mocked(initializeEngagementAdapters).mockResolvedValue(undefined);
        vi.mocked(ensureAdaptersInitialized).mockResolvedValue(undefined);
        vi.mocked(getEventMediator).mockReturnValue(mockEventMediator);

        // Ensure window is defined (client-side)
        Object.defineProperty(window, 'window', {
            value: globalThis,
            writable: true,
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    const renderPageViewTracker = (initialPath = '/test-page') => {
        const router = createMemoryRouter(
            [
                {
                    path: '*',
                    element: <PageViewTracker />,
                },
            ],
            {
                initialEntries: [initialPath],
            }
        );

        return { ...render(<RouterProvider router={router} />), router };
    };

    describe('Basic tracking', () => {
        it('should track page view for guest user', async () => {
            mockUseAuth.mockReturnValue(undefined);
            mockUseConfig.mockReturnValue(defaultConfig);

            renderPageViewTracker('/test-page');

            await waitFor(() => {
                expect(createEvent).toHaveBeenCalledWith('view_page', {
                    path: '/test-page',
                    payload: {
                        userType: 'guest',
                        usid: undefined,
                    },
                });
            });

            await waitFor(() => {
                expect(sendViewPageEvent).toHaveBeenCalledWith(mockEvent, mockEventMediator);
            });
        });

        it('should track page view for registered user', async () => {
            const mockAuth: SessionData = {
                access_token: 'test-token',
                customer_id: 'test-customer',
                usid: 'test-usid',
                userType: 'registered',
            };

            mockUseAuth.mockReturnValue(mockAuth);
            mockUseConfig.mockReturnValue(defaultConfig);

            renderPageViewTracker('/test-page');

            await waitFor(() => {
                expect(createEvent).toHaveBeenCalledWith('view_page', {
                    path: '/test-page',
                    payload: {
                        userType: 'registered',
                        usid: 'test-usid',
                    },
                });
            });

            await waitFor(() => {
                expect(sendViewPageEvent).toHaveBeenCalledWith(mockEvent, mockEventMediator);
            });
        });
    });

    describe('Blocklist functionality', () => {
        it('should not track page views for blocked paths', async () => {
            mockUseAuth.mockReturnValue(undefined);
            mockUseConfig.mockReturnValue({
                engagement: {
                    analytics: {
                        pageViewsBlocklist: ['/action'],
                    },
                },
            });

            renderPageViewTracker('/action/cart-item-remove');

            // Wait a bit to ensure tracking doesn't happen
            await new Promise((resolve) => setTimeout(resolve, 100));

            expect(createEvent).not.toHaveBeenCalled();
            expect(sendViewPageEvent).not.toHaveBeenCalled();
        });
    });

    describe('Duplicate tracking prevention', () => {
        it('should not track the same path twice', async () => {
            mockUseAuth.mockReturnValue(undefined);
            mockUseConfig.mockReturnValue(defaultConfig);

            const { router } = renderPageViewTracker('/test-page');

            await waitFor(() => {
                expect(createEvent).toHaveBeenCalledTimes(1);
            });

            // Navigate to the same path
            await router.navigate('/test-page');

            // Wait a bit to ensure no duplicate tracking
            await new Promise((resolve) => setTimeout(resolve, 100));

            expect(createEvent).toHaveBeenCalledTimes(1);
        });

        it('should track different paths separately', async () => {
            mockUseAuth.mockReturnValue(undefined);
            mockUseConfig.mockReturnValue(defaultConfig);

            const { router } = renderPageViewTracker('/page1');

            await waitFor(() => {
                expect(createEvent).toHaveBeenCalledTimes(1);
            });

            // Navigate to a different path
            await router.navigate('/page2');

            await waitFor(
                () => {
                    expect(createEvent).toHaveBeenCalledTimes(2);
                },
                { timeout: 2000 }
            );
        });

        it('should track same pathname with different query params separately', async () => {
            mockUseAuth.mockReturnValue(undefined);
            mockUseConfig.mockReturnValue(defaultConfig);

            const { router } = renderPageViewTracker('/test-page?param1=value1');

            await waitFor(() => {
                expect(createEvent).toHaveBeenCalledTimes(1);
            });

            // Navigate with different query params
            await router.navigate('/test-page?param2=value2');

            await waitFor(
                () => {
                    expect(createEvent).toHaveBeenCalledTimes(2);
                },
                { timeout: 2000 }
            );
        });
    });

    describe('Error handling', () => {
        it('should skip tracking when analytics initialization fails', async () => {
            // Make getEventMediator return undefined
            vi.mocked(getEventMediator).mockReturnValue(undefined);
            mockUseAuth.mockReturnValue(undefined);
            mockUseConfig.mockReturnValue(defaultConfig);

            renderPageViewTracker('/test-page');

            // Wait a bit to ensure no tracking happens
            await new Promise((resolve) => setTimeout(resolve, 100));

            // Should not have called createEvent or sendViewPageEvent
            expect(createEvent).not.toHaveBeenCalled();
            expect(sendViewPageEvent).not.toHaveBeenCalled();
        });

        it('should handle sendPageViewEvent errors gracefully', async () => {
            const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

            // Make sendViewPageEvent throw an error
            vi.mocked(sendViewPageEvent).mockImplementation(() => {
                throw new Error('Send failed');
            });

            mockUseAuth.mockReturnValue(undefined);
            mockUseConfig.mockReturnValue(defaultConfig);

            renderPageViewTracker('/test-page');

            await waitFor(() => {
                expect(createEvent).toHaveBeenCalled();
            });

            // Wait for error handling
            await new Promise((resolve) => setTimeout(resolve, 100));

            // In dev mode, should warn
            if (import.meta.env.DEV) {
                expect(consoleWarnSpy).toHaveBeenCalledWith(
                    'Failed to load and send page view tracking:',
                    expect.any(Error)
                );
            }

            consoleWarnSpy.mockRestore();
        });
    });

    describe('User context', () => {
        it('should use guest when userType is undefined', async () => {
            const mockAuth = {
                usid: 'test-usid',
                userType: undefined,
            };

            mockUseAuth.mockReturnValue(mockAuth);
            mockUseConfig.mockReturnValue(defaultConfig);

            renderPageViewTracker('/test-page');

            await waitFor(() => {
                expect(createEvent).toHaveBeenCalledWith('view_page', {
                    path: '/test-page',
                    payload: {
                        userType: 'guest',
                        usid: 'test-usid',
                    },
                });
            });

            await waitFor(() => {
                expect(sendViewPageEvent).toHaveBeenCalledWith(mockEvent, mockEventMediator);
            });
        });

        it('should handle undefined usid gracefully', async () => {
            const mockAuth: SessionData = {
                access_token: 'test-token',
                customer_id: 'test-customer',
                userType: 'registered',
                usid: undefined,
            };

            mockUseAuth.mockReturnValue(mockAuth);
            mockUseConfig.mockReturnValue(defaultConfig);

            renderPageViewTracker('/test-page');

            await waitFor(() => {
                expect(createEvent).toHaveBeenCalledWith('view_page', {
                    path: '/test-page',
                    payload: {
                        userType: 'registered',
                        usid: undefined,
                    },
                });
            });

            await waitFor(() => {
                expect(sendViewPageEvent).toHaveBeenCalledWith(mockEvent, mockEventMediator);
            });
        });
    });

    describe('Component rendering', () => {
        it('should render nothing (returns null)', () => {
            const { container } = renderPageViewTracker('/test-page');
            expect(container.firstChild).toBeNull();
        });
    });
});
