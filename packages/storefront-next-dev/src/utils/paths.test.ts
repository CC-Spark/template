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
import { describe, expect, it } from 'vitest';
import { getBundlePath, getCommerceCloudApiUrl } from './paths';

describe('getCommerceCloudApiUrl', () => {
    it('should construct correct API URL', () => {
        const url = getCommerceCloudApiUrl('test-code');

        expect(url).toBe('https://test-code.api.commercecloud.salesforce.com');
    });

    it('should handle different short codes', () => {
        const url = getCommerceCloudApiUrl('production-123');

        expect(url).toBe('https://production-123.api.commercecloud.salesforce.com');
    });

    it('should return proxyHost when provided', () => {
        const url = getCommerceCloudApiUrl('test-code', 'https://scw:25010');

        expect(url).toBe('https://scw:25010');
    });

    it('should fall back to constructed URL when proxyHost is undefined', () => {
        const url = getCommerceCloudApiUrl('test-code', undefined);

        expect(url).toBe('https://test-code.api.commercecloud.salesforce.com');
    });
});

describe('getBundlePath', () => {
    it('should construct correct bundle path', () => {
        const bundleId = 'test-bundle-123';
        const path = getBundlePath(bundleId);

        expect(path).toBe('/mobify/bundle/test-bundle-123/client/');
    });

    it('should handle different bundle IDs', () => {
        const bundleId = 'production-bundle-456';
        const path = getBundlePath(bundleId);

        expect(path).toBe('/mobify/bundle/production-bundle-456/client/');
    });

    it('should handle bundle IDs with special characters', () => {
        const bundleId = 'bundle-v1.2.3-beta';
        const path = getBundlePath(bundleId);

        expect(path).toBe('/mobify/bundle/bundle-v1.2.3-beta/client/');
    });
});
