import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import uiStringsSL from '@/extensions/store-locator/temp-ui-string-store-locator';

// Mock the lazy-loaded sheet to a simple passthrough component
vi.mock('@/extensions/store-locator/components/header/store-locator-sheet', () => ({
    default: ({ children }: any) => <div data-testid="mock-store-locator-sheet">{children}</div>,
}));

import StoreLocatorBadge from '@/extensions/store-locator/components/header/store-locator-badge';

describe('StoreLocatorBadge', () => {
    test('renders initial trigger button', () => {
        render(<StoreLocatorBadge />);

        expect(screen.getByRole('button', { name: uiStringsSL.storeLocator.trigger.ariaLabel })).toBeInTheDocument();

        expect(
            screen.queryByRole('button', { name: uiStringsSL.storeLocator.trigger.openAriaLabel })
        ).not.toBeInTheDocument();
    });

    test('shows open button after clicking trigger', async () => {
        render(<StoreLocatorBadge />);

        await userEvent.click(screen.getByRole('button', { name: uiStringsSL.storeLocator.trigger.ariaLabel }));

        const openBtn = await screen.findByRole('button', {
            name: uiStringsSL.storeLocator.trigger.openAriaLabel,
        });

        expect(openBtn).toBeInTheDocument();
        expect(screen.getByTestId('mock-store-locator-sheet')).toBeInTheDocument();
    });
});
