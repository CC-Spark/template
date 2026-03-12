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
 * Configuration Context and Provider
 *
 * Provides configuration access throughout the application using React Router's
 * context system. Supports both server and client rendering with proper hydration.
 */

import { createContext, type ReactNode } from 'react';
import { createContext as createRouterContext } from 'react-router';
import type { BaseConfig } from './schema';

/**
 * Router context for application configuration.
 *
 * Populated by `createAppConfigMiddleware` with the `app` section of config.
 * Accessible in loaders, actions, and middleware via `context.get(appConfigContext)`.
 */
// eslint-disable-next-line react-refresh/only-export-components
export const appConfigContext = createRouterContext<Record<string, unknown>>();

/**
 * React context for application configuration.
 *
 * Used by the `useConfig()` hook in React components.
 * Populated by `ConfigProvider` in the component tree.
 */
// eslint-disable-next-line react-refresh/only-export-components
export const ConfigContext = createContext<Record<string, unknown> | null>(null);

/**
 * Extract the `app` section from a full config object.
 *
 * @param staticConfig - The full config object (output of `defineConfig()`)
 * @returns The `app` section of the config
 */
// eslint-disable-next-line react-refresh/only-export-components
export function createAppConfig<T extends BaseConfig>(staticConfig: T): T['app'] {
    return staticConfig.app;
}

interface ConfigProviderProps {
    config: Record<string, unknown>;
    children: ReactNode;
}

/**
 * React context provider for application configuration.
 *
 * Wrap your component tree with this to enable `useConfig()` in child components.
 * Typically placed in the root layout component.
 */
export function ConfigProvider({ config, children }: ConfigProviderProps) {
    return <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>;
}
