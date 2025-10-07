import { describe, test, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import uiStringsSL from '@/extensions/store-locator/temp-ui-string-store-locator';

// Mock the heavy StoreLocator to a simple placeholder
vi.mock('@/extensions/store-locator/components/store-locator', () => ({
    default: () => <div data-testid="mock-store-locator">Mock StoreLocator</div>,
}));

import StoreLocatorSheet from '@/extensions/store-locator/components/header/store-locator-sheet';

describe('StoreLocatorSheet', () => {
    test('is open by default and renders title and description', () => {
        render(
            <StoreLocatorSheet>
                <button>Open Sheet</button>
            </StoreLocatorSheet>
        );

        expect(screen.getByText(uiStringsSL.storeLocator.title)).toBeInTheDocument();
        expect(screen.getByText(uiStringsSL.storeLocator.description)).toBeInTheDocument();
        expect(screen.getByTestId('mock-store-locator')).toBeInTheDocument();
        // Close control is available while open
        expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
    });

    test('closes via Close button and re-opens via trigger', async () => {
        render(
            <StoreLocatorSheet>
                <button>Open Sheet</button>
            </StoreLocatorSheet>
        );

        await userEvent.click(screen.getByRole('button', { name: /close/i }));

        await waitFor(() => {
            expect(screen.queryByText(uiStringsSL.storeLocator.title)).not.toBeInTheDocument();
        });

        await userEvent.click(screen.getByRole('button', { name: 'Open Sheet' }));

        expect(await screen.findByText(uiStringsSL.storeLocator.title)).toBeInTheDocument();
    });
});
