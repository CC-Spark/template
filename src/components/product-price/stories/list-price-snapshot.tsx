import * as ListPriceStories from './list-price.stories';
import { composeStories } from '@storybook/react-vite';
import { render } from '@testing-library/react';
import { describe, test, expect } from 'vitest';

const { Default, Range } = composeStories(ListPriceStories);

describe('ListPrice Snapshots', () => {
    test('Default snapshot', () => {
        const { container } = render(<Default />);
        expect(container).toMatchSnapshot();
    });

    test('Range snapshot', () => {
        const { container } = render(<Range />);
        expect(container).toMatchSnapshot();
    });
});
