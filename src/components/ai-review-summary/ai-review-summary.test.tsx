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
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AiReviewSummary } from './ai-review-summary';

describe('AiReviewSummary', () => {
    it('renders with default title when title is not provided', () => {
        render(<AiReviewSummary description="Summary text" rating={4.5} reviewCount={100} />);
        expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('AI Review Summary');
        expect(screen.getByText('Summary text')).toBeInTheDocument();
    });

    it('renders custom title when provided', () => {
        render(<AiReviewSummary title="Custom Title" description="Summary text" rating={4} reviewCount={50} />);
        expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Custom Title');
    });

    it('renders badge when badgeText is provided', () => {
        render(
            <AiReviewSummary
                title="AI Review Summary"
                badgeText="Beta"
                description="Summary"
                rating={4.5}
                reviewCount={10}
            />
        );
        expect(screen.getByText('Beta')).toBeInTheDocument();
    });

    it('does not render badge when badgeText is not provided', () => {
        render(<AiReviewSummary title="AI Review Summary" description="Summary" rating={4.5} reviewCount={10} />);
        expect(screen.queryByText('Beta')).not.toBeInTheDocument();
    });

    it('displays rating with one decimal place', () => {
        render(<AiReviewSummary description="Summary" rating={4.56} reviewCount={20} />);
        expect(screen.getByText('4.6')).toBeInTheDocument();
    });

    it('displays review count in based-on label', () => {
        render(<AiReviewSummary description="Summary" rating={5} reviewCount={128} />);
        expect(screen.getByText(/128/)).toBeInTheDocument();
    });

    it('has data-testid ai-review-summary', () => {
        render(<AiReviewSummary description="Summary" rating={4} reviewCount={5} />);
        expect(screen.getByTestId('ai-review-summary')).toBeInTheDocument();
    });

    it('applies custom className', () => {
        render(<AiReviewSummary description="Summary" rating={4} reviewCount={5} className="custom-class" />);
        const wrapper = screen.getByTestId('ai-review-summary');
        expect(wrapper).toHaveClass('custom-class');
    });
});
