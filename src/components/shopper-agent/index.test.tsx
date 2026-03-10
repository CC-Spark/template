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
import { render, screen, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import ShopperAgent from './index';

vi.mock('./shopper-agent-window', () => ({
    ShopperAgentWindow: () => <div data-testid="shopper-agent-window">ShopperAgentWindow</div>,
}));

vi.mock('./shopper-agent-ui', () => ({
    default: function MockShopperAgentUI() {
        return (
            <div data-testid="shopper-agent">
                <div data-testid="shopper-agent-window">ShopperAgentWindow</div>
            </div>
        );
    },
}));

const originalRAF = globalThis.requestAnimationFrame;
const originalCancelRAF = globalThis.cancelAnimationFrame;

const validConfig = {
    enabled: 'true',
    embeddedServiceName: 'test_service',
    embeddedServiceEndpoint: 'https://test.my.site.com/ESW',
    scriptSourceUrl: 'https://test.my.site.com/ESW/bootstrap.js',
    scrt2Url: 'https://test.salesforce-scrt.com',
    salesforceOrgId: '00Dxx0000000000',
    siteId: 'RefArch',
};

describe('ShopperAgent', () => {
    beforeEach(() => {
        globalThis.requestAnimationFrame = (cb: FrameRequestCallback) => {
            cb(0);
            return 0;
        };
        globalThis.cancelAnimationFrame = vi.fn();
    });

    afterEach(() => {
        globalThis.requestAnimationFrame = originalRAF;
        globalThis.cancelAnimationFrame = originalCancelRAF;
    });

    test('renders wrapper and ShopperAgentWindow when config is valid', async () => {
        render(<ShopperAgent commerceAgentConfiguration={validConfig} locale="en-US" currency="USD" userId="user-1" />);

        await waitFor(() => {
            expect(screen.getByTestId('shopper-agent')).toBeInTheDocument();
        });
        expect(screen.getByTestId('shopper-agent-window')).toBeInTheDocument();
        expect(screen.getByText('ShopperAgentWindow')).toBeInTheDocument();
    });

    test('passes locale to ShopperAgentWindow', async () => {
        render(<ShopperAgent commerceAgentConfiguration={validConfig} locale="en-GB" />);

        await waitFor(() => {
            expect(screen.getByTestId('shopper-agent')).toBeInTheDocument();
        });
    });
});
