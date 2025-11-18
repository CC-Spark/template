import type { Meta, StoryObj } from '@storybook/react-vite';
import Help from '../help';
import { action } from 'storybook/actions';
import { useEffect, useRef, type ReactNode, type ReactElement } from 'react';
import { expect, within, userEvent } from 'storybook/test';

function HelpStoryHarness({ children }: { children: ReactNode }): ReactElement {
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const root = containerRef.current;
        if (!root) return;

        const logNavigate = action('help-navigate');
        const logClick = action('help-button-click');

        const handleClick = (event: Event) => {
            const target = event.target as HTMLElement | null;
            if (!target || !root.contains(target)) return;

            const link = target.closest('a[href]');
            if (link) {
                const href = link.getAttribute('href') || '';
                const text = link.textContent?.trim() || '';
                event.preventDefault();
                logNavigate({ href, text });
                logClick({ href, text });
                return;
            }

            const button = target.closest('button');
            if (button) {
                const label = button.textContent?.trim() || button.getAttribute('aria-label') || '';
                logClick({ label });
            }
        };

        root.addEventListener('click', handleClick, true);

        return () => {
            root.removeEventListener('click', handleClick, true);
        };
    }, []);

    return <div ref={containerRef}>{children}</div>;
}

const meta: Meta<typeof Help> = {
    title: 'HOME/Help',
    component: Help,
    tags: ['autodocs', 'interaction'],
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component: `
Help component that displays a help section with a contact button.

### Features:
- Heading and description
- Contact Us button/link
- Responsive layout
                `,
            },
        },
    },
    decorators: [
        (Story) => (
            <HelpStoryHarness>
                <div className="py-16 bg-background">
                    <Story />
                </div>
            </HelpStoryHarness>
        ),
    ],
};

export default meta;
type Story = StoryObj<typeof Help>;

export const Default: Story = {
    render: () => <Help />,
    parameters: {
        docs: {
            story: `
Default help component.

### Features:
- Help heading
- Description text
- Contact Us button
            `,
        },
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        // Check for heading
        const heading = await canvas.findByText(/we're here to help/i, {}, { timeout: 5000 });
        await expect(heading).toBeInTheDocument();

        // Check for contact button
        const contactButton = await canvas.findByRole('link', { name: /contact us/i }, { timeout: 5000 });
        await expect(contactButton).toBeInTheDocument();
        await expect(contactButton).toHaveAttribute('href', '/contact');
    },
};

export const Interactive: Story = {
    render: () => <Help />,
    parameters: {
        docs: {
            story: `
Interactive help component for testing user interactions.

### Features:
- Button click interactions
- Navigation handling
            `,
        },
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        // Find and click contact button
        const contactButton = await canvas.findByRole('link', { name: /contact us/i }, { timeout: 5000 });
        await userEvent.click(contactButton);
    },
};
