import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { addAdapter, removeAdapter, getAdapter } from './adapter-store';
import type { EngagementAdapter } from './types';

describe('Adapter Store', () => {
    let mockAdapter: EngagementAdapter;

    beforeEach(() => {
        mockAdapter = {
            name: 'test-adapter',
            sendEvent: vi.fn().mockResolvedValue({ success: true }),
        };

        // Clear any existing adapters
        removeAdapter('test-adapter');
    });

    afterEach(() => {
        // Clean up
        removeAdapter('test-adapter');
        vi.clearAllMocks();
    });

    describe('adapter store', () => {
        it('should register, unregister, and retrieve adapters', () => {
            addAdapter('test-adapter', mockAdapter);
            expect(getAdapter('test-adapter')).toBe(mockAdapter);

            removeAdapter('test-adapter');
            expect(getAdapter('test-adapter')).toBeUndefined();
        });

        it('should handle non-existent adapters gracefully', () => {
            expect(getAdapter('non-existent')).toBeUndefined();
            expect(() => removeAdapter('non-existent')).not.toThrow();
        });

        it('should allow multiple adapters with different names', () => {
            const adapter1 = { ...mockAdapter, name: 'adapter-1' };
            const adapter2 = { ...mockAdapter, name: 'adapter-2' };

            addAdapter('adapter-1', adapter1);
            addAdapter('adapter-2', adapter2);

            expect(getAdapter('adapter-1')).toBe(adapter1);
            expect(getAdapter('adapter-2')).toBe(adapter2);
        });
    });
});
