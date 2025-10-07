/*
 * Copyright (c) 2025, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

'use client';

import { useState, useCallback, useRef } from 'react';
import type { ShopperProductsTypes } from 'commerce-sdk-isomorphic';
import uiStrings from '@/temp-ui-string';

interface ChildProductSelection {
    product: ShopperProductsTypes.Product;
    variant: ShopperProductsTypes.Variant;
    quantity: number;
}

interface ChildProductOrderability {
    [productId: string]: {
        isOrderable: boolean;
        errorMessage?: string;
    };
}

interface UseProductSetsBundlesProps {
    product: ShopperProductsTypes.Product;
    isProductASet?: boolean;
    isProductABundle?: boolean;
}

export function useProductSetsBundles({
    product,
    isProductASet = false,
    isProductABundle = false,
}: UseProductSetsBundlesProps) {
    const [childProductSelection, setChildProductSelection] = useState<Record<string, ChildProductSelection>>({});
    const [childProductOrderability, setChildProductOrderability] = useState<ChildProductOrderability>({});
    const [selectedBundleQuantity, setSelectedBundleQuantity] = useState(1);
    const childProductRefs = useRef<Record<string, globalThis.HTMLElement>>({});

    // Get normalized product data for sets/bundles
    interface NormalizedComboProduct {
        childProducts?: ShopperProductsTypes.Product[];
    }

    const comboProduct: NormalizedComboProduct =
        isProductASet || isProductABundle ? normalizeSetBundleProduct(product) : ({} as NormalizedComboProduct);

    // Handle child product selection
    const handleChildProductSelection = useCallback((productId: string, selection: ChildProductSelection) => {
        setChildProductSelection((prev) => ({
            ...prev,
            [productId]: selection,
        }));
    }, []);

    // Handle child product orderability
    const handleChildProductOrderability = useCallback(
        (productId: string, orderability: { isOrderable: boolean; errorMessage?: string }) => {
            setChildProductOrderability((prev) => ({
                ...prev,
                [productId]: orderability,
            }));
        },
        []
    );

    // Validate all child products are selected and orderable
    const validateChildProducts = useCallback(() => {
        const childProducts = comboProduct.childProducts || [];

        for (const childProduct of childProducts) {
            const productId = childProduct.product.id;
            const selection = childProductSelection[productId];
            const orderability = childProductOrderability[productId];

            // Check if product is selected
            if (!selection) {
                return {
                    isValid: false,
                    errorMessage: uiStrings.product.pleaseSelectOptionsFor.replace(
                        '{productName}',
                        childProduct.product.name || 'product'
                    ),
                    firstUnselectedProduct: childProduct.product,
                };
            }

            // Check if product is orderable
            if (orderability && !orderability.isOrderable) {
                return {
                    isValid: false,
                    errorMessage:
                        orderability.errorMessage ||
                        uiStrings.product.productNotOrderable.replace(
                            '{productName}',
                            childProduct.product.name || 'product'
                        ),
                    firstUnselectedProduct: childProduct.product,
                };
            }
        }

        return { isValid: true };
    }, [comboProduct.childProducts, childProductSelection, childProductOrderability]);

    // Handle child product validation with scrolling
    const handleChildProductValidation = useCallback(() => {
        const validation = validateChildProducts();

        if (!validation.isValid && validation.firstUnselectedProduct) {
            // Scroll to first unselected product
            const productRef = childProductRefs.current[validation.firstUnselectedProduct.id];
            if (productRef?.scrollIntoView) {
                productRef.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                });
            }

            return false;
        }

        return true;
    }, [validateChildProducts]);

    // Get all selected child products for add to cart
    const getSelectedChildProducts = useCallback(() => {
        return Object.values(childProductSelection);
    }, [childProductSelection]);

    // Check if all child products are selected
    const areAllChildProductsSelected = useCallback(() => {
        const childProducts = comboProduct.childProducts || [];
        return childProducts.every((childProduct) => childProductSelection[childProduct.id]);
    }, [comboProduct.childProducts, childProductSelection]);

    // Check if any child product is out of stock or not orderable
    const hasUnorderableChildProducts = useCallback(() => {
        return Object.values(childProductOrderability).some((orderability) => !orderability.isOrderable);
    }, [childProductOrderability]);

    return {
        // State
        childProductSelection,
        childProductOrderability,
        selectedBundleQuantity,
        childProductRefs,
        comboProduct,

        // Actions
        setChildProductSelection: handleChildProductSelection,
        setChildProductOrderability: handleChildProductOrderability,
        setSelectedBundleQuantity,
        handleChildProductValidation,

        // Utils
        validateChildProducts,
        getSelectedChildProducts,
        areAllChildProductsSelected: areAllChildProductsSelected(),
        hasUnorderableChildProducts: hasUnorderableChildProducts(),

        // Computed values
        selectedChildProductCount: Object.keys(childProductSelection).length,
        totalChildProducts: comboProduct.childProducts?.length || 0,
    };
}

// Helper function to normalize set/bundle product data
// This matches the logic from the original implementation
function normalizeSetBundleProduct(product: ShopperProductsTypes.Product): {
    childProducts: ShopperProductsTypes.Product[];
} {
    if (!product.type?.set && !product.type?.bundle) {
        return { childProducts: [] };
    }

    let childProducts: ShopperProductsTypes.Product[] = [];

    if (product.type.set && product.setProducts) {
        childProducts = product.setProducts.map((setProduct) => ({
            ...setProduct.product,
            quantity: 1,
        }));
    } else if (product.type.bundle && product.bundledProducts) {
        childProducts = product.bundledProducts.map((bundleProduct) => ({
            ...bundleProduct.product,
            quantity: bundleProduct.quantity || 1,
        }));
    }

    return { childProducts };
}
