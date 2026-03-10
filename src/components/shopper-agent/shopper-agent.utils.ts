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

/** Allowed Salesforce hostname suffixes; subdomains (e.g. *.salesforce.com) are allowed via .${domain} check. */
const TRUSTED_SALESFORCE_DOMAINS = [
    'salesforce.com',
    'salesforce-scrt.com',
    'pc-rnd.salesforce-scrt.com',
    'pc-rnd.site.com',
    'my.site.com',
];

/**
 * Validates that a URL is from a trusted Salesforce domain.
 * Uses exact match or "ends with dot + domain" to avoid subdomain takeover
 * (e.g. salesforce.com.attacker.com must not match).
 *
 * @param url - The URL to validate (e.g., 'https://myorg.salesforce.com/script.js')
 * @returns True if the URL is from a trusted Salesforce domain, false otherwise
 */
export const validateSalesforceDomain = (url: string): boolean => {
    try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname;

        return TRUSTED_SALESFORCE_DOMAINS.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));
    } catch {
        return false;
    }
};

export interface ShopperAgentConfig {
    enabled: string;
    embeddedServiceName: string;
    embeddedServiceEndpoint: string;
    scriptSourceUrl: string;
    scrt2Url: string;
    salesforceOrgId: string;
    siteId: string;
    enableConversationContext?: string;
    conversationContext?: string[];
}

/**
 * Validates the shopper agent configuration object to ensure all required fields
 * are present and valid before initializing the embedded messaging service.
 *
 * @param config - Shopper agent configuration object
 * @returns True if configuration is valid, false otherwise
 */
export const validateShopperAgentConfig = (config: unknown): config is ShopperAgentConfig => {
    if (!config || typeof config !== 'object') {
        // eslint-disable-next-line no-console -- config validation feedback
        console.error('[ShopperAgent] Configuration must be an object.');
        return false;
    }

    const typedConfig = config as Record<string, unknown>;

    const requiredFields = [
        'enabled',
        'embeddedServiceName',
        'embeddedServiceEndpoint',
        'scriptSourceUrl',
        'scrt2Url',
        'salesforceOrgId',
        'siteId',
    ];

    const isValid = requiredFields.every(
        (key) => typeof typedConfig[key] === 'string' && typedConfig[key].trim() !== ''
    );

    if (!isValid) {
        // eslint-disable-next-line no-console -- config validation feedback
        console.error('[ShopperAgent] Invalid configuration - missing or empty required fields.');
        return false;
    }

    // Validate optional conversation context properties if present
    if (typedConfig.enableConversationContext !== undefined) {
        if (typeof typedConfig.enableConversationContext !== 'string') {
            // eslint-disable-next-line no-console -- config validation feedback
            console.error('[ShopperAgent] enableConversationContext must be a string.');
            return false;
        }
    }

    if (typedConfig.conversationContext !== undefined) {
        if (!Array.isArray(typedConfig.conversationContext)) {
            // eslint-disable-next-line no-console -- config validation feedback
            console.error('[ShopperAgent] conversationContext must be an array.');
            return false;
        }
    }

    // Add domain validation for script URL
    if (typedConfig.scriptSourceUrl) {
        const isTrustedDomain = validateSalesforceDomain(typedConfig.scriptSourceUrl as string);
        if (!isTrustedDomain) {
            // eslint-disable-next-line no-console -- config validation feedback
            console.error('[ShopperAgent] Script URL must be from a trusted Salesforce domain.');
            return false;
        }
    }

    return true;
};

/**
 * Checks if the shopper agent is enabled and running in a browser environment.
 *
 * @param enabled - String representation of enabled state ('true' or 'false')
 * @returns True if enabled is 'true' and running on client, false otherwise
 */
export const isShopperAgentEnabled = (enabled: string): boolean => {
    return enabled === 'true' && typeof window !== 'undefined';
};

const onClient = typeof window !== 'undefined';

/**
 * Launch the chat using the embedded service bootstrap API
 *
 * When the floating chat button is hidden (hideChatButtonOnLoad=true), this function
 * first shows the chat button via utilAPI.showChatButton() before launching the chat,
 * ensuring the chat window opens correctly.
 *
 * @returns void
 */
export function launchChat(): void {
    if (!onClient) return;

    try {
        const utilAPI = window.embeddedservice_bootstrap?.utilAPI;
        if (!utilAPI) {
            // eslint-disable-next-line no-console -- embedded service API feedback
            console.warn('[ShopperAgent] utilAPI not available');
            return;
        }

        const hideChatButtonOnLoad = window.embeddedservice_bootstrap?.settings?.hideChatButtonOnLoad === true;
        if (hideChatButtonOnLoad && typeof utilAPI.showChatButton === 'function') {
            void utilAPI.showChatButton();
        }

        if (typeof utilAPI.launchChat === 'function') {
            void utilAPI.launchChat();
        }
    } catch (error) {
        // eslint-disable-next-line no-console -- embedded service API feedback
        console.error('[ShopperAgent] Error launching chat:', error);
    }
}

/**
 * Send a text message to the chat
 *
 * Programmatically sends a message using the embedded messaging utilAPI.
 * The message will appear in the chat window as if the user typed it.
 *
 * @param message - The message text to send
 * @returns void
 */
export function sendTextMessage(message: string): void {
    if (!onClient) {
        // eslint-disable-next-line no-console -- embedded service API feedback
        console.warn('[ShopperAgent] sendTextMessage called on server side');
        return;
    }

    try {
        const utilAPI = window.embeddedservice_bootstrap?.utilAPI;
        if (!utilAPI?.sendTextMessage) {
            // eslint-disable-next-line no-console -- embedded service API feedback
            console.warn('[ShopperAgent] utilAPI.sendTextMessage not available');
            return;
        }

        void utilAPI.sendTextMessage(message);
    } catch (error) {
        // eslint-disable-next-line no-console -- embedded service API feedback
        console.error('[ShopperAgent] Error sending text message:', error);
    }
}

/**
 * Open the shopper agent chat window
 *
 * Programmatically opens the embedded messaging widget.
 * This is a convenience wrapper around launchChat().
 *
 * @returns void
 */
export function openShopperAgent(): void {
    if (!onClient) return;

    try {
        launchChat();
    } catch (error) {
        // eslint-disable-next-line no-console -- embedded service API feedback
        console.error('[ShopperAgent] Error opening agent:', error);
    }
}
