/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProductPrice from './index';

describe('ProductPrice', () => {
    const mockProduct = {
        id: 'test-product',
        name: 'Test Product',
        price: 29.99,
        priceMax: 39.99,
        hitType: 'product' as const,
        type: {},
        variants: [],
        tieredPrices: [
            { quantity: 1, price: 29.99 },
            { quantity: 5, price: 39.99 },
        ],
    };

    test('renders current price and list price for standard product', () => {
        render(<ProductPrice product={mockProduct} currency="USD" labelForA11y="Test Product" />);

        expect(screen.getByText('From $29.99')).toBeInTheDocument();
        expect(screen.getByText('$39.99')).toBeInTheDocument();
    });

    test('renders only current price for set product', () => {
        const setProduct = {
            ...mockProduct,
            hitType: 'set' as const,
            type: { set: true },
        };

        render(<ProductPrice product={setProduct} currency="USD" labelForA11y="Test Set" />);

        expect(screen.getByText('From $29.99')).toBeInTheDocument();
        expect(screen.queryByText('$39.99')).not.toBeInTheDocument();
    });

    test('renders current price only when not on sale', () => {
        const noSaleProduct = {
            ...mockProduct,
            priceMax: undefined,
            tieredPrices: [{ quantity: 1, price: 29.99 }],
        };

        render(<ProductPrice product={noSaleProduct} currency="USD" labelForA11y="Test Product" />);

        expect(screen.getByText('$29.99')).toBeInTheDocument();
        expect(screen.queryByText('$39.99')).not.toBeInTheDocument();
    });

    test('applies custom className', () => {
        const { container } = render(
            <ProductPrice product={mockProduct} currency="USD" labelForA11y="Test Product" className="custom-class" />
        );

        expect(container.firstChild).toHaveClass('custom-class');
    });

    test('handles quantity multiplication', () => {
        render(<ProductPrice product={mockProduct} currency="USD" quantity={2} labelForA11y="Test Product" />);

        expect(screen.getByText('From $59.98')).toBeInTheDocument(); // 29.99 * 2
        expect(screen.getByText('$79.98')).toBeInTheDocument(); // 39.99 * 2
    });

    test('does not apply quantity multiplication when type is unit', () => {
        render(
            <ProductPrice product={mockProduct} currency="USD" quantity={2} labelForA11y="Test Product" type="unit" />
        );

        expect(screen.getByText('From $29.99')).toBeInTheDocument();
        expect(screen.queryByText('From $59.98')).not.toBeInTheDocument();
        expect(screen.queryByText('$39.99')).toBeInTheDocument();
        expect(screen.queryByText('$79.98')).not.toBeInTheDocument();
    });
});
