/**
 * Checkout utility functions
 */

import type { ShopperBasketsTypes } from 'commerce-sdk-isomorphic';
import { CHECKOUT_STEPS, type CheckoutStep } from '@/stores/checkout-store';
import type { CustomerProfile } from './checkout-context-types';
import type { ClientLoaderFunctionArgs } from 'react-router';
import { getBasket, updateBasket } from '@/middlewares/basket.client';
import createClient from '@/lib/scapi';
import { getShippingMethodsForShipment } from '@/lib/api/shipping-methods';

function hasValidPaymentCard(paymentInstrument: ShopperBasketsTypes.OrderPaymentInstrument | undefined): boolean {
    if (!paymentInstrument || paymentInstrument.paymentMethodId !== 'CREDIT_CARD') {
        return false;
    }

    const card = paymentInstrument.paymentCard;
    return !!(card?.cardType && card?.expirationMonth && card?.expirationYear && card?.maskedNumber);
}

function computeFinalStepForReturningCustomer(
    basket: ShopperBasketsTypes.Basket | undefined,
    customerProfile: CustomerProfile
): CheckoutStep | null {
    if (!customerProfile?.customer) {
        return null;
    }

    const hasEmail = basket?.customerInfo?.email || customerProfile.customer.login;
    const hasShippingAddress = basket?.shipments?.[0]?.shippingAddress;
    const hasShippingMethod = basket?.shipments?.[0]?.shippingMethod;
    const paymentInstrument = basket?.paymentInstruments?.[0];

    if (!hasEmail) {
        return CHECKOUT_STEPS.CONTACT_INFO;
    }

    if (!hasShippingAddress || !hasShippingAddress.address1) {
        return CHECKOUT_STEPS.SHIPPING_ADDRESS;
    }

    if (!hasShippingMethod) {
        return CHECKOUT_STEPS.SHIPPING_OPTIONS;
    }

    const hasValidBasketPayment = hasValidPaymentCard(paymentInstrument);
    const hasValidPayment =
        hasValidBasketPayment || (customerProfile.paymentInstruments && customerProfile.paymentInstruments.length > 0);

    if (!hasValidPayment) {
        return CHECKOUT_STEPS.PAYMENT;
    }

    return CHECKOUT_STEPS.REVIEW_ORDER;
}

export function computeStepFromBasket(
    basket: ShopperBasketsTypes.Basket | undefined,
    hasUserSelectedShippingOptions: boolean,
    autoAdvanceMode: boolean = false
): CheckoutStep {
    if (!basket) {
        return CHECKOUT_STEPS.CONTACT_INFO;
    }

    if (!basket.customerInfo?.email) {
        return CHECKOUT_STEPS.CONTACT_INFO;
    }

    const shippingAddress = basket.shipments?.[0]?.shippingAddress;
    if (!shippingAddress?.firstName || !shippingAddress?.lastName || !shippingAddress?.address1) {
        return CHECKOUT_STEPS.SHIPPING_ADDRESS;
    }

    const hasShippingMethod = basket.shipments?.[0]?.shippingMethod;
    if (!hasShippingMethod) {
        return CHECKOUT_STEPS.SHIPPING_OPTIONS;
    }

    if (!autoAdvanceMode && !hasUserSelectedShippingOptions) {
        return CHECKOUT_STEPS.SHIPPING_OPTIONS;
    }

    const paymentInstrument = basket.paymentInstruments?.[0];
    if (!hasValidPaymentCard(paymentInstrument)) {
        return CHECKOUT_STEPS.PAYMENT;
    }

    return CHECKOUT_STEPS.REVIEW_ORDER;
}

export function getCompletedSteps(
    basket: ShopperBasketsTypes.Basket | undefined,
    currentStep: CheckoutStep
): CheckoutStep[] {
    const completed: CheckoutStep[] = [];

    if (!basket) {
        return completed;
    }

    const hasEmail =
        basket.customerInfo?.email ||
        (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('checkoutEmail'));
    if (hasEmail && currentStep > CHECKOUT_STEPS.CONTACT_INFO) {
        completed.push(CHECKOUT_STEPS.CONTACT_INFO);
    }

    const hasShippingAddress = basket.shipments?.[0]?.shippingAddress;
    if (
        hasShippingAddress &&
        hasShippingAddress.firstName &&
        hasShippingAddress.lastName &&
        hasShippingAddress.address1 &&
        currentStep > CHECKOUT_STEPS.SHIPPING_ADDRESS
    ) {
        completed.push(CHECKOUT_STEPS.SHIPPING_ADDRESS);
    }

    const hasShippingMethod = basket.shipments?.[0]?.shippingMethod;
    if (hasShippingMethod && currentStep > CHECKOUT_STEPS.SHIPPING_OPTIONS) {
        completed.push(CHECKOUT_STEPS.SHIPPING_OPTIONS);
    }

    const paymentInstrument = basket.paymentInstruments?.[0];
    if (paymentInstrument && hasValidPaymentCard(paymentInstrument) && currentStep > CHECKOUT_STEPS.PAYMENT) {
        completed.push(CHECKOUT_STEPS.PAYMENT);
    }

    return completed;
}

export function shouldAutoAdvanceForReturningCustomer(
    isRegisteredCustomer: boolean,
    customerProfile?: CustomerProfile
): boolean {
    if (!isRegisteredCustomer || !customerProfile) {
        return false;
    }

    const hasAddresses = customerProfile.addresses && customerProfile.addresses.length > 0;
    const hasPaymentMethods = customerProfile.paymentInstruments && customerProfile.paymentInstruments.length > 0;

    return hasAddresses && hasPaymentMethods;
}

export function shouldPrefillBasket(
    basket: ShopperBasketsTypes.Basket | undefined,
    customerProfile: CustomerProfile
): boolean {
    if (!customerProfile?.customer || !customerProfile?.addresses?.length) {
        return false;
    }

    const missingEmail = !basket?.customerInfo?.email;
    const missingShippingAddress = !basket?.shipments?.[0]?.shippingAddress;

    return missingEmail || missingShippingAddress;
}

export async function initializeBasketForReturningCustomer(
    context: ClientLoaderFunctionArgs['context'],
    customerProfile: CustomerProfile
): Promise<ShopperBasketsTypes.Basket | null> {
    try {
        const basket = getBasket(context);
        if (!basket?.basketId || !customerProfile?.customer) {
            return null;
        }

        const basketClient = createClient(context).ShopperBaskets;
        let updatedBasket = basket;
        let hasUpdates = false;

        if (!updatedBasket.customerInfo?.email && customerProfile.customer.login) {
            updatedBasket = await basketClient.updateCustomerForBasket({
                parameters: { basketId: updatedBasket.basketId },
                body: { email: customerProfile.customer.login },
            });
            updateBasket(context, updatedBasket);
            hasUpdates = true;
        }

        const hasShippingAddress = updatedBasket.shipments?.[0]?.shippingAddress;
        if (!hasShippingAddress && customerProfile.addresses?.length > 0) {
            const defaultAddress =
                customerProfile.addresses.find((addr) => addr.preferred) || customerProfile.addresses[0];

            if (defaultAddress) {
                const shippingAddress = {
                    firstName: defaultAddress.firstName,
                    lastName: defaultAddress.lastName,
                    address1: defaultAddress.address1,
                    address2: defaultAddress.address2 || undefined,
                    city: defaultAddress.city,
                    stateCode: defaultAddress.stateCode,
                    postalCode: defaultAddress.postalCode,
                    countryCode: defaultAddress.countryCode || 'US',
                    phone:
                        defaultAddress.phone ||
                        customerProfile.customer.phoneMobile ||
                        customerProfile.customer.phoneHome ||
                        undefined,
                };

                updatedBasket = await basketClient.updateShippingAddressForShipment({
                    parameters: {
                        basketId: updatedBasket.basketId,
                        shipmentId: updatedBasket.shipments?.[0]?.shipmentId || 'me',
                    },
                    body: shippingAddress,
                });
                updateBasket(context, updatedBasket);
                hasUpdates = true;
            }
        }

        if (!updatedBasket.billingAddress && hasUpdates) {
            const shippingAddr = updatedBasket.shipments?.[0]?.shippingAddress;
            if (shippingAddr) {
                updatedBasket = await basketClient.updateBillingAddressForBasket({
                    parameters: { basketId: updatedBasket.basketId },
                    body: {
                        firstName: shippingAddr.firstName,
                        lastName: shippingAddr.lastName,
                        address1: shippingAddr.address1,
                        address2: shippingAddr.address2,
                        city: shippingAddr.city,
                        stateCode: shippingAddr.stateCode,
                        postalCode: shippingAddr.postalCode,
                        countryCode: shippingAddr.countryCode,
                        phone: shippingAddr.phone,
                    },
                });
                updateBasket(context, updatedBasket);
            }
        }

        if (
            hasUpdates &&
            updatedBasket.shipments?.[0]?.shippingAddress &&
            !updatedBasket.shipments?.[0]?.shippingMethod
        ) {
            try {
                const shippingMethods = await getShippingMethodsForShipment(context, updatedBasket.basketId as string);
                if (
                    Array.isArray(shippingMethods?.applicableShippingMethods) &&
                    shippingMethods?.applicableShippingMethods?.length > 0
                ) {
                    const defaultMethod = shippingMethods.applicableShippingMethods[0];
                    updatedBasket = await basketClient.updateShippingMethodForShipment({
                        parameters: {
                            basketId: updatedBasket.basketId,
                            shipmentId: updatedBasket.shipments[0].shipmentId || 'me',
                        },
                        body: { id: defaultMethod.id },
                    });
                    updateBasket(context, updatedBasket);
                }
            } catch {
                // Continue without shipping method
            }
        }

        return hasUpdates ? updatedBasket : null;
    } catch {
        return null;
    }
}

export { computeFinalStepForReturningCustomer };
