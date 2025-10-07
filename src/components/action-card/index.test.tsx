import { createRef } from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import uiStrings from '@/temp-ui-string';
import ActionCard from './index';

describe('ActionCard', () => {
    test('renders children within the card content', () => {
        const childText = 'Child content here';
        render(<ActionCard>{childText}</ActionCard>);

        expect(screen.getByText(childText)).toBeInTheDocument();
    });

    test('does not render footer when no actions are provided', () => {
        const { container } = render(<ActionCard>no actions</ActionCard>);

        expect(container.querySelector('[data-slot="card-footer"]')).toBeNull();
    });

    test('renders Edit button and calls onEdit when clicked', async () => {
        const onEdit = vi.fn();
        render(<ActionCard onEdit={onEdit}>content</ActionCard>);

        const editButton = screen.getByRole('button', { name: uiStrings.actionCard.edit });
        await userEvent.click(editButton);

        expect(onEdit).toHaveBeenCalledTimes(1);
        expect(editButton.closest('[data-slot="card-footer"]')).toBeTruthy();
    });

    test('renders Remove button and shows overlay while onRemove is pending', async () => {
        let resolveRemove!: () => void;
        const removePromise = new Promise<void>((resolve) => {
            resolveRemove = resolve;
        });

        const onRemove = vi.fn().mockReturnValue(removePromise);
        render(<ActionCard onRemove={onRemove}>content</ActionCard>);

        const removeButton = screen.getByRole('button', { name: uiStrings.actionCard.remove });
        await userEvent.click(removeButton);

        expect(onRemove).toHaveBeenCalledTimes(1);

        expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();

        resolveRemove();
        await waitFor(() => {
            expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
        });
    });

    test('uses provided aria labels when editBtnLabel/removeBtnLabel are set', () => {
        render(
            <ActionCard onEdit={() => {}} onRemove={() => {}} editBtnLabel="Modify item" removeBtnLabel="Delete item">
                content
            </ActionCard>
        );

        expect(screen.getByRole('button', { name: 'Modify item' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Delete item' })).toBeInTheDocument();
    });

    test('assigns refs to action buttons when provided', () => {
        const editRef = createRef<HTMLButtonElement>();
        const removeRef = createRef<HTMLButtonElement>();

        render(
            <ActionCard onEdit={() => {}} onRemove={() => {}} editBtnRef={editRef} removeBtnRef={removeRef}>
                content
            </ActionCard>
        );

        expect(editRef.current).toBeInstanceOf(HTMLButtonElement);
        expect(removeRef.current).toBeInstanceOf(HTMLButtonElement);
    });
});
