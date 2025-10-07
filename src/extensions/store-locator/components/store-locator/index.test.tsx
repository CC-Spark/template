import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import StoreLocator from './index';

vi.mock('./form', () => ({ default: () => <div data-testid="mock-form">FORM</div> }));
vi.mock('./list', () => ({ default: () => <div data-testid="mock-list">LIST</div> }));

describe('StoreLocator (composition)', () => {
    test('renders form and list', () => {
        render(<StoreLocator />);
        expect(screen.getByTestId('mock-form')).toBeInTheDocument();
        expect(screen.getByTestId('mock-list')).toBeInTheDocument();
    });
});
