import type { ReactElement } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';

export default function AccountOrders(): ReactElement {
    const { t } = useTranslation('account');
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-foreground" tabIndex={0}>
                    {t('navigation.orderHistory')}
                </h1>
            </div>

            {/* Order History Content */}
            <Card className="border-border">
                <CardContent className="p-6">
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">{t('orders.empty')}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
