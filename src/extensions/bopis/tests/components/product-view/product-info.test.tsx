/*
 * Copyright (c) 2025, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

// Testing libraries
import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
// React Router
import { createMemoryRouter, RouterProvider } from 'react-router';
// Components
import ProductInfo from '@/components/product-view/product-info';
import ProductViewProvider from '@/providers/product-view';
import { AllProvidersWrapper } from '@/test-utils/context-provider';
// mock data
import { masterProduct as mockProduct } from '@/components/__mocks__/master-variant-product';

describe('ProductInfo - BOPIS', () => {
    describe('delivery options', () => {
        test('should render DeliveryOptions in normal (add) mode', () => {
            const simpleProduct = {
                ...mockProduct,
                variationAttributes: [],
            };

            // Using createMemoryRouter in framework mode is fine
            // because both framework and data routers share the same underlying architecture, so it provides a valid navigation context for hooks and <Link>.
            // Even though it's listed under "data routers," it fully supports testing non-route components that rely on router behavior.
            const router = createMemoryRouter(
                [
                    {
                        path: '/product/:productId',
                        element: (
                            <AllProvidersWrapper>
                                <ProductViewProvider product={simpleProduct}>
                                    <ProductInfo product={simpleProduct} />
                                </ProductViewProvider>
                            </AllProvidersWrapper>
                        ),
                    },
                    // Catch-all route to prevent 404 errors when navigating
                    {
                        path: '*',
                        element: <div>Navigated</div>,
                    },
                ],
                {
                    initialEntries: ['/product/test-product'],
                }
            );
            render(<RouterProvider router={router} />);

            // DeliveryOptions should be rendered in normal mode
            // Check for text that exists in DeliveryOptions component
            expect(screen.getByText(/Delivery:/i)).toBeInTheDocument();
            expect(screen.getByText(/Ship to Address/i)).toBeInTheDocument();
        });

        test('should not render DeliveryOptions in edit mode without basketPickupStore', () => {
            const simpleProduct = {
                ...mockProduct,
                variationAttributes: [],
            };

            // In edit mode without basket context/itemId, basketPickupStore is undefined
            const router = createMemoryRouter(
                [
                    {
                        path: '/product/:productId',
                        element: (
                            <AllProvidersWrapper>
                                <ProductViewProvider product={simpleProduct} mode="edit">
                                    <ProductInfo product={simpleProduct} />
                                </ProductViewProvider>
                            </AllProvidersWrapper>
                        ),
                    },
                ],
                {
                    initialEntries: ['/product/test-product'],
                }
            );
            render(<RouterProvider router={router} />);

            // DeliveryOptions hidden in edit mode when no basket pickup store exists
            expect(screen.queryByText(/Delivery:/i)).not.toBeInTheDocument();
            expect(screen.queryByText(/Ship to Address/i)).not.toBeInTheDocument();
        });
    });
});
