import * as BundledProductItemsStories from './bundled-product-items.stories';
import { composeStories } from '@storybook/react-vite';
import { render } from '@testing-library/react';
import { describe, test, expect } from 'vitest';

const { Default } = composeStories(BundledProductItemsStories);

describe('BundledProductItems Snapshots', () => {
    test('Default snapshot', () => {
        const { container } = render(<Default />);
        expect(container).toMatchSnapshot();
    });
});
