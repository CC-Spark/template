import { composeStories } from '@storybook/react-vite';

import * as SwatchStories from './swatch.stories';
import { expect, test, describe, afterEach, vi } from 'vitest';
import { render, cleanup } from '@testing-library/react';

vi.mock('react-router', () => ({
    NavLink: ({
        to,
        children,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        preventScrollReset,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        relative,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        replace,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        state,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        viewTransition,
        ...props
    }: {
        to: string;
        children: React.ReactNode;
        preventScrollReset?: unknown;
        relative?: unknown;
        replace?: unknown;
        state?: unknown;
        viewTransition?: unknown;
        [key: string]: unknown;
    }) => (
        <a href={to} {...props}>
            {children}
        </a>
    ),
}));

const composed = composeStories(SwatchStories);

afterEach(() => {
    cleanup();
});

describe('Swatch stories snapshot', () => {
    for (const [storyName, Story] of Object.entries(composed)) {
        test(`${storyName} story renders and matches snapshot`, () => {
            const { container } = render(<Story />);
            expect(container.firstChild).toMatchSnapshot();
        });
    }
});
