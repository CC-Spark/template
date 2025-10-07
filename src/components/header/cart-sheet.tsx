'use client';

import { type PropsWithChildren, type ReactElement, useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useBasket } from '@/providers/basket';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import OrderSummary from '@/components/order-summary';
import uiStrings from '@/temp-ui-string';

export default function CartSheet({ children }: PropsWithChildren): ReactElement {
    // As this component gets loaded on demand, it immediately gets displayed open
    const [open, setOpen] = useState<boolean>(true);
    const basket = useBasket();
    const navigate = useNavigate();
    const handleClickCheckout = useCallback(() => {
        setOpen(false);
        void navigate('/cart');
    }, [navigate]);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>{children}</SheetTrigger>
            <SheetContent className="md:w-1/3 md:max-w-1/3">
                <SheetHeader>
                    <SheetTitle className="text-2xl font-bold text-foreground">{uiStrings.header.cartTitle}</SheetTitle>
                    {basket && (
                        <SheetDescription>
                            <OrderSummary showHeading={false} basket={basket} itemsExpanded={true} />
                        </SheetDescription>
                    )}

                    <SheetFooter>
                        <Button type="submit" onClick={handleClickCheckout}>
                            {uiStrings.header.checkout}
                        </Button>
                        <SheetClose asChild>
                            <Button variant="outline">{uiStrings.header.continueShopping}</Button>
                        </SheetClose>
                    </SheetFooter>
                </SheetHeader>
            </SheetContent>
        </Sheet>
    );
}
