import * as CurrentPriceStories from './current-price.stories';
import { composeStories } from '@storybook/react-vite';
import { render } from '@testing-library/react';
import { describe, test, expect } from 'vitest';

const { Default, Range, CustomElement } = composeStories(CurrentPriceStories);

describe('CurrentPrice Snapshots', () => {
    test('Default snapshot', () => {
        const { container } = render(<Default />);
        expect(container).toMatchSnapshot();
    });

    test('Range snapshot', () => {
        const { container } = render(<Range />);
        expect(container).toMatchSnapshot();
    });

    test('CustomElement snapshot', () => {
        const { container } = render(<CustomElement />);
        expect(container).toMatchSnapshot();
    });
});
