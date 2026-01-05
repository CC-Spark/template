/**
 * Copyright 2026 Salesforce, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import ProductSkeleton from './index';

describe('ProductSkeleton', () => {
    test('renders product skeleton component', () => {
        render(<ProductSkeleton />);

        expect(screen.getByTestId('product-skeleton')).toBeInTheDocument();
    });

    test('renders image gallery skeleton', () => {
        render(<ProductSkeleton />);

        expect(screen.getByTestId('image-gallery-skeleton')).toBeInTheDocument();
        expect(screen.getByTestId('main-image-skeleton')).toBeInTheDocument();
        expect(screen.getByTestId('thumbnails-skeleton')).toBeInTheDocument();
    });

    test('renders product info skeleton', () => {
        render(<ProductSkeleton />);

        expect(screen.getByTestId('product-info-skeleton')).toBeInTheDocument();
    });

    test('renders price skeleton', () => {
        render(<ProductSkeleton />);

        expect(screen.getByTestId('price-skeleton')).toBeInTheDocument();
    });

    test('renders variants skeleton', () => {
        render(<ProductSkeleton />);

        expect(screen.getByTestId('variants-skeleton')).toBeInTheDocument();
    });

    test('renders quantity skeleton', () => {
        render(<ProductSkeleton />);

        expect(screen.getByTestId('quantity-skeleton')).toBeInTheDocument();
    });

    test('renders add to cart button skeleton', () => {
        render(<ProductSkeleton />);

        expect(screen.getByTestId('add-to-cart-skeleton')).toBeInTheDocument();
    });

    test('renders wishlist button skeleton', () => {
        render(<ProductSkeleton />);

        expect(screen.getByTestId('wishlist-skeleton')).toBeInTheDocument();
    });

    test('renders product features skeleton', () => {
        render(<ProductSkeleton />);

        expect(screen.getByTestId('features-skeleton')).toBeInTheDocument();
    });

    test('renders accordion skeleton', () => {
        render(<ProductSkeleton />);

        expect(screen.getByTestId('accordion-skeleton')).toBeInTheDocument();
    });

    test('renders 4 accordion item skeletons', () => {
        render(<ProductSkeleton />);

        const accordionItems = screen.getAllByTestId('accordion-item-skeleton');
        expect(accordionItems).toHaveLength(4);
    });

    test('renders recommended products skeleton', () => {
        render(<ProductSkeleton />);

        expect(screen.getByTestId('recommended-products-skeleton')).toBeInTheDocument();
        expect(screen.getByTestId('recommended-title-skeleton')).toBeInTheDocument();
        expect(screen.getByTestId('recommended-products-grid')).toBeInTheDocument();
    });

    test('renders 4 recommended product items', () => {
        render(<ProductSkeleton />);

        const recommendedItems = screen.getAllByTestId('recommended-product-item');
        expect(recommendedItems).toHaveLength(4);
    });

    test('renders 5 thumbnail skeletons in image gallery', () => {
        render(<ProductSkeleton />);

        const thumbnailsContainer = screen.getByTestId('thumbnails-skeleton');
        const thumbnails = thumbnailsContainer.querySelectorAll('div');
        expect(thumbnails).toHaveLength(5);
    });

    test('renders breadcrumbs skeleton with aria-label', () => {
        render(<ProductSkeleton />);

        const breadcrumbs = screen.getByLabelText('Breadcrumb');
        expect(breadcrumbs).toBeInTheDocument();
        expect(screen.getByTestId('breadcrumbs-skeleton')).toBeInTheDocument();
    });
});
