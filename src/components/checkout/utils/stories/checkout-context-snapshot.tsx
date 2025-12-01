import { vi, expect, test, describe, afterEach } from 'vitest';

// Mock basket provider
vi.mock('@/providers/basket', () => ({
    useBasket: vi.fn(() => ({
        basket: null,
        isLoading: false,
    })),
}));

import { composeStories } from '@storybook/react-vite';

import * as CheckoutContextStories from './checkout-context.stories';
import { render, cleanup } from '@testing-library/react';

const composed = composeStories(CheckoutContextStories);

afterEach(() => {
    cleanup();
});

describe('CheckoutContext stories snapshot', () => {
    for (const [storyName, Story] of Object.entries(composed)) {
        test(`${storyName} story renders and matches snapshot`, () => {
            const { container } = render(<Story />);
            expect(container.firstChild).toMatchSnapshot();
        });
    }
});
