'use client';

import { lazy, type ReactElement, Suspense, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useBasket } from '@/providers/basket';
import CartBadgeIcon from './cart-badge-icon';
import { useTranslation } from 'react-i18next';

const CartSheet = lazy(() => import('./cart-sheet'));

/**
 * The cart badge defers the loading of the mini cart sheet until the very first user interaction
 * with the cart icon. The loading of the sheet component itself could in theory also happen earlier,
 * e.g. right after the initial load on the client. Subject for experiments...
 */
export default function CartBadge(): ReactElement {
    const basket = useBasket();
    const { t } = useTranslation('cart');
    const numberOfItems = basket?.productItems?.length ?? 0;
    const [clicked, setClicked] = useState<boolean>(false);

    if (clicked) {
        return (
            <Suspense
                fallback={
                    <Button
                        variant="ghost"
                        className="pointer-events-none"
                        aria-label={t('badge.ariaLabel', { count: numberOfItems })}>
                        <CartBadgeIcon numberOfItems={numberOfItems} />
                    </Button>
                }>
                <CartSheet>
                    <Button
                        variant="ghost"
                        className="cursor-pointer"
                        aria-label={t('badge.ariaLabel', { count: numberOfItems })}>
                        <CartBadgeIcon numberOfItems={numberOfItems} />
                    </Button>
                </CartSheet>
            </Suspense>
        );
    }

    return (
        <Button
            variant="ghost"
            className="cursor-pointer"
            onClick={() => setClicked(true)}
            aria-label={t('badge.ariaLabel', { count: numberOfItems })}>
            <CartBadgeIcon numberOfItems={numberOfItems} />
        </Button>
    );
}
