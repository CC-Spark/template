import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ContactInfo from './contact-info';

const createMockBasket = (overrides = {}) => ({
    basketId: 'test-basket-123',
    currency: 'USD',
    customerInfo: { email: 'test@example.com', customerId: null },
    shipments: [{ shipmentId: 'shipment-1', shippingAddress: null }],
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
    onRegisteredUserChoseGuest: vi.fn(),
    ...overrides,
});

const testScenarios = {
    editMode: { isEditing: true, isCompleted: false },
    completedStep: { isEditing: false, isCompleted: true },
    loadingState: { isLoading: true },
    guestUser: { basket: createMockBasket({ customerInfo: { email: 'guest@example.com', customerId: null } }) },
    registeredUser: {
        basket: createMockBasket({ customerInfo: { email: 'user@example.com', customerId: 'customer-123' } }),
    },
    errorState: { actionData: { success: false, errors: { email: 'Invalid email' } } },
};

vi.mock('@/providers/basket', () => ({ useBasket: vi.fn() }));
vi.mock('@/hooks/use-customer-lookup', () => ({
    useCustomerLookup: vi.fn(() => ({ isLoading: false, customer: null, lookup: vi.fn() })),
    useLoginSuggestion: vi.fn(() => ({ shouldSuggestLogin: false, isCurrentUser: false })),
}));
vi.mock('@/hooks/checkout/use-customer-profile', () => ({
    useCustomerProfile: vi.fn(() => null),
}));
vi.mock('react-hook-form', () => ({
    useForm: vi.fn(() => ({
        control: {},
        formState: { isSubmitted: false, isValid: true, errors: {} },
        handleSubmit: vi.fn((fn) => (e: React.FormEvent) => {
            e?.preventDefault?.();
            fn({});
        }),
        watch: vi.fn(() => 'test@example.com'),
        setValue: vi.fn(),
        trigger: vi.fn(),
        reset: vi.fn(),
        getValues: vi.fn(() => ({ email: 'test@example.com' })),
    })),
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

interface MockInputProps {
    [key: string]: unknown;
}

vi.mock('@/components/ui/button', () => ({
    Button: ({ children, disabled, onClick, type, ...props }: MockButtonProps) => (
        <button disabled={disabled} onClick={onClick} type={type} data-testid="mock-button" {...props}>
            {children}
        </button>
    ),
}));
vi.mock('@/components/ui/input', () => ({
    Input: (props: MockInputProps) => <input data-testid="mock-input" {...props} />,
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
vi.mock('@/lib/checkout-schemas', () => ({
    contactInfoSchema: {
        parse: vi.fn((data) => data),
        safeParse: vi.fn((data) => ({ success: true, data })),
        _def: { typeName: 'ZodObject' },
    },
    getContactInfoDefaultValues: vi.fn(() => ({ email: '' })),
}));
vi.mock('@hookform/resolvers/zod', () => ({ zodResolver: vi.fn(() => ({ resolver: vi.fn(), mode: 'onSubmit' })) }));
vi.mock('@/temp-ui-string', () => ({
    default: {
        checkout: {
            contactInfo: { title: 'Contact Information' },
            common: {
                stepCompleted: '✓',
                stepNumbers: { contactInfo: '1' },
            },
        },
    },
}));
vi.mock('@/lib/utils', () => ({ cn: vi.fn((...classes) => classes.filter(Boolean).join(' ')) }));

const { useBasket } = await import('@/providers/basket');
const { useCustomerLookup, useLoginSuggestion } = await import('@/hooks/use-customer-lookup');
const { useCustomerProfile } = await import('@/hooks/checkout/use-customer-profile');

describe('ContactInfo Component', () => {
    let mockOnSubmit: ReturnType<typeof vi.fn>;
    let mockOnEdit: ReturnType<typeof vi.fn>;
    let mockOnRegisteredUserChoseGuest: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        vi.clearAllMocks();
        mockOnSubmit = vi.fn();
        mockOnEdit = vi.fn();
        mockOnRegisteredUserChoseGuest = vi.fn();

        vi.mocked(useBasket).mockReturnValue(createMockBasket());
        vi.mocked(useCustomerProfile).mockReturnValue(null);
        vi.mocked(useCustomerLookup).mockReturnValue({ isLoading: false, customer: null, lookup: vi.fn() });
        vi.mocked(useLoginSuggestion).mockReturnValue({ shouldSuggestLogin: false, isCurrentUser: false });
    });

    const renderContactInfo = (props = {}) => {
        const defaultProps = createDefaultProps({
            onSubmit: mockOnSubmit,
            onEdit: mockOnEdit,
            onRegisteredUserChoseGuest: mockOnRegisteredUserChoseGuest,
            ...props,
        });
        return render(<ContactInfo {...defaultProps} />);
    };

    describe('Component State', () => {
        test('renders contact info form when editing', () => {
            renderContactInfo(testScenarios.editMode);
            expect(screen.getByTestId('toggle-card')).toBeInTheDocument();
            expect(screen.getByTestId('toggle-card-edit')).toBeInTheDocument();
        });

        test('handles loading state correctly', () => {
            renderContactInfo(testScenarios.loadingState);
            const toggleCard = screen.getByTestId('toggle-card');
            expect(toggleCard).toHaveAttribute('data-loading', 'true');
        });

        test('handles completed state correctly', () => {
            renderContactInfo(testScenarios.completedStep);
            expect(screen.getByTestId('toggle-card')).toBeInTheDocument();
            expect(screen.getByTestId('toggle-card-summary')).toBeInTheDocument();
        });

        test('handles error state gracefully', () => {
            expect(() => renderContactInfo(testScenarios.errorState)).not.toThrow();
            expect(screen.getByTestId('toggle-card')).toBeInTheDocument();
        });
    });

    describe('Form Interaction', () => {
        test('handles form submission', async () => {
            const user = userEvent.setup();
            renderContactInfo(testScenarios.editMode);
            const submitButton = screen.getByTestId('mock-button');
            await user.click(submitButton);
            expect(mockOnSubmit).toHaveBeenCalled();
        });

        test('handles edit button click', async () => {
            const user = userEvent.setup();
            renderContactInfo(testScenarios.completedStep);
            const editButton = screen.getByTestId('edit-button');
            await user.click(editButton);
            expect(mockOnEdit).toHaveBeenCalled();
        });

        test('renders email form field', () => {
            renderContactInfo();
            expect(screen.getByTestId('form-field')).toBeInTheDocument();
        });
    });

    describe('Customer Types', () => {
        const customerScenarios = [
            {
                type: 'guest',
                setup: () => {
                    vi.mocked(useBasket).mockReturnValue(testScenarios.guestUser.basket);
                    vi.mocked(useCustomerProfile).mockReturnValue(null);
                },
                description: 'guest user without account',
            },
            {
                type: 'registered',
                setup: () => {
                    vi.mocked(useBasket).mockReturnValue(testScenarios.registeredUser.basket);
                    vi.mocked(useCustomerProfile).mockReturnValue({
                        customerId: 'customer-123',
                        email: 'user@example.com',
                    });
                },
                description: 'registered customer with account',
            },
            {
                type: 'customer-lookup',
                setup: () => {
                    vi.mocked(useBasket).mockReturnValue(createMockBasket());
                    vi.mocked(useCustomerLookup).mockReturnValue({
                        isLoading: false,
                        customer: { email: 'found@example.com' },
                        lookup: vi.fn(),
                    });
                },
                description: 'customer found via lookup',
            },
        ];

        customerScenarios.forEach(({ setup, description }) => {
            test(`handles ${description}`, () => {
                setup();
                renderContactInfo();
                expect(screen.getByTestId('toggle-card')).toBeInTheDocument();
            });
        });
    });

    describe('User Interactions', () => {
        const interactionScenarios = [
            {
                name: 'submit form with valid email',
                setup: () => renderContactInfo(testScenarios.editMode),
                action: async (user: ReturnType<typeof userEvent.setup>) => {
                    const submitButton = screen.getByTestId('mock-button');
                    await user.click(submitButton);
                },
                expectation: () => expect(mockOnSubmit).toHaveBeenCalled(),
            },
            {
                name: 'edit completed contact info',
                setup: () => renderContactInfo(testScenarios.completedStep),
                action: async (user: ReturnType<typeof userEvent.setup>) => {
                    const editButton = screen.getByTestId('edit-button');
                    await user.click(editButton);
                },
                expectation: () => expect(mockOnEdit).toHaveBeenCalled(),
            },
            {
                name: 'interact with email form field',
                setup: () => renderContactInfo(testScenarios.editMode),
                action: () => {
                    const formField = screen.getByTestId('form-field');
                    expect(formField).toBeInTheDocument();
                },
                expectation: () => {
                    const formField = screen.getByTestId('form-field');
                    expect(formField).toBeInTheDocument();
                },
            },
        ];

        interactionScenarios.forEach((scenario) => {
            test(`should handle ${scenario.name}`, async () => {
                const user = userEvent.setup();
                scenario.setup();
                await scenario.action(user);
                scenario.expectation();
            });
        });
    });

    describe('Login Suggestions', () => {
        const loginScenarios = [
            {
                name: 'suggest login for existing customer',
                mockValues: {
                    loginSuggestion: { shouldSuggestLogin: true, isCurrentUser: false },
                    customerLookup: { isLoading: false, customer: { email: 'existing@example.com' }, lookup: vi.fn() },
                },
            },
            {
                name: 'no suggestion for new customer',
                mockValues: {
                    loginSuggestion: { shouldSuggestLogin: false, isCurrentUser: false },
                    customerLookup: { isLoading: false, customer: null, lookup: vi.fn() },
                },
            },
            {
                name: 'loading customer lookup',
                mockValues: {
                    loginSuggestion: { shouldSuggestLogin: false, isCurrentUser: false },
                    customerLookup: { isLoading: true, customer: null, lookup: vi.fn() },
                },
            },
        ];

        loginScenarios.forEach(({ name, mockValues }) => {
            test(`handles ${name}`, () => {
                vi.mocked(useLoginSuggestion).mockReturnValue(mockValues.loginSuggestion);
                vi.mocked(useCustomerLookup).mockReturnValue(mockValues.customerLookup);

                renderContactInfo();
                expect(screen.getByTestId('toggle-card')).toBeInTheDocument();
            });
        });
    });

    describe('Error Handling', () => {
        const errorScenarios = [
            {
                name: 'action data error',
                props: { actionData: { success: false, errors: { email: 'Invalid email' } } },
            },
            { name: 'missing onSubmit', props: { onSubmit: null } },
            { name: 'missing onEdit', props: { onEdit: null } },
            { name: 'invalid basket data', setup: () => vi.mocked(useBasket).mockReturnValue(null) },
        ];

        errorScenarios.forEach(({ name, props, setup }) => {
            test(`handles ${name} gracefully`, () => {
                if (setup) setup();
                expect(() => renderContactInfo(props)).not.toThrow();
            });
        });
    });

    describe('Contact Info Features', () => {
        test('renders contact info title', () => {
            renderContactInfo();
            expect(screen.getByTestId('toggle-card-title')).toHaveTextContent('Contact Information');
        });

        test('handles customer profile integration', () => {
            vi.mocked(useCustomerProfile).mockReturnValue({
                customerId: 'customer-123',
                email: 'profile@example.com',
                firstName: 'John',
                lastName: 'Doe',
            });

            renderContactInfo();
            expect(screen.getByTestId('toggle-card')).toBeInTheDocument();
        });

        test('integrates with customer lookup service', () => {
            const mockLookup = vi.fn();
            vi.mocked(useCustomerLookup).mockReturnValue({
                isLoading: false,
                customer: null,
                lookup: mockLookup,
            });

            renderContactInfo();
            expect(screen.getByTestId('toggle-card')).toBeInTheDocument();
        });

        test('handles registered user chose guest callback', () => {
            renderContactInfo({
                onRegisteredUserChoseGuest: mockOnRegisteredUserChoseGuest,
                actionData: { registeredUserChoseGuest: true },
            });

            expect(screen.getByTestId('toggle-card')).toBeInTheDocument();
        });
    });
});
