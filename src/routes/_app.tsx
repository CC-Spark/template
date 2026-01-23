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
import { useRef } from 'react';
import { Outlet, useRouteLoaderData } from 'react-router';
import type { RootLoaderData } from '@/root';
import type { ShopperProducts } from '@salesforce/storefront-next-runtime/scapi';

// Components
import Header from '@/components/header';
import Footer from '@/components/footer';
import CategoryNavigationMenuMega from '@/components/navigation-menu-mega';

/**
 * Default Layout Route
 *
 * This pathless layout route provides the standard storefront UI structure:
 * - Header with navigation
 * - Main content area (via `<Outlet/>`)
 * - Footer
 *
 * Routes that need this layout should be prefixed with `_app.` in their filename.
 * For routes without default header/footer (e.g., login), use the `_empty.` prefix instead.
 */
export default function DefaultLayout() {
    // Access root loader data for categories and session
    const rootData = useRouteLoaderData<RootLoaderData>('root');

    // We're only loading the root and sub categories from the server on the very first navigation.
    // These refs ensure that the initial data/promises don't get overwritten/removed on subsequent
    // client-side navigations.
    const refRoot = useRef<Promise<ShopperProducts.schemas['Category']> | undefined>(undefined);
    const refSubs = useRef<Promise<ShopperProducts.schemas['Category'][]> | undefined>(undefined);
    if (rootData?.root && rootData?.subs) {
        refRoot.current = rootData.root;
        refSubs.current = rootData.subs;
    }

    return (
        <>
            <Header>
                <CategoryNavigationMenuMega resolve={refRoot.current} defer={refSubs.current} />
            </Header>
            <main className="grow pt-8">
                <Outlet />
            </main>
            <Footer />
        </>
    );
}
