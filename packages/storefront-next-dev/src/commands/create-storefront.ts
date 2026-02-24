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

import { Command, Flags } from '@oclif/core';
import { createStorefront } from '../create-storefront';

/**
 * Create storefront command - creates a new storefront project from template.
 */
export default class CreateStorefront extends Command {
    static description = 'Create a storefront project';

    static examples = [
        '<%= config.bin %> <%= command.id %>',
        '<%= config.bin %> <%= command.id %> -v',
        '<%= config.bin %> <%= command.id %> -n my-storefront -t https://github.com/org/template',
        '<%= config.bin %> <%= command.id %> -l /path/to/monorepo/packages',
    ];

    static flags = {
        verbose: Flags.boolean({
            char: 'v',
            description: 'Verbose mode',
            default: false,
        }),
        name: Flags.string({
            char: 'n',
            description: 'Storefront project name',
        }),
        template: Flags.string({
            char: 't',
            description: 'Template GitHub URL to use for the storefront',
        }),
        'local-packages-dir': Flags.string({
            char: 'l',
            description: 'Local monorepo packages directory for file:// templates (pre-fills dependency paths)',
        }),
    };

    async run(): Promise<void> {
        const { flags } = await this.parse(CreateStorefront);

        await createStorefront({
            verbose: flags.verbose,
            name: flags.name,
            template: flags.template,
            localPackagesDir: flags['local-packages-dir'],
        });
    }
}
