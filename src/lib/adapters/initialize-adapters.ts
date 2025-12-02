import type { AppConfig } from '@/config';
import { getAllAdapters } from './adapter-store';

let adaptersInitializationPromise: Promise<void> | undefined;

/**
 * Ensures engagement adapters are initialized.
 *
 * This function handles the lazy initialization of engagement adapters.
 * The function is idempotent - it's safe to call multiple times.
 * If initialization is already in progress, it returns the existing promise.
 *
 * Adapter initialization code (Einstein, etc.) is dynamically imported to keep it out of the initial bundle.
 *
 * @param appConfig - The application configuration needed to initialize adapters
 * @returns Promise that resolves when adapters are initialized, or undefined on error
 */
export async function ensureAdaptersInitialized(appConfig: AppConfig): Promise<void> {
    // Early exit: check if adapters are already initialized
    if (getAllAdapters().length > 0) {
        return;
    }

    // If initialization is already in progress, wait for it
    if (adaptersInitializationPromise) {
        try {
            await adaptersInitializationPromise;
            return;
        } catch (error) {
            if (import.meta.env.DEV) {
                // eslint-disable-next-line no-console
                console.warn('Failed to initialize engagement adapters:', error);
            }
            return;
        }
    }

    // Start initialization with lazy loading
    adaptersInitializationPromise = (async () => {
        // Dynamically import adapter initialization code to keep it out of initial bundle
        const { initializeEngagementAdapters } = await import('@/adapters');

        // Initialize adapters only if config is available
        if (appConfig) {
            initializeEngagementAdapters(appConfig);
        }
    })().catch((error) => {
        // Clear promise on error to allow retry
        adaptersInitializationPromise = undefined;
        if (import.meta.env.DEV) {
            // eslint-disable-next-line no-console
            console.warn('Failed to initialize engagement adapters:', error);
        }
        throw error;
    });

    try {
        await adaptersInitializationPromise;
    } catch {
        // Error already logged above
    }
}

/**
 * Reset the adapters initialization promise (for testing only)
 *
 * This function clears the cached initialization promise, allowing tests to create
 * a fresh initialization state. This should only be used in test environments.
 */
export function resetAdaptersInitialization(): void {
    adaptersInitializationPromise = undefined;
}
