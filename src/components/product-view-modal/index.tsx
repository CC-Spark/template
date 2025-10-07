'use client';

/*
 * Copyright (c) 2025, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

// React
import { type ReactElement } from 'react';

// Types
import type { ShopperProductsTypes } from 'commerce-sdk-isomorphic';

// Components
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Typography } from '@/components/typography';

// Constants
import uiStrings from '@/temp-ui-string';

export interface ProductViewModalProps extends React.ComponentProps<typeof Dialog> {
    /** The product being edited */
    product: ShopperProductsTypes.Product;
}

/**
 * ProductViewModal component that displays a product editing dialog
 *
 * This component provides:
 * - Product name display in the content area
 * - Dialog for editing cart item with product variants
 * - Consistent styling with other dialog components in the application
 *
 * @param props - Component props
 * @returns JSX element with product view modal
 */
export function ProductViewModal({ product, ...props }: ProductViewModalProps): ReactElement {
    // Generate product content
    // TODO: Implement product content W-19564508
    const productContent = (
        <div className="text-center py-4">
            <Typography variant="product-title" align="center">
                {product.name}
            </Typography>
        </div>
    );

    return (
        <Dialog {...props}>
            <DialogContent className="sm:max-w-4xl" showCloseButton>
                <DialogHeader>
                    <DialogTitle>{uiStrings.editItem.title}</DialogTitle>
                </DialogHeader>
                {productContent}
            </DialogContent>
        </Dialog>
    );
}
