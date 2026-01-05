/**
 * Copyright 2026 Salesforce, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
