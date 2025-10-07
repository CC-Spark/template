'use client';

import type { ReactElement } from 'react';
import type { ShopperProductsTypes } from 'commerce-sdk-isomorphic';
import NavigationDesktopDropdown from './desktop-dropdown';

export default function NavigationDesktopDropdownContainer({
    category,
}: {
    category: ShopperProductsTypes.Category;
}): ReactElement {
    return (
        <div
            className="fixed left-0 right-0 z-50 bg-background shadow-xl"
            style={{ top: 'var(--header-height, 65px)' }}>
            <div className="w-full pt-3 pr-4 pb-4 pl-4">
                <div className="max-w-screen-2xl mx-auto pt-0 pb-8">
                    <NavigationDesktopDropdown category={category} />
                </div>
            </div>
        </div>
    );
}
