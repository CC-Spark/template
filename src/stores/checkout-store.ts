import { createStore } from 'zustand/vanilla';

export const CHECKOUT_STEPS = {
    CONTACT_INFO: 0,
    SHIPPING_ADDRESS: 1,
    SHIPPING_OPTIONS: 2,
    PAYMENT: 3,
    REVIEW_ORDER: 4,
} as const;

export type CheckoutStep = (typeof CHECKOUT_STEPS)[keyof typeof CHECKOUT_STEPS];

type CheckoutStoreState = {
    currentStep: CheckoutStep;
};

type CheckoutStoreActions = {
    setStep: (step: CheckoutStep) => void;
    goToNextStep: () => void;
    goToPreviousStep: () => void;
    resetCheckout: () => void;
};

export type CheckoutStore = CheckoutStoreState & CheckoutStoreActions;

const defaultState: CheckoutStoreState = {
    currentStep: CHECKOUT_STEPS.CONTACT_INFO,
};

/**
 * Creates a `zustand` store to hold information about the current checkout step and navigation.
 * @see {@link https://zustand.docs.pmnd.rs/guides/nextjs}
 */
export const createCheckoutStore = (initState: CheckoutStoreState = defaultState) => {
    return createStore<CheckoutStore>()((set, get) => ({
        ...initState,
        setStep: (step: CheckoutStep): void => {
            set({ currentStep: step });
        },
        goToNextStep: (): void => {
            const currentStep = get().currentStep;
            const steps = Object.values(CHECKOUT_STEPS);
            const currentIndex = steps.indexOf(currentStep);

            if (currentIndex < steps.length - 1) {
                set({ currentStep: steps[currentIndex + 1] });
            }
        },
        goToPreviousStep: (): void => {
            const currentStep = get().currentStep;
            const steps = Object.values(CHECKOUT_STEPS);
            const currentIndex = steps.indexOf(currentStep);

            if (currentIndex > 0) {
                set({ currentStep: steps[currentIndex - 1] });
            }
        },
        resetCheckout: (): void => {
            set({ currentStep: CHECKOUT_STEPS.CONTACT_INFO });
        },
    }));
};
