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
import { vi, test, describe, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { type ShopperSearch } from '@salesforce/storefront-next-runtime/scapi';
import { ConfigWrapper } from '@/test-utils/config';
import { CurrencyProvider } from '@/providers/currency';
import ProductGrid from './index';

const addSourceSpy = vi.fn();
const hasSourceSpy = vi.fn();

vi.mock('@/providers/dynamic-image', async (importOriginal) => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    const original = await importOriginal<typeof import('@/providers/dynamic-image')>();
    return {
        ...original,
        useDynamicImageContext: () => {
            // Get the real context value
            const originalContext = original.useDynamicImageContext();
            // Wrap `addSource` to spy on calls while preserving original behavior
            return {
                ...originalContext,
                addSource: (src: string) => {
                    const result = originalContext?.addSource(src);
                    addSourceSpy(src, result);
                    return result;
                },
                hasSource: (src: string) => {
                    const result = originalContext?.hasSource(src);
                    hasSourceSpy(src, result);
                    return result;
                },
            };
        },
    };
});

vi.mock('@/lib/product-utils', () => ({
    createProductUrl: vi.fn(() => '/product/test-product'),
    getImagesForColor: vi.fn((product, color) => {
        const colorSuffix = color || 'default';
        return [
            {
                link: `https://example.com/${product.productId}-${colorSuffix}.jpg`,
                disBaseLink: `https://example.com/${product.productId}-${colorSuffix}.jpg`,
                alt: `${product.productName} Image`,
            },
        ];
    }),
    getDecoratedVariationAttributes: vi.fn(() => [
        {
            id: 'color',
            name: 'Colour',
            values: [
                {
                    value: 'navy',
                    name: 'Navy',
                    swatch: { link: 'https://example.com/navy.jpg', disBaseLink: 'https://example.com/navy.jpg' },
                },
            ],
        },
    ]),
}));

vi.mock('@/lib/currency', () => ({
    formatCurrency: vi.fn((price) => `$${price}`),
}));

vi.mock('@/lib/product-badges', () => ({
    getProductBadges: vi.fn(() => ({
        hasBadges: false,
        badges: [],
    })),
}));

const createMockProduct = (id: string, name: string): ShopperSearch.schemas['ProductSearchHit'] => ({
    productId: id,
    productName: name,
    price: 99.99,
    variationAttributes: [
        {
            id: 'color',
            values: [{ value: 'navy', name: 'Navy' }],
        },
    ],
    imageGroups: [
        {
            viewType: 'medium',
            images: [
                {
                    alt: `${name} image`,
                    link: `https://example.com/${id}.jpg`,
                    disBaseLink: `https://example.com/${id}.jpg`,
                },
            ],
        },
    ],
});

const mockProducts = [
    createMockProduct('product-1', 'Product One'),
    createMockProduct('product-2', 'Product Two'),
    createMockProduct('product-3', 'Product Three'),
];

const renderComponent = (
    props: {
        products?: ShopperSearch.schemas['ProductSearchHit'][];
        handleProductClick?: (product: ShopperSearch.schemas['ProductSearchHit']) => void;
    } = {}
) => {
    const router = createMemoryRouter(
        [
            {
                path: '/test',
                element: (
                    <ConfigWrapper>
                        <CurrencyProvider value="USD">
                            <ProductGrid
                                products={props.products ?? mockProducts}
                                handleProductClick={props.handleProductClick}
                            />
                        </CurrencyProvider>
                    </ConfigWrapper>
                ),
            },
            {
                path: '/product/:productId',
                element: <div>Product Page</div>,
            },
            {
                path: '*',
                element: <div>Navigated</div>,
            },
        ],
        { initialEntries: ['/test'] }
    );
    return render(<RouterProvider router={router} />);
};

describe('ProductGrid', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('renders all products in the grid', () => {
        renderComponent();

        expect(screen.getByText('Product One')).toBeInTheDocument();
        expect(screen.getByText('Product Two')).toBeInTheDocument();
        expect(screen.getByText('Product Three')).toBeInTheDocument();
    });

    test('displays empty state message when no products', () => {
        renderComponent({ products: [] });

        expect(screen.getByText('No products found.')).toBeInTheDocument();
    });

    test('calls handleProductClick when product is clicked', async () => {
        const user = userEvent.setup();
        const handleProductClick = vi.fn();
        renderComponent({ handleProductClick });

        const productLink = screen.getByRole('link', { name: 'Product One' });
        await user.click(productLink);

        expect(handleProductClick).toHaveBeenCalledWith(mockProducts[0]);
    });
});

describe('ProductGrid DynamicImageProvider Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('Verify calls to the DynamicImageProvider context from nested components', () => {
        renderComponent();

        // Verify `addSource` was called by each ProductTile with its image URL
        expect(addSourceSpy).toHaveBeenCalledTimes(3);
        expect(addSourceSpy).toHaveBeenCalledWith('https://example.com/product-1-default.jpg', expect.any(Boolean));
        expect(addSourceSpy).toHaveBeenCalledWith('https://example.com/product-2-default.jpg', expect.any(Boolean));
        expect(addSourceSpy).toHaveBeenCalledWith('https://example.com/product-3-default.jpg', expect.any(Boolean));

        // Verify `hasSource` was called by each DynamicImage to check priority
        expect(hasSourceSpy).toHaveBeenCalledTimes(3);
        expect(hasSourceSpy).toHaveBeenCalledWith('https://example.com/product-1-default.jpg', expect.any(Boolean));
        expect(hasSourceSpy).toHaveBeenCalledWith('https://example.com/product-2-default.jpg', expect.any(Boolean));
        expect(hasSourceSpy).toHaveBeenCalledWith('https://example.com/product-3-default.jpg', expect.any(Boolean));

        // Verify return values: first call returns true, others return false
        expect(addSourceSpy.mock.calls[0][1]).toBe(true); // First image gets priority
        expect(addSourceSpy.mock.calls[1][1]).toBe(false);
        expect(addSourceSpy.mock.calls[2][1]).toBe(false);

        // Verify return values: first image was added as priority, so hasSource returns true for it
        expect(hasSourceSpy.mock.calls[0][1]).toBe(true); // First image is in the set
        expect(hasSourceSpy.mock.calls[1][1]).toBe(false); // Others are not (addSource returned false)
        expect(hasSourceSpy.mock.calls[2][1]).toBe(false);
    });
});
