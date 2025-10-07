import { describe, test, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

// System under test
import { useStoreLocatorForm } from './use-store-locator-form';

// Mock store provider used by the hook
const mockStore = {
    searchByForm: vi.fn(),
    searchParams: undefined as any,
};

vi.mock('@/extensions/store-locator/providers/store-locator', () => ({
    useStoreLocator: (selector: any) => selector(mockStore),
}));
describe('useStoreLocatorForm', () => {
    beforeEach(() => {
        mockStore.searchByForm.mockClear();
        mockStore.searchParams = undefined;
    });

    test('onSubmit calls searchByForm with provided data', () => {
        const { result } = renderHook(() => useStoreLocatorForm());
        result.current.onSubmit({ countryCode: 'US', postalCode: '94105' });
        expect(mockStore.searchByForm).toHaveBeenCalledWith({ countryCode: 'US', postalCode: '94105' });
    });

    test('form initializes with store searchParams and resets when it changes', async () => {
        mockStore.searchParams = { countryCode: 'US', postalCode: '94105' };
        const { result, rerender } = renderHook(() => useStoreLocatorForm());
        expect(result.current.form.getValues()).toEqual({ countryCode: 'US', postalCode: '94105' });

        // change store searchParams and rerender — hook should reset form values
        mockStore.searchParams = { countryCode: 'CA', postalCode: 'M5H 2N2' };
        rerender();

        await waitFor(() => {
            expect(result.current.form.getValues()).toEqual({ countryCode: 'CA', postalCode: 'M5H 2N2' });
        });
    });
});
