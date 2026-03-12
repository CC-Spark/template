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

import type { ReactNode } from 'react';
import { createAppConfig, ConfigProvider, deepMerge } from '@salesforce/storefront-next-runtime/config';
import type { Config } from '@/types/config';
import { mockBuildConfig } from './config';

export { mockBuildConfig } from './config';

/**
 * Pre-created mock config for convenience
 */
export const mockConfig = createAppConfig(mockBuildConfig);

/**
 * Helper to create a custom config wrapper with overrides
 */
export function createConfigWrapper(configOverrides?: Partial<Config>) {
    const customConfig = configOverrides
        ? createAppConfig(deepMerge(mockBuildConfig, configOverrides as Record<string, unknown>))
        : mockConfig;

    return function CustomConfigWrapper({ children }: { children: ReactNode }) {
        return <ConfigProvider config={customConfig}>{children}</ConfigProvider>;
    };
}
