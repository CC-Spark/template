/*
 * Copyright (c) 2025, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import type { ReactElement } from 'react';
import type { ShopperProducts } from '@salesforce/storefront-next-runtime/scapi';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useTranslation } from 'react-i18next';

interface ProductAccordionProps {
    product: ShopperProducts.schemas['Product'];
}

export default function ProductAccordion({ product }: ProductAccordionProps): ReactElement {
    const { t } = useTranslation('product');

    return (
        <div className="max-w-4xl">
            <Accordion type="multiple" className="w-full">
                {/* Product Details */}
                <AccordionItem value="details">
                    <AccordionTrigger className="text-left font-semibold text-lg">
                        {t('productDetails')}
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-4 text-muted-foreground">
                            {product.longDescription ? (
                                <div className="prose prose-sm max-w-none">{product.longDescription}</div>
                            ) : (
                                <p>{product.shortDescription || t('noDetailedDescription')}</p>
                            )}

                            {/* Additional product attributes */}
                            {product.brand && (
                                <div>
                                    <strong>{t('brand')}</strong> {product.brand}
                                </div>
                            )}

                            {product.manufacturerName && (
                                <div>
                                    <strong>{t('manufacturer')}</strong> {product.manufacturerName}
                                </div>
                            )}

                            {product.manufacturerSku && (
                                <div>
                                    <strong>{t('sku')}</strong> {product.manufacturerSku}
                                </div>
                            )}
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Size & Fit */}
                <AccordionItem value="size-fit">
                    <AccordionTrigger className="text-left font-semibold text-lg">{t('sizeAndFit')}</AccordionTrigger>
                    <AccordionContent>
                        <div className="text-muted-foreground">
                            <p>{t('sizeAndFitComingSoon')}</p>
                            {/* Future: Add size chart, fit guide, etc. */}
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Shipping & Returns */}
                <AccordionItem value="shipping">
                    <AccordionTrigger className="text-left font-semibold text-lg">
                        {t('shippingAndReturns')}
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="text-muted-foreground space-y-2">
                            <p>
                                <strong>{t('freeShipping')}</strong>
                            </p>
                            <p>
                                <strong>{t('standardShipping')}</strong>
                            </p>
                            <p>
                                <strong>{t('expressShipping')}</strong>
                            </p>
                            <p>
                                <strong>{t('returns')}</strong>
                            </p>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Reviews */}
                <AccordionItem value="reviews">
                    <AccordionTrigger className="text-left font-semibold text-lg">{t('reviews')}</AccordionTrigger>
                    <AccordionContent>
                        <div className="text-muted-foreground">
                            <p>{t('reviewsComingSoon')}</p>
                            {/* Future: Add review system integration */}
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Care Instructions */}
                {product.type?.item && (
                    <AccordionItem value="care">
                        <AccordionTrigger className="text-left font-semibold text-lg">
                            {t('careInstructions')}
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="text-muted-foreground">
                                <p>{t('careInstructionsComingSoon')}</p>
                                {/* Future: Add care instruction details */}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                )}
            </Accordion>
        </div>
    );
}
