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
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DeployCartridge from './deploy-cartridge';
import fs from 'fs-extra';
import path from 'path';

// Hoisted mocks must be declared before vi.mock calls due to hoisting
const { mockUploadCartridges } = vi.hoisted(() => ({
    mockUploadCartridges: vi.fn(() => Promise.resolve()),
}));

// Mock dependencies
vi.mock('fs-extra', () => ({
    default: {
        existsSync: vi.fn(() => true),
    },
}));

vi.mock('@salesforce/b2c-tooling-sdk/operations/code', () => ({
    uploadCartridges: mockUploadCartridges,
}));

vi.mock('@salesforce/b2c-tooling-sdk/cli', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Command } = require('@oclif/core');
    class InstanceCommand extends Command {
        static baseFlags = {};
        resolvedConfig = {
            values: {
                codeVersion: 'test-version',
            },
        };
        instance = {};
        requireServer() {}
        requireCodeVersion() {}
        requireWebDavCredentials() {}
    }
    return { InstanceCommand };
});

describe('deploy-cartridge command', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (fs.existsSync as ReturnType<typeof vi.fn>).mockReturnValue(true);
    });

    it('should call uploadCartridges with correct cartridge mapping', async () => {
        const cmd = new DeployCartridge([], {} as never);
        const cmdAny = cmd as unknown as {
            parse: ReturnType<typeof vi.fn>;
            log: ReturnType<typeof vi.fn>;
            requireServer: ReturnType<typeof vi.fn>;
            requireCodeVersion: ReturnType<typeof vi.fn>;
            requireWebDavCredentials: ReturnType<typeof vi.fn>;
            run: () => Promise<void>;
        };

        vi.spyOn(cmd as any, 'parse').mockResolvedValue({
            flags: {
                'project-directory': '/test/project',
            },
            args: {},
            argv: [],
            raw: [],
            metadata: {},
        });
        vi.spyOn(cmd as any, 'log').mockImplementation(() => {});
        vi.spyOn(cmd as any, 'requireServer').mockImplementation(() => {});
        vi.spyOn(cmd as any, 'requireCodeVersion').mockImplementation(() => {});
        vi.spyOn(cmd as any, 'requireWebDavCredentials').mockImplementation(() => {});

        await cmdAny.run();

        expect(mockUploadCartridges).toHaveBeenCalledWith(expect.anything(), [
            {
                name: 'app_storefrontnext_base',
                src: path.join('/test/project', 'cartridges', 'app_storefrontnext_base'),
                dest: 'app_storefrontnext_base',
            },
        ]);
    });

    it('should error if project directory does not exist', async () => {
        (fs.existsSync as ReturnType<typeof vi.fn>).mockReturnValue(false);

        const cmd = new DeployCartridge([], {} as never);
        const cmdAny = cmd as unknown as {
            parse: ReturnType<typeof vi.fn>;
            error: (msg: string) => never;
            run: () => Promise<void>;
        };

        vi.spyOn(cmd as any, 'parse').mockResolvedValue({
            flags: {
                'project-directory': '/nonexistent/project',
            },
            args: {},
            argv: [],
            raw: [],
            metadata: {},
        });
        vi.spyOn(cmd as any, 'error').mockImplementation((msg: any) => {
            throw new Error(msg);
        });

        await expect(cmdAny.run()).rejects.toThrow("doesn't exist");
    });

    it('should error if metadata directory does not exist', async () => {
        // First call (project dir) returns true, second call (metadata dir) returns false
        (fs.existsSync as ReturnType<typeof vi.fn>).mockReturnValueOnce(true).mockReturnValueOnce(false);

        const cmd = new DeployCartridge([], {} as never);
        const cmdAny = cmd as unknown as {
            parse: ReturnType<typeof vi.fn>;
            error: (msg: string) => never;
            run: () => Promise<void>;
        };

        vi.spyOn(cmd as any, 'parse').mockResolvedValue({
            flags: {
                'project-directory': '/test/project',
            },
            args: {},
            argv: [],
            raw: [],
            metadata: {},
        });
        vi.spyOn(cmd as any, 'error').mockImplementation((msg: any) => {
            throw new Error(msg);
        });

        await expect(cmdAny.run()).rejects.toThrow("Metadata directory doesn't exist");
    });

    it('should suggest generate-cartridge command in error message', async () => {
        // First call (project dir) returns true, second call (metadata dir) returns false
        (fs.existsSync as ReturnType<typeof vi.fn>).mockReturnValueOnce(true).mockReturnValueOnce(false);

        const cmd = new DeployCartridge([], {} as never);
        const cmdAny = cmd as unknown as {
            parse: ReturnType<typeof vi.fn>;
            error: (msg: string) => never;
            run: () => Promise<void>;
        };

        vi.spyOn(cmd as any, 'parse').mockResolvedValue({
            flags: {
                'project-directory': '/test/project',
            },
            args: {},
            argv: [],
            raw: [],
            metadata: {},
        });
        vi.spyOn(cmd as any, 'error').mockImplementation((msg: any) => {
            throw new Error(msg);
        });

        await expect(cmdAny.run()).rejects.toThrow('sfnext generate-cartridge');
    });

    it('should log success message after deployment', async () => {
        const cmd = new DeployCartridge([], {} as never);
        const cmdAny = cmd as unknown as {
            run: () => Promise<void>;
        };

        vi.spyOn(cmd as any, 'parse').mockResolvedValue({
            flags: {
                'project-directory': '/test/project',
            },
            args: {},
            argv: [],
            raw: [],
            metadata: {},
        });
        const logSpy = vi.spyOn(cmd as any, 'log').mockImplementation(() => {});
        vi.spyOn(cmd as any, 'requireServer').mockImplementation(() => {});
        vi.spyOn(cmd as any, 'requireCodeVersion').mockImplementation(() => {});
        vi.spyOn(cmd as any, 'requireWebDavCredentials').mockImplementation(() => {});

        await cmdAny.run();

        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('deployed'));
    });

    it('should call require methods for validation', async () => {
        const cmd = new DeployCartridge([], {} as never);
        const cmdAny = cmd as unknown as {
            run: () => Promise<void>;
        };

        const requireServerSpy = vi.spyOn(cmd as any, 'requireServer').mockImplementation(() => {});
        const requireCodeVersionSpy = vi.spyOn(cmd as any, 'requireCodeVersion').mockImplementation(() => {});
        const requireWebDavCredentialsSpy = vi
            .spyOn(cmd as any, 'requireWebDavCredentials')
            .mockImplementation(() => {});

        vi.spyOn(cmd as any, 'parse').mockResolvedValue({
            flags: {
                'project-directory': '/test/project',
            },
            args: {},
            argv: [],
            raw: [],
            metadata: {},
        });
        vi.spyOn(cmd as any, 'log').mockImplementation(() => {});

        await cmdAny.run();

        expect(requireServerSpy).toHaveBeenCalled();
        expect(requireCodeVersionSpy).toHaveBeenCalled();
        expect(requireWebDavCredentialsSpy).toHaveBeenCalled();
    });
});
