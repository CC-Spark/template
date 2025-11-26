import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getTranslation } from './i18next';
import { getInstance } from '@/middlewares/i18next';
import { createTestContext } from '@/lib/test-utils/context-provider';

// Mock the i18next middleware
vi.mock('@/middlewares/i18next', async () => {
    const actual = await vi.importActual('@/middlewares/i18next');
    return {
        ...actual,
        getInstance: vi.fn(),
    };
});

describe('i18next', () => {
    describe('getTranslation', () => {
        describe('server-side (window is undefined)', () => {
            let originalWindow: typeof window;

            beforeEach(() => {
                // Clear all mocks before each test
                vi.clearAllMocks();
                // Save original window reference
                originalWindow = global.window;
                // Delete window to simulate server environment
                // @ts-expect-error - deleting window for test
                delete global.window;
            });

            afterEach(() => {
                // Restore window
                global.window = originalWindow;
            });

            it('should return a working translation function when context is provided', () => {
                const context = createTestContext();
                const mockServerI18next = {
                    t: vi.fn((key: string) => `Server translation: ${key}`),
                    language: 'es',
                } as any;

                vi.mocked(getInstance).mockReturnValue(mockServerI18next);

                const { t } = getTranslation(context);
                const result = t('test.key');

                // Test behavior: translation function works and returns a string
                expect(typeof result).toBe('string');
                expect(result).toContain('test.key');
            });
        });

        describe('client-side (window is defined)', () => {
            beforeEach(() => {
                vi.clearAllMocks();
            });

            it('should provide a working translation function without context', () => {
                const { t } = getTranslation();

                // Test behavior: translation function exists and is callable
                expect(typeof t).toBe('function');
                const result = t('test.key');
                expect(typeof result).toBe('string');
            });

            it('should provide a working translation function with context', () => {
                const context = createTestContext();
                const { t } = getTranslation(context);

                // Test behavior: translation function works regardless of context on client
                expect(typeof t).toBe('function');
                const result = t('test.key');
                expect(typeof result).toBe('string');
            });

            it('should be consistent across multiple calls', () => {
                const result1 = getTranslation();
                const result2 = getTranslation();

                // Test behavior: consistent interface on repeated calls
                expect(typeof result1.t).toBe('function');
                expect(typeof result2.t).toBe('function');
                expect(result1.t).toBe(result2.t);
            });
        });

        describe('return value interface', () => {
            it('should return an object with i18next and t properties', () => {
                const result = getTranslation();

                // Test interface: correct shape of return value
                expect(result).toHaveProperty('i18next');
                expect(result).toHaveProperty('t');
                expect(typeof result.t).toBe('function');
                expect(typeof result.i18next).toBe('object');
            });

            it('should return t function that is bound to the i18next instance', () => {
                const result = getTranslation();

                // Test interface: t function is the instance's translation method
                expect(result.t).toBe(result.i18next.t);
            });

            it('should provide access to i18next instance for advanced usage', () => {
                const result = getTranslation();

                // Test interface: i18next instance has expected properties
                expect(result.i18next).toHaveProperty('t');
                expect(result.i18next).toHaveProperty('language');
            });
        });

        describe('edge cases', () => {
            it('should handle undefined context gracefully', () => {
                // Test behavior: doesn't throw with undefined context
                expect(() => getTranslation(undefined)).not.toThrow();

                const result = getTranslation(undefined);
                expect(typeof result.t).toBe('function');
            });

            it('should handle readonly context', () => {
                const context = createTestContext();
                const readonlyContext: Readonly<typeof context> = context;

                // Test behavior: works with readonly context type
                expect(() => getTranslation(readonlyContext)).not.toThrow();

                const result = getTranslation(readonlyContext);
                expect(typeof result.t).toBe('function');
            });
        });
    });
});
