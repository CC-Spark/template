import { expect, test, describe, afterEach } from 'vitest';
import { composeStories } from '@storybook/react-vite';
import * as ProductCarouselSkeletonStories from './skeleton.stories';
import { render, cleanup } from '@testing-library/react';

const composed = composeStories(ProductCarouselSkeletonStories);

afterEach(() => {
    cleanup();
});

describe('ProductCarouselSkeleton stories snapshot', () => {
    for (const [storyName, Story] of Object.entries(composed)) {
        test(`${storyName} story renders and matches snapshot`, () => {
            const { container } = render(<Story />);
            expect(container.firstChild).toMatchSnapshot();
        });
    }
});
