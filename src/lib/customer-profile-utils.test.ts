import { describe, it, expect } from 'vitest';
import {
    getContactInfoFromCustomer,
    getShippingAddressFromCustomer,
    getPaymentMethodsFromCustomer,
    getDefaultShippingMethod,
} from './customer-profile-utils';

describe('Checkout Prefill Utilities', () => {
    describe('getContactInfoFromCustomer', () => {
        it('should extract contact info from customer profile', () => {
            const customerProfile = {
                customer: {
                    email: 'john.doe@example.com',
                    firstName: 'John',
                    lastName: 'Doe',
                    phoneHome: '555-1234',
                },
            };

            const result = getContactInfoFromCustomer(customerProfile);

            expect(result).toEqual({
                email: 'john.doe@example.com',
                firstName: 'John',
                lastName: 'Doe',
                phone: '555-1234',
            });
        });

        it('should handle missing optional fields', () => {
            const customerProfile = {
                customer: {
                    email: 'jane@example.com',
                },
            };

            const result = getContactInfoFromCustomer(customerProfile);

            expect(result).toEqual({
                email: 'jane@example.com',
                firstName: '',
                lastName: '',
                phone: '',
            });
        });

        it('should return empty object for missing customer', () => {
            const result = getContactInfoFromCustomer(undefined);
            expect(result).toEqual({});
        });
    });

    describe('getShippingAddressFromCustomer', () => {
        it('should prioritize preferred shipping address', () => {
            const customerProfile = {
                addresses: [
                    {
                        addressId: 'shipping_addr_1',
                        firstName: 'John',
                        lastName: 'Doe',
                        address1: '456 Oak St',
                        city: 'Springfield',
                        stateCode: 'IL',
                        postalCode: '62701',
                        countryCode: 'US',
                        phone: '555-5678',
                    },
                    {
                        addressId: 'billing_addr_1',
                        firstName: 'John',
                        lastName: 'Doe',
                        address1: '123 Main St',
                        city: 'Anytown',
                        stateCode: 'CA',
                        postalCode: '12345',
                        countryCode: 'US',
                        phone: '555-1234',
                        preferred: true,
                    },
                ],
                preferredShippingAddress: {
                    addressId: 'shipping_addr_1',
                    firstName: 'John',
                    lastName: 'Doe',
                    address1: '456 Oak St',
                    city: 'Springfield',
                    stateCode: 'IL',
                    postalCode: '62701',
                    countryCode: 'US',
                    phone: '555-5678',
                },
                preferredBillingAddress: {
                    addressId: 'billing_addr_1',
                    firstName: 'John',
                    lastName: 'Doe',
                    address1: '123 Main St',
                    city: 'Anytown',
                    stateCode: 'CA',
                    postalCode: '12345',
                    countryCode: 'US',
                    phone: '555-1234',
                },
            };

            const result = getShippingAddressFromCustomer(customerProfile);

            expect(result).toEqual({
                firstName: 'John',
                lastName: 'Doe',
                address1: '456 Oak St',
                address2: '',
                city: 'Springfield',
                stateCode: 'IL',
                postalCode: '62701',
                countryCode: 'US',
                phone: '555-5678',
            });
        });

        it('should fall back to billing address when no preferred shipping address', () => {
            const customerProfile = {
                addresses: [
                    {
                        addressId: 'shipping_addr_1',
                        firstName: 'John',
                        lastName: 'Doe',
                        address1: '456 Oak St',
                        city: 'Springfield',
                        stateCode: 'IL',
                        postalCode: '62701',
                        countryCode: 'US',
                        phone: '555-5678',
                    },
                    {
                        addressId: 'billing_addr_1',
                        firstName: 'John',
                        lastName: 'Doe',
                        address1: '123 Main St',
                        city: 'Anytown',
                        stateCode: 'CA',
                        postalCode: '12345',
                        countryCode: 'US',
                        phone: '555-1234',
                        preferred: true,
                    },
                ],
                // No preferredShippingAddress, only billing
                preferredBillingAddress: {
                    addressId: 'billing_addr_1',
                    firstName: 'John',
                    lastName: 'Doe',
                    address1: '123 Main St',
                    city: 'Anytown',
                    stateCode: 'CA',
                    postalCode: '12345',
                    countryCode: 'US',
                    phone: '555-1234',
                },
            };

            const result = getShippingAddressFromCustomer(customerProfile);

            expect(result).toEqual({
                firstName: 'John',
                lastName: 'Doe',
                address1: '123 Main St',
                address2: '',
                city: 'Anytown',
                stateCode: 'CA',
                postalCode: '12345',
                countryCode: 'US',
                phone: '555-1234',
            });
        });

        it('should fall back to shipping address when no billing', () => {
            const customerProfile = {
                addresses: [
                    {
                        addressId: 'shipping_addr_1',
                        firstName: 'Jane',
                        lastName: 'Smith',
                        address1: '789 Pine Ave',
                        city: 'Portland',
                        stateCode: 'OR',
                        postalCode: '97201',
                        countryCode: 'US',
                        phone: '555-9876',
                        preferred: true,
                    },
                ],
                preferredShippingAddress: {
                    addressId: 'shipping_addr_1',
                    firstName: 'Jane',
                    lastName: 'Smith',
                    address1: '789 Pine Ave',
                    city: 'Portland',
                    stateCode: 'OR',
                    postalCode: '97201',
                    countryCode: 'US',
                    phone: '555-9876',
                },
            };

            const result = getShippingAddressFromCustomer(customerProfile);

            expect(result).toEqual({
                firstName: 'Jane',
                lastName: 'Smith',
                address1: '789 Pine Ave',
                address2: '',
                city: 'Portland',
                stateCode: 'OR',
                postalCode: '97201',
                countryCode: 'US',
                phone: '555-9876',
            });
        });

        it('should return empty object when no addresses', () => {
            const customerProfile = { addresses: [] };
            const result = getShippingAddressFromCustomer(customerProfile);
            expect(result).toEqual({});
        });
    });

    describe('getPaymentMethodsFromCustomer', () => {
        it('should format payment methods with card type and expiration', () => {
            const customerProfile = {
                paymentInstruments: [
                    {
                        paymentInstrumentId: 'card_123',
                        paymentMethodId: 'CREDIT_CARD',
                        paymentCard: {
                            cardType: 'Visa',
                            expirationMonth: 12,
                            expirationYear: 2025,
                            maskedNumber: '************1234',
                        },
                    },
                    {
                        paymentInstrumentId: 'card_456',
                        paymentMethodId: 'CREDIT_CARD',
                        paymentCard: {
                            cardType: 'Mastercard',
                            expirationMonth: 6,
                            expirationYear: 2026,
                            maskedNumber: '************5678',
                        },
                    },
                ],
            };

            const result = getPaymentMethodsFromCustomer(customerProfile);

            expect(result).toEqual([
                {
                    id: 'card_123',
                    type: 'CREDIT_CARD',
                    cardType: 'Visa',
                    maskedNumber: 'Visa •••• (exp 12/25)',
                    expirationMonth: 12,
                    expirationYear: 2025,
                    cardholderName: '',
                    preferred: true,
                },
                {
                    id: 'card_456',
                    type: 'CREDIT_CARD',
                    cardType: 'Mastercard',
                    maskedNumber: 'Mastercard •••• (exp 06/26)',
                    expirationMonth: 6,
                    expirationYear: 2026,
                    cardholderName: '',
                    preferred: false,
                },
            ]);
        });

        it('should handle missing payment methods', () => {
            const customerProfile = { paymentInstruments: [] };
            const result = getPaymentMethodsFromCustomer(customerProfile);
            expect(result).toEqual([]);
        });

        it('should include all payment methods regardless of type', () => {
            const customerProfile = {
                paymentInstruments: [
                    {
                        paymentInstrumentId: 'card_123',
                        paymentMethodId: 'CREDIT_CARD',
                        paymentCard: {
                            cardType: 'Visa',
                            expirationMonth: 12,
                            expirationYear: 2025,
                        },
                    },
                    {
                        paymentInstrumentId: 'paypal_456',
                        paymentMethodId: 'PAYPAL',
                    },
                ],
            };

            const result = getPaymentMethodsFromCustomer(customerProfile);

            expect(result).toHaveLength(2);
            expect(result[0].id).toBe('card_123');
            expect(result[1].id).toBe('paypal_456');
        });
    });

    describe('getDefaultShippingMethod', () => {
        const mockShippingMethods = [
            { id: 'standard', name: 'Standard Shipping', price: 5.99 },
            { id: 'express', name: 'Express Shipping', price: 12.99 },
            { id: 'overnight', name: 'Overnight Shipping', price: 24.99 },
        ];

        it('should keep current selection if already selected', () => {
            const result = getDefaultShippingMethod(mockShippingMethods, { id: 'express' });

            expect(result).toBe('express');
        });

        it('should select first method as default when none selected', () => {
            const result = getDefaultShippingMethod(mockShippingMethods);

            expect(result).toBe('standard');
        });

        it('should return undefined when no methods available', () => {
            const result = getDefaultShippingMethod([]);

            expect(result).toBeUndefined();
        });

        it('should return undefined when methods array is undefined', () => {
            const result = getDefaultShippingMethod(undefined);

            expect(result).toBeUndefined();
        });

        it('should handle empty current selection', () => {
            const result = getDefaultShippingMethod(mockShippingMethods, { id: '' });

            expect(result).toBe('standard');
        });

        it('should prioritize Commerce Cloud default method over first method', () => {
            const methodsWithDefault = [
                { id: 'standard', name: 'Standard Shipping', price: 5.99 },
                { id: 'express', name: 'Express Shipping', price: 12.99, default: true },
                { id: 'overnight', name: 'Overnight Shipping', price: 24.99 },
            ];

            const result = getDefaultShippingMethod(methodsWithDefault);

            expect(result).toBe('express'); // Should pick the one marked as default, not first
        });

        it('should prioritize preferred method when no default is marked', () => {
            const methodsWithPreferred = [
                { id: 'standard', name: 'Standard Shipping', price: 5.99 },
                { id: 'express', name: 'Express Shipping', price: 12.99 },
                { id: 'overnight', name: 'Overnight Shipping', price: 24.99, preferred: true },
            ];

            const result = getDefaultShippingMethod(methodsWithPreferred);

            expect(result).toBe('overnight'); // Should pick the preferred one
        });

        it('should fall back to first method when no default or preferred is marked', () => {
            const result = getDefaultShippingMethod(mockShippingMethods);

            expect(result).toBe('standard'); // Falls back to first method
        });
    });
});
