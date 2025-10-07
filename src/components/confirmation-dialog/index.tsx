/*
 * Copyright (c) 2025, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

'use client';

// React
import { type ReactElement } from 'react';

// Components
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export interface ConfirmationDialogProps extends React.ComponentProps<typeof AlertDialog> {
    // Dialog content
    /** Dialog title */
    title: string;
    /** Dialog description */
    description: string;

    // Button configuration
    /** Cancel button text */
    cancelButtonText: string;
    /** Confirm button text */
    confirmButtonText: string;
    /** Callback when cancel button is clicked */
    onCancel: () => void;
    /** Callback when confirm button is clicked */
    onConfirm: () => void;

    // Optional props
    /** Whether the confirm button should be disabled */
    confirmButtonDisabled?: boolean;
    /** Custom className for the dialog content */
    className?: string;
    /** ARIA label for the cancel button (optional) */
    cancelButtonAriaLabel?: string;
    /** ARIA label for the confirm button (optional) */
    confirmButtonAriaLabel?: string;
}

/**
 * Reusable confirmation dialog component
 *
 * This component provides a consistent confirmation dialog pattern across the application.
 * It can be used for various confirmation scenarios like removing items, deleting data, etc.
 *
 * @param props - Component props
 * @returns JSX element with confirmation dialog
 */
export function ConfirmationDialog({
    // Dialog content
    title,
    description,

    // Button configuration
    cancelButtonText,
    confirmButtonText,
    onCancel,
    onConfirm,

    // Optional props
    confirmButtonDisabled = false,
    className = 'sm:max-w-sm',
    cancelButtonAriaLabel,
    confirmButtonAriaLabel,
    ...props
}: ConfirmationDialogProps): ReactElement {
    return (
        <AlertDialog {...props}>
            <AlertDialogContent className={className}>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel
                        onClick={onCancel}
                        disabled={confirmButtonDisabled}
                        aria-label={cancelButtonAriaLabel}>
                        {cancelButtonText}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        disabled={confirmButtonDisabled}
                        aria-label={confirmButtonAriaLabel}>
                        {confirmButtonText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
