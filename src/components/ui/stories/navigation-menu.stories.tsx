import type { Meta, StoryObj } from '@storybook/react-vite';
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from '../navigation-menu';
import { expect, within, userEvent } from 'storybook/test';
import { waitForStorybookReady } from '@storybook/test-utils';

const meta: Meta<typeof NavigationMenu> = {
    title: 'UI/NavigationMenu',
    component: NavigationMenu,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component:
                    'A collection of links for navigating websites. Built with Radix UI Navigation Menu primitives. Supports dropdown menus and viewport positioning.',
            },
        },
        a11y: {
            config: {
                rules: [
                    // Radix UI intentionally sets aria-hidden="true" on #storybook-root when menu opens
                    // This is correct accessibility behavior for modal focus trapping
                    { id: 'aria-hidden-focus', enabled: false },
                ],
            },
        },
    },
    tags: ['autodocs', 'interaction'],
    argTypes: {
        viewport: {
            description: 'Whether to show the viewport',
            control: 'boolean',
        },
    },
};

export default meta;
type Story = StoryObj<typeof NavigationMenu>;

export const Default: Story = {
    render: () => (
        <NavigationMenu>
            <NavigationMenuList>
                <NavigationMenuItem>
                    <NavigationMenuTrigger>Components</NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <NavigationMenuLink href="/components/button">Button</NavigationMenuLink>
                        <NavigationMenuLink href="/components/input">Input</NavigationMenuLink>
                        <NavigationMenuLink href="/components/card">Card</NavigationMenuLink>
                    </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <NavigationMenuLink href="/docs">Documentation</NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <NavigationMenuLink href="/about">About</NavigationMenuLink>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    ),
    play: async ({ canvasElement }) => {
        await waitForStorybookReady(canvasElement);
        const canvas = within(canvasElement);

        const componentsTrigger = canvas.getByRole('button', { name: /components/i });
        await expect(componentsTrigger).toBeInTheDocument();

        await userEvent.click(componentsTrigger);
    },
};

export const WithoutViewport: Story = {
    render: () => (
        <NavigationMenu viewport={false}>
            <NavigationMenuList>
                <NavigationMenuItem>
                    <NavigationMenuTrigger>Products</NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <NavigationMenuLink href="/products/laptops">Laptops</NavigationMenuLink>
                        <NavigationMenuLink href="/products/phones">Phones</NavigationMenuLink>
                        <NavigationMenuLink href="/products/tablets">Tablets</NavigationMenuLink>
                    </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <NavigationMenuLink href="/support">Support</NavigationMenuLink>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    ),
    play: async ({ canvasElement }) => {
        await waitForStorybookReady(canvasElement);
        const canvas = within(canvasElement);

        const productsTrigger = canvas.getByRole('button', { name: /products/i });
        await expect(productsTrigger).toBeInTheDocument();
    },
};

export const Simple: Story = {
    render: () => (
        <NavigationMenu>
            <NavigationMenuList>
                <NavigationMenuItem>
                    <NavigationMenuLink href="/home">Home</NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <NavigationMenuLink href="/about">About</NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <NavigationMenuLink href="/contact">Contact</NavigationMenuLink>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    ),
    play: async ({ canvasElement }) => {
        await waitForStorybookReady(canvasElement);
        const canvas = within(canvasElement);

        const homeLink = canvas.getByRole('link', { name: /home/i });
        await expect(homeLink).toBeInTheDocument();
    },
};
