import { getInstance } from '@/middlewares/i18next';
import i18next from 'i18next';
import type { RouterContextProvider } from 'react-router';

/**
 * Gets the i18next instance and translation function for use in non-component code.
 * Use `useTranslation` hook for React components. Similar to `getConfig`/`useConfig` pattern.
 * @param context - Optional router context for server-side rendering
 * @returns Object containing i18next instance and `t` translation function
 */
export function getTranslation(context?: Readonly<RouterContextProvider>) {
    if (context && typeof window === 'undefined') {
        // On the server side, you should get the i18next instance that the i18next middleware has created and saved in the context
        const i18nextOnServer = getInstance(context);

        return {
            i18next: i18nextOnServer,
            t: i18nextOnServer.t,
        };
    }

    // Return these properties from the global i18next instance
    return {
        i18next,
        t: i18next.t,
    };
}
