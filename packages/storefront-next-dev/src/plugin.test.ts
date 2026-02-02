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
import { describe, it, expect } from 'vitest';
import { storefrontNextPlugins, type StorefrontNextPluginsConfig } from './plugin';

describe('storefrontNextPlugins', () => {
    it('should return an array of plugins with default config', () => {
        const plugins = storefrontNextPlugins();
        expect(Array.isArray(plugins)).toBe(true);
        // Base plugins: managedRuntimeBundle, fixReactRouterManifestUrls, patchReactRouter,
        // transformPluginPlaceholder, watchConfigFiles, eventInstrumentationValidator
        expect(plugins.length).toBe(6);
        plugins.forEach((plugin) => {
            expect(plugin).toHaveProperty('name');
        });
    });

    it('should return an array of plugins with empty config', () => {
        const plugins = storefrontNextPlugins({});
        expect(Array.isArray(plugins)).toBe(true);
        expect(plugins.length).toBe(6);
    });

    it('should not include readableChunkFileNamesPlugin when readableChunkNames is false', () => {
        const plugins = storefrontNextPlugins({ readableChunkNames: false });
        expect(plugins.length).toBe(6);
        const pluginNames = plugins.map((p) => p.name);
        expect(pluginNames).not.toContain('odyssey:readable-chunk-file-names');
    });

    it('should include readableChunkFileNamesPlugin when readableChunkNames is true', () => {
        const plugins = storefrontNextPlugins({ readableChunkNames: true });
        expect(plugins.length).toBe(7); // Should have 7 plugins when readableChunkNames is enabled
        const pluginNames = plugins.map((p) => p.name);
        expect(pluginNames).toContain('odyssey:readable-chunk-file-names');
    });

    it('should have all required plugins in correct order', () => {
        const plugins = storefrontNextPlugins({ readableChunkNames: true });
        const pluginNames = plugins.map((p) => p.name);

        // Check order and presence
        expect(pluginNames[0]).toBe('odyssey:managed-runtime-bundle');
        expect(pluginNames[1]).toBe('odyssey:fix-react-router-manifest-urls');
        expect(pluginNames[2]).toBe('odyssey:patch-react-router');
        expect(pluginNames[3]).toBe('odyssey:transform-plugin-placeholder');
        expect(pluginNames[4]).toBe('odyssey:watch-config-files');
        expect(pluginNames[5]).toBe('storefrontnext:event-instrumentation-validator');
        expect(pluginNames[6]).toBe('odyssey:readable-chunk-file-names');
    });

    it('should accept StorefrontNextPluginsConfig type with readableChunkNames', () => {
        const config: StorefrontNextPluginsConfig = {
            readableChunkNames: true,
        };
        const plugins = storefrontNextPlugins(config);
        expect(plugins.length).toBe(7);
    });

    it('should not include eventInstrumentationValidator when explicitly disabled', () => {
        const plugins = storefrontNextPlugins({ eventInstrumentationValidator: false });
        expect(plugins.length).toBe(5); // One less than default
        const pluginNames = plugins.map((p) => p.name);
        expect(pluginNames).not.toContain('storefrontnext:event-instrumentation-validator');
    });

    it('should include staticRegistryPlugin when staticRegistry config is provided', () => {
        const plugins = storefrontNextPlugins({
            staticRegistry: {
                componentPath: '/path/to/components',
                registryPath: '/path/to/registry',
            },
        });
        expect(plugins.length).toBe(7); // 6 base + staticRegistry
        const pluginNames = plugins.map((p) => p.name);
        expect(pluginNames).toContain('storefrontnext:static-registry');
    });

    it('should not include staticRegistryPlugin when only componentPath is provided', () => {
        const plugins = storefrontNextPlugins({
            staticRegistry: {
                componentPath: '/path/to/components',
            } as any,
        });
        expect(plugins.length).toBe(6); // Only base plugins
        const pluginNames = plugins.map((p) => p.name);
        expect(pluginNames).not.toContain('storefrontnext:static-registry');
    });

    it('should not include staticRegistryPlugin when only registryPath is provided', () => {
        const plugins = storefrontNextPlugins({
            staticRegistry: {
                registryPath: '/path/to/registry',
            } as any,
        });
        expect(plugins.length).toBe(6); // Only base plugins
        const pluginNames = plugins.map((p) => p.name);
        expect(pluginNames).not.toContain('storefrontnext:static-registry');
    });
});
