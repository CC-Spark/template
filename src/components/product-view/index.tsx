/*
 * Copyright (c) 2025, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { type ReactElement } from 'react';
import type { ShopperProductsTypes } from 'commerce-sdk-isomorphic';
import ImageGallery from '@/components/image-gallery';
import ProductInfo from './product-info';
import ProductSetBundle from './product-set-bundle';
import { useProductColorImage } from '@/hooks/product/use-product-color-image';
import CategoryBreadcrumbs from '../category-breadcrumbs';

interface ProductViewProps {
    product: ShopperProductsTypes.Product;
    category: ShopperProductsTypes.Category | undefined;
}

export default function ProductView({ product, category }: ProductViewProps): ReactElement {
    // Calculate directly without useMemo since these are simple operations
    const isProductASet = product?.type?.set;
    const isProductABundle = product?.type?.bundle;
    const breadcrumbData = category?.parentCategoryTree || [];
    // Use color image hook for managing selected color and filtered images
    const { galleryImages, setSelectedColor } = useProductColorImage({
        product,
    });

    return (
        <>
            {/* Product Sets/Bundles or Regular Product */}
            {isProductASet || isProductABundle ? (
                <ProductSetBundle product={product} isProductASet={isProductASet} isProductABundle={isProductABundle} />
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* Left Column - Image Gallery */}
                    <div className="order-1">
                        <ImageGallery images={galleryImages} eager={!isProductASet && !isProductABundle} />
                    </div>

                    {/* Right Column - Product Info */}
                    <div className="order-2">
                        {/* Breadcrumbs */}
                        {breadcrumbData.length > 0 && category && (
                            <div className="hidden md:block">
                                <CategoryBreadcrumbs category={category} />
                            </div>
                        )}
                        <ProductInfo
                            product={product}
                            key={product.id}
                            isProductASet={isProductASet}
                            isProductABundle={isProductABundle}
                            onColorChange={setSelectedColor}
                        />
                    </div>
                </div>
            )}
        </>
    );
}
