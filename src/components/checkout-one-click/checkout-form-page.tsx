'use client';

import { useEffect } from 'react';
import { Form, useNavigation } from 'react-router';
import { useCheckoutContext } from '@/hooks/use-checkout';
import { useBasket } from '@/providers/basket';
import { useCheckoutActions } from '@/hooks/use-checkout-actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Typography } from '@/components/typography';
import { CheckoutProgress } from './checkout-progress';
import { useCompletedSteps } from '@/hooks/checkout/use-completed-steps';
import { useCustomerProfile } from '@/hooks/checkout/use-customer-profile';
import type { ShopperBasketsTypes } from 'commerce-sdk-isomorphic';

import ContactInfo from './partials/contact-info';
import ShippingAddress from './partials/shipping-address';
import ShippingOptions from './partials/shipping-options';
import Payment from './partials/payment';
import RegisterCustomerSelection from './partials/register-customer-selection';
import OrderSummary from '@/components/order-summary';
import uiStrings from '@/temp-ui-string';

interface GuestAccountCreationProps {
    cart: ShopperBasketsTypes.Basket;
    customerProfile: ReturnType<typeof useCustomerProfile>;
    onSaved: (shouldCreate: boolean) => void;
}

function GuestAccountCreation({ cart, customerProfile, onSaved }: GuestAccountCreationProps) {
    const isRegisteredUser = Boolean(customerProfile?.customer?.customerId);

    if (isRegisteredUser) {
        return null;
    }

    const customerLookupResultStr =
        typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('customerLookupResult') : null;

    let customerLookupResult = null;
    try {
        customerLookupResult = customerLookupResultStr ? JSON.parse(customerLookupResultStr) : null;
    } catch {
        // Failed to parse customer lookup result
    }

    const shouldShow =
        customerLookupResult?.recommendation === 'guest' || (!cart?.customerInfo?.customerId && !customerLookupResult);

    if (!shouldShow) {
        return null;
    }

    return <RegisterCustomerSelection onSaved={onSaved} />;
}

interface CheckoutFormPageProps {
    shippingMethods?: ShopperBasketsTypes.ShippingMethodResult;
}

export default function CheckoutFormPage({ shippingMethods }: CheckoutFormPageProps) {
    // Use basket from provider (managed by middleware)
    const cart = useBasket();
    const { step, STEPS, goToStep, editingStep } = useCheckoutContext();
    const completedSteps = useCompletedSteps();
    const customerProfile = useCustomerProfile();

    // Get navigation state
    const navigation = useNavigation();

    // Checkout actions hook with all fetchers and submission handlers
    const {
        submitContactInfo,
        submitShippingAddress,
        submitShippingOptions,
        submitPayment,
        contactFetcher,
        shippingAddressFetcher,
        shippingOptionsFetcher,
        paymentFetcher,
        isSubmitting,
        handleCreateAccountPreferenceChange,
        shouldCreateAccount,
    } = useCheckoutActions();

    const isPlacingOrder = navigation.state === 'submitting' && navigation.formAction === '/action/place-order';

    // Form submission handlers - delegated to checkout actions hook
    const handleContactSubmit = submitContactInfo;
    const handleShippingAddressSubmit = submitShippingAddress;
    const handleShippingOptionsSubmit = submitShippingOptions;
    const handlePaymentSubmit = submitPayment;

    // Step state logic - centralized in container
    const contactInfoState = {
        isCompleted: step > STEPS.CONTACT_INFO,
        isEditing: step === STEPS.CONTACT_INFO || editingStep === STEPS.CONTACT_INFO,
        onEdit: () => goToStep(STEPS.CONTACT_INFO),
    };

    const shippingAddressState = {
        isCompleted: step > STEPS.SHIPPING_ADDRESS,
        isEditing: step === STEPS.SHIPPING_ADDRESS || editingStep === STEPS.SHIPPING_ADDRESS,
        onEdit: () => {
            goToStep(STEPS.SHIPPING_ADDRESS);
        },
    };

    const shippingOptionsState = {
        isCompleted: step > STEPS.SHIPPING_OPTIONS,
        isEditing: step === STEPS.SHIPPING_OPTIONS || editingStep === STEPS.SHIPPING_OPTIONS,
        onEdit: () => goToStep(STEPS.SHIPPING_OPTIONS),
    };

    const paymentState = {
        isCompleted: step > STEPS.PAYMENT,
        isEditing: step === STEPS.PAYMENT || editingStep === STEPS.PAYMENT,
        onEdit: () => goToStep(STEPS.PAYMENT),
    };

    // Note: Order placement success is now handled by action route redirect
    // The place order action automatically redirects to the confirmation page
    // Session storage cleanup is also handled in the action route

    // Auto-scroll to top when reaching review step
    useEffect(() => {
        if (step === STEPS.REVIEW_ORDER) {
            window.scrollTo({ top: 0 });
        }
    }, [step, STEPS.REVIEW_ORDER]);

    // Check if cart is empty (no items) - also handle basketId to ensure we have a valid basket
    if (!cart || !cart.basketId || !cart.productItems || cart.productItems.length === 0) {
        return (
            <div className="min-h-screen bg-muted flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6">
                        <Typography variant="muted" className="text-center">
                            {uiStrings.checkout.common.emptyCart}
                        </Typography>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-muted">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Checkout Progress Timeline */}
                <div className="md:hidden mb-6">
                    <CheckoutProgress currentStep={step} completedSteps={completedSteps} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Checkout Content */}
                    <div className="lg:col-span-2 space-y-6">
                        <ContactInfo
                            onSubmit={handleContactSubmit}
                            isLoading={isSubmitting('contact')}
                            actionData={contactFetcher.data}
                            {...contactInfoState}
                        />

                        <ShippingAddress
                            onSubmit={handleShippingAddressSubmit}
                            isLoading={isSubmitting('shipping-address')}
                            actionData={shippingAddressFetcher.data}
                            {...shippingAddressState}
                        />
                        <ShippingOptions
                            onSubmit={handleShippingOptionsSubmit}
                            isLoading={isSubmitting('shipping-options')}
                            actionData={shippingOptionsFetcher.data}
                            shippingMethods={shippingMethods}
                            {...shippingOptionsState}
                        />
                        <Payment
                            onSubmit={handlePaymentSubmit}
                            isLoading={isSubmitting('payment')}
                            actionData={paymentFetcher.data}
                            {...paymentState}
                        />

                        {/* Create Account Option - Show for guest users after payment */}
                        <GuestAccountCreation
                            cart={cart}
                            customerProfile={customerProfile}
                            onSaved={handleCreateAccountPreferenceChange}
                        />

                        {/* Place Order Section */}
                        {step === STEPS.REVIEW_ORDER && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        <Typography variant="h4" as="h2">
                                            Review & Place Order
                                        </Typography>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex justify-center">
                                        <Form method="post" action="/action/place-order">
                                            {/* Hidden field to pass create account preference to server */}
                                            <input
                                                type="hidden"
                                                name="shouldCreateAccount"
                                                value={shouldCreateAccount ? 'true' : 'false'}
                                            />
                                            <Button
                                                type="submit"
                                                disabled={isPlacingOrder}
                                                className="w-full max-w-sm"
                                                size="lg">
                                                {isPlacingOrder
                                                    ? uiStrings.checkout.placeOrder.processing
                                                    : uiStrings.checkout.placeOrder.button}
                                            </Button>
                                        </Form>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8 space-y-6">
                            {/* Timeline - Desktop Only */}
                            <div className="hidden md:block">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>
                                            <Typography variant="h4" as="h2">
                                                Progress
                                            </Typography>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <CheckoutProgress currentStep={step} completedSteps={completedSteps} />
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Order Summary */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        <Typography variant="h4" as="h2">
                                            {uiStrings.checkout.orderSummary.title}
                                        </Typography>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <OrderSummary basket={cart} showCartItems={true} showHeading={false} />
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
