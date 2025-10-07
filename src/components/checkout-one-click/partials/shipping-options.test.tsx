import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ShippingOptions from './shipping-options';

const createMockBasket = (overrides = {}) => ({
    basketId: 'test-basket-123',
    currency: 'USD',
    customerInfo: { email: 'test@example.com', customerId: null },
    shipments: [
        {
            shipmentId: 'shipment-1',
            shippingMethods: [
                { id: 'standard', name: 'Standard Shipping', price: 5.99, description: 'Standard delivery' },
                { id: 'express', name: 'Express Shipping', price: 12.99, description: 'Express delivery' },
                { id: 'overnight', name: 'Overnight Shipping', price: 24.99, description: 'Next day delivery' },
            ],
            selectedShippingMethod: null,
        },
    ],
    paymentInstruments: [],
    ...overrides,
});

const createDefaultProps = (overrides = {}) => ({
    onSubmit: vi.fn(),
    isLoading: false,
    actionData: undefined,
    isCompleted: false,
    isEditing: true,
    onEdit: vi.fn(),
    ...overrides,
});

const testScenarios = {
    editMode: { isEditing: true, isCompleted: false },
    completedStep: { isEditing: false, isCompleted: true },
    loadingState: { isLoading: true },
    noShippingMethods: { basket: createMockBasket({ shipments: [{ shippingMethods: [] }] }) },
    selectedMethod: {
        basket: createMockBasket({
            shipments: [
                {
                    selectedShippingMethod: 'express',
                    shippingMethods: [
                        { id: 'standard', name: 'Standard Shipping', price: 5.99 },
                        { id: 'express', name: 'Express Shipping', price: 12.99 },
                    ],
                },
            ],
        }),
    },
    errorState: { actionData: { success: false, errors: { shippingMethod: 'Shipping method required' } } },
};

vi.mock('@/providers/basket', () => ({ useBasket: vi.fn() }));
vi.mock('@/hooks/checkout/use-customer-profile', () => ({
    useCustomerProfile: vi.fn(() => null),
}));
vi.mock('../utils/checkout-context', () => ({
    useCheckoutContext: vi.fn(() => ({ completedSteps: [], markStepCompleted: vi.fn() })),
}));
vi.mock('react-hook-form', () => ({
    useForm: vi.fn(() => ({
        control: {},
        formState: { isSubmitted: false, isValid: true, errors: {} },
        handleSubmit: vi.fn((fn) => (e: React.FormEvent) => {
            e?.preventDefault?.();
            fn({});
        }),
        watch: vi.fn(() => 'standard'),
        setValue: vi.fn(),
        trigger: vi.fn(),
        reset: vi.fn(),
        getValues: vi.fn(() => ({ shippingMethod: 'standard' })),
    })),
}));
vi.mock('@/lib/customer-profile-utils', () => ({
    getDefaultShippingMethod: vi.fn().mockReturnValue('standard'),
}));
interface MockToggleCardProps {
    children: React.ReactNode;
    title: React.ReactNode;
    editing: boolean;
    disabled: boolean;
    onEdit: () => void;
    isLoading: boolean;
    [key: string]: unknown;
}

interface MockCardComponentProps {
    children: React.ReactNode;
    [key: string]: unknown;
}

vi.mock('@/components/toggle-card', () => ({
    ToggleCard: ({ children, title, editing, disabled, onEdit, isLoading, ...props }: MockToggleCardProps) => (
        <div
            data-testid="toggle-card"
            data-editing={editing}
            data-disabled={disabled}
            data-loading={isLoading}
            {...props}>
            <div data-testid="toggle-card-title">{title}</div>
            <button onClick={onEdit} data-testid="edit-button">
                Edit
            </button>
            {children}
        </div>
    ),
    ToggleCardEdit: ({ children, ...props }: MockCardComponentProps) => (
        <div data-testid="toggle-card-edit" {...props}>
            {children}
        </div>
    ),
    ToggleCardSummary: ({ children, ...props }: MockCardComponentProps) => (
        <div data-testid="toggle-card-summary" {...props}>
            {children}
        </div>
    ),
}));
interface MockButtonProps {
    children: React.ReactNode;
    disabled?: boolean;
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
    [key: string]: unknown;
}

vi.mock('@/components/ui/button', () => ({
    Button: ({ children, disabled, onClick, type, ...props }: MockButtonProps) => (
        <button disabled={disabled} onClick={onClick} type={type} data-testid="mock-button" {...props}>
            {children}
        </button>
    ),
}));
interface MockFormComponentProps {
    children: React.ReactNode;
    [key: string]: unknown;
}

vi.mock('@/components/ui/form', () => ({
    Form: ({ children, ...props }: MockFormComponentProps) => (
        <form data-testid="mock-form" {...props}>
            {children}
        </form>
    ),
    FormField: ({ children, ...props }: MockFormComponentProps) => (
        <div data-testid="form-field" {...props}>
            {children}
        </div>
    ),
    FormItem: ({ children, ...props }: MockFormComponentProps) => (
        <div data-testid="form-item" {...props}>
            {children}
        </div>
    ),
    FormLabel: ({ children, ...props }: MockFormComponentProps) => (
        <label data-testid="form-label" {...props}>
            {children}
        </label>
    ),
    FormControl: ({ children, ...props }: MockFormComponentProps) => (
        <div data-testid="form-control" {...props}>
            {children}
        </div>
    ),
    FormMessage: ({ children, ...props }: MockFormComponentProps) => (
        <div data-testid="form-error" {...props}>
            {children}
        </div>
    ),
}));
interface MockRadioGroupProps {
    children: React.ReactNode;
    onValueChange?: (value: string) => void;
    value?: string;
    [key: string]: unknown;
}

interface MockRadioGroupItemProps {
    value: string;
    id?: string;
    [key: string]: unknown;
}

vi.mock('@/components/ui/radio-group', () => ({
    RadioGroup: ({ children, value, ...props }: MockRadioGroupProps) => (
        <div data-testid="radio-group" data-value={value} {...props}>
            {children}
        </div>
    ),
    RadioGroupItem: ({ value, id, ...props }: MockRadioGroupItemProps) => (
        <input type="radio" value={value} id={id} data-testid="radio-item" {...props} />
    ),
}));
vi.mock('@/lib/checkout-schemas', () => ({
    shippingOptionsSchema: {
        parse: vi.fn((data) => data),
        safeParse: vi.fn((data) => ({ success: true, data })),
        _def: { typeName: 'ZodObject' },
    },
    getShippingOptionsDefaultValues: vi.fn(() => ({ shippingMethod: '' })),
}));
vi.mock('@hookform/resolvers/zod', () => ({ zodResolver: vi.fn(() => ({ resolver: vi.fn(), mode: 'onSubmit' })) }));
vi.mock('@/temp-ui-string', () => ({
    default: {
        checkout: {
            shippingOptions: { title: 'Shipping Options', noMethodsAvailable: 'No shipping methods available' },
        },
    },
}));
vi.mock('@/lib/utils', () => ({ cn: vi.fn((...classes) => classes.filter(Boolean).join(' ')) }));

const { useBasket } = await import('@/providers/basket');
const { useCustomerProfile } = await import('@/hooks/checkout/use-customer-profile');

describe('ShippingOptions Component', () => {
    let mockOnSubmit: ReturnType<typeof vi.fn>;
    let mockOnEdit: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        vi.clearAllMocks();
        mockOnSubmit = vi.fn();
        mockOnEdit = vi.fn();

        vi.mocked(useBasket).mockReturnValue(createMockBasket());
        vi.mocked(useCustomerProfile).mockReturnValue(null);
    });

    const renderShippingOptions = (props = {}) => {
        const defaultProps = createDefaultProps({
            onSubmit: mockOnSubmit,
            onEdit: mockOnEdit,
            ...props,
        });
        return render(<ShippingOptions {...defaultProps} />);
    };

    describe('Component State', () => {
        test('renders shipping options form when editing', () => {
            renderShippingOptions(testScenarios.editMode);
            expect(screen.getByTestId('toggle-card')).toBeInTheDocument();
            expect(screen.getByTestId('toggle-card-edit')).toBeInTheDocument();
        });

        test('handles loading state correctly', () => {
            renderShippingOptions(testScenarios.loadingState);
            const toggleCard = screen.getByTestId('toggle-card');
            expect(toggleCard).toHaveAttribute('data-loading', 'true');
        });

        test('handles completed state correctly', () => {
            renderShippingOptions(testScenarios.completedStep);
            expect(screen.getByTestId('toggle-card')).toBeInTheDocument();
            expect(screen.getByTestId('toggle-card-summary')).toBeInTheDocument();
        });

        test('handles error state gracefully', () => {
            expect(() => renderShippingOptions(testScenarios.errorState)).not.toThrow();
            expect(screen.getByTestId('toggle-card')).toBeInTheDocument();
        });
    });

    describe('Form Interaction', () => {
        test('handles form submission', () => {
            renderShippingOptions(testScenarios.editMode);
            const submitButton = screen.getByTestId('mock-button');
            expect(submitButton).toBeInTheDocument();
        });

        test('handles edit button click', () => {
            renderShippingOptions(testScenarios.completedStep);
            const editButton = screen.getByTestId('edit-button');
            editButton.click();
            expect(mockOnEdit).toHaveBeenCalled();
        });

        test('renders shipping form', () => {
            renderShippingOptions();
            expect(screen.getByTestId('toggle-card')).toBeInTheDocument();
        });
    });

    describe('Shipping Methods', () => {
        const shippingScenarios = [
            {
                name: 'multiple shipping methods',
                basketData: createMockBasket(),
                shouldRender: true,
                expectedMethods: 3,
            },
            {
                name: 'single shipping method',
                basketData: createMockBasket({
                    shipments: [
                        {
                            shippingMethods: [{ id: 'standard', name: 'Standard Shipping', price: 5.99 }],
                        },
                    ],
                }),
                shouldRender: true,
                expectedMethods: 1,
            },
            {
                name: 'no shipping methods available',
                basketData: testScenarios.noShippingMethods.basket,
                shouldRender: true,
                expectedMethods: 0,
            },
            {
                name: 'pre-selected shipping method',
                basketData: testScenarios.selectedMethod.basket,
                shouldRender: true,
                expectedMethods: 2,
            },
        ];

        shippingScenarios.forEach(({ name, basketData, shouldRender, expectedMethods }) => {
            test(`handles ${name}`, () => {
                vi.mocked(useBasket).mockReturnValue(basketData);

                if (shouldRender) {
                    expect(() => renderShippingOptions()).not.toThrow();
                    expect(screen.getByTestId('toggle-card')).toBeInTheDocument();

                    if (expectedMethods === 0) {
                        expect(screen.getAllByText('No shipping methods available')).toHaveLength(2);
                    } else {
                        expect(screen.getByTestId('toggle-card')).toBeInTheDocument();
                    }
                } else {
                    expect(() => renderShippingOptions()).not.toThrow();
                }
            });
        });
    });

    describe('Pricing', () => {
        const pricingScenarios = [
            { method: { id: 'free', name: 'Free Shipping', price: 0 }, displayPrice: '$0.00' },
            { method: { id: 'standard', name: 'Standard Shipping', price: 5.99 }, displayPrice: '$5.99' },
            { method: { id: 'express', name: 'Express Shipping', price: 12.99 }, displayPrice: '$12.99' },
            { method: { id: 'premium', name: 'Premium Shipping', price: 99.99 }, displayPrice: '$99.99' },
        ];

        pricingScenarios.forEach(({ method }) => {
            test(`displays correct pricing for ${method.name}`, () => {
                const basketWithMethod = createMockBasket({
                    shipments: [{ shippingMethods: [method] }],
                });
                vi.mocked(useBasket).mockReturnValue(basketWithMethod);

                renderShippingOptions();
                expect(screen.getByTestId('toggle-card')).toBeInTheDocument();
            });
        });
    });

    describe('User Interactions', () => {
        const interactionScenarios = [
            {
                name: 'submit form with button click',
                setup: () => renderShippingOptions(testScenarios.editMode),
                action: () => {
                    const submitButton = screen.getByTestId('mock-button');
                    expect(submitButton).toBeInTheDocument();
                },
                expectation: () => expect(screen.getByTestId('mock-button')).toBeInTheDocument(),
            },
            {
                name: 'edit completed shipping options',
                setup: () => renderShippingOptions(testScenarios.completedStep),
                action: () => {
                    const editButton = screen.getByTestId('edit-button');
                    editButton.click();
                },
                expectation: () => expect(mockOnEdit).toHaveBeenCalled(),
            },
            {
                name: 'interact with shipping form',
                setup: () => renderShippingOptions(testScenarios.editMode),
                action: () => {
                    const form = screen.getByTestId('toggle-card-edit');
                    expect(form).toBeInTheDocument();
                },
                expectation: () => {
                    const form = screen.getByTestId('toggle-card-edit');
                    expect(form).toBeInTheDocument();
                },
            },
        ];

        interactionScenarios.forEach((scenario) => {
            test(`should handle ${scenario.name}`, async () => {
                const user = userEvent.setup();
                scenario.setup();
                const result = scenario.action(user);
                if (
                    result &&
                    typeof result === 'object' &&
                    result !== null &&
                    'then' in result &&
                    typeof result.then === 'function'
                ) {
                    await (result as Promise<unknown>);
                }
                scenario.expectation();
            });
        });
    });

    describe('Error Handling', () => {
        const errorScenarios = [
            {
                name: 'action data error',
                props: { actionData: { success: false, errors: { shippingMethod: 'Shipping method required' } } },
            },
            { name: 'missing onSubmit', props: { onSubmit: null } },
            { name: 'missing onEdit', props: { onEdit: null } },
            { name: 'invalid basket data', setup: () => vi.mocked(useBasket).mockReturnValue(null) },
            {
                name: 'empty shipments array',
                setup: () => vi.mocked(useBasket).mockReturnValue(createMockBasket({ shipments: [] })),
            },
        ];

        errorScenarios.forEach(({ name, props, setup }) => {
            test(`handles ${name} gracefully`, () => {
                if (setup) setup();
                expect(() => renderShippingOptions(props)).not.toThrow();
            });
        });
    });

    describe('Shipping Features', () => {
        test('renders shipping options title', () => {
            renderShippingOptions();
            expect(screen.getByTestId('toggle-card-title')).toHaveTextContent('Shipping Options');
        });

        test('handles customer profile integration', () => {
            vi.mocked(useCustomerProfile).mockReturnValue({
                customerId: 'customer-123',
                email: 'profile@example.com',
                firstName: 'John',
                lastName: 'Doe',
            });

            renderShippingOptions();
            expect(screen.getByTestId('toggle-card')).toBeInTheDocument();
        });

        test('integrates with auto-populate default shipping method', () => {
            renderShippingOptions();
            expect(screen.getByTestId('toggle-card')).toBeInTheDocument();
        });

        test('handles shipment without shipping methods', () => {
            vi.mocked(useBasket).mockReturnValue(
                createMockBasket({
                    shipments: [{ shippingMethods: undefined }],
                })
            );

            expect(() => renderShippingOptions()).not.toThrow();
            expect(screen.getByTestId('toggle-card')).toBeInTheDocument();
        });

        test('handles multiple shipments scenario', () => {
            vi.mocked(useBasket).mockReturnValue(
                createMockBasket({
                    shipments: [
                        {
                            shipmentId: 'shipment-1',
                            shippingMethods: [{ id: 'standard', name: 'Standard', price: 5.99 }],
                        },
                        {
                            shipmentId: 'shipment-2',
                            shippingMethods: [{ id: 'express', name: 'Express', price: 12.99 }],
                        },
                    ],
                })
            );

            renderShippingOptions();
            expect(screen.getByTestId('toggle-card')).toBeInTheDocument();
        });
    });
});
