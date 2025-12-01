import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import VenmoButton from './venmo-button';

// Mock the PayPalSDKButton component
vi.mock('./paypal-sdk-button', () => ({
    default: vi.fn(({ config, disabled }) => (
        <div
            data-testid="paypal-sdk-button"
            data-disabled={String(disabled)}
            data-funding-source={String(config.fundingSource)}>
            PayPal SDK Button
        </div>
    )),
}));

describe('VenmoButton', () => {
    beforeEach(() => {
        // Mock window.paypal
        global.window = {
            ...global.window,
            paypal: {
                FUNDING: {
                    VENMO: 'venmo',
                },
            },
        } as any;
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should render VenmoButton component', () => {
        const onApprove = vi.fn();
        render(<VenmoButton onApprove={onApprove} />);

        expect(screen.getByTestId('paypal-sdk-button')).toBeInTheDocument();
    });

    it('should pass correct config to PayPalSDKButton', () => {
        const onApprove = vi.fn();
        render(<VenmoButton onApprove={onApprove} />);

        const button = screen.getByTestId('paypal-sdk-button');
        expect(button).toHaveAttribute('data-funding-source', 'venmo');
    });

    it('should pass disabled prop correctly', () => {
        const onApprove = vi.fn();
        render(<VenmoButton onApprove={onApprove} disabled={true} />);

        const button = screen.getByTestId('paypal-sdk-button');
        expect(button).toHaveAttribute('data-disabled', 'true');
    });

    it('should default disabled to false', () => {
        const onApprove = vi.fn();
        render(<VenmoButton onApprove={onApprove} />);

        const button = screen.getByTestId('paypal-sdk-button');
        expect(button).toHaveAttribute('data-disabled', 'false');
    });

    it('should handle missing window.paypal gracefully', () => {
        // Remove window.paypal
        const originalPaypal = (global.window as any).paypal;
        delete (global.window as any).paypal;

        const onApprove = vi.fn();
        render(<VenmoButton onApprove={onApprove} />);

        const button = screen.getByTestId('paypal-sdk-button');
        expect(button).toBeInTheDocument();
        // When paypal is undefined, fundingSource evaluates to undefined
        // (typeof window !== 'undefined' is true, but window.paypal?.FUNDING.VENMO is undefined)
        expect(button).toHaveAttribute('data-funding-source', 'undefined');

        // Restore
        (global.window as any).paypal = originalPaypal;
    });
});
