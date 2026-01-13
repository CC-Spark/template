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
// Default export: Vite plugin (for tree-shaking, plugin users won't bundle CLI code)
export { storefrontNextPlugins as default, type StorefrontNextPluginsConfig } from './plugin';

// Named export: Transform plugin placeholder components (PluginComponent & ProviderProviders)
export { transformPluginPlaceholderPlugin } from './plugins/transformPlugins';

// Named export: Push function for programmatic usage
// For better tree-shaking, import from './commands/push' subpath export instead
export { push } from './commands/push';
export type { PushOptions } from './types';

// Server factory for production use
export { createServer, loadProjectConfig, loadConfigFromEnv } from './server/index';

// Named export: Trim extensions function
import trimExtensions from './extensibility/trim-extensions';
export { trimExtensions };

// Named export: Generate cartridge metadata for programmatic usage
export {
    generateMetadata,
    type GenerateMetadataOptions,
    type GenerateMetadataResult,
} from './cartridge-services/generate-cartridge';
