import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TYPE_ID_KEY, META_KEY, LOADER_KEY, REGION_DEFINITIONS_KEY } from './decorators';

vi.mock('@salesforce/storefront-next-runtime/design/react', () => ({
    createReactComponentDesignDecorator: vi.fn(() => 'mock-design-decorator'),
}));

vi.mock('./component-registry', () => {
    class MockComponentRegistry {
        static lastConfig: any;

        constructor(config: any) {
            MockComponentRegistry.lastConfig = config;
        }
    }

    return {
        ComponentRegistry: MockComponentRegistry,
    };
});

import { registry } from './registry';
import { createReactComponentDesignDecorator } from '@salesforce/storefront-next-runtime/design/react';
import { ComponentRegistry as ImportedComponentRegistry } from './component-registry';

describe('registry', () => {
    beforeEach(() => {
        // Reset Reflect metadata mocks before each test
        (Reflect as any).getMetadata = vi.fn();
        (Reflect as any).defineMetadata = vi.fn();
        vi.clearAllMocks();
    });

    it('creates a ComponentRegistry instance with expected configuration', () => {
        expect(registry).toBeInstanceOf(ImportedComponentRegistry as any);

        const config = (ImportedComponentRegistry as any).lastConfig;
        expect(config).toBeDefined();
        expect(typeof config).toBe('object');

        // designDecorator should come from createReactComponentDesignDecorator
        expect(config.designDecorator).toBe(createReactComponentDesignDecorator);

        // modules should be the result of import.meta.glob, which is an object
        expect(config.modules).toBeDefined();
        expect(typeof config.modules).toBe('object');

        // extractMeta should be a function
        expect(typeof config.extractMeta).toBe('function');
    });

    it('extractMeta returns undefined when no candidate has a type id', () => {
        const config = (ImportedComponentRegistry as any).lastConfig;
        const extractMeta = config.extractMeta as (
            modDefault: React.ComponentType<any> | undefined,
            mod: Partial<Record<string, unknown>>
        ) => any;

        const defaultComp = () => null;

        // No TYPE_ID_KEY metadata on any candidate
        (Reflect.getMetadata as vi.Mock).mockReturnValue(undefined);

        const result = extractMeta(defaultComp, {});

        expect(result).toBeUndefined();
        expect(Reflect.getMetadata).toHaveBeenCalled();
        expect(Reflect.defineMetadata).not.toHaveBeenCalled();
    });

    it('extractMeta uses metadata from a candidate component and caches onto default component', () => {
        const config = (ImportedComponentRegistry as any).lastConfig;
        const extractMeta = config.extractMeta as (
            modDefault: React.ComponentType<any> | undefined,
            mod: Partial<Record<string, unknown>>
        ) => any;

        const defaultComp = () => null;
        const namedComp = () => null;

        const meta = { label: 'Test Component', category: 'test' };
        const loader = { load: vi.fn() };
        const regions = { header: [], footer: [] };

        (Reflect.getMetadata as vi.Mock).mockImplementation((key: string, target: unknown) => {
            if (target === namedComp) {
                if (key === TYPE_ID_KEY) return 'test-id';
                if (key === META_KEY) return meta;
                if (key === LOADER_KEY) return loader;
                if (key === REGION_DEFINITIONS_KEY) return regions;
            }
            return undefined;
        });

        const result = extractMeta(defaultComp, { Named: namedComp });

        expect(result).toEqual({
            id: 'test-id',
            ...meta,
            loader,
            regions,
        });

        // Should have read metadata from namedComp
        expect(Reflect.getMetadata).toHaveBeenCalledWith(TYPE_ID_KEY, namedComp);
        expect(Reflect.getMetadata).toHaveBeenCalledWith(META_KEY, namedComp);
        expect(Reflect.getMetadata).toHaveBeenCalledWith(LOADER_KEY, namedComp);
        expect(Reflect.getMetadata).toHaveBeenCalledWith(REGION_DEFINITIONS_KEY, namedComp);

        // Should have cached metadata onto defaultComp
        expect(Reflect.defineMetadata).toHaveBeenCalledWith(TYPE_ID_KEY, 'test-id', defaultComp);
        expect(Reflect.defineMetadata).toHaveBeenCalledWith(META_KEY, meta, defaultComp);
        expect(Reflect.defineMetadata).toHaveBeenCalledWith(LOADER_KEY, loader, defaultComp);
    });

    it('extractMeta does not cache metadata when default component is undefined', () => {
        const config = (ImportedComponentRegistry as any).lastConfig;
        const extractMeta = config.extractMeta as (
            modDefault: React.ComponentType<any> | undefined,
            mod: Partial<Record<string, unknown>>
        ) => any;

        const namedComp = () => null;

        const meta = { label: 'Test Component' };
        const loader = { load: vi.fn() };
        const regions = { header: [] };

        (Reflect.getMetadata as vi.Mock).mockImplementation((key: string, target: unknown) => {
            if (target === namedComp) {
                if (key === TYPE_ID_KEY) return 'test-id';
                if (key === META_KEY) return meta;
                if (key === LOADER_KEY) return loader;
                if (key === REGION_DEFINITIONS_KEY) return regions;
            }
            return undefined;
        });

        const result = extractMeta(undefined, { Named: namedComp });

        expect(result).toEqual({
            id: 'test-id',
            ...meta,
            loader,
            regions,
        });

        expect(Reflect.defineMetadata).not.toHaveBeenCalled();
    });

    it('extractMeta swallows errors from Reflect and returns undefined', () => {
        const config = (ImportedComponentRegistry as any).lastConfig;
        const extractMeta = config.extractMeta as (
            modDefault: React.ComponentType<any> | undefined,
            mod: Partial<Record<string, unknown>>
        ) => any;

        const defaultComp = () => null;
        const namedComp = () => null;

        (Reflect.getMetadata as vi.Mock).mockImplementation(() => {
            throw new Error('reflect not ready');
        });

        const result = extractMeta(defaultComp, { Named: namedComp });

        expect(result).toBeUndefined();
    });
});
