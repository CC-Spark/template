/*
 * Copyright (c) 2025, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import type { ReactElement } from 'react';
import StoreLocatorForm from './form';
import StoreLocatorList from './list';

/**
 * StoreLocator
 *
 * Composition of store locator form and results list.
 *
 * @returns ReactElement
 */
export default function StoreLocator(): ReactElement {
    return (
        <section aria-labelledby="store-locator-heading" className="p-4">
            <StoreLocatorForm />
            <StoreLocatorList />
        </section>
    );
}
