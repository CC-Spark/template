import { composeStories } from '@storybook/react-vite';

import * as QuantityPickerStories from './quantity-picker.stories';
import { expect, test, describe, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
const composed = composeStories(QuantityPickerStories);

afterEach(() => {
    cleanup();
});

describe('QuantityPicker stories snapshot', () => {
    for (const [storyName, Story] of Object.entries(composed)) {
        test(`${storyName} story renders and matches snapshot`, () => {
            const { container } = render(<Story />);
            expect(container.firstChild).toMatchSnapshot();
        });
    }
});
