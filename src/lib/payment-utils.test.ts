import { detectCardType } from './payment-utils';

describe('detectCardType', () => {
    test('detects Visa cards', () => {
        expect(detectCardType('4111111111111111')).toBe('Visa'); // Standard test Visa
        expect(detectCardType('4111 1111 1111 1111')).toBe('Visa'); // With spaces
        expect(detectCardType('4000000000000002')).toBe('Visa'); // Another test Visa
        expect(detectCardType('4111111111111')).toBe('Visa'); // 13-digit Visa
    });

    test('detects Mastercard', () => {
        expect(detectCardType('5555555555554444')).toBe('Mastercard'); // Classic range 5[1-5]
        expect(detectCardType('5105105105105100')).toBe('Mastercard');
        expect(detectCardType('2223000048400011')).toBe('Mastercard'); // New range 2[2-7]
        expect(detectCardType('2720990000000015')).toBe('Mastercard');
    });

    test('detects American Express', () => {
        expect(detectCardType('378282246310005')).toBe('American Express'); // Starts with 37
        expect(detectCardType('371449635398431')).toBe('American Express');
        expect(detectCardType('343434343434343')).toBe('American Express'); // Starts with 34
    });

    test('detects Discover', () => {
        expect(detectCardType('6011111111111117')).toBe('Discover');
        expect(detectCardType('6011000990139424')).toBe('Discover');
    });

    test('detects Diners Club', () => {
        expect(detectCardType('30569309025904')).toBe('Diners Club'); // Starts with 30[0-5]
        expect(detectCardType('36227206271667')).toBe('Diners Club'); // Starts with 36
        expect(detectCardType('38520000023237')).toBe('Diners Club'); // Starts with 38
    });

    test('detects JCB', () => {
        expect(detectCardType('3530111333300000')).toBe('JCB');
        expect(detectCardType('3566002020360505')).toBe('JCB');
    });

    test('handles invalid or unknown cards', () => {
        expect(detectCardType('')).toBe('Unknown');
        expect(detectCardType('1234567890123456')).toBe('Credit Card'); // Doesn't match any pattern
        expect(detectCardType('9999999999999999')).toBe('Credit Card');
        expect(detectCardType('abc')).toBe('Credit Card'); // Non-numeric
    });

    test('handles cards with formatting', () => {
        expect(detectCardType('4111-1111-1111-1111')).toBe('Visa');
        expect(detectCardType('5555 5555 5555 4444')).toBe('Mastercard');
        expect(detectCardType('3782-822463-10005')).toBe('American Express');
    });

    test('validates card length requirements', () => {
        expect(detectCardType('4111111111111')).toBe('Visa'); // 13 digits - valid Visa
        expect(detectCardType('41111111111111111111')).toBe('Credit Card'); // 20 digits - too long for Visa
        expect(detectCardType('51111111111111111')).toBe('Credit Card'); // 17 digits - wrong length for Mastercard
        expect(detectCardType('34343434343434')).toBe('Credit Card'); // 14 digits - too short for Amex
    });
});
