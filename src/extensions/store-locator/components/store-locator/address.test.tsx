import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ShopperStoresTypes } from 'commerce-sdk-isomorphic';
import StoreAddress from './address';

const baseStore: ShopperStoresTypes.Store = {
    id: '1',
    name: 'Test Store',
    address1: '1 Market St',
    city: 'San Francisco',
    stateCode: 'CA',
    postalCode: '94105',
};

describe('StoreAddress', () => {
    test('renders multiline address by default', () => {
        render(<StoreAddress store={baseStore} />);
        expect(screen.getByText('1 Market St')).toBeInTheDocument();
        expect(screen.getByText('San Francisco, CA 94105')).toBeInTheDocument();
    });

    test('renders single line when multiline=false', () => {
        render(<StoreAddress store={baseStore} multiline={false} />);
        expect(screen.getByText('1 Market St, San Francisco, CA 94105')).toBeInTheDocument();
    });
});
