/*
 * Copyright (c) 2025, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

interface TextSeparatorProps extends HTMLAttributes<HTMLDivElement> {
    text: string;
}

/**
 * TextSeparator
 *
 * Visually separates content with a horizontal rule and a centered small text label.
 *
 * @param text - The label to render in the center of the separator
 * @returns ReactElement
 *
 * @example
 * <TextSeparator text="Or" />
 */
const TextSeparator = forwardRef<HTMLDivElement, TextSeparatorProps>(({ className, text, ...props }, ref) => (
    <div ref={ref} className={cn('relative my-2 flex items-center', className)} {...props}>
        <Separator className="absolute left-0 right-0" />
        <span className="bg-background text-muted-foreground mx-auto px-2 text-xs relative z-10">{text}</span>
    </div>
));
TextSeparator.displayName = 'TextSeparator';

export { TextSeparator };
