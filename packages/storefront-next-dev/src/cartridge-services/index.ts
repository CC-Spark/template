/*
 * Copyright (c) 2025, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * Cartridge services exports for programmatic usage
 */

// Deploy cartridge functionality
export { deployCode } from './deploy-cartridge';

// Generate cartridge metadata
export { generateMetadata, type GenerateMetadataOptions } from './generate-cartridge';

// Types
export type { DeployResult } from './types';
