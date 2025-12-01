import { expect, test, describe, afterEach } from 'vitest';
import { composeStories } from '@storybook/react-vite';
import * as ProductPriceStories from './product-price.stories';
import { render, cleanup } from '@testing-library/react';

const composed = composeStories(ProductPriceStories);

afterEach(() => {
    cleanup();
});

describe('ProductPrice stories snapshot', () => {
    for (const [storyName, Story] of Object.entries(composed)) {
        test(`${storyName} story renders and matches snapshot`, () => {
            const { container } = render(<Story />);
            expect(container.firstChild).toMatchSnapshot();
        });
    }
});
