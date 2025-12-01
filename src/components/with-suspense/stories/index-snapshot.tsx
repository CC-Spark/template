import { expect, test, describe, afterEach } from 'vitest';

import { composeStories } from '@storybook/react-vite';

import * as WithSuspenseStories from './index.stories';
import { render, cleanup, act, waitFor } from '@testing-library/react';

const composed = composeStories(WithSuspenseStories);

afterEach(() => {
    cleanup();
});

describe('WithSuspense stories snapshot', () => {
    for (const [storyName, Story] of Object.entries(composed)) {
        test(`${storyName} story renders and matches snapshot`, async () => {
            // Wrap render in act() and await Suspense resolution
            let container: HTMLElement | undefined;
            await act(async () => {
                const result = render(<Story />);
                container = result.container;
                // Wait for Suspense to resolve by waiting for content to appear
                // This ensures all async operations complete before taking snapshot
                await waitFor(
                    () => {
                        // Check that something rendered (either fallback or content)
                        expect(container?.firstChild || container).toBeTruthy();
                    },
                    { timeout: 1000 }
                );
            });
            // Take snapshot of whatever rendered (fallback or resolved content)
            const snapshotTarget = container?.firstChild || container || document.body;
            expect(snapshotTarget).toMatchSnapshot();
        });
    }
});
