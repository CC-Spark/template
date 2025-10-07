'use client';

import { lazy, type ReactElement, Suspense, useState } from 'react';
import { Button } from '@/components/ui/button';
import CartBadgeIcon from './cart-badge-icon';

const CartSheet = lazy(() => import('./cart-sheet'));

/**
 * The cart badge defers the loading of the mini cart sheet until the very first user interaction
 * with the cart icon. The loading of the sheet component itself could in theory also happen earlier,
 * e.g. right after the initial load on the client. Subject for experiments...
 */
export default function CartBadge(): ReactElement {
    const [clicked, setClicked] = useState<boolean>(false);

    if (clicked) {
        return (
            <Suspense
                fallback={
                    <Button variant="ghost" className="pointer-events-none">
                        <CartBadgeIcon />
                    </Button>
                }>
                <CartSheet>
                    <Button variant="ghost" className="cursor-pointer">
                        <CartBadgeIcon />
                    </Button>
                </CartSheet>
            </Suspense>
        );
    }

    return (
        <Button variant="ghost" className="cursor-pointer" onClick={() => setClicked(true)}>
            <CartBadgeIcon />
        </Button>
    );
}
