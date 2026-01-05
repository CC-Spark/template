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
