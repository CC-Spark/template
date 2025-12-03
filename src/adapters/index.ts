import type { AppConfig } from '@/config';
import { createEinsteinAdapter } from './einstein';
import { addAdapter } from '@/lib/adapters';
import { createActiveDataAdapter } from './active-data';

/**
 * Initialize engagement adapterss.
 *
 * Uses properties defined in appConfig.engagement.adapters to set up default adapters.
 *
 * This is the place to modify when adding new engagement adapters to the system.
 */
export function initializeEngagementAdapters(appConfig: AppConfig) {
    const engagementAdapterConfigs = appConfig?.engagement?.adapters;

    // Register default adapters
    // Comment these out to disable the default adapters
    if (engagementAdapterConfigs?.einstein?.enabled) {
        try {
            addAdapter(
                'einstein',
                createEinsteinAdapter({
                    host: engagementAdapterConfigs.einstein.host || '',
                    einsteinId: engagementAdapterConfigs.einstein.einsteinId || '',
                    realm: engagementAdapterConfigs.einstein.realm || '',
                    siteId: engagementAdapterConfigs.einstein.siteId || appConfig.commerce.api.siteId,
                    isProduction: engagementAdapterConfigs.einstein.isProduction || false,
                    eventToggles: engagementAdapterConfigs.einstein.eventToggles || {},
                })
            );
        } catch (error) {
            // eslint-disable-next-line no-console
            console.warn('Failed to initialize Einstein adapter:', (error as Error).message);
        }
    }

    if (engagementAdapterConfigs.activeData.enabled) {
        try {
            addAdapter(
                'active-data',
                createActiveDataAdapter({
                    host: engagementAdapterConfigs.activeData.host || '',
                    siteId: engagementAdapterConfigs.activeData.siteId || appConfig.commerce.api.siteId,
                    locale: engagementAdapterConfigs.activeData.locale || appConfig.site.locale,
                    siteUUID: engagementAdapterConfigs.activeData.siteUUID || '',
                    eventToggles: engagementAdapterConfigs.activeData.eventToggles || {},
                })
            );
        } catch (error) {
            // eslint-disable-next-line no-console
            console.warn('Failed to initialize Active Data adapter:', (error as Error).message);
        }
    }

    /* Example custom adapter registration
    addAdapter('custom', {
        name: 'custom',
        // sendEvent handles how to send the event to the analytics provider
        sendEvent: async (event: AnalyticsEvent) => Promise.resolve({}),
    });
    */
}
