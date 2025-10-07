import { useMemo, type ReactElement } from 'react';
import { Outlet, useLoaderData, type ClientLoaderFunctionArgs, type LoaderFunctionArgs, redirect } from 'react-router';
import { User, Heart, Receipt, MapPin } from 'lucide-react';
import { getAuth as getAuthClient } from '@/middlewares/auth.client';
import { getAuth as getAuthServer } from '@/middlewares/auth.server';
import { getCustomer } from '@/lib/api/customer';
import { Card, CardContent } from '@/components/ui/card';
import { AccountNavList, type AccountNavItemData } from '@/components/account-navigation';
import uiStrings from '@/temp-ui-string';
import type { ShopperCustomersTypes } from 'commerce-sdk-isomorphic';

type AccountLayoutLoaderData = {
    customer: Promise<ShopperCustomersTypes.Customer>;
};

// eslint-disable-next-line react-refresh/only-export-components
export function loader(args: LoaderFunctionArgs) {
    // SERVER LOADER: Only uses server-side auth
    const session = getAuthServer(args.context);
    const { access_token, access_token_expiry, userType, customer_id } = session;

    // TODO remove access_token check when middleware is updated
    if (
        !access_token ||
        typeof access_token_expiry !== 'number' ||
        access_token_expiry < Date.now() ||
        userType !== 'registered' ||
        !customer_id
    ) {
        // Use throw redirect on the server for better performance
        throw redirect('/login');
    }

    const customer = getCustomer(args.context, customer_id);
    return { customer };
}

// eslint-disable-next-line react-refresh/only-export-components
export function clientLoader(args: ClientLoaderFunctionArgs) {
    // CLIENT LOADER: Only uses client-side auth
    const session = getAuthClient(args.context);
    const { access_token, access_token_expiry, userType, customer_id } = session;

    // TODO remove access_token check when middleware is updated
    if (
        !access_token ||
        typeof access_token_expiry !== 'number' ||
        access_token_expiry < Date.now() ||
        userType !== 'registered' ||
        !customer_id
    ) {
        return redirect('/login');
    }

    const customer = getCustomer(args.context, customer_id);
    return { customer };
}

export default function AccountLayout(): ReactElement {
    const loaderData = useLoaderData<AccountLayoutLoaderData>();

    const navigationItems: AccountNavItemData[] = useMemo(
        () => [
            {
                path: '/account',
                icon: User,
                label: uiStrings.account.navigation.accountDetails,
            },
            {
                path: '/account/wishlist',
                icon: Heart,
                label: uiStrings.account.navigation.wishlist,
            },
            {
                path: '/account/orders',
                icon: Receipt,
                label: uiStrings.account.navigation.orderHistory,
            },
            {
                path: '/account/addresses',
                icon: MapPin,
                label: uiStrings.account.navigation.addresses,
            },
        ],
        []
    );

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Mobile Navigation Accordion */}
                    <div className="lg:hidden">
                        <Card className="bg-muted/30">
                            <CardContent className="p-4">
                                <h2 className="text-lg font-semibold text-foreground mb-4">
                                    {uiStrings.account.myAccount}
                                </h2>
                                <nav className="space-y-1">
                                    <AccountNavList items={navigationItems} isMobile={true} />
                                </nav>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Desktop Sidebar Navigation */}
                    <div className="hidden lg:block lg:col-span-1">
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-foreground">{uiStrings.account.myAccount}</h2>
                            <nav className="space-y-1">
                                <AccountNavList items={navigationItems} />
                            </nav>
                        </div>
                    </div>

                    {/* Main Content - Child routes render here */}
                    <div className="lg:col-span-3">
                        <Outlet context={loaderData} />
                    </div>
                </div>
            </div>
        </div>
    );
}
