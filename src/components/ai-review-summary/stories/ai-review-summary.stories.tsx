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
import { AiReviewSummary } from '../ai-review-summary';

const meta: Meta<typeof AiReviewSummary> = {
    title: 'Components/AiReviewSummary',
    component: AiReviewSummary,
    tags: ['autodocs'],
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component: `
AI Review Summary displays an AI-generated summary of customer reviews with rating and badge.
Used inside the Customer Reviews accordion on the product page.
                `,
            },
        },
    },
    argTypes: {
        title: { control: 'text' },
        badgeText: { control: 'text' },
        description: { control: 'text' },
        rating: { control: { type: 'number', min: 0, max: 5, step: 0.1 } },
        reviewCount: { control: { type: 'number', min: 0 } },
    },
};

export default meta;

type Story = StoryObj<typeof AiReviewSummary>;

export const Default: Story = {
    args: {
        title: 'AI Review Summary',
        badgeText: 'Beta',
        description:
            'Customers love the comfort and fit of these shoes. Many mention they run true to size and are great for all-day wear. The style and quality receive consistent praise.',
        rating: 4.5,
        reviewCount: 128,
    },
};

export const ShortSummary: Story = {
    args: {
        title: 'AI Review Summary',
        badgeText: 'Beta',
        description: 'Highly rated for comfort and durability.',
        rating: 4.8,
        reviewCount: 42,
    },
};

export const NoBadge: Story = {
    args: {
        title: 'AI Review Summary',
        description: 'Summary without a badge.',
        rating: 4,
        reviewCount: 10,
    },
};
