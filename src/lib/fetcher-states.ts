/**
 * React Router fetcher state constants.
 *
 * These constants represent the possible states of a React Router fetcher.
 * They are based on the string literals used by React Router internally.
 *
 * @see https://reactrouter.com/en/main/hooks/use-fetcher
 */
export const FETCHER_STATES = {
    /** No fetcher operation is in progress */
    IDLE: 'idle',
    /** A fetcher submission is in progress */
    SUBMITTING: 'submitting',
    /** A fetcher is loading data from a loader */
    LOADING: 'loading',
} as const;

/**
 * Type for React Router fetcher states.
 *
 * This type represents all possible states a fetcher can be in.
 */
export type FetcherState = (typeof FETCHER_STATES)[keyof typeof FETCHER_STATES];
