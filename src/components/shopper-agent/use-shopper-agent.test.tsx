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
import { renderHook, act } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { useShopperAgent } from './use-shopper-agent';

vi.mock('./shopper-agent.utils', () => ({
    launchChat: vi.fn(),
    sendTextMessage: vi.fn(),
}));

import { launchChat as mockLaunchChat, sendTextMessage as mockSendTextMessage } from './shopper-agent.utils';

describe('useShopperAgent', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('returns actions object with open and sendMessage', () => {
        const { result } = renderHook(() => useShopperAgent());

        expect(result.current.actions).toBeDefined();
        expect(typeof result.current.actions.open).toBe('function');
        expect(typeof result.current.actions.sendMessage).toBe('function');
    });

    test('actions.open calls launchChat', () => {
        const { result } = renderHook(() => useShopperAgent());

        act(() => {
            result.current.actions.open();
        });

        expect(mockLaunchChat).toHaveBeenCalledTimes(1);
    });

    test('actions.sendMessage calls sendTextMessage with message', () => {
        const { result } = renderHook(() => useShopperAgent());

        act(() => {
            result.current.actions.sendMessage('Hello, agent');
        });

        expect(mockSendTextMessage).toHaveBeenCalledWith('Hello, agent');
        expect(mockSendTextMessage).toHaveBeenCalledTimes(1);
    });

    test('actions are stable across re-renders', () => {
        const { result, rerender } = renderHook(() => useShopperAgent());

        const open1 = result.current.actions.open;
        const sendMessage1 = result.current.actions.sendMessage;

        rerender();
        const open2 = result.current.actions.open;
        const sendMessage2 = result.current.actions.sendMessage;

        expect(open1).toBe(open2);
        expect(sendMessage1).toBe(sendMessage2);
    });
});
