import type { ReactElement } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import uiStrings from '@/temp-ui-string';

export default function AccountAddresses(): ReactElement {
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-foreground" tabIndex={0}>
                    {uiStrings.account.navigation.addresses}
                </h1>
            </div>

            {/* Addresses Content */}
            <Card className="border-border">
                <CardContent className="p-6">
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">{uiStrings.account.addresses.empty}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
