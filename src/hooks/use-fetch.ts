/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useRef } from 'react';
import { useFetcher } from 'react-router';
import type { CommerceSdkKeyMap, CommerceSdkCtorFromKey } from '@/lib/scapi';
import { encodeBase64Url } from '@/lib/url';

type ResolveFn<T> = (value: T) => void;
type RejectFn = (reason?: unknown) => void;
type FetchConfig = { timeoutMs?: number };

type FilterResponseFromUnion<T> = T extends Promise<Response | infer U> ? Promise<U> : T;

type ExtractMethodNames<T> = {
    [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never;
}[keyof T & string];

type ExtractMethodParams<T, M extends ExtractMethodNames<T>> = T[M] extends (...args: infer P) => any ? P : never;

type ExtractMethodReturnType<T, M extends ExtractMethodNames<T>> = T[M] extends (...args: any[]) => infer R
    ? FilterResponseFromUnion<R>
    : never;

/**
 * A React hook that's part of our Commerce SDK fetch API trinity. The trinity consists of this hook, the `fetch`
 * service, and finally the route (and its loaders) for processing requests from the first two. The purpose of these
 * three entities is to simplify and centralize the way to interact with the Commerce SDK methods inside the mentioned
 * route.
 *
 * Under the hood, this hook uses React Router's `useFetcher` hook to perform the actual requests. By doing so we're
 * able to synchronize our hook with React Router's lifecycle and error handling. But unlike the original hook, our
 * fetch hook returns a promise that resolves or rejects based on the underlying fetcher's response. If the caller
 * is interested in the request's state, it can access the `state` property of the hook.
 *
 * The hook exclusively interacts with the route `/resource/api/client/{resource}` and its related loader functions.
 * It expects a Commerce SDK client's name, a method name and method parameters to be passed as parameters.
 *
 * TODO: Actively monitor the React Router issue {@link https://github.com/remix-run/react-router/issues/14207} which
 *   is about adding a manual reset/abort functionality to fetchers. Once this issue is resolved, we should make the
 *   functionality available in this hook as well.
 * @see {@link import('react-router').useFetcher}
 * @see {@link import('@/routes/resource.api.client.$resource.ts').loader}
 * @see {@link import('@/routes/resource.api.client.$resource.ts').clientLoader}
 * @see {@link import('@/lib/scapi.ts').default}
 * @example
 * import { useEffect } from 'react';
 * import { useFetch } from '@/hooks/use-fetch';
 *
 * export default function MyComponent() {
 *   const fetcher = useFetch('ShopperProducts', 'getCategory', {
 *     parameters: { id: 'test', levels: 2 },
 *   });
 *
 *   useEffect(() => {
 *     fetcher.load().then((data) => {
 *       // Use data
 *     });
 *   }, [fetcher]);
 * }
 */
export function useFetch<
    C extends CommerceSdkKeyMap,
    M extends ExtractMethodNames<I>,
    I extends InstanceType<CommerceSdkCtorFromKey<C>>,
    R extends ExtractMethodReturnType<I, M>,
>(
    client: C,
    method: M,
    ...options: ExtractMethodParams<I, M>
): {
    state: ReturnType<typeof useFetcher>['state'];
    load: (config?: FetchConfig) => Promise<Awaited<R>>;
} {
    // Request ID tracker/counter
    const reqIdRef = useRef(0);

    // Reference to the active request ID
    const activeReqRef = useRef<number | null>(null);

    // References to the resolve and reject functions of the active request
    const resolveRef = useRef<ResolveFn<Awaited<R>> | null>(null);
    const rejectRef = useRef<RejectFn | null>(null);

    // Reference to the current request's abortion timeout (if available)
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearPending = useCallback(() => {
        if (timeoutRef.current) {
            globalThis.clearTimeout?.(timeoutRef.current);
            timeoutRef.current = null;
        }
        resolveRef.current = null;
        rejectRef.current = null;
        activeReqRef.current = null;
    }, []);

    const parameters = Array.isArray(options) ? JSON.stringify(options) : '[]';
    const resource = encodeBase64Url(`["${client}","${method}",${parameters}]`);
    const fetcher = useFetcher<Awaited<R>>({ key: resource });

    // Observe state transitions and resolve or reject the active promise
    useEffect(() => {
        if (activeReqRef.current == null) {
            // No active request
            return;
        }

        // React Router handles eventual errors during the fetcher execution at the closest `ErrorBoundary`. Normally,
        // the interaction between the hook and the associated loader should be error-proof, as the loader catches any
        // errors and wraps them as part of its response. So we're usually operating on the "happy path", which means
        // `state === "idle"`. In case the loader returns a successful response, we resolve the currently active
        // promise, otherwise we reject it, so that the information is propagated to the caller.
        if (fetcher.state === 'idle') {
            const response = fetcher.data as { success: true; data: Awaited<R> } | { success: false; error?: string };
            if (response.success) {
                resolveRef.current?.(response.data);
            } else {
                rejectRef.current?.(response.error);
            }
            clearPending();
        }
    }, [fetcher.state, fetcher.data, clearPending]);

    useEffect(() => {
        // Cleanup on unmount
        return () => {
            clearPending();
        };
    }, [clearPending]);

    // Public API
    const load = useCallback(
        (config?: FetchConfig): Promise<Awaited<R>> => {
            const { timeoutMs = -1 } = config ?? {};
            const thisReqId = ++reqIdRef.current;
            activeReqRef.current = thisReqId;

            const promise = new Promise<Awaited<R>>((resolve, reject) => {
                resolveRef.current = (value) => {
                    activeReqRef.current === thisReqId && resolve(value);
                };
                rejectRef.current = (reason) => {
                    activeReqRef.current === thisReqId && reject(reason);
                };
            });

            if (timeoutMs >= 0) {
                timeoutRef.current = globalThis.setTimeout?.(() => {
                    rejectRef.current?.(new Error(`Request timeout after ${timeoutMs}ms`));
                    clearPending();
                }, timeoutMs);
            }

            // Invoke fetcher
            void fetcher.load(`/resource/api/client/${resource}`);

            return promise;
        },
        [fetcher, clearPending, resource]
    );

    return {
        state: fetcher.state,
        load,
    };
}
