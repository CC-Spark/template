import { getCardIcon } from './card-icon-utils';

describe('getCardIcon', () => {
    test('returns wrapper components for known card types', () => {
        const VisaWrapper = getCardIcon('Visa');
        const MastercardWrapper = getCardIcon('Mastercard');
        const AmexWrapper = getCardIcon('American Express');
        const DiscoverWrapper = getCardIcon('Discover');

        // Test that the functions are defined and callable
        expect(typeof VisaWrapper).toBe('function');
        expect(typeof MastercardWrapper).toBe('function');
        expect(typeof AmexWrapper).toBe('function');
        expect(typeof DiscoverWrapper).toBe('function');

        // Test that they return different wrapper functions
        expect(VisaWrapper).not.toBe(MastercardWrapper);
        expect(VisaWrapper).not.toBe(AmexWrapper);
        expect(MastercardWrapper).not.toBe(DiscoverWrapper);
    });

    test('returns GenericCardIcon for unknown card types', () => {
        const UnknownIcon = getCardIcon('Unknown');
        const RandomIcon = getCardIcon('Some Random Card');
        const EmptyIcon = getCardIcon('');
        const DinersIcon = getCardIcon('Diners Club');
        const JCBIcon = getCardIcon('JCB');

        // All unknown types should return the same GenericCardIcon component
        expect(UnknownIcon).toBe(RandomIcon);
        expect(UnknownIcon).toBe(EmptyIcon);
        expect(UnknownIcon).toBe(DinersIcon);
        expect(UnknownIcon).toBe(JCBIcon);
        expect(typeof UnknownIcon).toBe('function');
    });

    test('is case sensitive', () => {
        const GenericIcon = getCardIcon('Unknown');

        // Lowercase should fallback to generic
        expect(getCardIcon('visa')).toBe(GenericIcon);
        // Uppercase should fallback to generic
        expect(getCardIcon('VISA')).toBe(GenericIcon);
        // Exact case match should return wrapper
        expect(getCardIcon('Visa')).not.toBe(GenericIcon);
    });
});
