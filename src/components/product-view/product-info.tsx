/*
 * Copyright (c) 2025, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

'use client';

import { type ReactElement } from 'react';
import type { ShopperProductsTypes } from 'commerce-sdk-isomorphic';
import ProductQuantityPicker from '@/components/product-quantity-picker';
import { useToast } from '@/components/toast';
import { Button } from '@/components/ui/button';
import ProductAttributeSelector from '@/components/product-attribute-selector';
import { useProductActions } from '@/hooks/product/use-product-actions';
import { useVariantSelection } from '@/hooks/product/use-variant-selection';
import uiStrings from '@/temp-ui-string';
import ProductPrice from '../product-price';

interface ProductInfoProps {
    product: ShopperProductsTypes.Product;
    isProductASet?: boolean;
    isProductABundle?: boolean;
    onColorChange?: (colorValue: string | null) => void;
}

export default function ProductInfo({
    product,
    isProductASet = false,
    isProductABundle = false,
    onColorChange,
}: ProductInfoProps): ReactElement {
    // Use variant selection hook
    const { currentVariant, selectedAttributes, isVariantFullySelected, handleAttributeChange, getAvailableValues } =
        useVariantSelection({
            product,
        });

    // Inventory and stock calculations
    const inventory = product.inventory;

    // Use product actions hook
    const {
        isAddingToCart,
        isAddingToWishlist,
        quantity,
        canAddToCart,
        isOutOfStock,
        hasVariants,
        stockLevel,
        handleAddToCart,
        handleAddToWishlist,
        setQuantity,
    } = useProductActions({
        product,
        isProductASet,
        isProductABundle,
        currentVariant,
        stockLevel: inventory?.ats || 0,
    });

    const { addToast } = useToast();

    const onAddToCart = async () => {
        const productToAdd = hasVariants ? currentVariant : product;

        try {
            await handleAddToCart(productToAdd, quantity);
        } catch {
            addToast(uiStrings.product.failedToAddProductToCartError, 'error');
        }
    };

    const onAddToWishlist = async () => {
        const productToAdd = hasVariants ? currentVariant || product : product;
        try {
            await handleAddToWishlist(productToAdd as ShopperProductsTypes.Variant);
        } catch {
            addToast(uiStrings.product.failedToAddProductToWishlistError, 'error');
        }
    };

    // Convert variation attributes to the format expected by ProductAttributeSelector
    const productAttributes =
        product.variationAttributes?.map((attr) => ({
            id: attr.id,
            name: attr.name || '',
            values: getAvailableValues(attr.id).map((value) => ({
                value: value.value,
                name: value.name || String(value.value),
                orderable: value.orderable,
            })),
        })) || [];

    return (
        <div className="space-y-6">
            {/* Desktop Product Title - hidden on mobile */}
            <div className="hidden md:block">
                <h1 className="text-3xl font-bold text-foreground">{product.name}</h1>
                {product.shortDescription && (
                    <p className="mt-2 text-lg text-muted-foreground">{product.shortDescription}</p>
                )}
            </div>

            {/* Price - show unit price on PDP */}
            <div className="space-y-1">
                <ProductPrice
                    type="unit"
                    product={product}
                    quantity={quantity}
                    currency="USD"
                    labelForA11y={product?.name}
                    currentPriceProps={{
                        className: 'text-xl font-bold text-foreground',
                    }}
                />
            </div>

            {/* Unified Attribute Selection */}
            {productAttributes.length > 0 && (
                <ProductAttributeSelector
                    product={product}
                    attributes={productAttributes}
                    selected={selectedAttributes}
                    onAttributeChange={(attributeId, value) => {
                        handleAttributeChange(attributeId, value);
                        // For click-only mode, update color immediately when clicked
                        if (attributeId === 'color') {
                            onColorChange?.(value);
                        }
                    }}
                    maxSwatches={8}
                    swatchSize="md"
                    interactionMode="click-only"
                />
            )}

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
                {/* Options Selection Message */}
                {hasVariants && !isVariantFullySelected && !isProductASet && !isProductABundle && (
                    <div className="text-destructive font-medium">{uiStrings.product.selectAllOptions}</div>
                )}

                {/* Quantity Selector - Only for non-set/bundle products */}
                {!isProductASet && !isProductABundle && (
                    <ProductQuantityPicker
                        value={quantity.toString()}
                        onChange={setQuantity}
                        stockLevel={stockLevel}
                        isOutOfStock={isOutOfStock}
                        productName={product.name}
                    />
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                    <Button
                        onClick={() => void onAddToCart()}
                        disabled={!canAddToCart || isAddingToCart}
                        className="w-full"
                        size="lg">
                        {isAddingToCart ? uiStrings.product.addingToCart : uiStrings.product.addToCart}
                    </Button>

                    <Button
                        onClick={() => void onAddToWishlist()}
                        disabled={isAddingToWishlist}
                        variant="outline"
                        className="w-full"
                        size="lg">
                        {isAddingToWishlist ? uiStrings.product.addingToWishlist : uiStrings.product.addToWishlist}
                    </Button>
                </div>
            </div>

            {/* Product Bundle/Set Notice */}
            {(isProductASet || isProductABundle) && (
                <div className="bg-primary/10 border border-primary rounded-lg p-4">
                    <p className="text-sm text-primary">
                        {isProductASet ? uiStrings.product.productSetNotice : uiStrings.product.productBundleNotice}
                    </p>
                </div>
            )}
        </div>
    );
}
