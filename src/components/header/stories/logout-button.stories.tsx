import type { Meta, StoryObj } from '@storybook/react-vite';
import LogoutButton from '../logout-button';
import { action } from 'storybook/actions';
import { useEffect, useRef, type ReactNode, type ReactElement } from 'react';
import { expect, within, userEvent } from 'storybook/test';
import { waitForStorybookReady } from '@storybook/test-utils';

function LogoutButtonStoryHarness({ children }: { children: ReactNode }): ReactElement {
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const root = containerRef.current;
        if (!root) return;

        const logSubmit = action('logout-button-submit');
        const logClick = action('logout-button-click');

        const handleSubmit = (event: SubmitEvent) => {
            const form = event.target;
            if (!(form instanceof HTMLFormElement) || !root.contains(form)) return;
            event.preventDefault();
            logSubmit({});
        };

        const handleClick = (event: MouseEvent) => {
            const target = event.target as HTMLElement | null;
            if (!target || !root.contains(target)) return;
            const button = target.closest('button[type="submit"]');
            if (button) {
                logClick({});
            }
        };

        root.addEventListener('submit', handleSubmit, true);
        root.addEventListener('click', handleClick, true);

        return () => {
            root.removeEventListener('submit', handleSubmit, true);
            root.removeEventListener('click', handleClick, true);
        };
    }, []);

    return <div ref={containerRef}>{children}</div>;
}

const meta: Meta<typeof LogoutButton> = {
    title: 'LAYOUT/Header/Logout Button',
    component: LogoutButton,
    tags: ['autodocs', 'interaction'],
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component: `
Logout Button component for signing out users.

### Features:
- Form submission via React Router
- Loading state during submission
- Disabled state while submitting
                `,
            },
        },
    },
    decorators: [
        (Story) => (
            <LogoutButtonStoryHarness>
                <div className="p-8">
                    <Story />
                </div>
            </LogoutButtonStoryHarness>
        ),
    ],
};

export default meta;
type Story = StoryObj<typeof LogoutButton>;

export const Default: Story = {
    render: () => <LogoutButton />,
    parameters: {
        docs: {
            story: `
Default logout button.

### Features:
- Sign Out button
- Form submission
            `,
        },
    },
    play: async ({ canvasElement }) => {
        await waitForStorybookReady(canvasElement);
        const canvas = within(canvasElement);

        // Check for logout button
        const logoutButton = await canvas.findByRole('button', { name: /sign out/i }, { timeout: 5000 });
        await expect(logoutButton).toBeInTheDocument();
        await expect(logoutButton).not.toBeDisabled();
    },
};

export const Submitting: Story = {
    render: () => <LogoutButton />,
    parameters: {
        docs: {
            story: `
Logout button in submitting state (simulated).

### Features:
- Button shows loading state
- Button is disabled during submission
            `,
        },
    },
    play: async ({ canvasElement }) => {
        await waitForStorybookReady(canvasElement);
        const canvas = within(canvasElement);

        // Check for logout button
        const logoutButton = await canvas.findByRole('button', { name: /sign out/i }, { timeout: 5000 });
        await expect(logoutButton).toBeInTheDocument();

        // Click to trigger submission (this will show submitting state if navigation state is submitting)
        await userEvent.click(logoutButton);

        // Wait a bit for state update
        await new Promise((resolve) => setTimeout(resolve, 100));
    },
};

export const Interactive: Story = {
    render: () => <LogoutButton />,
    parameters: {
        docs: {
            story: `
Interactive logout button for testing user interactions.

### Features:
- Button click
- Form submission
            `,
        },
    },
    play: async ({ canvasElement }) => {
        await waitForStorybookReady(canvasElement);
        const canvas = within(canvasElement);

        // Find and click logout button
        const logoutButton = await canvas.findByRole('button', { name: /sign out/i }, { timeout: 5000 });
        await expect(logoutButton).toBeInTheDocument();
        await userEvent.click(logoutButton);
    },
};
