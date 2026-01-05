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
 * TypeScript types for Salesforce Commerce Cloud cartridge deployment
 */
export interface HttpRequestOptions {
    auth: { basic: string };
    uri: string;
    method: string;
    headers?: Record<string, string>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body?: any; // BodyInit | ReadStream - using any for flexibility with Node.js streams
    form?: Record<string, unknown>;
    // WebDAV-specific options
    baseUrl?: string;
    // Node.js fetch streaming support
    duplex?: string;
}

export interface HttpResponse {
    statusCode: number;
    statusMessage: string;
    headers: Record<string, string>;
}

export interface DeployResult {
    version: string;
}

export const WEBDAV_BASE = '/on/demandware.servlet/webdav/Sites';
export const CARTRIDGES_PATH = 'Cartridges';

// HTTP Methods
export const HTTP_METHODS = {
    PUT: 'PUT',
    POST: 'POST',
    DELETE: 'DELETE',
} as const;

// Content Types
export const CONTENT_TYPES = {
    APPLICATION_ZIP: 'application/zip',
    APPLICATION_FORM_URLENCODED: 'application/x-www-form-urlencoded',
    APPLICATION_JSON: 'application/json',
} as const;

// WebDAV Operations
export const WEBDAV_OPERATIONS = {
    UNZIP: 'UNZIP',
    TARGET_CARTRIDGES: 'cartridges',
} as const;
