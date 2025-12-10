import type { APIGatewayProxyEvent, Context } from 'aws-lambda';
import type { Writable } from 'stream';
import type { Express } from 'express';
import type { ServerBuild } from 'react-router';
import { createServer } from '../server/index';
import { createStreamingLambdaAdapter } from './create-lambda-adapter';

// type AsyncStreamingHandlerFunction = (event: APIGatewayProxyEvent, responseStream: Writable, context: Context) => Promise<void>;

type AsyncHandlerFunction = (event: APIGatewayProxyEvent, context: Context) => Promise<void>;

type BuildHandler = (responseStream: Writable) => AsyncHandlerFunction;

const createBuildHandler = (app: Express): BuildHandler => {
    return (responseStream: Writable) => {
        return async (event: APIGatewayProxyEvent, context: Context) => {
            const streamingLambdaAdapter = createStreamingLambdaAdapter(app, responseStream);
            return streamingLambdaAdapter(event, context);
        };
    };
};

// @ts-expect-error: This file isn't available during build time, but will be on MRT.
const { default: build } = (await import('./server/index.js')) as unknown as {
    default: ServerBuild;
};
const app = await createServer({
    mode: 'production',
    build,
    streaming: true,
});

export const buildHandler = createBuildHandler(app);
