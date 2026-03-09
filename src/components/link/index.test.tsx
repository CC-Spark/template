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
import { createRef } from 'react';
import { render, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Link, NavLink } from './index';

const mockUseSite = vi.fn();
vi.mock('@salesforce/storefront-next-runtime/multi-site', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@salesforce/storefront-next-runtime/multi-site')>();
    return {
        ...actual,
        useSite: (...args: unknown[]) => mockUseSite(...args),
    };
});

const mockUseConfig = vi.fn();
vi.mock('@/config', () => ({
    useConfig: (...args: unknown[]) => mockUseConfig(...args),
}));

function renderWithRouter(ui: React.ReactElement) {
    return render(<MemoryRouter initialEntries={['/']}>{ui}</MemoryRouter>);
}

const defaultSite = {
    id: 'RefArchGlobal',
    defaultCurrency: 'GBP',
    defaultLocale: 'en-GB',
    supportedCurrencies: ['EUR', 'GBP'],
    supportedLocales: [
        { id: 'en-GB', preferredCurrency: 'GBP' },
        { id: 'de-DE', preferredCurrency: 'EUR' },
    ],
};

const defaultConfig = {
    url: { prefix: '/:siteId', search: '?lng=:localeId' },
    siteAliasMap: { RefArchGlobal: 'global' },
};

describe('Link', () => {
    afterEach(() => {
        cleanup();
        vi.resetAllMocks();
    });

    it('renders a multi-site URL with prefix and search params', () => {
        mockUseSite.mockReturnValue(defaultSite);
        mockUseConfig.mockReturnValue(defaultConfig);

        const { getByRole } = renderWithRouter(<Link to="/product/123">Product</Link>);

        expect(getByRole('link')).toHaveAttribute('href', '/global/product/123?lng=en-GB');
    });

    it('uses the raw site id when no alias is configured', () => {
        mockUseSite.mockReturnValue(defaultSite);
        mockUseConfig.mockReturnValue({ url: { prefix: '/:siteId' } });

        const { getByRole } = renderWithRouter(<Link to="/category">Category</Link>);

        expect(getByRole('link')).toHaveAttribute('href', '/RefArchGlobal/category');
    });

    it('renders a plain href when site context is not available', () => {
        mockUseSite.mockReturnValue(undefined);
        mockUseConfig.mockReturnValue(defaultConfig);

        const { getByRole } = renderWithRouter(<Link to="/product/123">Product</Link>);

        expect(getByRole('link')).toHaveAttribute('href', '/product/123');
    });

    it('passes through an object `to` prop without transformation', () => {
        mockUseSite.mockReturnValue(defaultSite);
        mockUseConfig.mockReturnValue(defaultConfig);

        const { getByRole } = renderWithRouter(
            <Link to={{ pathname: '/product/123', search: '?color=red' }}>Product</Link>
        );

        expect(getByRole('link')).toHaveAttribute('href', '/product/123?color=red');
    });

    it('forwards a ref to the anchor element', () => {
        mockUseSite.mockReturnValue(undefined);
        mockUseConfig.mockReturnValue(defaultConfig);

        const ref = createRef<HTMLAnchorElement>();
        renderWithRouter(
            <Link to="/test" ref={ref}>
                Test
            </Link>
        );

        expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
    });

    it('passes additional props to the rendered anchor', () => {
        mockUseSite.mockReturnValue(undefined);
        mockUseConfig.mockReturnValue(defaultConfig);

        const { getByRole } = renderWithRouter(
            <Link to="/test" className="my-link" data-testid="custom">
                Test
            </Link>
        );

        const link = getByRole('link');
        expect(link).toHaveClass('my-link');
        expect(link).toHaveAttribute('data-testid', 'custom');
    });
});

describe('NavLink', () => {
    afterEach(() => {
        cleanup();
        vi.resetAllMocks();
    });

    it('renders a multi-site URL with prefix and search params', () => {
        mockUseSite.mockReturnValue(defaultSite);
        mockUseConfig.mockReturnValue(defaultConfig);

        const { getByRole } = renderWithRouter(<NavLink to="/product/123">Product</NavLink>);

        expect(getByRole('link')).toHaveAttribute('href', '/global/product/123?lng=en-GB');
    });

    it('renders a plain href when site context is not available', () => {
        mockUseSite.mockReturnValue(undefined);
        mockUseConfig.mockReturnValue(defaultConfig);

        const { getByRole } = renderWithRouter(<NavLink to="/product/123">Product</NavLink>);

        expect(getByRole('link')).toHaveAttribute('href', '/product/123');
    });

    it('forwards a ref to the anchor element', () => {
        mockUseSite.mockReturnValue(undefined);
        mockUseConfig.mockReturnValue(defaultConfig);

        const ref = createRef<HTMLAnchorElement>();
        renderWithRouter(
            <NavLink to="/test" ref={ref}>
                Test
            </NavLink>
        );

        expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
    });
});
