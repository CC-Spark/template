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
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

describe('routes.ts', () => {
    let originalReactRouterAppDirectory: string;

    beforeEach(() => {
        originalReactRouterAppDirectory = globalThis.__reactRouterAppDirectory;
        globalThis.__reactRouterAppDirectory = __dirname;
    });

    afterEach(() => {
        globalThis.__reactRouterAppDirectory = originalReactRouterAppDirectory;
    });

    it('should export the routes object', async () => {
        const { default: routes } = await import('./routes');
        return expect(routes).resolves.toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: 'routes/_index',
                    path: undefined,
                }),
                expect.objectContaining({
                    id: 'routes/category.$categoryId',
                    path: 'category/:categoryId',
                }),
                expect.objectContaining({
                    id: 'routes/product.$productId',
                    path: 'product/:productId',
                }),
                expect.objectContaining({
                    id: 'routes/cart',
                    path: 'cart',
                }),
                expect.objectContaining({
                    id: 'routes/checkout',
                    path: 'checkout',
                }),
            ])
        );
    });
});
