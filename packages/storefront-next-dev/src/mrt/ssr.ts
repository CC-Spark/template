import type { APIGatewayProxyHandler } from 'aws-lambda';
import serverlessExpress from '@codegenie/serverless-express';
import type { ServerBuild } from 'react-router';
import { createServer } from '../server/index';

// cache the server instance to avoid creating a new one for each request
let handler: APIGatewayProxyHandler | null = null;

const getHandler = async (): Promise<typeof handler> => {
    if (!handler) {
        // @ts-expect-error: This file isn't available during build time, but will be on MRT.
        const { default: build } = (await import('./server/index.js')) as unknown as {
            default: ServerBuild;
        };
        const app = await createServer({
            mode: 'production',
            build,
            streaming: false,
        });
        handler = serverlessExpress({ app, resolutionMode: 'CALLBACK' });
    }
    return handler;
};

// Important Constraints:
// - The export must be named "get" to be compatible with Managed Runtime
// - The handler must follow the AWS Lambda "callback" signature ("async" lambda is not supported by MRT)
export const get: APIGatewayProxyHandler = (event, context, callback) => {
    // Important: It must be set to false to avoid the response
    // being delayed until the event loop is empty
    context.callbackWaitsForEmptyEventLoop = false;

    void getHandler()
        .then((handlerInstance) => {
            if (!handlerInstance) {
                callback(new Error('Serverless Express handler is not available'));
                return;
            }
            void handlerInstance(event, context, callback);
        })
        .catch((error) => {
            callback(error);
        });
};
