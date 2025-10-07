// Testing libraries
import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createRoutesStub } from 'react-router';
import { User } from 'lucide-react';
import { AccountNavItem } from './nav-item';

const mockNavItem = {
    path: '/account',
    icon: User,
    label: 'Account Details',
    disabled: false,
};

const createTestWrapper = (component: React.ReactElement, initialPath = '/account') => {
    const Stub = createRoutesStub([
        {
            path: '/account',
            Component: () => component,
        },
    ]);
    return <Stub initialEntries={[initialPath]} />;
};

describe('<AccountNavItem />', () => {
    describe('Rendering with disabled false', () => {
        test('displays navigation item with correct label, link, and icon', () => {
            render(createTestWrapper(<AccountNavItem item={mockNavItem} />));
            const link = screen.getByRole('link', { name: 'Account Details' });
            expect(link).toBeInTheDocument();
            expect(link).toHaveAttribute('href', '/account');
            expect(screen.getByTestId('Account Details-icon')).toBeInTheDocument();
            expect(screen.getAllByRole('link')).toHaveLength(1);
        });
    });

    describe('Rendering with disabled true', () => {
        test('renders as disabled div when disabled is true', () => {
            const disabledItem = { ...mockNavItem, disabled: true };
            render(createTestWrapper(<AccountNavItem item={disabledItem} />));

            const disabledElement = screen.getByRole('button', { name: 'Account Details' });
            expect(disabledElement).toBeInTheDocument();
            expect(disabledElement).toBeDisabled();
        });

        test('does not render as link when disabled', () => {
            const disabledItem = { ...mockNavItem, disabled: true };
            render(createTestWrapper(<AccountNavItem item={disabledItem} />));

            expect(screen.queryByRole('link')).not.toBeInTheDocument();
            expect(screen.getByRole('button')).toBeInTheDocument();
        });
    });
});
