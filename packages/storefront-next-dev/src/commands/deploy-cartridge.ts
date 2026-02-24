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

import { InstanceCommand } from '@salesforce/b2c-tooling-sdk/cli';
import { uploadCartridges, type CartridgeMapping } from '@salesforce/b2c-tooling-sdk/operations/code';
import path from 'path';
import fs from 'fs-extra';
import { CARTRIDGES_BASE_DIR, SFNEXT_BASE_CARTRIDGE_NAME, SFNEXT_BASE_CARTRIDGE_OUTPUT_DIR } from '../config';

/**
 * Deploy cartridge command - deploys the Page Designer metadata cartridge to a B2C instance.
 *
 * Inherits all B2C instance flags from InstanceCommand:
 * - --server/-s: B2C instance hostname (env: SFCC_SERVER)
 * - --code-version/-v: Code version (env: SFCC_CODE_VERSION)
 * - --username/-u: Basic auth username (env: SFCC_USERNAME)
 * - --password/-p: Basic auth password (env: SFCC_PASSWORD)
 * - --client-id: OAuth client ID (env: SFCC_CLIENT_ID)
 * - --client-secret: OAuth client secret (env: SFCC_CLIENT_SECRET)
 * - --webdav-server: Separate WebDAV hostname (env: SFCC_WEBDAV_SERVER)
 * - --config: Path to dw.json config file (env: SFCC_CONFIG)
 * - --instance/-i: Named instance from config (env: SFCC_INSTANCE)
 */
export default class Deploy extends InstanceCommand<typeof Deploy> {
    static description = 'Deploy cartridge to B2C Commerce Cloud instance';

    static examples = [
        '<%= config.bin %> <%= command.id %>',
        '<%= config.bin %> <%= command.id %> --project-directory ./my-project',
        '<%= config.bin %> <%= command.id %> -s my-sandbox.dx.commercecloud.salesforce.com',
        '<%= config.bin %> <%= command.id %> --code-version staging',
    ];

    static flags = {
        ...InstanceCommand.baseFlags,
    };

    async run(): Promise<void> {
        const { flags } = await this.parse(Deploy);
        const projectDirectory = flags['project-directory'] || process.cwd();

        // Validate project directory exists
        if (!fs.existsSync(projectDirectory)) {
            this.error(`Project directory doesn't exist: ${projectDirectory}`);
        }

        // Build cartridge paths
        const metadataDir = path.join(projectDirectory, CARTRIDGES_BASE_DIR, SFNEXT_BASE_CARTRIDGE_OUTPUT_DIR);

        // Verify metadata directory exists within cartridge base
        if (!fs.existsSync(metadataDir)) {
            this.error(`Metadata directory doesn't exist: ${metadataDir}. Run 'sfnext generate-cartridge' first.`);
        }

        // Validate required configuration
        this.requireServer();
        this.requireCodeVersion();
        this.requireWebDavCredentials();

        // Create cartridge mapping for the generated metadata cartridge
        const cartridgeSrc = path.join(projectDirectory, CARTRIDGES_BASE_DIR, SFNEXT_BASE_CARTRIDGE_NAME);
        const cartridges: CartridgeMapping[] = [
            {
                name: SFNEXT_BASE_CARTRIDGE_NAME,
                src: cartridgeSrc,
                dest: SFNEXT_BASE_CARTRIDGE_NAME,
            },
        ];

        this.log(
            `Deploying cartridge "${SFNEXT_BASE_CARTRIDGE_NAME}" to code version "${this.resolvedConfig.values.codeVersion}"...`
        );

        // Deploy using SDK - this.instance is provided by InstanceCommand
        await uploadCartridges(this.instance, cartridges);

        this.log(`Code deployed to version "${this.resolvedConfig.values.codeVersion}" successfully!`);
    }
}
