/*
 * Copyright (c) 2025, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useStoreLocator } from '@/extensions/store-locator/providers/store-locator';
import type { FormSearchParams } from '@/extensions/store-locator/stores/store-locator-store';
import uiStringsSL from '@/extensions/store-locator/temp-ui-string-store-locator';

const formSchema = z.object({
    countryCode: z.string().min(1, uiStringsSL.storeLocator.form.selectCountryValidation),
    postalCode: z.string().min(1, uiStringsSL.storeLocator.form.postalCodeValidation),
});

/**
 * Hook to manage store locator form.
 * The form state is backed by the store locator store.
 *
 * @returns An object with `form` (react-hook-form methods) and `onSubmit` handler
 *
 * @example
 * const { form, onSubmit } = useStoreLocatorForm();
 * return <form onSubmit={form.handleSubmit(onSubmit)}>...</form>
 */
export function useStoreLocatorForm() {
    const searchByForm = useStoreLocator((s) => s.searchByForm);
    const storeSearchParams = useStoreLocator((s) => s.searchParams);

    // Use searchParams or default empty values for form initialization
    const defaultValues = storeSearchParams || { countryCode: '', postalCode: '' };

    const form = useForm<FormSearchParams>({
        resolver: zodResolver(formSchema),
        defaultValues,
    });

    // Reset form when store values change externally
    useEffect(() => {
        const newDefaults = storeSearchParams || { countryCode: '', postalCode: '' };
        form.reset(newDefaults);
    }, [storeSearchParams, form]);

    const onSubmit = useCallback(
        (data: FormSearchParams) => {
            searchByForm(data);
        },
        [searchByForm]
    );

    return {
        form,
        onSubmit,
    };
}
