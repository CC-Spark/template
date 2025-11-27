import { composeStories } from '@storybook/react-vite';
import * as InputOTPStories from './input-otp.stories';

import { expect, test, describe, afterEach } from 'vitest';
import { render, cleanup, act } from '@testing-library/react';
const composed = composeStories(InputOTPStories);

afterEach(() => {
    cleanup();
});

describe('InputOTP stories snapshot', () => {
    for (const [storyName, Story] of Object.entries(composed)) {
        test(`${storyName} story renders and matches snapshot`, async () => {
            let container: HTMLElement | undefined;
            let unmount: (() => void) | undefined;

            act(() => {
                const result = render(<Story />);
                container = result.container;
                unmount = result.unmount;
            });

            expect(container?.firstChild).toMatchSnapshot();

            // Unmount and wait for any pending operations to complete
            await act(async () => {
                if (unmount) {
                    unmount();
                }
                // Wait a bit for any pending timeouts to complete
                await new Promise((resolve) => setTimeout(resolve, 100));
            });
        });
    }
});
