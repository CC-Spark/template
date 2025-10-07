/*
 * Copyright (c) 2025, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

'use client';

import ImageGallery from '@/components/image-gallery';
import ProductQuantityPicker from '@/components/product-quantity-picker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProductSetsBundles } from '@/hooks/product/use-product-sets-bundles';
import { useProductActions } from '@/hooks/product/use-product-actions';
import ProductAttributeSelector from '@/components/product-attribute-selector';
import { useVariantSelection } from '@/hooks/product/use-variant-selection';
import uiStrings from '@/temp-ui-string';
import ProductPrice from '@/components/product-price';
import type { ShopperProductsTypes } from 'commerce-sdk-isomorphic';
import { type ReactElement, useEffect, useState } from 'react';

interface ProductSetBundleProps {
    product: ShopperProductsTypes.Product;
    isProductASet?: boolean;
    isProductABundle?: boolean;
}

interface ProductSelectionValues {
    product: ShopperProductsTypes.Product;
    variant: ShopperProductsTypes.Variant;
    quantity: number;
}

export default function ProductSetBundle({
    product,
    isProductASet = false,
    isProductABundle = false,
}: ProductSetBundleProps): ReactElement {
    const {
        comboProduct,
        childProductSelection,
        selectedBundleQuantity,
        areAllChildProductsSelected,
        hasUnorderableChildProducts,
        handleChildProductValidation,
        setChildProductSelection,
        setSelectedBundleQuantity,
        selectedChildProductCount,
        totalChildProducts,
    } = useProductSetsBundles({
        product,
        isProductASet,
        isProductABundle,
    });

    const { isAddingToCart, handleProductSetAddToCart, handleProductBundleAddToCart, isOutOfStock, stockLevel } =
        useProductActions({
            product,
            isProductASet,
            isProductABundle,
        });

    const childProducts = comboProduct.childProducts || [];

    const handleAddToCart = async () => {
        // Validate all child products are selected
        if (!handleChildProductValidation()) {
            return;
        }

        if (isProductASet) {
            const selectedProducts = Object.values(childProductSelection);
            await handleProductSetAddToCart(selectedProducts);
        } else if (isProductABundle) {
            const selectedProducts = Object.values(childProductSelection);
            await handleProductBundleAddToCart(product, selectedBundleQuantity, selectedProducts);
        }
    };

    const canAddToCart = areAllChildProductsSelected && !hasUnorderableChildProducts;

    if (!isProductASet && !isProductABundle) {
        return <></>;
    }

    return (
        <div className="space-y-8">
            {/* Set/Bundle Header */}
            <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold text-foreground">
                    {isProductASet ? uiStrings.product.productSet : uiStrings.product.productBundle}
                </h2>
                <p className="text-muted-foreground">
                    {isProductASet ? uiStrings.product.setDescription : uiStrings.product.bundleDescription}
                </p>

                {/* Progress indicator */}
                <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                    <span>
                        {uiStrings.product.selectedOf
                            .replace('{selected}', selectedChildProductCount.toString())
                            .replace('{total}', totalChildProducts.toString())}
                    </span>
                    <div className="w-32 bg-muted rounded-full h-2">
                        <div
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(selectedChildProductCount / totalChildProducts) * 100}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Child Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {childProducts.map((childProduct: ShopperProductsTypes.Product, index: number) => (
                    <ChildProductCard
                        key={childProduct.id}
                        childProduct={childProduct}
                        index={index}
                        isProductASet={isProductASet}
                        isProductABundle={isProductABundle}
                        onSelectionChange={(selection) => setChildProductSelection(childProduct.id, selection)}
                    />
                ))}
            </div>

            {/* Bundle Quantity Selector (for bundles only) */}
            {isProductABundle && (
                <div className="flex justify-center">
                    <div className="w-64">
                        <ProductQuantityPicker
                            value={selectedBundleQuantity.toString()}
                            onChange={setSelectedBundleQuantity}
                            stockLevel={stockLevel}
                            isOutOfStock={isOutOfStock}
                            productName={product?.name}
                            isBundle={isProductABundle}
                        />
                    </div>
                </div>
            )}

            {/* Add to Cart Button */}
            <div className="flex justify-center">
                <Button
                    onClick={() => void handleAddToCart()}
                    disabled={!canAddToCart || isAddingToCart}
                    size="lg"
                    className="min-w-64">
                    {isAddingToCart
                        ? uiStrings.product.adding
                        : isProductASet
                          ? uiStrings.product.addSetToCart
                          : uiStrings.product.addBundleToCart}
                </Button>
            </div>

            {/* Error Messages */}
            {!areAllChildProductsSelected && (
                <div className="text-center text-destructive">{uiStrings.product.selectAllOptionsAbove}</div>
            )}
        </div>
    );
}

// Child Product Card Component
interface ChildProductCardProps {
    childProduct: ShopperProductsTypes.Product | ShopperProductsTypes.Variant;
    index: number;
    isProductASet: boolean;
    isProductABundle: boolean;
    onSelectionChange: (selection: ProductSelectionValues) => void;
}

function ChildProductCard({
    childProduct,
    index: _index,
    isProductASet,
    isProductABundle,
    onSelectionChange,
}: ChildProductCardProps): ReactElement {
    const product = childProduct.product;

    const { currentVariant, selectedAttributes, isVariantFullySelected, handleAttributeChange, getAvailableValues } =
        useVariantSelection({
            product,
        });

    const [quantity, setQuantity] = useState(childProduct.quantity || 1);

    // Update parent when selection changes
    useEffect(() => {
        if (isVariantFullySelected && currentVariant) {
            onSelectionChange({
                product,
                variant: currentVariant,
                quantity,
            });
        }
    }, [currentVariant, quantity, isVariantFullySelected, product, onSelectionChange]);

    const isInStock = (currentVariant?.inventory?.ats || product?.inventory?.ats || 0) > 0;

    return (
        <Card className="h-full" data-testid="child-product">
            <CardHeader className="pb-4">
                <CardTitle className="text-lg">{product?.name}</CardTitle>
                <ProductPrice
                    product={product}
                    currency="USD"
                    labelForA11y={product?.name}
                    quantity={quantity}
                    currentPriceProps={{
                        className: 'text-xl font-bold text-foreground',
                    }}
                />
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Product Image */}
                <div className="aspect-square">
                    <ImageGallery
                        images={
                            (product?.imageGroups || [])
                                .find((group: ShopperProductsTypes.ImageGroup) => group.viewType === 'large')
                                ?.images?.map((img: ShopperProductsTypes.Image) => ({
                                    src: `${img.disBaseLink || img.link}`,
                                    alt: img.alt || product?.name,
                                    thumbSrc: `${img.disBaseLink || img.link}?sw=150&q=75`,
                                })) || []
                        }
                        eager={isProductASet || isProductABundle ? false : true}
                    />
                </div>

                {/* Variant Selection */}
                {Array.isArray(product?.variationAttributes) && product.variationAttributes.length && (
                    <ProductAttributeSelector
                        product={product}
                        attributes={product.variationAttributes.map(
                            (attr: ShopperProductsTypes.VariationAttribute) => ({
                                id: attr.id || '',
                                name: attr.name ?? '',
                                values: getAvailableValues(attr.id).map(
                                    (v: ShopperProductsTypes.VariationAttributeValue) => ({
                                        value: v.value || '',
                                        name: v.name ?? String(v.value),
                                        orderable: v.orderable,
                                    })
                                ),
                            })
                        )}
                        selected={selectedAttributes}
                        onAttributeChange={handleAttributeChange}
                        swatchSize="sm"
                        maxSwatches={4}
                        interactionMode="click-only"
                    />
                )}

                {/* Quantity for Product Sets */}
                {isProductASet && (
                    <ProductQuantityPicker
                        value={quantity.toString()}
                        onChange={setQuantity}
                        stockLevel={currentVariant?.inventory?.ats || product?.inventory?.ats}
                        isOutOfStock={!isInStock}
                        productName={product?.name}
                    />
                )}

                {/* Selection Status */}
                <div className="text-center text-sm">
                    {isVariantFullySelected ? (
                        <span className="text-primary font-medium">{uiStrings.product.selected}</span>
                    ) : (
                        <span className="text-muted-foreground">{uiStrings.product.selectOptionsAbove}</span>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
