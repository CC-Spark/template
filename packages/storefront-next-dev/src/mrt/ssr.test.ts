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
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { APIGatewayProxyEvent, Context, Callback } from 'aws-lambda';
import type { Express } from 'express';

// Mock modules with factory functions
vi.mock('@codegenie/serverless-express', () => ({
    default: vi.fn(),
}));

vi.mock('../server/index', () => ({
    createServer: vi.fn(),
}));

// Mock the server build import
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

// Import after mocks are set up
const serverlessExpress = (await import('@codegenie/serverless-express')).default;
const { createServer } = await import('../server/index');

describe('mrt/ssr', () => {
    let mockExpressApp: Express;
    let mockServerlessHandler: ReturnType<typeof vi.fn>;
    let mockContext: Context;
    let mockEvent: APIGatewayProxyEvent;
    let mockCallback: Callback;

    beforeAll(() => {
        // Mock Express app
        mockExpressApp = {
            use: vi.fn(),
            all: vi.fn(),
            disable: vi.fn(),
        } as unknown as Express;

        // Mock serverless handler
        mockServerlessHandler = vi.fn();
        vi.mocked(serverlessExpress).mockReturnValue(mockServerlessHandler as any);

        // Mock createServer
        vi.mocked(createServer).mockResolvedValue(mockExpressApp);
    });

    beforeEach(() => {
        vi.clearAllMocks();

        // Mock AWS Lambda context
        mockContext = {
            callbackWaitsForEmptyEventLoop: true,
            functionName: 'test-function',
            functionVersion: '1',
            invokedFunctionArn: 'arn:aws:lambda:us-east-1:123456789012:function:test-function',
            memoryLimitInMB: '128',
            awsRequestId: 'test-request-id',
            logGroupName: '/aws/lambda/test-function',
            logStreamName: '2024/01/01/[$LATEST]test',
            getRemainingTimeInMillis: () => 3000,
            done: vi.fn(),
            fail: vi.fn(),
            succeed: vi.fn(),
        };

        // Mock AWS Lambda event (API Gateway v1)
        mockEvent = {
            resource: '/',
            httpMethod: 'GET',
            path: '/',
            queryStringParameters: null,
            multiValueQueryStringParameters: null,
            headers: {},
            multiValueHeaders: {},
            body: null,
            isBase64Encoded: false,
            requestContext: {
                accountId: '123456789012',
                apiId: 'test-api-id',
                protocol: 'HTTP/1.1',
                httpMethod: 'GET',
                path: '/',
                stage: '$default',
                requestId: 'test-request-id',
                requestTime: '01/Jan/2024:00:00:00 +0000',
                requestTimeEpoch: 1704067200000,
                identity: {
                    sourceIp: '127.0.0.1',
                    userAgent: 'test-agent',
                    accessKey: null,
                    accountId: null,
                    apiKey: null,
                    apiKeyId: null,
                    caller: null,
                    clientCert: null,
                    cognitoAuthenticationProvider: null,
                    cognitoAuthenticationType: null,
                    cognitoIdentityId: null,
                    cognitoIdentityPoolId: null,
                    principalOrgId: null,
                    user: null,
                    userArn: null,
                },
                authorizer: {},
                resourceId: 'test-resource-id',
                resourcePath: '/',
            },
            pathParameters: null,
            stageVariables: null,
        };

        // Mock callback
        mockCallback = vi.fn() as Callback;
    });

    describe('get handler', () => {
        it('should set callbackWaitsForEmptyEventLoop to false', async () => {
            const { get } = await import('./ssr');

            void get(mockEvent, mockContext, mockCallback);

            expect(mockContext.callbackWaitsForEmptyEventLoop).toBe(false);
        });

        it('should initialize handler with correct server and serverless express configuration', async () => {
            const { get } = await import('./ssr');

            void get(mockEvent, mockContext, mockCallback);

            // Wait for handler initialization
            await vi.waitFor(() => {
                expect(vi.mocked(createServer)).toHaveBeenCalled();
                expect(vi.mocked(serverlessExpress)).toHaveBeenCalled();
            });

            // Verify createServer was called with correct parameters
            const createServerCall = vi.mocked(createServer).mock.calls[0];
            expect(createServerCall).toBeDefined();
            expect(createServerCall[0]).toMatchObject({
                mode: 'production',
            });
            expect(createServerCall[0].build).toBeDefined();
            expect(createServerCall[0].build).toHaveProperty('assets');
            expect(createServerCall[0].build).toHaveProperty('routes');

            // Verify serverless express was called with correct configuration
            expect(vi.mocked(serverlessExpress)).toHaveBeenCalledWith({
                app: mockExpressApp,
                resolutionMode: 'CALLBACK',
            });
        });

        it('should invoke the serverless handler with event, context, and callback', async () => {
            const { get } = await import('./ssr');

            void get(mockEvent, mockContext, mockCallback);

            await vi.waitFor(() => {
                expect(mockServerlessHandler).toHaveBeenCalled();
            });

            expect(mockServerlessHandler).toHaveBeenCalledWith(mockEvent, mockContext, mockCallback);
        });

        it('should maintain AWS Lambda callback signature (not async)', async () => {
            const { get } = await import('./ssr');

            // Verify that the handler does NOT return a Promise
            // AWS Lambda callback handlers should be synchronous functions
            const result = get(mockEvent, mockContext, mockCallback);

            expect(result).toBeUndefined();
        });

        it('should handle multiple concurrent requests correctly', async () => {
            const { get } = await import('./ssr');

            const context1 = { ...mockContext, awsRequestId: 'request-1' };
            const context2 = { ...mockContext, awsRequestId: 'request-2' };
            const context3 = { ...mockContext, awsRequestId: 'request-3' };

            const callback1 = vi.fn() as Callback;
            const callback2 = vi.fn() as Callback;
            const callback3 = vi.fn() as Callback;

            // Simulate concurrent requests
            void get(mockEvent, context1, callback1);
            void get(mockEvent, context2, callback2);
            void get(mockEvent, context3, callback3);

            await vi.waitFor(() => {
                // All three should have been invoked
                expect(mockServerlessHandler).toHaveBeenCalledTimes(3);
            });

            // Each should have been called with their respective context
            expect(mockServerlessHandler).toHaveBeenCalledWith(mockEvent, context1, callback1);
            expect(mockServerlessHandler).toHaveBeenCalledWith(mockEvent, context2, callback2);
            expect(mockServerlessHandler).toHaveBeenCalledWith(mockEvent, context3, callback3);
        });
    });

    describe('MRT constraints compliance', () => {
        it('should export handler named "get" for MRT compatibility', async () => {
            const module = await import('./ssr');

            expect(module).toHaveProperty('get');
            expect(typeof module.get).toBe('function');
        });

        it('should use callback signature instead of async handler', async () => {
            const { get } = await import('./ssr');

            // AWS Lambda async handlers return a Promise
            // MRT-compatible handlers use callbacks and return void
            const returnValue = get(mockEvent, mockContext, mockCallback);

            expect(returnValue).toBeUndefined();
        });

        it('should set callbackWaitsForEmptyEventLoop to false immediately', async () => {
            const { get } = await import('./ssr');

            // Context starts with true
            expect(mockContext.callbackWaitsForEmptyEventLoop).toBe(true);

            void get(mockEvent, mockContext, mockCallback);

            // Should be set to false synchronously, before any async operations
            expect(mockContext.callbackWaitsForEmptyEventLoop).toBe(false);
        });
    });

    describe('error handling', () => {
        it('should handle errors during handler initialization', async () => {
            // Reset the module to test error handling
            vi.resetModules();

            const initError = new Error('Failed to initialize handler');
            vi.mocked(createServer).mockRejectedValueOnce(initError);

            // Force fresh import with unique query parameter
            const timestamp = Date.now().toString();
            const { get } = await import(`./ssr?t=${timestamp}`);

            void get(mockEvent, mockContext, mockCallback);

            await vi.waitFor(
                () => {
                    expect(mockCallback).toHaveBeenCalledWith(initError);
                },
                { timeout: 2000 }
            );
        });

        it('should handle null handler gracefully', async () => {
            // Reset the module to test null handler
            vi.resetModules();

            vi.mocked(serverlessExpress).mockReturnValueOnce(null as any);

            // Force fresh import with unique query parameter
            const timestamp = Date.now().toString();
            const { get } = await import(`./ssr?t=${timestamp}`);

            void get(mockEvent, mockContext, mockCallback);

            await vi.waitFor(
                () => {
                    expect(mockCallback).toHaveBeenCalledWith(
                        expect.objectContaining({
                            message: 'Serverless Express handler is not available',
                        })
                    );
                },
                { timeout: 2000 }
            );
        });
    });
});
