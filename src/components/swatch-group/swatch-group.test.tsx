import { describe, test, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRoutesStub } from 'react-router';
import { SwatchGroup } from './swatch-group';
import { Swatch } from './swatch';

// Mock child swatch components for testing
const MockSwatch = ({ value, children, ...props }: { value: string; children: React.ReactNode }) => (
    <button data-testid={`swatch-${value}`} value={value} {...props}>
        {children}
    </button>
);

describe('SwatchGroup', () => {
    test('renders with label and display name', () => {
        render(
            <SwatchGroup label="Color" displayName="Navy Blue">
                <MockSwatch value="navy">Navy</MockSwatch>
                <MockSwatch value="black">Black</MockSwatch>
            </SwatchGroup>
        );

        expect(screen.getByText('Color:')).toBeInTheDocument();
        expect(screen.getByText('Navy Blue')).toBeInTheDocument();
    });

    test('handles empty children gracefully', () => {
        render(<SwatchGroup label="Color">{null}</SwatchGroup>);

        expect(screen.getByText('Color:')).toBeInTheDocument();
        expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    });

    test('renders with proper radiogroup accessibility attributes', () => {
        render(
            <SwatchGroup label="Color" ariaLabel="Choose a color">
                <MockSwatch value="red">Red</MockSwatch>
                <MockSwatch value="blue">Blue</MockSwatch>
            </SwatchGroup>
        );

        const radioGroup = screen.getByRole('radiogroup');
        expect(radioGroup).toHaveAttribute('aria-label', 'Choose a color');
    });

    test('uses label as aria-label when ariaLabel not provided', () => {
        render(
            <SwatchGroup label="Size">
                <MockSwatch value="small">S</MockSwatch>
                <MockSwatch value="large">L</MockSwatch>
            </SwatchGroup>
        );

        const radioGroup = screen.getByRole('radiogroup');
        expect(radioGroup).toHaveAttribute('aria-label', 'Size');
    });

    test('calls handleChange when selection changes', async () => {
        const user = userEvent.setup();
        const handleChange = vi.fn();

        const RouterStub = createRoutesStub([
            {
                path: '/',
                Component: () => (
                    <SwatchGroup label="Color" handleChange={handleChange}>
                        <Swatch value="red" href="/red">
                            Red
                        </Swatch>
                        <Swatch value="blue" href="/blue">
                            Blue
                        </Swatch>
                    </SwatchGroup>
                ),
            },
            {
                path: '/red',
                Component: () => <div>Red page</div>,
            },
            {
                path: '/blue',
                Component: () => <div>Blue page</div>,
            },
        ]);

        render(<RouterStub />);

        const redSwatch = screen.getByRole('radio', { name: /red/i });
        await user.click(redSwatch);

        expect(handleChange).toHaveBeenCalledWith('red');
    });

    test('handles keyboard navigation with arrow keys', async () => {
        const user = userEvent.setup();

        const RouterStub = createRoutesStub([
            {
                path: '/',
                Component: () => (
                    <SwatchGroup label="Size">
                        <Swatch value="small" href="/small">
                            Small
                        </Swatch>
                        <Swatch value="medium" href="/medium">
                            Medium
                        </Swatch>
                        <Swatch value="large" href="/large">
                            Large
                        </Swatch>
                    </SwatchGroup>
                ),
            },
            {
                path: '/small',
                Component: () => <div>Small page</div>,
            },
            {
                path: '/medium',
                Component: () => <div>Medium page</div>,
            },
            {
                path: '/large',
                Component: () => <div>Large page</div>,
            },
        ]);

        render(<RouterStub />);

        const swatches = screen.getAllByRole('radio');

        // Focus first swatch
        swatches[0].focus();

        // Arrow right should move to next swatch
        await user.keyboard('{ArrowRight}');
        expect(swatches[1]).toHaveFocus();

        // Arrow left should move to previous swatch
        await user.keyboard('{ArrowLeft}');
        expect(swatches[0]).toHaveFocus();

        // Arrow down should move to next swatch
        await user.keyboard('{ArrowDown}');
        expect(swatches[1]).toHaveFocus();

        // Arrow up should move to previous swatch
        await user.keyboard('{ArrowUp}');
        expect(swatches[0]).toHaveFocus();
    });

    test('wraps keyboard navigation at boundaries', async () => {
        const user = userEvent.setup();

        const RouterStub = createRoutesStub([
            {
                path: '/',
                Component: () => (
                    <SwatchGroup label="Size">
                        <Swatch value="small" href="/small">
                            Small
                        </Swatch>
                        <Swatch value="large" href="/large">
                            Large
                        </Swatch>
                    </SwatchGroup>
                ),
            },
        ]);

        render(<RouterStub />);

        const swatches = screen.getAllByRole('radio');

        // Focus last swatch
        swatches[1].focus();

        // Arrow right should wrap to first swatch
        await user.keyboard('{ArrowRight}');
        await waitFor(() => {
            expect(swatches[0]).toHaveFocus();
        });

        // Arrow left should wrap to last swatch
        await user.keyboard('{ArrowLeft}');
        expect(swatches[1]).toHaveFocus();
    });

    test('sets correct selected state based on value prop', () => {
        const RouterStub = createRoutesStub([
            {
                path: '/',
                Component: () => (
                    <SwatchGroup label="Color" value="blue">
                        <Swatch value="red" href="/red">
                            Red
                        </Swatch>
                        <Swatch value="blue" href="/blue">
                            Blue
                        </Swatch>
                        <Swatch value="green" href="/green">
                            Green
                        </Swatch>
                    </SwatchGroup>
                ),
            },
        ]);

        render(<RouterStub />);

        const redSwatch = screen.getByRole('radio', { name: /red/i });
        const blueSwatch = screen.getByRole('radio', { name: /blue/i });
        const greenSwatch = screen.getByRole('radio', { name: /green/i });

        expect(redSwatch).not.toBeChecked();
        expect(blueSwatch).toBeChecked();
        expect(greenSwatch).not.toBeChecked();
    });

    test('sets correct focusable state - selected item is focusable', () => {
        const RouterStub = createRoutesStub([
            {
                path: '/',
                Component: () => (
                    <SwatchGroup label="Color" value="blue">
                        <Swatch value="red" href="/red">
                            Red
                        </Swatch>
                        <Swatch value="blue" href="/blue">
                            Blue
                        </Swatch>
                        <Swatch value="green" href="/green">
                            Green
                        </Swatch>
                    </SwatchGroup>
                ),
            },
        ]);

        render(<RouterStub />);

        const redSwatch = screen.getByRole('radio', { name: /red/i });
        const blueSwatch = screen.getByRole('radio', { name: /blue/i });
        const greenSwatch = screen.getByRole('radio', { name: /green/i });

        expect(redSwatch).toHaveAttribute('tabIndex', '-1');
        expect(blueSwatch).toHaveAttribute('tabIndex', '0');
        expect(greenSwatch).toHaveAttribute('tabIndex', '-1');
    });

    test('sets first item as focusable when no value selected', () => {
        const RouterStub = createRoutesStub([
            {
                path: '/',
                Component: () => (
                    <SwatchGroup label="Color">
                        <Swatch value="red" href="/red">
                            Red
                        </Swatch>
                        <Swatch value="blue" href="/blue">
                            Blue
                        </Swatch>
                        <Swatch value="green" href="/green">
                            Green
                        </Swatch>
                    </SwatchGroup>
                ),
            },
        ]);

        render(<RouterStub />);

        const redSwatch = screen.getByRole('radio', { name: /red/i });
        const blueSwatch = screen.getByRole('radio', { name: /blue/i });
        const greenSwatch = screen.getByRole('radio', { name: /green/i });

        expect(redSwatch).toHaveAttribute('tabIndex', '0');
        expect(blueSwatch).toHaveAttribute('tabIndex', '-1');
        expect(greenSwatch).toHaveAttribute('tabIndex', '-1');
    });

    test('applies custom className when provided', () => {
        const RouterStub = createRoutesStub([
            {
                path: '/',
                Component: () => (
                    <SwatchGroup label="Color" className="custom-swatch-group">
                        <Swatch value="red" href="/red">
                            Red
                        </Swatch>
                    </SwatchGroup>
                ),
            },
        ]);

        render(<RouterStub />);

        const container = screen.getByRole('radiogroup').parentElement;
        expect(container).toHaveClass('custom-swatch-group');
    });

    test('does not render label when not provided', () => {
        const RouterStub = createRoutesStub([
            {
                path: '/',
                Component: () => (
                    <SwatchGroup>
                        <Swatch value="red" href="/red">
                            Red
                        </Swatch>
                    </SwatchGroup>
                ),
            },
        ]);

        render(<RouterStub />);

        expect(screen.queryByText(/:/)).not.toBeInTheDocument();
    });

    test('updates selected index when value prop changes', () => {
        const RouterStub1 = createRoutesStub([
            {
                path: '/',
                Component: () => (
                    <SwatchGroup label="Color" value="red">
                        <Swatch value="red" href="/red">
                            Red
                        </Swatch>
                        <Swatch value="blue" href="/blue">
                            Blue
                        </Swatch>
                    </SwatchGroup>
                ),
            },
        ]);

        const { rerender } = render(<RouterStub1 />);

        let redSwatch = screen.getByRole('radio', { name: /red/i });
        let blueSwatch = screen.getByRole('radio', { name: /blue/i });

        expect(redSwatch).toBeChecked();
        expect(blueSwatch).not.toBeChecked();

        // Update value prop
        const RouterStub2 = createRoutesStub([
            {
                path: '/',
                Component: () => (
                    <SwatchGroup label="Color" value="blue">
                        <Swatch value="red" href="/red">
                            Red
                        </Swatch>
                        <Swatch value="blue" href="/blue">
                            Blue
                        </Swatch>
                    </SwatchGroup>
                ),
            },
        ]);

        rerender(<RouterStub2 />);

        redSwatch = screen.getByRole('radio', { name: /red/i });
        blueSwatch = screen.getByRole('radio', { name: /blue/i });

        expect(redSwatch).not.toBeChecked();
        expect(blueSwatch).toBeChecked();
    });
});
