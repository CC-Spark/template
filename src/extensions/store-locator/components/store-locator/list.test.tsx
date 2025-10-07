import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import uiStringsSL from '@/extensions/store-locator/temp-ui-string-store-locator';
import StoreLocatorList from './list';

const baseState = {
    mode: 'input',
    searchParams: { countryCode: 'US', postalCode: '94105' },
    config: {
        supportedCountries: [{ countryCode: 'US', countryName: 'United States' }],
        radius: 25,
        radiusUnit: 'mi',
    },
    selectedStoreId: null as string | null,
    setSelectedStoreId: vi.fn(),
    geoError: false,
    hasSearched: true,
    hasError: false,
    isLoading: false,
    stores: [
        { id: 'a', name: 'A', address1: '1 Market St', city: 'SF', stateCode: 'CA', postalCode: '94105' },
        { id: 'b', name: 'B', address1: '2 Main St', city: 'SF', stateCode: 'CA', postalCode: '94107' },
        { id: 'c', name: 'C', address1: '3 Pine St', city: 'SF', stateCode: 'CA', postalCode: '94109' },
    ],
    storesPaginated: [
        { id: 'a', name: 'A', address1: '1 Market St', city: 'SF', stateCode: 'CA', postalCode: '94105' },
        { id: 'b', name: 'B', address1: '2 Main St', city: 'SF', stateCode: 'CA', postalCode: '94107' },
    ],
    setPage: vi.fn(),
};

vi.mock('@/extensions/store-locator/hooks/use-store-locator-list', () => ({
    useStoreLocatorList: () => baseState,
}));

describe('StoreLocatorList', () => {
    beforeEach(() => {
        baseState.setSelectedStoreId.mockClear();
        baseState.setPage.mockClear();
    });

    test('renders status and items, shows Load More when more results', () => {
        render(<StoreLocatorList />);

        const statusText = uiStringsSL.storeLocator.list.statusInput
            .replace('{distanceText}', `${baseState.config.radius} ${baseState.config.radiusUnit}`)
            .replace('{postal}', baseState.searchParams.postalCode)
            .replace('{countryName}', 'United States');
        expect(screen.getByText(statusText)).toBeInTheDocument();

        expect(screen.getByText('A')).toBeInTheDocument();
        expect(screen.getByText('B')).toBeInTheDocument();

        expect(screen.getByRole('button', { name: uiStringsSL.storeLocator.list.loadMoreButton })).toBeInTheDocument();
    });

    test('selecting a store updates selectedStoreId', async () => {
        render(<StoreLocatorList />);

        const radios = screen.getAllByRole('radio');
        await userEvent.click(radios[0]);
        expect(baseState.setSelectedStoreId).toHaveBeenCalledWith('a');
    });

    test('clicking Load More requests next page', async () => {
        render(<StoreLocatorList />);
        await userEvent.click(screen.getByRole('button', { name: uiStringsSL.storeLocator.list.loadMoreButton }));
        expect(baseState.setPage).toHaveBeenCalled();
    });
});
