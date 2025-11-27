import { composeStories } from '@storybook/react-vite';
import * as RadioGroupStories from './radio-group.stories';

import { expect, test, describe } from 'vitest';
import { render } from '@testing-library/react';
const composed = composeStories(RadioGroupStories);

describe('RadioGroup stories snapshot', () => {
    for (const [storyName, Story] of Object.entries(composed)) {
        test(`${storyName} story renders and matches snapshot`, () => {
            const { container } = render(<Story />);
            expect(container.firstChild).toMatchSnapshot();
        });
    }
});
