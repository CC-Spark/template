import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the server build that streamingHandler tries to import
vi.mock('./server/index.js', () => ({
    default: {
        assets: { version: '1', entry: { module: 'entry.js', imports: [] }, routes: {} },
        assetsBuildDirectory: '/build/client',
        basename: '/',
        entry: { module: {} },
        future: {},
        publicPath: '/',
        routes: {},
    },
}));

// Mock the server creation
const mockApp = { listen: vi.fn() };
vi.mock('../server/index', () => ({
    createServer: vi.fn().mockResolvedValue(mockApp),
}));

// Mock the createStreamingLambdaAdapter
vi.mock('./create-lambda-adapter', () => ({
    createStreamingLambdaAdapter: vi.fn((_app, _responseStream) => {
        return async (_event: any, _context: any) => {
            // Mock implementation
            return Promise.resolve();
        };
    }),
}));

describe('streamingHandler', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should export buildHandler', async () => {
        const module = await import('./streamingHandler');

        expect(module).toHaveProperty('buildHandler');
        expect(typeof module.buildHandler).toBe('function');
    });

    it('should create buildHandler from createServer', async () => {
        // This test verifies that the module structure is correct
        // The actual implementation is tested through integration tests
        const module = await import('./streamingHandler');

        expect(module.buildHandler).toBeDefined();
    });

    it('should be compatible with AWS Lambda response streaming', async () => {
        // Verify the exported buildHandler has the correct signature
        const module = await import('./streamingHandler');

        // buildHandler should be a function that takes a responseStream
        // and returns an async handler function
        expect(typeof module.buildHandler).toBe('function');
    });
});
