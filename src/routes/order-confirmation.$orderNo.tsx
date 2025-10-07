import { type ReactElement, use } from 'react';
import { type ClientLoaderFunctionArgs, Link, type LoaderFunctionArgs } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Typography } from '@/components/typography';
import createClient from '@/lib/scapi';
import createPage, { type RouteComponentProps } from '@/components/create-page';
import type { ShopperOrdersTypes } from 'commerce-sdk-isomorphic';
import AddressDisplay from '@/components/address-display';
import Loading from '@/components/loading';
import { getCardTypeDisplay, getFormattedMaskedCardNumber } from '@/lib/payment-utils';
import uiStrings from '@/temp-ui-string';

type CheckoutConfirmationLoaderData = {
    order?: Promise<ShopperOrdersTypes.Order | undefined>;
    error?: string;
};

function getPageData({ context, params }: LoaderFunctionArgs): CheckoutConfirmationLoaderData {
    const { orderNo } = params;
    if (!orderNo) {
        return {
            error: uiStrings.checkout.confirmation.orderNumberRequired,
        };
    }
    return {
        order: createClient(context)
            .ShopperOrders.getOrder({
                parameters: { orderNo },
            })
            .catch(() => undefined),
    };
}

// eslint-disable-next-line react-refresh/only-export-components
export function loader(args: LoaderFunctionArgs) {
    return getPageData(args);
}

// eslint-disable-next-line react-refresh/only-export-components
export function clientLoader(args: ClientLoaderFunctionArgs) {
    return getPageData(args);
}

/**
 * Hydrate fallback component displayed during client-side hydration
 * TODO: This requires a fitting skeleton to be used as the hydrate fallback
 */
export function HydrateFallback() {
    return <Loading />;
}

function CheckoutConfirmation({
    loaderData: { order: orderPromise, error },
}: RouteComponentProps<CheckoutConfirmationLoaderData>): ReactElement {
    const order = orderPromise ? use(orderPromise) : undefined;
    if (!order) {
        return (
            <div className="min-h-screen bg-background">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-center">
                                {uiStrings.checkout.confirmation.orderNotFound}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-center space-y-4">
                            <Typography variant="p" className="text-muted-foreground">
                                {error || uiStrings.checkout.confirmation.orderNotFoundDescription}
                            </Typography>
                            <Button asChild>
                                <Link to="/">{uiStrings.checkout.confirmation.actions.continueShopping}</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Success Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>

                    <Typography variant="h1" as="h1" className="mb-4 text-accent">
                        {uiStrings.checkout.confirmation.title}
                    </Typography>

                    <Typography variant="p" className="text-muted-foreground">
                        {uiStrings.checkout.confirmation.fields.orderNumber}{' '}
                        <span className="font-mono font-medium">{order.orderNo}</span>
                    </Typography>

                    <Typography variant="p" className="text-muted-foreground mt-2">
                        {uiStrings.checkout.confirmation.confirmationEmailSent.replace(
                            '{email}',
                            order.customerInfo?.email || ''
                        )}
                    </Typography>
                </div>

                {/* Order Summary */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>{uiStrings.checkout.confirmation.sections.orderSummary}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>{uiStrings.checkout.confirmation.fields.orderNumber}</span>
                                <span className="font-mono">{order.orderNo}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>{uiStrings.checkout.confirmation.fields.status}</span>
                                <span>{order.status}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>{uiStrings.checkout.confirmation.fields.total}</span>
                                <span className="font-medium">
                                    {new Intl.NumberFormat('en-US', {
                                        style: 'currency',
                                        currency: order.currency || 'USD',
                                    }).format(order.orderTotal || 0)}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Shipping Details */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>{uiStrings.checkout.confirmation.sections.shippingDetails}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <Typography variant="h5" as="h3" className="mb-2">
                                    {uiStrings.checkout.confirmation.fields.shippingAddress}
                                </Typography>
                                {order.shipments?.[0]?.shippingAddress && (
                                    <AddressDisplay address={order.shipments[0].shippingAddress} />
                                )}
                            </div>
                            <div>
                                <Typography variant="h5" as="h3" className="mb-2">
                                    {uiStrings.checkout.confirmation.fields.shippingMethod}
                                </Typography>
                                <Typography variant="p" className="text-muted-foreground">
                                    {order.shipments?.[0]?.shippingMethod?.name ||
                                        uiStrings.checkout.confirmation.fields.defaultShippingMethod}
                                </Typography>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Payment Details */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>{uiStrings.checkout.confirmation.sections.paymentDetails}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <Typography variant="h5" as="h3" className="mb-2">
                                    {uiStrings.checkout.confirmation.fields.billingAddress}
                                </Typography>
                                {order.billingAddress && <AddressDisplay address={order.billingAddress} />}
                            </div>
                            <div>
                                <Typography variant="h5" as="h3" className="mb-2">
                                    {uiStrings.checkout.confirmation.fields.paymentMethod}
                                </Typography>
                                {order.paymentInstruments?.[0] && (
                                    <div>
                                        <Typography variant="p" className="text-muted-foreground">
                                            {getCardTypeDisplay(
                                                order.paymentInstruments[0],
                                                uiStrings.checkout.confirmation.fields.defaultPaymentMethod
                                            )}
                                        </Typography>
                                        <Typography variant="p" className="text-muted-foreground">
                                            {getFormattedMaskedCardNumber(order.paymentInstruments[0])}
                                        </Typography>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button asChild size="lg">
                        <Link to="/">{uiStrings.checkout.confirmation.actions.continueShopping}</Link>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                        <Link to="/account">{uiStrings.checkout.confirmation.actions.viewAccount}</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}

// TODO: This requires a fitting skeleton
const OrderConfirmationPage = createPage({
    component: CheckoutConfirmation,
});

export default OrderConfirmationPage;
