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

/**
 * Configuration access for loaders, actions, utilities, and React components.
 *
 * Two functions:
 * - `getConfig()` — For loaders, actions, and utilities
 * - `useConfig()` — For React components (hook required for React Context)
 */

import { useContext } from 'react';
import type { RouterContextProvider } from 'react-router';
import { ConfigContext, appConfigContext } from './context';

declare global {
    interface Window {
        __APP_CONFIG__?: Record<string, unknown>;
    }
}

/**
 * Get configuration in loaders, actions, and utilities.
 *
 * Pass context parameter in server loaders/actions.
 * Omit context parameter in client loaders (uses window.__APP_CONFIG__).
 *
 * @param context - Router context for server loaders/actions
 * @returns App configuration
 */
export function getConfig<T extends Record<string, unknown> = Record<string, unknown>>(
    context?: Readonly<RouterContextProvider>
): T {
    if (context) {
        const config = context.get(appConfigContext);
        if (!config) {
            throw new Error(
                'Configuration not available in router context. ' +
                    'Ensure appConfigMiddleware.server runs before other middleware.'
            );
        }
        return config as T;
    }

    if (typeof window !== 'undefined' && window.__APP_CONFIG__) {
        return window.__APP_CONFIG__ as T;
    }

    throw new Error(
        'Configuration not available. This can happen if:\n' +
            '1. Server: Pass context parameter: getConfig(context)\n' +
            '2. Client: Ensure window.__APP_CONFIG__ was injected during SSR\n' +
            '3. React component: Use useConfig() hook instead of getConfig()'
    );
}

/**
 * Get configuration in React components.
 *
 * Must use this hook (not getConfig) because React Context requires useContext().
 *
 * @returns App configuration
 */
export function useConfig<T extends Record<string, unknown> = Record<string, unknown>>(): T {
    const config = useContext(ConfigContext);
    if (!config) {
        throw new Error(
            'useConfig must be used within ConfigProvider. ' +
                'Ensure ConfigProvider wraps your component tree in root.tsx'
        );
    }
    return config as T;
}
