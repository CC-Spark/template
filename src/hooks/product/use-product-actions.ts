/*
 * Copyright (c) 2025, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useSearchParams, useFetcher } from 'react-router';
import type { ShopperProductsTypes } from 'commerce-sdk-isomorphic';
import { useToast } from '@/components/toast';
import uiStrings from '@/temp-ui-string';

interface ProductSelectionValues {
    product: ShopperProductsTypes.Product;
    variant: ShopperProductsTypes.Variant;
    quantity: number;
}

interface UseProductActionsProps {
    product: ShopperProductsTypes.Product;
    isProductASet?: boolean;
    isProductABundle?: boolean;
    currentVariant?: ShopperProductsTypes.Variant | null;
    stockLevel?: number;
}

export function useProductActions({
    product,
    isProductASet = false,
    isProductABundle = false,
    currentVariant = null,
    stockLevel = 0,
}: UseProductActionsProps) {
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [searchParams, setSearchParams] = useSearchParams();

    // Toast notifications
    const { addToast } = useToast();

    // Fetchers for server actions
    const cartFetcher = useFetcher();
    const multipleItemsFetcher = useFetcher();
    const bundleFetcher = useFetcher();

    // Inventory and stock calculations
    const inventory = product.inventory;
    const actualStockLevel = stockLevel || inventory?.ats || 0;
    const isInStock = actualStockLevel > 0;
    const isOutOfStock = !isInStock;
    const unfulfillable = isInStock && actualStockLevel < quantity;

    // Check if variant is required but not selected
    const hasVariants = product.variationAttributes && product.variationAttributes.length > 0;

    // Can add to cart validation
    const canAddToCart = useMemo(() => {
        if (quantity <= 0) return false;

        if (quantity > actualStockLevel) return false;

        if (hasVariants) {
            if (currentVariant) {
                if (!currentVariant.orderable) return false;
            } else return false;
        } else {
            if (!product.inventory?.orderable) return false;
        }

        if (!isProductASet && !isProductABundle && !isInStock) return false;

        return true;
    }, [
        quantity,
        actualStockLevel,
        hasVariants,
        currentVariant,
        product.inventory?.orderable,
        isProductASet,
        isProductABundle,
        isInStock,
    ]);

    // Handle successful cart updates
    useEffect(() => {
        if (!isAddingToCart) {
            // Prevent toast fatigue
            return;
        }
        if (cartFetcher.data?.success && cartFetcher.data.basket) {
            setIsAddingToCart(false);
            addToast(uiStrings.product.addedToCart.replace('{productName}', product.name || 'product'), 'success');
        } else if (cartFetcher.data?.success === false) {
            addToast(uiStrings.product.failedToAddToCart.replace('{error}', cartFetcher.data.error), 'error');
            setIsAddingToCart(false);
        }
        //As addToast, setIsAddingToCart are unlikely to change, we don't need to include them in the dependency array
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAddingToCart, cartFetcher.data, product.name]);

    useEffect(() => {
        if (!isAddingToCart) {
            // Prevent toast fatigue
            return;
        }
        if (multipleItemsFetcher.data?.success && multipleItemsFetcher.data.basket) {
            setIsAddingToCart(false);
            addToast(uiStrings.product.addedSetToCart, 'success');
        } else if (multipleItemsFetcher.data?.success === false) {
            addToast(
                uiStrings.product.failedToAddItemsToCart.replace('{error}', multipleItemsFetcher.data.error),
                'error'
            );
            setIsAddingToCart(false);
        }
        //As addToast, setIsAddingToCart are unlikely to change, we don't need to include them in the dependency array
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAddingToCart, multipleItemsFetcher.data]);

    useEffect(() => {
        if (!isAddingToCart) {
            // Prevent toast fatigue
            return;
        }
        if (bundleFetcher.data?.success && bundleFetcher.data.basket) {
            setIsAddingToCart(false);
            addToast(uiStrings.product.addedBundleToCart, 'success');
        } else if (bundleFetcher.data?.success === false) {
            addToast(uiStrings.product.failedToAddBundleToCart.replace('{error}', bundleFetcher.data.error), 'error');
            setIsAddingToCart(false);
        }
        //As addToast, setIsAddingToCart are unlikely to change, we don't need to include them in the dependency array
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAddingToCart, bundleFetcher.data]);

    // Handle adding to cart
    const handleAddToCart = useCallback(
        async (
            selectedVariant: ShopperProductsTypes.Variant | ShopperProductsTypes.Product | null | undefined,
            _quantity: number = 1
        ) => {
            if (isAddingToCart) return;

            // Validate inputs
            if (!selectedVariant && !product.id) {
                addToast(uiStrings.product.failedToAddProductToCart, 'error');
                return;
            }

            if (_quantity <= 0) {
                addToast(uiStrings.product.failedToAddProductToCart, 'error');
                return;
            }

            setIsAddingToCart(true);

            try {
                const productItem = {
                    productId: selectedVariant?.productId || product.id,
                    quantity: _quantity,
                    price: selectedVariant?.price || product.price,
                };

                // Use server action to add item to cart
                await cartFetcher.submit(
                    { productItem: JSON.stringify(productItem) },
                    {
                        method: 'POST',
                        action: '/action/cart-item-add',
                    }
                );
            } catch {
                setIsAddingToCart(false);
                addToast(uiStrings.product.failedToAddProductToCart, 'error');
            }
        },
        [product, isAddingToCart, cartFetcher, addToast]
    );

    // Handle adding to wishlist
    //TODO: update this function when we work on wishlist
    const handleAddToWishlist = useCallback((_selectedVariant?: ShopperProductsTypes.Variant) => {
        setIsAddingToWishlist(true);

        // TODO: Implement actual add to wishlist API call
        // This will be implemented when wishlist functionality is added

        setIsAddingToWishlist(false);

        // TODO: Promise.resolve used to mimic future async behavior
        return Promise.resolve({ success: true });
    }, []);

    // Handle variant selection with URL updates
    const handleVariantSelection = useCallback(
        (variant: ShopperProductsTypes.Variant) => {
            if (variant?.productId && variant.productId !== product.id) {
                // Update URL with selected variant
                const newSearchParams = new URLSearchParams(searchParams);
                newSearchParams.set('pid', variant.productId);
                setSearchParams(newSearchParams);
            }
        },
        [product.id, searchParams, setSearchParams]
    );

    // Handle product set add to cart (multiple products)
    const handleProductSetAddToCart = useCallback(
        async (productSelections: ProductSelectionValues[]) => {
            if (isAddingToCart) return;

            // Validate inputs
            if (!productSelections || productSelections.length === 0) {
                addToast(uiStrings.product.failedToAddItemsToCartError, 'error');
                return;
            }

            setIsAddingToCart(true);

            try {
                const productItems = productSelections.map((selection) => ({
                    productId: selection.variant.productId || selection.product.id,
                    quantity: selection.quantity,
                    price: selection.variant.price || selection.product.price,
                }));

                // Use server action to add multiple items to cart
                await multipleItemsFetcher.submit(
                    { productItems: JSON.stringify(productItems) },
                    {
                        method: 'POST',
                        action: '/action/cart-set-add',
                    }
                );
            } catch {
                setIsAddingToCart(false);
                addToast(uiStrings.product.failedToAddItemsToCartError, 'error');
            }
        },
        [isAddingToCart, multipleItemsFetcher, addToast]
    );

    // Handle product bundle add to cart
    const handleProductBundleAddToCart = useCallback(
        async (
            _selectedVariant: ShopperProductsTypes.Variant | ShopperProductsTypes.Product,
            _quantity: number,
            childProductSelections: ProductSelectionValues[]
        ) => {
            if (isAddingToCart) return;

            // Validate inputs
            if (!product.id) {
                addToast(uiStrings.product.failedToAddBundleToCartError, 'error');
                return;
            }

            if (_quantity <= 0) {
                addToast(uiStrings.product.failedToAddBundleToCartError, 'error');
                return;
            }

            if (!childProductSelections || childProductSelections.length === 0) {
                addToast(uiStrings.product.failedToAddBundleToCartError, 'error');
                return;
            }

            setIsAddingToCart(true);

            try {
                const bundleItem = {
                    productId: product.id,
                    quantity: _quantity,
                    price: product.price,
                };

                const childSelections = childProductSelections.map((child) => ({
                    productId: child.variant.productId || child.product.id,
                    quantity: child.quantity,
                }));

                // Use server action to add bundle to cart
                await bundleFetcher.submit(
                    {
                        bundleItem: JSON.stringify(bundleItem),
                        childSelections: JSON.stringify(childSelections),
                    },
                    {
                        method: 'POST',
                        action: '/action/cart-bundle-add',
                    }
                );
            } catch {
                setIsAddingToCart(false);
                addToast(uiStrings.product.failedToAddBundleToCartError, 'error');
            }
        },
        [product, isAddingToCart, bundleFetcher, addToast]
    );

    return {
        // State
        isAddingToCart:
            isAddingToCart ||
            cartFetcher.state === 'submitting' ||
            multipleItemsFetcher.state === 'submitting' ||
            bundleFetcher.state === 'submitting',
        isAddingToWishlist,
        quantity,

        // Validation and inventory
        canAddToCart,
        isInStock,
        isOutOfStock,
        unfulfillable,
        hasVariants,
        stockLevel: actualStockLevel,

        // Actions
        handleAddToCart,
        handleAddToWishlist,
        handleVariantSelection,
        handleProductSetAddToCart,
        handleProductBundleAddToCart,
        setQuantity,
    };
}
