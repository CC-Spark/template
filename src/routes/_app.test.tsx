/**
 * Copyright 2026 Salesforce, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { createRoutesStub } from 'react-router';
import type { ShopperProducts } from '@salesforce/storefront-next-runtime/scapi';
import DefaultLayout from './_app';

// Mock components
vi.mock('@/components/header', () => ({
    default: ({ children }: { children?: React.ReactNode }) => <header data-testid="header">{children}</header>,
}));

vi.mock('@/components/footer', () => ({
    default: () => <footer data-testid="footer">Footer</footer>,
}));

vi.mock('@/components/navigation-menu-mega', () => ({
    default: ({ resolve, defer }: { resolve?: unknown; defer?: unknown }) => (
        <nav data-testid="navigation-menu-mega" data-has-resolve={!!resolve} data-has-defer={!!defer}>
            Navigation
        </nav>
    ),
}));

describe('_app.tsx - Default Layout Route', () => {
    const mockCategory: ShopperProducts.schemas['Category'] = {
        id: 'root',
        name: 'Root Category',
    };

    const mockSubCategories: ShopperProducts.schemas['Category'][] = [
        { id: 'sub1', name: 'Sub Category 1' },
        { id: 'sub2', name: 'Sub Category 2' },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render Header, main content area, and Footer', async () => {
        const Stub = createRoutesStub([
            {
                id: 'root',
                path: '/',
                Component: DefaultLayout,
                loader: () => ({
                    root: Promise.resolve(mockCategory),
                    subs: Promise.resolve(mockSubCategories),
                }),
                children: [
                    {
                        index: true,
                        Component: () => <div data-testid="child-content">Child Route Content</div>,
                    },
                ],
            },
        ]);

        render(<Stub initialEntries={['/']} />);

        await waitFor(() => {
            // Verify layout structure
            expect(screen.getByTestId('header')).toBeInTheDocument();
            expect(screen.getByTestId('footer')).toBeInTheDocument();
            expect(screen.getByTestId('navigation-menu-mega')).toBeInTheDocument();

            // Verify child content is rendered via Outlet
            expect(screen.getByTestId('child-content')).toBeInTheDocument();
        });
    });

    it('should render main element with correct styling', async () => {
        const Stub = createRoutesStub([
            {
                id: 'root',
                path: '/',
                Component: DefaultLayout,
                loader: () => ({
                    root: Promise.resolve(mockCategory),
                    subs: Promise.resolve(mockSubCategories),
                }),
                children: [
                    {
                        index: true,
                        Component: () => <div>Content</div>,
                    },
                ],
            },
        ]);

        render(<Stub initialEntries={['/']} />);

        await waitFor(() => {
            const main = screen.getByRole('main');
            expect(main).toBeInTheDocument();
            expect(main).toHaveClass('grow', 'pt-8');
        });
    });

    it('should pass category data to CategoryNavigationMenuMega', async () => {
        const Stub = createRoutesStub([
            {
                id: 'root',
                path: '/',
                Component: DefaultLayout,
                loader: () => ({
                    root: Promise.resolve(mockCategory),
                    subs: Promise.resolve(mockSubCategories),
                }),
                children: [
                    {
                        index: true,
                        Component: () => <div>Content</div>,
                    },
                ],
            },
        ]);

        render(<Stub initialEntries={['/']} />);

        await waitFor(() => {
            const nav = screen.getByTestId('navigation-menu-mega');
            expect(nav).toHaveAttribute('data-has-resolve', 'true');
            expect(nav).toHaveAttribute('data-has-defer', 'true');
        });
    });

    it('should handle missing root loader data gracefully', async () => {
        const Stub = createRoutesStub([
            {
                id: 'root',
                path: '/',
                Component: DefaultLayout,
                loader: () => ({
                    // No root or subs data
                }),
                children: [
                    {
                        index: true,
                        Component: () => <div data-testid="child-content">Content</div>,
                    },
                ],
            },
        ]);

        render(<Stub initialEntries={['/']} />);

        await waitFor(() => {
            // Layout should still render
            expect(screen.getByTestId('header')).toBeInTheDocument();
            expect(screen.getByTestId('footer')).toBeInTheDocument();
            expect(screen.getByTestId('child-content')).toBeInTheDocument();

            // Navigation should render but without data
            const nav = screen.getByTestId('navigation-menu-mega');
            expect(nav).toHaveAttribute('data-has-resolve', 'false');
            expect(nav).toHaveAttribute('data-has-defer', 'false');
        });
    });

    it('should preserve category refs across re-renders', async () => {
        const Stub = createRoutesStub([
            {
                id: 'root',
                path: '/',
                Component: DefaultLayout,
                loader: () => ({
                    root: Promise.resolve(mockCategory),
                    subs: Promise.resolve(mockSubCategories),
                }),
                children: [
                    {
                        index: true,
                        Component: () => <div>Content</div>,
                    },
                ],
            },
        ]);

        const { rerender } = render(<Stub initialEntries={['/']} />);

        await waitFor(() => {
            // First render should have data
            expect(screen.getByTestId('navigation-menu-mega')).toHaveAttribute('data-has-resolve', 'true');
        });

        // Re-render should preserve the refs
        rerender(<Stub initialEntries={['/']} />);
        await waitFor(() => {
            expect(screen.getByTestId('navigation-menu-mega')).toHaveAttribute('data-has-resolve', 'true');
        });
    });
});
