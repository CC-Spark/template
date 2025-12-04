import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { resolveAssetUrl, isAbsoluteURL } from './utils';

describe('isAbsoluteURL', () => {
    it('should return true for http URLs', () => {
        expect(isAbsoluteURL('http://example.com/image.jpg')).toBe(true);
    });

    it('should return true for https URLs', () => {
        expect(isAbsoluteURL('https://example.com/image.jpg')).toBe(true);
    });

    it('should return true for protocol-relative URLs', () => {
        expect(isAbsoluteURL('//example.com/image.jpg')).toBe(true);
    });

    it('should return false for relative URLs', () => {
        expect(isAbsoluteURL('/images/hero.png')).toBe(false);
        expect(isAbsoluteURL('images/hero.png')).toBe(false);
    });
});

describe('resolveAssetUrl', () => {
    describe('with absolute URLs', () => {
        it('should return http URLs unchanged', () => {
            const url = 'http://example.com/image.jpg';
            expect(resolveAssetUrl(url)).toBe(url);
        });

        it('should return https URLs unchanged', () => {
            const url = 'https://example.com/image.jpg';
            expect(resolveAssetUrl(url)).toBe(url);
        });

        it('should return protocol-relative URLs unchanged', () => {
            const url = '//example.com/image.jpg';
            expect(resolveAssetUrl(url)).toBe(url);
        });

        it('should return data URLs unchanged', () => {
            const url =
                'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
            expect(resolveAssetUrl(url)).toBe(url);
        });
    });

    describe('with URLs already containing bundle path', () => {
        it('should return URLs with bundle path unchanged', () => {
            const url = '/mobify/bundle/60/client/images/hero.png';
            expect(resolveAssetUrl(url)).toBe(url);
        });

        it('should handle bundle path in the middle of URL', () => {
            const url = 'https://cdn.example.com/mobify/bundle/60/client/images/hero.png';
            expect(resolveAssetUrl(url)).toBe(url);
        });

        it('should not double-transform static imports', () => {
            const staticImportUrl = '/mobify/bundle/local/client/images/hero-abc123.png';
            expect(resolveAssetUrl(staticImportUrl)).toBe(staticImportUrl);
        });
    });

    describe('in local development environment (BUNDLE_ID=local)', () => {
        beforeEach(() => {
            // Mock browser environment with local bundle ID
            (window as { _BUNDLE_ID: string })._BUNDLE_ID = 'local';
        });

        afterEach(() => {
            delete (window as { _BUNDLE_ID?: string })._BUNDLE_ID;
        });

        it('should return absolute paths as-is', () => {
            expect(resolveAssetUrl('/images/hero.png')).toBe('/images/hero.png');
        });

        it('should prepend slash to relative paths', () => {
            expect(resolveAssetUrl('images/hero.png')).toBe('/images/hero.png');
        });

        it('should handle nested paths', () => {
            expect(resolveAssetUrl('/assets/images/products/hero.png')).toBe('/assets/images/products/hero.png');
        });

        it('should handle paths with query parameters', () => {
            expect(resolveAssetUrl('/images/hero.png?w=100')).toBe('/images/hero.png?w=100');
        });
    });

    describe('in MRT environment (BUNDLE_ID=60)', () => {
        beforeEach(() => {
            // Mock browser environment with MRT bundle ID
            (window as { _BUNDLE_ID: string })._BUNDLE_ID = '60';
        });

        afterEach(() => {
            delete (window as { _BUNDLE_ID?: string })._BUNDLE_ID;
        });

        it('should prepend bundle path to absolute local paths', () => {
            expect(resolveAssetUrl('/images/hero.png')).toBe('/mobify/bundle/60/client/images/hero.png');
        });

        it('should prepend bundle path to relative local paths', () => {
            expect(resolveAssetUrl('images/hero.png')).toBe('/mobify/bundle/60/client/images/hero.png');
        });

        it('should handle nested directory paths', () => {
            expect(resolveAssetUrl('/assets/images/products/hero.png')).toBe(
                '/mobify/bundle/60/client/assets/images/products/hero.png'
            );
        });

        it('should handle paths with special characters', () => {
            expect(resolveAssetUrl('/images/hero-image_v2.png')).toBe(
                '/mobify/bundle/60/client/images/hero-image_v2.png'
            );
        });

        it('should handle paths with query parameters', () => {
            expect(resolveAssetUrl('/images/hero.png?w=100&h=200')).toBe(
                '/mobify/bundle/60/client/images/hero.png?w=100&h=200'
            );
        });

        it('should handle paths with hash fragments', () => {
            expect(resolveAssetUrl('/images/hero.png#section')).toBe(
                '/mobify/bundle/60/client/images/hero.png#section'
            );
        });
    });

    describe('on server side', () => {
        let originalWindow: typeof globalThis.window;

        beforeEach(() => {
            // Save original window and mock Node.js environment
            originalWindow = globalThis.window;
            vi.stubGlobal('window', undefined);
        });

        afterEach(() => {
            // Restore window and clean up env
            vi.stubGlobal('window', originalWindow);
            delete process.env.BUNDLE_ID;
        });

        it('should use process.env.BUNDLE_ID in MRT', () => {
            process.env.BUNDLE_ID = '140';
            expect(resolveAssetUrl('/images/hero.png')).toBe('/mobify/bundle/140/client/images/hero.png');
        });

        it('should default to "local" when BUNDLE_ID is not set', () => {
            delete process.env.BUNDLE_ID;
            expect(resolveAssetUrl('/images/hero.png')).toBe('/images/hero.png');
        });

        it('should treat BUNDLE_ID=local as local development', () => {
            process.env.BUNDLE_ID = 'local';
            expect(resolveAssetUrl('/images/hero.png')).toBe('/images/hero.png');
            expect(resolveAssetUrl('images/hero.png')).toBe('/images/hero.png');
        });

        it('should handle relative paths on server', () => {
            process.env.BUNDLE_ID = '200';
            expect(resolveAssetUrl('images/hero.png')).toBe('/mobify/bundle/200/client/images/hero.png');
        });
    });

    describe('edge cases', () => {
        beforeEach(() => {
            (window as { _BUNDLE_ID: string })._BUNDLE_ID = '60';
        });

        afterEach(() => {
            delete (window as { _BUNDLE_ID?: string })._BUNDLE_ID;
        });

        it('should handle empty string', () => {
            expect(resolveAssetUrl('')).toBe('/mobify/bundle/60/client/');
        });

        it('should handle paths with multiple slashes', () => {
            expect(resolveAssetUrl('//images//hero.png')).toBe('//images//hero.png');
        });

        it('should handle paths with dots', () => {
            expect(resolveAssetUrl('/images/../assets/hero.png')).toBe(
                '/mobify/bundle/60/client/images/../assets/hero.png'
            );
        });

        it('should handle paths starting with dot', () => {
            expect(resolveAssetUrl('./images/hero.png')).toBe('/mobify/bundle/60/client/./images/hero.png');
        });
    });

    describe('compatibility with ContentCard usage', () => {
        beforeEach(() => {
            (window as { _BUNDLE_ID: string })._BUNDLE_ID = '60';
        });

        afterEach(() => {
            delete (window as { _BUNDLE_ID?: string })._BUNDLE_ID;
        });

        it('should handle dynamic Page Designer image URLs', () => {
            const pageDesignerUrl = 'https://cdn.commercecloud.salesforce.com/on/demandware.static/images/product.jpg';
            expect(resolveAssetUrl(pageDesignerUrl)).toBe(pageDesignerUrl);
        });

        it('should handle static import fallbacks', () => {
            const staticImport = '/mobify/bundle/60/client/images/hero-abc123.png';
            expect(resolveAssetUrl(staticImport)).toBe(staticImport);
        });

        it('should handle local asset paths from Page Designer', () => {
            expect(resolveAssetUrl('images/hero-cube.png')).toBe('/mobify/bundle/60/client/images/hero-cube.png');
        });
    });
});
