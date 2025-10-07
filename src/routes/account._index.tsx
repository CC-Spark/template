import { use, useMemo, type ReactElement } from 'react';
import { useOutletContext } from 'react-router';
import { Card, CardContent } from '@/components/ui/card';
import uiStrings from '@/temp-ui-string';
import type { ShopperCustomersTypes } from 'commerce-sdk-isomorphic';

type AccountLayoutContext = {
    customer: Promise<ShopperCustomersTypes.Customer | null>;
};

export default function AccountDetails(): ReactElement {
    // Get customer data from parent layout context
    const { customer: customerPromise } = useOutletContext<AccountLayoutContext>();
    const customer = use(customerPromise);

    // Extract user info from customer data
    const userInfo = useMemo(
        () => ({
            fullName: `${customer?.firstName || ''} ${customer?.lastName || ''}`.trim(),
            email: customer?.email || customer?.login || '',
            phoneNumber: customer?.phoneHome || customer?.phoneMobile || '',
        }),
        [customer]
    );

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-foreground" tabIndex={0}>
                    {uiStrings.account.title}
                </h1>
            </div>

            {/* My Profile Card */}
            <Card className="border-border">
                <CardContent className="p-6">
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-foreground leading-7">
                            {uiStrings.account.profile.title}
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div>
                            <div className="mb-2">
                                <p className="text-sm font-bold text-foreground">
                                    {uiStrings.account.profile.fullName}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-foreground">{userInfo.fullName}</p>
                            </div>
                        </div>
                        <div>
                            <div className="mb-2">
                                <p className="text-sm font-bold text-foreground">{uiStrings.account.profile.email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-foreground">{userInfo.email}</p>
                            </div>
                        </div>
                        <div>
                            <div className="mb-2">
                                <p className="text-sm font-bold text-foreground">
                                    {uiStrings.account.profile.phoneNumber}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-foreground">
                                    {userInfo.phoneNumber === 'N/A'
                                        ? uiStrings.account.profile.notProvided
                                        : userInfo.phoneNumber}
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Password Card */}
            <Card className="border-border">
                <CardContent className="p-6">
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-foreground leading-7">
                            {uiStrings.account.password.title}
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div>
                            <div className="mb-2">
                                <p className="text-sm font-bold text-foreground">
                                    {uiStrings.account.password.password}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-foreground">••••••••</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
