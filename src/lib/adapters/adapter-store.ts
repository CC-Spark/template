import type { EngagementAdapter } from './types';

// Global engagement adapter store
// The main purpose of this store is to store the instances of adapters that were created
const engagementAdapterStore = new Map<string, EngagementAdapter>();

/**
 * Add an engagement adapter to the adapter store
 */
export function addAdapter(name: string, adapter: EngagementAdapter): void {
    engagementAdapterStore.set(name, adapter);
}

/**
 * Remove an engagement adapter from the adapter store
 */
export function removeAdapter(name: string): void {
    engagementAdapterStore.delete(name);
}

/**
 * Get an engagement adapter from the adapter store
 */
export function getAdapter(name: string): EngagementAdapter | undefined {
    return engagementAdapterStore.get(name);
}

/**
 * Get all engagement adapters from the adapter store
 */
export function getAllAdapters(): EngagementAdapter[] {
    return Array.from(engagementAdapterStore.values());
}
