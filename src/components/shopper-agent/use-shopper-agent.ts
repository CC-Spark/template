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
import { useCallback } from 'react';
import { launchChat, sendTextMessage } from './shopper-agent.utils';

/**
 * React hook that returns shopper agent actions.
 * Uses the embedded service bootstrap API.
 *
 * @example
 * const { actions } = useShopperAgent();
 * <button onClick={actions.open}>Open Chat</button>
 *
 * @returns Object with actions (open, sendMessage)
 */
export function useShopperAgent() {
    const open = useCallback(() => {
        launchChat();
    }, []);

    const sendMessage = useCallback((message: string) => {
        sendTextMessage(message);
    }, []);

    return {
        actions: {
            open,
            sendMessage,
        },
    };
}
