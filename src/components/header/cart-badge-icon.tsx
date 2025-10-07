'use client';

import type { ReactElement } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useBasket } from '@/providers/basket';
import { Badge } from '@/components/ui/badge';

export default function CartBadgeIcon(): ReactElement {
    const basket = useBasket();
    return (
        <>
            <ShoppingCart className="size-6" />
            <Badge variant="destructive" className="h-4 min-w-4 rounded-full px-1 font-mono tabular-num">
                {basket?.productItems?.length ?? 0}
            </Badge>
        </>
    );
}
