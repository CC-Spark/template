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
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { waitForStorybookReady } from '@storybook/test-utils';
import { MarketingConsent, type MarketingConsentSubscriptions } from '../index';

const defaultSubscriptions: MarketingConsentSubscriptions = {
    data: [
        {
            subscriptionId: 'Sale',
            channels: ['email'],
            title: 'Sale',
            consentType: 'marketing',
            consentRequired: false,
            defaultStatus: 'opt_out',
            tags: [],
            consentStatus: [{ channel: 'email', contactPointValue: 'user@example.com', status: 'opt_out' }],
        },
        {
            subscriptionId: 'Newsletter',
            channels: ['email'],
            title: 'Newsletter',
            consentType: 'marketing',
            consentRequired: false,
            defaultStatus: 'opt_out',
            tags: [],
            consentStatus: [{ channel: 'email', contactPointValue: 'user@example.com', status: 'opt_in' }],
        },
    ],
};

const meta: Meta<typeof MarketingConsent> = {
    title: 'ACCOUNT/Marketing Consent',
    component: MarketingConsent,
    args: {
        subscriptions: defaultSubscriptions,
    },
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component:
                    'Marketing & Communication Preferences section displayed on the Account Details page. Data is loaded from the consent API (getSubscriptions). Subscription opt-in/opt-out is derived from consentStatus (per channel). Switches are read-only until the update API is integrated.',
            },
        },
    },
    tags: ['autodocs', 'interaction'],
};

export default meta;
type Story = StoryObj<typeof MarketingConsent>;

export const Default: Story = {
    play: async ({ canvasElement }) => {
        await waitForStorybookReady(canvasElement);
        const canvas = within(canvasElement);

        await expect(canvas.getByText('Marketing & Communication Preferences')).toBeInTheDocument();
        const editButton = canvas.getByRole('button', { name: /edit/i });
        await expect(editButton).toBeInTheDocument();
        await expect(editButton).toHaveAttribute('type', 'button');
        await expect(canvas.getByRole('heading', { level: 2, name: 'Email' })).toBeInTheDocument();
        const lists = canvas.getAllByRole('list');
        await expect(lists.length).toBeGreaterThanOrEqual(1);
        const switches = canvas.getAllByRole('switch');
        await expect(switches.length).toBe(2);
        await expect(canvas.getByText('Sale')).toBeInTheDocument();
        await expect(canvas.getByText('Newsletter')).toBeInTheDocument();
    },
};

export const ClickEditButton: Story = {
    play: async ({ canvasElement }) => {
        await waitForStorybookReady(canvasElement);
        const canvas = within(canvasElement);

        const editButton = canvas.getByRole('button', { name: /edit marketing preferences/i });
        await expect(editButton).toBeInTheDocument();
        await expect(editButton).toHaveAttribute('type', 'button');
        await expect(editButton).toHaveAttribute('aria-label', 'Edit marketing preferences');
    },
};

export const Empty: Story = {
    args: {
        subscriptions: { data: [] },
    },
    parameters: { snapshot: false },
    play: async ({ canvasElement }) => {
        await waitForStorybookReady(canvasElement);
        const canvas = within(canvasElement);

        await expect(canvas.getByText('Marketing & Communication Preferences')).toBeInTheDocument();
        await expect(canvas.getByRole('button', { name: /edit/i })).toBeInTheDocument();
        await expect(canvas.queryByRole('heading', { level: 2 })).not.toBeInTheDocument();
    },
};
