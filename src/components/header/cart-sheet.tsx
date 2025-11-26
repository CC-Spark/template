'use client';

import { type PropsWithChildren, type ReactElement, useState } from 'react';
import { Link } from 'react-router';
import { useBasket } from '@/providers/basket';
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button, buttonVariants } from '@/components/ui/button';
import OrderSummary from '@/components/order-summary';
import { useTranslation } from 'react-i18next';

export default function CartSheet({ children }: PropsWithChildren): ReactElement {
    // As this component gets loaded on demand, it immediately gets displayed open
    const [open, setOpen] = useState<boolean>(true);
    const { t } = useTranslation('header');
    const basket = useBasket();

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>{children}</SheetTrigger>
            <SheetContent className="md:w-1/3 md:max-w-1/3">
                <SheetHeader>
                    <SheetTitle className="text-2xl font-bold text-foreground">{t('cartTitle')}</SheetTitle>
                </SheetHeader>

                {basket && (
                    <div className="flex-1 overflow-y-auto">
                        <OrderSummary
                            showHeading={false}
                            basket={basket}
                            itemsExpanded={true}
                            onEditCart={() => setOpen(false)}
                        />
                    </div>
                )}

                <SheetFooter>
                    <Link to="/checkout" onClick={() => setOpen(false)} className={buttonVariants()}>
                        {t('checkout')}
                    </Link>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        {t('continueShopping')}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
