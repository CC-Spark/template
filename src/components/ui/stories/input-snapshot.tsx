import { vi, expect, test, describe, beforeEach, afterEach } from 'vitest';

// Suppress React warning about value prop without onChange (intentional for snapshot testing)
// eslint-disable-next-line no-console
const originalWarn = console.warn;
// eslint-disable-next-line no-console
const originalError = console.error;
beforeEach(() => {
    // eslint-disable-next-line no-console
    console.warn = vi.fn((...args: unknown[]) => {
        const message = args.map((arg) => (typeof arg === 'string' ? arg : String(arg))).join(' ');
        // Suppress the specific warning about value prop without onChange
        if (message.includes('You provided a `value` prop to a form field without an `onChange` handler')) {
            return;
        }
        originalWarn(...args);
    });
    // eslint-disable-next-line no-console
    console.error = vi.fn((...args: unknown[]) => {
        const message = args.map((arg) => (typeof arg === 'string' ? arg : String(arg))).join(' ');
        // Suppress the specific warning about value prop without onChange (React may use console.error)
        if (message.includes('You provided a `value` prop to a form field without an `onChange` handler')) {
            return;
        }
        originalError(...args);
    });
});

afterEach(() => {
    // eslint-disable-next-line no-console
    console.warn = originalWarn;
    // eslint-disable-next-line no-console
    console.error = originalError;
});

import { composeStories } from '@storybook/react-vite';
import * as InputStories from './input.stories';

import { render, cleanup } from '@testing-library/react';
const composed = composeStories(InputStories);

afterEach(() => {
    cleanup();
});

describe('Input stories snapshot', () => {
    for (const [storyName, Story] of Object.entries(composed)) {
        test(`${storyName} story renders and matches snapshot`, () => {
            const { container } = render(<Story />);
            expect(container.firstChild).toMatchSnapshot();
        });
    }
});
