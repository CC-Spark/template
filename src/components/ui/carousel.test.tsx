/*
 * Copyright (c) 2025, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { render, screen } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from './carousel';

// Mock useEmblaCarousel
const mockScrollPrev = vi.fn();
const mockScrollNext = vi.fn();
const mockOn = vi.fn();
const mockOff = vi.fn();

let mockCanScrollPrev = false;
let mockCanScrollNext = false;

vi.mock('embla-carousel-react', () => ({
    default: () => [
        { current: null },
        {
            canScrollPrev: () => mockCanScrollPrev,
            canScrollNext: () => mockCanScrollNext,
            scrollPrev: mockScrollPrev,
            scrollNext: mockScrollNext,
            on: mockOn,
            off: mockOff,
            selectedScrollSnap: () => 0,
            scrollSnapList: () => [0, 1, 2],
            containerNode: () => null,
        },
    ],
}));

describe('Carousel', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockCanScrollPrev = false;
        mockCanScrollNext = false;
    });

    describe('Arrow Visibility Based on Scrollability', () => {
        test('hides both arrows when carousel is not scrollable', () => {
            mockCanScrollPrev = false;
            mockCanScrollNext = false;

            render(
                <Carousel>
                    <CarouselContent>
                        <CarouselItem>Item 1</CarouselItem>
                        <CarouselItem>Item 2</CarouselItem>
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>
            );

            expect(screen.queryByRole('button', { name: /previous/i })).not.toBeInTheDocument();
            expect(screen.queryByRole('button', { name: /next/i })).not.toBeInTheDocument();
        });

        test('shows arrows when carousel is scrollable', () => {
            mockCanScrollPrev = false;
            mockCanScrollNext = true;

            render(
                <Carousel>
                    <CarouselContent>
                        <CarouselItem>Item 1</CarouselItem>
                        <CarouselItem>Item 2</CarouselItem>
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>
            );

            // Both arrows should be visible even though only one direction is scrollable
            expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
        });

        test('shows arrows when can scroll in either direction', () => {
            mockCanScrollPrev = true;
            mockCanScrollNext = false;

            render(
                <Carousel>
                    <CarouselContent>
                        <CarouselItem>Item 1</CarouselItem>
                        <CarouselItem>Item 2</CarouselItem>
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>
            );

            expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
        });

        test('shows arrows when can scroll in both directions', () => {
            mockCanScrollPrev = true;
            mockCanScrollNext = true;

            render(
                <Carousel>
                    <CarouselContent>
                        <CarouselItem>Item 1</CarouselItem>
                        <CarouselItem>Item 2</CarouselItem>
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>
            );

            expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
        });
    });

    describe('Arrow Disabled States', () => {
        test('disables previous arrow at start of scrollable carousel', () => {
            mockCanScrollPrev = false;
            mockCanScrollNext = true;

            render(
                <Carousel>
                    <CarouselContent>
                        <CarouselItem>Item 1</CarouselItem>
                        <CarouselItem>Item 2</CarouselItem>
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>
            );

            expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled();
            expect(screen.getByRole('button', { name: /next/i })).not.toBeDisabled();
        });

        test('disables next arrow at end of scrollable carousel', () => {
            mockCanScrollPrev = true;
            mockCanScrollNext = false;

            render(
                <Carousel>
                    <CarouselContent>
                        <CarouselItem>Item 1</CarouselItem>
                        <CarouselItem>Item 2</CarouselItem>
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>
            );

            expect(screen.getByRole('button', { name: /previous/i })).not.toBeDisabled();
            expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
        });

        test('enables both arrows in middle of carousel', () => {
            mockCanScrollPrev = true;
            mockCanScrollNext = true;

            render(
                <Carousel>
                    <CarouselContent>
                        <CarouselItem>Item 1</CarouselItem>
                        <CarouselItem>Item 2</CarouselItem>
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>
            );

            expect(screen.getByRole('button', { name: /previous/i })).not.toBeDisabled();
            expect(screen.getByRole('button', { name: /next/i })).not.toBeDisabled();
        });
    });

    describe('Carousel Options', () => {
        test('accepts carousel options', () => {
            render(
                <Carousel opts={{ align: 'center', loop: true }}>
                    <CarouselContent>
                        <CarouselItem>Item 1</CarouselItem>
                    </CarouselContent>
                </Carousel>
            );

            expect(screen.getByRole('region')).toBeInTheDocument();
        });

        test('applies horizontal orientation by default', () => {
            render(
                <Carousel>
                    <CarouselContent>
                        <CarouselItem>Item 1</CarouselItem>
                    </CarouselContent>
                </Carousel>
            );

            expect(screen.getByRole('region')).toBeInTheDocument();
        });

        test('supports vertical orientation', () => {
            render(
                <Carousel orientation="vertical">
                    <CarouselContent>
                        <CarouselItem>Item 1</CarouselItem>
                    </CarouselContent>
                </Carousel>
            );

            expect(screen.getByRole('region')).toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        test('has proper ARIA attributes', () => {
            mockCanScrollPrev = true;
            mockCanScrollNext = true;

            render(
                <Carousel>
                    <CarouselContent>
                        <CarouselItem>Item 1</CarouselItem>
                        <CarouselItem>Item 2</CarouselItem>
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>
            );

            const region = screen.getByRole('region');
            expect(region).toHaveAttribute('aria-roledescription', 'carousel');

            const prevButton = screen.getByRole('button', { name: /previous/i });
            expect(prevButton).toBeInTheDocument();

            const nextButton = screen.getByRole('button', { name: /next/i });
            expect(nextButton).toBeInTheDocument();
        });

        test('carousel items have proper role', () => {
            render(
                <Carousel>
                    <CarouselContent>
                        <CarouselItem>Item 1</CarouselItem>
                        <CarouselItem>Item 2</CarouselItem>
                    </CarouselContent>
                </Carousel>
            );

            const items = screen.getAllByRole('group');
            expect(items).toHaveLength(2);
            items.forEach((item) => {
                expect(item).toHaveAttribute('aria-roledescription', 'slide');
            });
        });
    });

    describe('Component Structure', () => {
        test('renders CarouselContent wrapper', () => {
            render(
                <Carousel>
                    <CarouselContent>
                        <CarouselItem>Item 1</CarouselItem>
                    </CarouselContent>
                </Carousel>
            );

            expect(screen.getByText('Item 1')).toBeInTheDocument();
        });

        test('renders multiple CarouselItems', () => {
            render(
                <Carousel>
                    <CarouselContent>
                        <CarouselItem>Item 1</CarouselItem>
                        <CarouselItem>Item 2</CarouselItem>
                        <CarouselItem>Item 3</CarouselItem>
                    </CarouselContent>
                </Carousel>
            );

            expect(screen.getByText('Item 1')).toBeInTheDocument();
            expect(screen.getByText('Item 2')).toBeInTheDocument();
            expect(screen.getByText('Item 3')).toBeInTheDocument();
        });

        test('accepts custom className on carousel', () => {
            render(
                <Carousel className="custom-carousel-class">
                    <CarouselContent>
                        <CarouselItem>Item 1</CarouselItem>
                    </CarouselContent>
                </Carousel>
            );

            const carousel = screen.getByRole('region');
            expect(carousel).toHaveClass('custom-carousel-class');
        });

        test('accepts custom className on CarouselContent', () => {
            const { container } = render(
                <Carousel>
                    <CarouselContent className="custom-content-class">
                        <CarouselItem>Item 1</CarouselItem>
                    </CarouselContent>
                </Carousel>
            );

            const content = container.querySelector('.custom-content-class');
            expect(content).toBeInTheDocument();
        });
    });
});
