/*
 * Copyright (c) 2025, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { renderHook, act } from '@testing-library/react';
import type { ShopperProductsTypes } from 'commerce-sdk-isomorphic';
import { vi, type MockedFunction } from 'vitest';
import { useProductColorImage } from './use-product-color-image';

// Mock the image-groups-utils module
vi.mock('@/lib/image-groups-utils', () => ({
    findImageGroupBy: vi.fn(),
}));

import { findImageGroupBy } from '@/lib/image-groups-utils';

const mockFindImageGroupBy = findImageGroupBy as MockedFunction<typeof findImageGroupBy>;

describe('useProductColorImage', () => {
    const mockProduct: ShopperProductsTypes.Product = {
        id: 'test-product',
        name: 'Test Product',
        imageGroups: [
            {
                viewType: 'large',
                images: [
                    {
                        alt: 'Default image',
                        disBaseLink: 'https://example.com/default-large.jpg',
                        link: 'https://example.com/default-large.jpg',
                    },
                    {
                        alt: 'Default image 2',
                        disBaseLink: 'https://example.com/default-large-2.jpg',
                        link: 'https://example.com/default-large-2.jpg',
                    },
                ],
            },
            {
                viewType: 'medium',
                images: [
                    {
                        alt: 'Default medium',
                        disBaseLink: 'https://example.com/default-medium.jpg',
                        link: 'https://example.com/default-medium.jpg',
                    },
                ],
            },
        ],
    };

    const mockColorImageGroup: ShopperProductsTypes.ImageGroup = {
        viewType: 'large',
        variationAttributes: [
            {
                id: 'color',
                values: [{ value: 'red', name: 'Red' }],
            },
        ],
        images: [
            {
                alt: 'Red product image',
                disBaseLink: 'https://example.com/red-large.jpg',
                link: 'https://example.com/red-large.jpg',
            },
        ],
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('initialization', () => {
        it('should initialize with null selectedColor and default images', () => {
            const { result } = renderHook(() => useProductColorImage({ product: mockProduct }));

            expect(result.current.selectedColor).toBeNull();
            expect(result.current.galleryImages).toHaveLength(2);
            expect(result.current.galleryImages[0]).toEqual({
                src: 'https://example.com/default-large.jpg',
                alt: 'Default image',
                thumbSrc: 'https://example.com/default-large.jpg',
            });
        });

        it('should return empty gallery images when product has no image groups', () => {
            const productWithoutImages = { ...mockProduct, imageGroups: undefined };
            const { result } = renderHook(() => useProductColorImage({ product: productWithoutImages }));

            expect(result.current.galleryImages).toHaveLength(0);
        });

        it('should return empty gallery images when no large images exist', () => {
            const productWithoutLargeImages = {
                ...mockProduct,
                imageGroups: [
                    {
                        viewType: 'small',
                        images: [
                            {
                                alt: 'Small image',
                                disBaseLink: 'small.jpg',
                                link: 'small.jpg',
                            },
                        ],
                    },
                ],
            };
            const { result } = renderHook(() => useProductColorImage({ product: productWithoutLargeImages }));

            expect(result.current.galleryImages).toHaveLength(0);
        });
    });

    describe('color selection', () => {
        it('should update selectedColor when setSelectedColor is called', () => {
            const { result } = renderHook(() => useProductColorImage({ product: mockProduct }));

            act(() => {
                result.current.setSelectedColor('red');
            });

            expect(result.current.selectedColor).toBe('red');
        });

        it('should filter images by color when color is selected', () => {
            mockFindImageGroupBy.mockReturnValue(mockColorImageGroup);

            const { result } = renderHook(() => useProductColorImage({ product: mockProduct }));

            act(() => {
                result.current.setSelectedColor('red');
            });

            expect(mockFindImageGroupBy).toHaveBeenCalledWith(mockProduct.imageGroups, {
                viewType: 'large',
                selectedVariationAttributes: {
                    color: 'red',
                },
            });

            expect(result.current.galleryImages).toHaveLength(1);
            expect(result.current.galleryImages[0]).toEqual({
                src: 'https://example.com/red-large.jpg',
                alt: 'Red product image',
                thumbSrc: 'https://example.com/red-large.jpg',
            });
        });

        it('should fallback to default images when color selection returns no images', () => {
            mockFindImageGroupBy.mockReturnValue(undefined);

            const { result } = renderHook(() => useProductColorImage({ product: mockProduct }));

            act(() => {
                result.current.setSelectedColor('blue');
            });

            expect(result.current.galleryImages).toHaveLength(0);
        });

        it('should reset to default images when selectedColor is set to null', () => {
            mockFindImageGroupBy.mockReturnValue(mockColorImageGroup);

            const { result } = renderHook(() => useProductColorImage({ product: mockProduct }));

            // First select a color
            act(() => {
                result.current.setSelectedColor('red');
            });

            expect(result.current.galleryImages).toHaveLength(1);

            // Then reset to null
            act(() => {
                result.current.setSelectedColor(null);
            });

            expect(result.current.selectedColor).toBeNull();
            expect(result.current.galleryImages).toHaveLength(2);
        });
    });

    describe('getImagesForColor helper', () => {
        it('should return images for specified color without changing state', () => {
            mockFindImageGroupBy.mockReturnValue(mockColorImageGroup);

            const { result } = renderHook(() => useProductColorImage({ product: mockProduct }));

            const redImages = result.current.getImagesForColor('red');

            expect(mockFindImageGroupBy).toHaveBeenCalledWith(mockProduct.imageGroups, {
                viewType: 'large',
                selectedVariationAttributes: {
                    color: 'red',
                },
            });

            expect(redImages).toHaveLength(1);
            expect(redImages[0]).toEqual(mockColorImageGroup.images?.[0]);

            // State should not change
            expect(result.current.selectedColor).toBeNull();
        });

        it('should return default images when color is null', () => {
            const { result } = renderHook(() => useProductColorImage({ product: mockProduct }));

            const defaultImages = result.current.getImagesForColor(null);

            expect(defaultImages).toHaveLength(2);
            expect(defaultImages).toEqual(mockProduct.imageGroups?.[0].images);
        });

        it('should return empty array when no images exist for color', () => {
            mockFindImageGroupBy.mockReturnValue(undefined);

            const { result } = renderHook(() => useProductColorImage({ product: mockProduct }));

            const blueImages = result.current.getImagesForColor('blue');

            expect(blueImages).toHaveLength(0);
        });
    });

    describe('image transformation', () => {
        it('should transform images with disBaseLink', () => {
            const { result } = renderHook(() => useProductColorImage({ product: mockProduct }));

            expect(result.current.galleryImages[0].src).toBe('https://example.com/default-large.jpg');
            expect(result.current.galleryImages[0].thumbSrc).toBe('https://example.com/default-large.jpg');
        });

        it('should fallback to link when disBaseLink is not available', () => {
            const productWithLinkOnly = {
                ...mockProduct,
                imageGroups: [
                    {
                        viewType: 'large',
                        images: [
                            {
                                alt: 'Link only image',
                                link: 'https://example.com/link-only.jpg',
                            },
                        ],
                    },
                ],
            };

            const { result } = renderHook(() => useProductColorImage({ product: productWithLinkOnly }));

            expect(result.current.galleryImages[0].src).toBe('https://example.com/link-only.jpg');
            expect(result.current.galleryImages[0].thumbSrc).toBe('https://example.com/link-only.jpg');
        });

        it('should use empty string when no image URL is available', () => {
            const productWithNoUrls = {
                ...mockProduct,
                imageGroups: [
                    {
                        viewType: 'large',
                        images: [
                            {
                                alt: 'No URL image',
                                link: '',
                            },
                        ],
                    },
                ],
            };

            const { result } = renderHook(() => useProductColorImage({ product: productWithNoUrls }));

            expect(result.current.galleryImages[0].src).toBe('');
            expect(result.current.galleryImages[0].thumbSrc).toBe('');
        });

        it('should use product name as fallback alt text', () => {
            const productWithoutAlt = {
                ...mockProduct,
                imageGroups: [
                    {
                        viewType: 'large',
                        images: [
                            {
                                disBaseLink: 'https://example.com/no-alt.jpg',
                                link: 'https://example.com/no-alt.jpg',
                            },
                        ],
                    },
                ],
            };

            const { result } = renderHook(() => useProductColorImage({ product: productWithoutAlt }));

            expect(result.current.galleryImages[0].alt).toBe('Test Product');
        });

        it('should use default alt text when product name is not available', () => {
            const productWithoutName = {
                ...mockProduct,
                name: undefined,
                imageGroups: [
                    {
                        viewType: 'large',
                        images: [
                            {
                                disBaseLink: 'https://example.com/no-alt.jpg',
                                link: 'https://example.com/no-alt.jpg',
                            },
                        ],
                    },
                ],
            };

            const { result } = renderHook(() => useProductColorImage({ product: productWithoutName }));

            expect(result.current.galleryImages[0].alt).toBe('Product image');
        });
    });
});
