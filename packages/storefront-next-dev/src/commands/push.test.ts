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
import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import type { PushOptions, CloudAPIResponse } from '../types';
import type { push as PushFn } from './push';
import type { createBundle as CreateBundleFn } from '../bundle';
import type { buildMrtConfig as BuildMrtConfigFn } from '../config';
import type fsExtra from 'fs-extra';

// Module-level variables for mocked modules
let push: typeof PushFn;
let createBundle: typeof CreateBundleFn;
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- assigned from dynamic import
let CloudAPIClient: any;
let buildMrtConfig: typeof BuildMrtConfigFn;
let getMrtConfig: ReturnType<typeof vi.fn>;
let info: ReturnType<typeof vi.fn>;
let success: ReturnType<typeof vi.fn>;
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- assigned from dynamic import, freshWarn used in tests
let warn: ReturnType<typeof vi.fn>;
let error: ReturnType<typeof vi.fn>;
let fs: typeof fsExtra;

// Track CloudAPIClient instances for assertions
let mockCloudAPIInstances: Array<{ push: ReturnType<typeof vi.fn>; waitForDeploy: ReturnType<typeof vi.fn> }> = [];

describe('push', () => {
    beforeAll(async () => {
        // Setup mocks before importing modules
        vi.doMock('../bundle', () => ({
            createBundle: vi.fn(() => Promise.resolve('mock-bundle')),
        }));

        vi.doMock('../cloud-api', () => ({
            CloudAPIClient: class MockCloudAPIClient {
                push: ReturnType<typeof vi.fn>;
                waitForDeploy: ReturnType<typeof vi.fn>;
                constructor() {
                    this.push = vi.fn(() =>
                        Promise.resolve<CloudAPIResponse>({
                            url: 'https://example.com/bundle',
                            warnings: [],
                        })
                    );
                    this.waitForDeploy = vi.fn(() => Promise.resolve());
                    mockCloudAPIInstances.push(this);
                }
            },
        }));

        vi.doMock('../config', () => ({
            buildMrtConfig: vi.fn(() => ({
                ssrParameters: {},
                ssrOnly: [],
                ssrShared: [],
            })),
        }));

        vi.doMock('../utils', () => ({
            DEFAULT_CLOUD_ORIGIN: 'https://cloud.mobify.com',
            getDefaultBuildDir: vi.fn(() => '/test/build'),
            getCredentialsFile: vi.fn(() => '/test/.credentials'),
            readCredentials: vi.fn(() =>
                Promise.resolve({
                    username: 'test@example.com',
                    api_key: 'test-api-key',
                })
            ),
            getMrtConfig: vi.fn(() => ({
                defaultMrtProject: 'test-project',
                defaultMrtTarget: 'staging' as string | undefined,
            })),
            getDefaultMessage: vi.fn(() => 'main:abc123'),
        }));

        vi.doMock('../utils/logger', () => ({
            info: vi.fn(),
            success: vi.fn(),
            warn: vi.fn(),
            error: vi.fn(),
            debug: vi.fn(),
        }));

        vi.doMock('fs-extra', () => ({
            default: {
                existsSync: vi.fn(() => true),
            },
            existsSync: vi.fn(() => true),
        }));

        // Dynamic imports after mocks are set up
        const pushModule = await import('./push');
        push = pushModule.push;

        const bundleModule = await import('../bundle');
        createBundle = bundleModule.createBundle;

        const cloudApiModule = await import('../cloud-api');
        CloudAPIClient = cloudApiModule.CloudAPIClient;

        const configModule = await import('../config');
        buildMrtConfig = configModule.buildMrtConfig;

        const utilsModule = await import('../utils');
        getMrtConfig = utilsModule.getMrtConfig as ReturnType<typeof vi.fn>;

        const loggerModule = await import('../utils/logger');
        info = loggerModule.info as ReturnType<typeof vi.fn>;
        success = loggerModule.success as ReturnType<typeof vi.fn>;
        warn = loggerModule.warn as ReturnType<typeof vi.fn>;
        error = loggerModule.error as ReturnType<typeof vi.fn>;

        const fsModule = await import('fs-extra');
        fs = fsModule.default;
    });

    beforeEach(() => {
        vi.clearAllMocks();
        // Clear tracked instances
        mockCloudAPIInstances = [];
        // Reset mocks to default values
        (fs.existsSync as ReturnType<typeof vi.fn>).mockReturnValue(true);
        getMrtConfig.mockReturnValue({
            defaultMrtProject: 'test-project',
            defaultMrtTarget: 'staging' as string | undefined,
        });
    });

    it('should successfully push a bundle with minimal options', async () => {
        const options: PushOptions = {
            projectDirectory: '/test/project',
        };

        await push(options);

        expect(createBundle).toHaveBeenCalled();
        expect(success).toHaveBeenCalledWith('Bundle uploaded successfully!');
    });

    it('should use credentials from options when provided', async () => {
        const options: PushOptions = {
            projectDirectory: '/test/project',
            user: 'user@example.com',
            key: 'test-key',
        };

        await push(options);

        expect(createBundle).toHaveBeenCalled();
    });

    it('should wait for deployment when wait flag is set', async () => {
        const options: PushOptions = {
            projectDirectory: '/test/project',
            target: 'staging',
            wait: true,
        };

        await push(options);

        // Use tracked instance instead of mock.results
        const clientInstance = mockCloudAPIInstances[0];
        expect(clientInstance).toBeDefined();
        expect(clientInstance.waitForDeploy).toHaveBeenCalledWith('test-project', 'staging');
        expect(success).toHaveBeenCalledWith('Deployment complete!');
    });

    it('should use custom build directory when provided', async () => {
        const options: PushOptions = {
            projectDirectory: '/test/project',
            buildDirectory: '/custom/build',
        };

        await push(options);

        expect(buildMrtConfig).toHaveBeenCalledWith('/custom/build', '/test/project');
    });

    it('should use custom message when provided', async () => {
        const options: PushOptions = {
            projectDirectory: '/test/project',
            message: 'Custom deployment message',
        };

        await push(options);

        expect(createBundle).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'Custom deployment message',
            })
        );
    });

    it('should throw error when wait is set without target', async () => {
        getMrtConfig.mockReturnValue({
            defaultMrtProject: 'test-project',
            defaultMrtTarget: undefined,
        });

        const options: PushOptions = {
            projectDirectory: '/test/project',
            wait: true,
        };

        await expect(push(options)).rejects.toThrow('You must provide a target to deploy to when using --wait');
    });

    it('should throw error when only user is provided without key', async () => {
        const options: PushOptions = {
            projectDirectory: '/test/project',
            user: 'user@example.com',
        };

        await expect(push(options)).rejects.toThrow('You must provide both --user and --key together, or neither');
    });

    it('should throw error when only key is provided without user', async () => {
        const options: PushOptions = {
            projectDirectory: '/test/project',
            key: 'test-key',
        };

        await expect(push(options)).rejects.toThrow('You must provide both --user and --key together, or neither');
    });

    it('should throw error when project directory does not exist', async () => {
        (fs.existsSync as ReturnType<typeof vi.fn>).mockReturnValue(false);

        const options: PushOptions = {
            projectDirectory: '/nonexistent/project',
        };

        await expect(push(options)).rejects.toThrow('Project directory "/nonexistent/project" does not exist!');
    });

    it('should throw error when project slug cannot be determined', async () => {
        getMrtConfig.mockReturnValue({
            defaultMrtProject: '',
            defaultMrtTarget: 'staging' as string | undefined,
        });

        const options: PushOptions = {
            projectDirectory: '/test/project',
        };

        await expect(push(options)).rejects.toThrow(
            'Project slug could not be determined from CLI, .env, or package.json'
        );
    });

    it('should throw error when build directory does not exist', async () => {
        (fs.existsSync as ReturnType<typeof vi.fn>).mockReturnValueOnce(true).mockReturnValueOnce(false);

        const options: PushOptions = {
            projectDirectory: '/test/project',
        };

        await expect(push(options)).rejects.toThrow('Build directory "/test/build" does not exist!');
    });

    it('should display warnings from API response', async () => {
        // First, we need to reset the module to get a fresh mock with warnings
        vi.resetModules();
        mockCloudAPIInstances = [];

        // Re-mock with warnings
        vi.doMock('../cloud-api', () => ({
            CloudAPIClient: class MockCloudAPIClient {
                push = vi.fn(() =>
                    Promise.resolve<CloudAPIResponse>({
                        url: 'https://example.com/bundle',
                        warnings: ['Warning 1', 'Warning 2'],
                    })
                );
                waitForDeploy = vi.fn(() => Promise.resolve());
                constructor() {
                    mockCloudAPIInstances.push(this);
                }
            },
        }));

        // Re-import with fresh mocks
        const { push: freshPush } = await import('./push');
        const loggerModule = await import('../utils/logger');
        const freshWarn = loggerModule.warn as ReturnType<typeof vi.fn>;

        const options: PushOptions = {
            projectDirectory: '/test/project',
        };

        await freshPush(options);

        // warnings.forEach(warn) passes index and array as additional parameters
        expect(freshWarn).toHaveBeenNthCalledWith(1, 'Warning 1', 0, ['Warning 1', 'Warning 2']);
        expect(freshWarn).toHaveBeenNthCalledWith(2, 'Warning 2', 1, ['Warning 1', 'Warning 2']);
    });

    it('should use custom cloud origin when provided', async () => {
        const options: PushOptions = {
            projectDirectory: '/test/project',
            cloudOrigin: 'https://custom-cloud.example.com',
        };

        await push(options);

        expect(info).toHaveBeenCalledWith('Beginning upload to https://custom-cloud.example.com');
    });

    it('should set DEPLOY_TARGET environment variable when target is provided', async () => {
        const options: PushOptions = {
            projectDirectory: '/test/project',
            target: 'production',
        };

        await push(options);

        expect(process.env.DEPLOY_TARGET).toBe('production');
    });

    it('should rethrow errors after logging them', async () => {
        const testError = new Error('Test error');
        (createBundle as ReturnType<typeof vi.fn>).mockRejectedValueOnce(testError);

        const options: PushOptions = {
            projectDirectory: '/test/project',
        };

        await expect(push(options)).rejects.toThrow('Test error');
        expect(error).toHaveBeenCalledWith('Test error');
    });
});
