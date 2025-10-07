/*
 * Copyright (c) 2025, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
'use client';

/**
 * Store Locator Layout Context
 *
 * Provides a lightweight mechanism to influence layout behavior of the
 * Store Locator feature without coupling components to specific containers.
 *
 * Current use case: allow components such as `StoreDetails` to render in a
 * forced mobile layout when embedded in constrained surfaces (e.g. a sheet),
 * while maintaining normal responsive behavior by default on the full page.
 */

import { createContext, type PropsWithChildren, useContext } from 'react';

/**
 * Shape of the value exposed by the Store Locator layout context.
 *
 * - When `forceMobile` is true, components should render using the mobile
 *   layout regardless of the actual viewport width.
 * - Defaults to `false` when no provider is present in the tree.
 */
interface StoreLocatorLayoutValue {
    /** When true, components should render using the mobile layout regardless of viewport */
    forceMobile: boolean;
}

/**
 * Context that carries layout directives for Store Locator components.
 * Defaults to `{ forceMobile: false }` so that, in the absence of a provider,
 * the Store Locator renders with normal responsive behavior.
 */
const StoreLocatorLayoutContext = createContext<StoreLocatorLayoutValue>({ forceMobile: false });

/**
 * StoreLocatorLayoutProvider
 *
 * Context provider that lets parents opt Store Locator components into a
 * forced mobile layout. Useful for constrained containers like sheets, drawers,
 * or popovers where the desktop grid should be suppressed.
 *
 * @param props.forceMobile - If true, force mobile layout for descendants
 * @param props.children - React children that can read layout directives
 *
 * @example
 * <StoreLocatorLayoutProvider forceMobile>
 *   <StoreLocator />
 * </StoreLocatorLayoutProvider>
 */
export function StoreLocatorLayoutProvider({ forceMobile, children }: PropsWithChildren<StoreLocatorLayoutValue>) {
    return <StoreLocatorLayoutContext.Provider value={{ forceMobile }}>{children}</StoreLocatorLayoutContext.Provider>;
}

/**
 * Hook to consume the Store Locator layout directives. Returns the current
 * layout flags. If no provider is mounted, the default value
 * `{ forceMobile: false }` is returned.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useStoreLocatorLayout(): StoreLocatorLayoutValue {
    return useContext(StoreLocatorLayoutContext);
}
