/*
 * Copyright (c) 2025, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { useEffect } from 'react';

export type ModalResetTiming = 'open' | 'close' | 'both';

export interface UseModalStateResetOptions {
    /**
     * Whether the modal is currently open
     */
    open: boolean;
    /**
     * Callback to reset state
     */
    onReset: () => void;
    /**
     * When to trigger the reset:
     * - 'open': Reset when modal opens
     * - 'close': Reset when modal closes
     * - 'both': Reset on both open and close
     *
     * @default 'open'
     */
    resetOn?: ModalResetTiming;
}

/**
 * Generic hook for resetting modal state based on open/close events
 *
 * This hook provides a declarative way to reset component state when a modal
 * opens or closes. It's commonly used to:
 * - Clear form inputs when modal opens (fresh start)
 * - Reset refs/flags when modal closes (prepare for next open)
 * - Ensure consistent state across modal sessions
 *
 * Used by:
 * - CartItemEditModal: Resets product/variation state on open
 * - BonusProductModal: Resets processing flags on close
 *
 * @param options - Configuration options for state reset behavior
 *
 */
export function useModalStateReset({ open, onReset, resetOn = 'open' }: UseModalStateResetOptions) {
    useEffect(() => {
        const shouldResetOnOpen = (resetOn === 'open' || resetOn === 'both') && open;
        const shouldResetOnClose = (resetOn === 'close' || resetOn === 'both') && !open;

        if (shouldResetOnOpen || shouldResetOnClose) {
            onReset();
        }
        // onReset is typically a stable callback or inline function
        // We intentionally include it to allow consumers to control when reset happens
    }, [open, onReset, resetOn]);
}
