import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TextSeparator } from './text-separator';

describe('TextSeparator', () => {
    test('renders provided text', () => {
        render(<TextSeparator text="Or" />);
        expect(screen.getByText('Or')).toBeInTheDocument();
    });
});
