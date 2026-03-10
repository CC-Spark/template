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
import { lazy, Suspense, useEffect, useState } from 'react';
import type { ShopperAgentConfig } from './shopper-agent.utils';

const ShopperAgentUI = lazy(() => import('./shopper-agent-ui'));

interface ShopperAgentProps {
    commerceAgentConfiguration?: ShopperAgentConfig;
    locale: string;
    currency?: string;
    userId?: string;
}

/**
 * ShopperAgent wrapper: defers loading the agent chunk until after first paint using
 * requestAnimationFrame, so the critical path and hydration stay fast. The chunk
 * (and Embedded Service script) load in the next frame; when the user clicks "Open chat"
 * the agent is typically ready with no 1–3s delay.
 */
function ShopperAgent({ commerceAgentConfiguration, locale, currency, userId }: ShopperAgentProps) {
    const [deferReady, setDeferReady] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const id = requestAnimationFrame(() => {
            void import('./shopper-agent-ui');
            setDeferReady(true);
        });
        return () => cancelAnimationFrame(id);
    }, []);

    if (!deferReady) {
        return null;
    }

    return (
        <Suspense fallback={null}>
            <ShopperAgentUI
                commerceAgentConfiguration={commerceAgentConfiguration}
                locale={locale}
                currency={currency}
                userId={userId}
            />
        </Suspense>
    );
}

export default ShopperAgent;

// Re-export the hook and utilities for convenience
// eslint-disable-next-line react-refresh/only-export-components -- barrel re-exports
export { useShopperAgent } from './use-shopper-agent';
// eslint-disable-next-line react-refresh/only-export-components -- barrel re-exports
export { launchChat, sendTextMessage, openShopperAgent } from './shopper-agent.utils';

export type { ShopperAgentConfig } from './shopper-agent.utils';
