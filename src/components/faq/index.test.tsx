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

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import Faq from './index';

const mockQuestions = {
    questions: [
        'What sizes does this come in?',
        'Which color would work best for a minimalist space?',
        'Will this work in a minimalist living room?',
    ],
};

const mockGetFaqQuestions = vi.fn();

const mockUseProductContent = vi.fn();
vi.mock('@/hooks/product-content/use-product-content', () => ({
    useProductContent: () => mockUseProductContent(),
}));

vi.mock('@/providers/product-view', () => ({
    useProductView: () => ({
        product: { id: 'test-product-id' },
    }),
}));

describe('Faq', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseProductContent.mockReturnValue({
            adapter: { getFaqQuestions: mockGetFaqQuestions },
            isEnabled: true,
        });
        mockGetFaqQuestions.mockResolvedValue(mockQuestions);
    });

    it('renders Ask assistant section with questions after data loads', async () => {
        render(<Faq />);

        await waitFor(() => {
            expect(screen.getByText('Ask assistant')).toBeInTheDocument();
        });

        expect(screen.getByText('AI')).toBeInTheDocument();
        expect(screen.getByText('What sizes does this come in?')).toBeInTheDocument();
        expect(screen.getByText('Which color would work best for a minimalist space?')).toBeInTheDocument();
        expect(screen.getByText('Will this work in a minimalist living room?')).toBeInTheDocument();
    });

    it('renders nothing when adapter has no getFaqQuestions', async () => {
        mockUseProductContent.mockReturnValue({
            adapter: {},
            isEnabled: true,
        });

        const { container } = render(<Faq />);

        await waitFor(() => {
            expect(container.firstChild).toBeNull();
        });
    });

    it('renders nothing when getFaqQuestions returns empty questions', async () => {
        mockGetFaqQuestions.mockResolvedValue({ questions: [] });

        const { container } = render(<Faq />);

        await waitFor(() => {
            expect(mockGetFaqQuestions).toHaveBeenCalledWith('test-product-id');
        });
        expect(container.firstChild).toBeNull();
    });

    it('calls getFaqQuestions with product id', async () => {
        render(<Faq />);

        await waitFor(() => {
            expect(mockGetFaqQuestions).toHaveBeenCalledWith('test-product-id');
        });
    });
});
