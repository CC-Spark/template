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

import { Command } from '@oclif/core';
import path from 'path';
import fs from 'fs-extra';
import { generateMetadata } from '../cartridge-services/generate-cartridge';
import { CARTRIDGES_BASE_DIR, SFNEXT_BASE_CARTRIDGE_OUTPUT_DIR } from '../config';
import { commonFlags } from '../flags';

/**
 * Generate cartridge metadata command.
 *
 * Scans the project for decorated components and generates Page Designer
 * metadata files in the cartridge directory.
 */
export default class Generate extends Command {
    static description = 'Generate Page Designer component metadata from decorated components';

    static examples = ['<%= config.bin %> <%= command.id %>', '<%= config.bin %> <%= command.id %> -d ./my-project'];

    static flags = {
        ...commonFlags,
    };

    async run(): Promise<void> {
        const { flags } = await this.parse(Generate);
        const projectDirectory = flags['project-directory'];

        // Validate project directory exists
        if (!fs.existsSync(projectDirectory)) {
            this.error(`Project directory doesn't exist: ${projectDirectory}`);
        }

        // Full path where metadata files are generated
        const metadataDir = path.join(projectDirectory, CARTRIDGES_BASE_DIR, SFNEXT_BASE_CARTRIDGE_OUTPUT_DIR);

        // Ensure the full metadata directory path exists
        if (!fs.existsSync(metadataDir)) {
            this.log(`Creating metadata directory: ${metadataDir}`);
            fs.mkdirSync(metadataDir, { recursive: true });
        }

        this.log('Generating Page Designer metadata...');

        await generateMetadata(projectDirectory, metadataDir);

        this.log('Page Designer metadata generated successfully!');
    }
}
