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

'use client';

import { type ReactElement, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useProductContent } from '@/hooks/product-content/use-product-content';
import { useProductView } from '@/providers/product-view';
import CollapsibleSection from '@/components/collapsible-section';
import FaqQuestionItem from './faq-question-item';

/**
 * Tailwind classes for the small "AI" label next to "Ask assistant" in the collapsible summary.
 * Used only here on the PDP FAQ section header.
 */
const AI_BADGE_CLASSES =
    'inline-flex items-center justify-center rounded px-3 py-1 text-xs font-medium min-w-10 bg-muted text-foreground';

/**
 * Ask assistant FAQ section for PDP. Fetches questions from the product content adapter,
 * renders a collapsible section with "Ask assistant" + AI badge and a list of clickable
 * question boxes (sparkle icon, question, chevron). Each box is fully clickable with
 * a greyer border on hover.
 */
export default function Faq(): ReactElement | null {
    const { t } = useTranslation('product');
    const { product } = useProductView();
    const { adapter, isEnabled } = useProductContent();
    const [questions, setQuestions] = useState<string[]>([]);

    useEffect(() => {
        if (!isEnabled || !adapter?.getFaqQuestions) return;
        let cancelled = false;
        void (async () => {
            try {
                const data = await adapter?.getFaqQuestions?.(product.id);
                if (!cancelled && data?.questions?.length) {
                    setQuestions(data.questions);
                }
            } catch {
                if (!cancelled) setQuestions([]);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [adapter, isEnabled, product.id]);

    if (questions.length === 0) {
        return null;
    }

    const handleQuestionClick = (question: string) => {
        // Placeholder for future assistant/chat integration
        void question;
    };

    return (
        <CollapsibleSection
            label={t('askAssistant')}
            labelSupplement={<span className={AI_BADGE_CLASSES}>AI</span>}
            defaultOpen={true}
            className="mt-4">
            <div className="flex flex-col gap-2">
                {questions.map((question, index) => {
                    // Index keys: list order is fixed per load; question strings may repeat.
                    // eslint-disable-next-line react/no-array-index-key -- stable ordered FAQ from adapter
                    return <FaqQuestionItem key={index} question={question} onClick={handleQuestionClick} />;
                })}
            </div>
        </CollapsibleSection>
    );
}
