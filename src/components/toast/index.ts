/*
 * Copyright (c) 2025, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { useCallback } from 'react';
import { toast } from 'sonner';

export type ToastType = 'success' | 'error' | 'info';

/**
 * Custom hook for toast notifications using sonner
 */
export function useToast() {
    const addToast = useCallback((message: string, type: ToastType = 'info', duration = 5000) => {
        const options = {
            duration,
            action: {
                label: 'Close',
                onClick: () => toast.dismiss(),
            },
        };

        switch (type) {
            case 'success':
                return toast.success(message, options);
            case 'error':
                return toast.error(message, options);
            default:
                return toast(message, options);
        }
    }, []);

    return { addToast };
}

// Re-export toast and Toaster from sonner for convenience
export { toast, Toaster } from 'sonner';
