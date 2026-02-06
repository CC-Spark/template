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

import { type ReactElement } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Typography } from '@/components/typography';
import { useCurrency } from '@/providers/currency';
import { cn } from '@/lib/utils';
import type { InfoModalProps } from './types';

// Re-export types for convenience
export type {
    InfoModalData,
    InfoModalProps,
    PaymentSchedule,
    StepInfo,
    ModalLink,
    PaymentScheduleModalData,
} from './types';

import { PaymentScheduleModalContent } from './renderers/payment-schedule-modal-content';

const INFO_MODAL_DESCRIPTION_ID = 'info-modal-description';

/** Escapes a string for safe use inside a RegExp. */
function escapeRegex(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Returns the currency symbol for regex matching (e.g. USD -> $). Unknown codes fall back to $. */
function getCurrencySymbolForRegex(currencyCode: string): string {
    const map: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', JPY: '¥', CAD: '$', AUD: '$' };
    return map[currencyCode?.toUpperCase()] ?? '$';
}

/**
 * InfoModal is a generic, reusable modal component that displays informational content.
 *
 * This modal accepts structured data from adapters and handles all rendering logic internally.
 * It supports payment schedule (e.g. Pay in 4) content from adapters.
 *
 * The adapter should return plain data (not React components), and this modal transforms
 * that data into the appropriate UI structure.
 *
 * @param props - Component props
 * @param props.open - Whether the modal is open
 * @param props.onOpenChange - Callback when modal open state changes
 * @param props.data - Structured modal data from adapter
 * @param props.className - Optional custom className for the dialog content
 * @returns ReactElement
 */
export default function InfoModal({ open, onOpenChange, data, className }: InfoModalProps): ReactElement {
    const currency = useCurrency() || 'USD';

    if (!data) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className={className} aria-describedby={INFO_MODAL_DESCRIPTION_ID}>
                    <DialogHeader>
                        <DialogTitle>Information</DialogTitle>
                    </DialogHeader>
                    <Typography variant="muted" as="p" id={INFO_MODAL_DESCRIPTION_ID} className="mt-4">
                        No data available.
                    </Typography>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className={cn('max-w-2xl sm:max-w-2xl gap-0 p-0 border-0', className)}
                aria-describedby={INFO_MODAL_DESCRIPTION_ID}>
                {data.type === 'payment-schedule' && (
                    <>
                        <DialogHeader className="p-6 pt-8 pb-0 pr-12 text-left">
                            {data.title != null && (
                                <DialogTitle className="text-[1.5rem] font-semibold text-foreground">
                                    {data.title}
                                </DialogTitle>
                            )}
                        </DialogHeader>
                        <div className="mt-4 border-b border-muted-foreground/25" aria-hidden />
                        <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
                            <div className="p-6 space-y-6">
                                {data.description != null ? (
                                    (() => {
                                        const desc = data.description;
                                        const symbol = escapeRegex(getCurrencySymbolForRegex(currency));
                                        const amountPattern = new RegExp(`^(.*?)(${symbol}\\d[\\d,.]*)(.*)$`);
                                        const match = desc.match(amountPattern);
                                        if (match) {
                                            const [, before, amount, after] = match;
                                            return (
                                                <p
                                                    id={INFO_MODAL_DESCRIPTION_ID}
                                                    className="text-sm text-muted-foreground">
                                                    {before}
                                                    <strong className="font-semibold text-foreground">{amount}</strong>
                                                    {after}
                                                </p>
                                            );
                                        }
                                        return (
                                            <p id={INFO_MODAL_DESCRIPTION_ID} className="text-sm text-muted-foreground">
                                                {desc}
                                            </p>
                                        );
                                    })()
                                ) : (
                                    <span id={INFO_MODAL_DESCRIPTION_ID} className="sr-only">
                                        Payment schedule details
                                    </span>
                                )}
                                <PaymentScheduleModalContent
                                    paymentSchedule={data.paymentSchedule}
                                    steps={data.steps}
                                    disclaimer={data.disclaimer}
                                    links={data.links}
                                    currency={currency}
                                />
                            </div>
                        </div>
                        <div className="p-6 pt-4 border-t border-border">
                            <Button className="w-full" onClick={() => onOpenChange(false)}>
                                Close
                            </Button>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
