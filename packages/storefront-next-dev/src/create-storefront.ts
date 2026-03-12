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
import { execSync } from 'child_process';
import { generateEnvFile } from './utils';
import { error, warn } from './utils/logger';
import prompts from 'prompts';
import path from 'path';
import fs from 'fs-extra';
import dotenv from 'dotenv';
import trimExtensions from './extensibility/trim-extensions';
import {
    resolveDependenciesForMultiple,
    validateNoCycles,
    type ExtensionConfig,
} from './extensibility/dependency-utils';
import { prepareForLocalDev } from './utils/local-dev-setup';

const DEFAULT_STOREFRONT = 'sfcc-storefront';
const STOREFRONT_NEXT_GITHUB_URL = 'https://github.com/SalesforceCommerceCloud/storefront-next-template';

export const createStorefront = async (
    options: { verbose?: boolean; localPackagesDir?: string; name?: string; template?: string } = {}
) => {
    // Check if git is available before proceeding
    try {
        execSync('git --version', { stdio: 'ignore' });
    } catch (e) {
        error(`❌ git isn't installed or found in your PATH. Install git before running this command: ${String(e)}`);
        process.exit(1);
    }

    // Use provided name or prompt for it
    let storefront = options.name;
    if (!storefront) {
        const response = await prompts({
            type: 'text',
            name: 'storefront',
            message: '🏪 What would you like to name your storefront?\n',
            initial: DEFAULT_STOREFRONT,
        });
        storefront = response.storefront;
    }
    if (!storefront) {
        error('Storefront name is required.');
        process.exit(1);
    }
    // eslint-disable-next-line no-console
    console.log('\n');

    // Use provided template or prompt for it
    let template = options.template;
    if (!template) {
        const response = await prompts({
            type: 'select',
            name: 'template',
            message: '📄 Which template would you like to use for your storefront?\n',
            choices: [
                { title: 'Salesforce B2C Commerce Retail Storefront', value: STOREFRONT_NEXT_GITHUB_URL },
                { title: 'A different template (I will provide the Github URL)', value: 'custom' },
            ],
        });
        template = response.template;
        // eslint-disable-next-line no-console
        console.log('\n');
        if (template === 'custom') {
            const { githubUrl } = await prompts({
                type: 'text',
                name: 'githubUrl',
                message: '🌐 What is the Github URL for your template?\n',
            });
            if (!githubUrl) {
                error('Github URL is required.');
                process.exit(1);
            }
            template = githubUrl;
        }
    }
    if (!template) {
        error('Template is required.');
        process.exit(1);
    }
    // Clone the template based on the template URL and storefront name
    // Use --depth 1 for shallow clone since we delete .git anyway - much faster!
    execSync(`git clone --depth 1 ${template} ${storefront}`);
    // remove the .git directory so it starts out as a local project
    const gitDir = path.join(storefront, '.git');
    if (fs.existsSync(gitDir)) {
        fs.rmSync(gitDir, { recursive: true, force: true });
    }

    // Hook: Prepare for local development if cloned from a local monorepo (file:// URL)
    // or if --local-packages-dir was provided
    if (template.startsWith('file://') || options.localPackagesDir) {
        const templatePath = template.replace('file://', '');
        // Use provided localPackagesDir, or derive from template path
        const sourcePackagesDir = options.localPackagesDir || path.dirname(templatePath);
        await prepareForLocalDev({
            projectDirectory: storefront,
            sourcePackagesDir,
        });
    }

    // eslint-disable-next-line no-console
    console.log('\n');
    // configure extensions
    if (fs.existsSync(path.join(storefront, 'src', 'extensions', 'config.json'))) {
        const extensionConfigText = fs.readFileSync(path.join(storefront, 'src', 'extensions', 'config.json'), 'utf8');
        const extensionConfig: ExtensionConfig = JSON.parse(extensionConfigText);
        if (extensionConfig.extensions) {
            // Validate no circular dependencies before proceeding
            try {
                validateNoCycles(extensionConfig);
            } catch (e) {
                error(`Extension configuration error: ${(e as Error).message}`);
                process.exit(1);
            }

            const { selectedExtensions } = await prompts({
                type: 'multiselect',
                name: 'selectedExtensions',
                message:
                    '🔌 Which extension would you like to enable? (Use arrow keys to select, space to toggle, and enter to confirm.)\n',
                choices: Object.keys(extensionConfig.extensions).map((extension) => ({
                    title: `${extensionConfig.extensions[extension].name} - ${
                        extensionConfig.extensions[extension].description
                    }`,
                    value: extension,
                    selected: extensionConfig.extensions[extension].defaultOn ?? true,
                })),
                instructions: false,
            });

            // Resolve all dependencies for selected extensions
            const resolvedExtensions = resolveDependenciesForMultiple(selectedExtensions, extensionConfig);

            // Check if any dependencies were auto-added
            const selectedSet = new Set(selectedExtensions);
            const autoAdded = resolvedExtensions.filter((ext: string) => !selectedSet.has(ext));

            if (autoAdded.length > 0) {
                // Find which extensions required the auto-added dependencies
                for (const addedExt of autoAdded) {
                    const dependentExts = selectedExtensions.filter((selected: string) => {
                        const deps = extensionConfig.extensions[selected]?.dependencies || [];
                        return (
                            deps.includes(addedExt) ||
                            resolvedExtensions.indexOf(addedExt) < resolvedExtensions.indexOf(selected)
                        );
                    });
                    if (dependentExts.length > 0) {
                        const addedName = extensionConfig.extensions[addedExt]?.name || addedExt;
                        const dependentNames = dependentExts
                            .map((ext: string) => extensionConfig.extensions[ext]?.name || ext)
                            .join(', ');
                        warn(`${dependentNames} requires ${addedName}. ${addedName} has been automatically added.`);
                    }
                }
            }

            const enabledExtensions = Object.fromEntries(resolvedExtensions.map((ext: string) => [ext, true]));
            trimExtensions(
                storefront,
                enabledExtensions,
                { extensions: extensionConfig.extensions },
                options?.verbose || false
            );
        }
    }
    // interview for config overrides
    const configMetaPath = fs.existsSync(path.join(storefront, 'config-meta.json'))
        ? path.join(storefront, 'config-meta.json')
        : path.join(storefront, 'src', 'config', 'config-meta.json');
    const configMeta = JSON.parse(fs.readFileSync(configMetaPath, 'utf8'));
    // Load default config values from .env.default if it exists
    const envDefaultPath = path.join(storefront, '.env.default');
    let envDefaultValues: Record<string, string> = {};
    if (fs.existsSync(envDefaultPath)) {
        const result = dotenv.parse(fs.readFileSync(envDefaultPath, 'utf8'));
        envDefaultValues = result;
    }
    // eslint-disable-next-line no-console
    console.log('\n⚙️ We will now configure your storefront before it will be ready to run.\n');
    const configOverrides: Record<string, string> = {};
    for (const config of configMeta.configs) {
        const answer = await prompts({
            type: 'text',
            name: config.key,
            message: `What is the value for ${config.name}? (default: ${envDefaultValues[config.key]})\n`,
            initial: envDefaultValues[config.key] ?? '',
        });
        configOverrides[config.key] = answer[config.key];
    }
    // Generate the .env file based on the .env.default file and the config overrides from the extension config
    generateEnvFile(storefront, configOverrides);
    // Print banner after setup is complete
    const BANNER = `
    ╔══════════════════════════════════════════════════════════════════╗
    ║                       CONGRATULATIONS                            ║
    ╚══════════════════════════════════════════════════════════════════╝

        🎉 Congratulations! Your storefront is ready to use! 🎉
        What's next:
        - Navigate to the storefront directory: cd ${storefront}
        - Install dependencies: pnpm install
        - Build the storefront: pnpm run build
        - Run the development server: pnpm run dev
    `;
    // eslint-disable-next-line no-console
    console.log(BANNER);
};
