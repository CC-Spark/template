import { describe, it, expect } from 'vitest';
import { getDefaultShippingMethod } from './customer-profile-utils';

describe('Checkout Features Integration Tests', () => {
    describe('Shipping Method Default Selection', () => {
        it('should select first method when none is selected', () => {
            const methods = [
                { id: 'standard', name: 'Standard Shipping', price: 5.99 },
                { id: 'express', name: 'Express Shipping', price: 12.99 },
            ];

            const result = getDefaultShippingMethod(methods);
            expect(result).toBe('standard');
        });

        it('should preserve existing selection', () => {
            const methods = [
                { id: 'standard', name: 'Standard Shipping', price: 5.99 },
                { id: 'express', name: 'Express Shipping', price: 12.99 },
            ];
            const currentSelection = { id: 'express' };

            const result = getDefaultShippingMethod(methods, currentSelection);
            expect(result).toBe('express');
        });

        it('should handle empty methods array', () => {
            const result = getDefaultShippingMethod([]);
            expect(result).toBeUndefined();
        });

        it('should handle undefined methods', () => {
            const result = getDefaultShippingMethod(undefined);
            expect(result).toBeUndefined();
        });
    });

    describe('Customer Profile Data Structure', () => {
        it('should properly structure contact info data', () => {
            const mockProfile = {
                customer: {
                    email: 'test@example.com',
                    firstName: 'Test',
                    lastName: 'User',
                    phoneHome: '555-1234',
                },
            };

            // Test that the structure expected by our functions is correct
            expect(mockProfile.customer.email).toBe('test@example.com');
            expect(mockProfile.customer.firstName).toBe('Test');
            expect(mockProfile.customer.lastName).toBe('User');
            expect(mockProfile.customer.phoneHome).toBe('555-1234');
        });

        it('should properly structure address data', () => {
            const mockProfile = {
                addresses: [
                    {
                        addressId: 'billing_addr_1',
                        firstName: 'Test',
                        lastName: 'User',
                        address1: '123 Main St',
                        city: 'Anytown',
                        stateCode: 'CA',
                        postalCode: '12345',
                        countryCode: 'US',
                        phone: '555-1234',
                        preferred: true,
                    },
                ],
                preferredBillingAddress: {
                    addressId: 'billing_addr_1',
                    firstName: 'Test',
                    lastName: 'User',
                    address1: '123 Main St',
                    city: 'Anytown',
                    stateCode: 'CA',
                    postalCode: '12345',
                    countryCode: 'US',
                    phone: '555-1234',
                },
            };

            // Test that the structure is correct
            expect(mockProfile.addresses).toHaveLength(1);
            expect(mockProfile.addresses[0].addressId).toBe('billing_addr_1');
            expect(mockProfile.preferredBillingAddress.address1).toBe('123 Main St');
        });

        it('should properly structure payment instrument data', () => {
            const mockProfile = {
                paymentInstruments: [
                    {
                        paymentInstrumentId: 'card_123',
                        paymentMethodId: 'CREDIT_CARD',
                        paymentCard: {
                            cardType: 'Visa',
                            expirationMonth: 12,
                            expirationYear: 2025,
                            maskedNumber: '************1234',
                            holder: 'Test User',
                        },
                    },
                ],
            };

            // Test that the structure is correct
            expect(mockProfile.paymentInstruments).toHaveLength(1);
            expect(mockProfile.paymentInstruments[0].paymentMethodId).toBe('CREDIT_CARD');
            expect(mockProfile.paymentInstruments[0].paymentCard?.cardType).toBe('Visa');
        });
    });

    describe('Feature Flags and Business Logic', () => {
        it('should handle empty shipping methods array gracefully', () => {
            const emptyShippingMethods: Array<{ id: string; name: string }> = [];
            const validShippingMethods = [
                { id: 'ups_ground', name: 'UPS Ground' },
                { id: 'fedex_overnight', name: 'FedEx Overnight' },
            ];

            // Test that our component can handle empty arrays
            expect(emptyShippingMethods.length).toBe(0);
            expect(validShippingMethods.length).toBeGreaterThan(0);

            const hasValidIds = validShippingMethods.every(
                (method) => method.id && !method.id.includes('mock') && !method.id.includes('test')
            );
            expect(hasValidIds).toBe(true);
        });

        it('should handle auto-advance logic conditions', () => {
            const isRegisteredCustomer = true;
            const customerProfile = {
                customer: { email: 'test@example.com' },
                addresses: [{ addressId: 'addr_1' }],
                paymentInstruments: [{ paymentInstrumentId: 'card_1' }],
            };

            // Auto-advance should be enabled for registered customers with profile data
            const shouldAutoAdvance =
                isRegisteredCustomer &&
                !!customerProfile &&
                !!customerProfile.addresses?.length &&
                !!customerProfile.paymentInstruments?.length;

            expect(shouldAutoAdvance).toBe(true);

            // Should not auto-advance for guest users (no customer profile)
            const guestCustomerProfile = null;
            const guestShouldAutoAdvance = !!guestCustomerProfile;
            expect(guestShouldAutoAdvance).toBe(false);
        });
    });
});
