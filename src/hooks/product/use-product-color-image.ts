/*
 * Copyright (c) 2025, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

'use client';

import { useState, useMemo, useCallback } from 'react';
import type { ShopperProductsTypes } from 'commerce-sdk-isomorphic';
import type { GalleryImage } from '@/components/image-gallery';
import { getImagesForColor } from '@/lib/product-utils';

interface UseProductColorImageProps {
    product: ShopperProductsTypes.Product;
}

interface UseProductColorImageReturn {
    selectedColor: string | null;
    setSelectedColor: (color: string | null) => void;
    galleryImages: GalleryImage[];
    getImagesForColor: (color: string | null) => ShopperProductsTypes.Image[];
}

/**
 * Custom hook for managing product color selection and filtered images
 *
 * This hook provides:
 * - State management for selected color
 * - Filtered images based on color selection (always uses 'large' viewType)
 * - Helper function to get images for any color
 */
export function useProductColorImage({ product }: UseProductColorImageProps): UseProductColorImageReturn {
    // State to track selected color for image filtering
    const [selectedColor, setSelectedColor] = useState<string | null>(null);

    // Get images filtered by selected color
    const filteredImages = useMemo(() => getImagesForColor(product, selectedColor), [product, selectedColor]);

    // Helper function to get images for any color (useful for previews)
    const getImagesForColorCallback = useCallback(
        (color: string | null) => getImagesForColor(product, color),
        [product]
    );

    // Transform Commerce SDK images to GalleryImage format
    const galleryImages: GalleryImage[] = useMemo(() => {
        if (!filteredImages || filteredImages.length === 0) {
            return [];
        }

        return filteredImages.map((image: ShopperProductsTypes.Image) => ({
            src: image.disBaseLink || image.link || '',
            alt: image.alt || product.name || 'Product image',
            thumbSrc: image.disBaseLink || image.link || '',
        }));
    }, [filteredImages, product.name]);

    return {
        selectedColor,
        setSelectedColor,
        galleryImages,
        getImagesForColor: getImagesForColorCallback,
    };
}
