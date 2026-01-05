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
import type React from 'react';
import { vi, describe, test, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import BonusProductSelection from './bonus-product-selection';

// Mock for the carousel
vi.mock('@/components/ui/carousel', () => ({
    Carousel: ({ children }: { children: React.ReactNode }) => (
        <div role="region" aria-roledescription="carousel">
            {children}
        </div>
    ),
    CarouselContent: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="carousel-content">{children}</div>
    ),
    CarouselItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    CarouselPrevious: (props: React.ComponentProps<'button'>) => <button aria-label="Previous slide" {...props} />,
    CarouselNext: (props: React.ComponentProps<'button'>) => <button aria-label="Next slide" {...props} />,
}));

describe('BonusProductSelection', () => {
    test('renders accordion trigger with correct accessible name', () => {
        render(<BonusProductSelection />);

        // Title text is the accessible name of the trigger button
        const trigger = screen.getByRole('button', {
            name: /buy one classic fit shirt and get one free tie/i,
        });
        expect(trigger).toBeInTheDocument();
    });

    test('renders a carousel region for product selection', async () => {
        render(<BonusProductSelection />);
        fireEvent.click(
            screen.getByRole('button', {
                name: /buy one classic fit shirt and get one free tie/i,
            })
        );
        await waitFor(() => {
            const regions = screen.getAllByRole('region');
            const carousel = regions.find((el) => el.getAttribute('aria-roledescription') === 'carousel');
            expect(carousel).toBeTruthy();
        });
    });

    test('has previous and next slide controls with accessible labels', async () => {
        render(<BonusProductSelection />);
        fireEvent.click(
            screen.getByRole('button', {
                name: /buy one classic fit shirt and get one free tie/i,
            })
        );
        await waitFor(() => {
            expect(screen.getByLabelText(/previous slide/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/next slide/i)).toBeInTheDocument();
        });
    });

    test('renders product images as decorative (empty alt) to avoid redundancy', async () => {
        render(<BonusProductSelection />);
        fireEvent.click(
            screen.getByRole('button', {
                name: /buy one classic fit shirt and get one free tie/i,
            })
        );
        await waitFor(() => {
            const presentationalImgs = screen.getAllByRole('presentation');
            expect(presentationalImgs.length).toBeGreaterThan(0);
        });
    });

    // TODO: Expansion/collapse behavior to be implemented when selection data is wired
});
