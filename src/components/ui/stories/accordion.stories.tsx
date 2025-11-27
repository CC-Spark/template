import type { Meta, StoryObj } from '@storybook/react-vite';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../accordion';
import { expect, within, userEvent } from 'storybook/test';
import { waitForStorybookReady } from '@storybook/test-utils';

const meta: Meta<typeof Accordion> = {
    title: 'UI/Accordion',
    component: Accordion,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component:
                    'A vertically stacked set of interactive headings that each reveal a section of content. Built with Radix UI Accordion primitives.',
            },
        },
    },
    tags: ['autodocs', 'interaction'],
    argTypes: {
        type: {
            description: 'Type of accordion behavior',
            control: 'select',
            options: ['single', 'multiple'],
        },
        collapsible: {
            description: 'Whether the accordion can collapse all items',
            control: 'boolean',
        },
    },
};

export default meta;
type Story = StoryObj<typeof Accordion>;

export const Default: Story = {
    render: () => (
        <Accordion type="single" collapsible className="w-[400px]">
            <AccordionItem value="item-1">
                <AccordionTrigger>Is it accessible?</AccordionTrigger>
                <AccordionContent>
                    Yes. It adheres to the WAI-ARIA design pattern and uses Radix UI primitives for accessibility.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
                <AccordionTrigger>Is it styled?</AccordionTrigger>
                <AccordionContent>
                    Yes. It comes with default styles that match the other components aesthetic, but it&apos;s
                    customizable.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
                <AccordionTrigger>Is it animated?</AccordionTrigger>
                <AccordionContent>Yes. It uses CSS animations for smooth open and close transitions.</AccordionContent>
            </AccordionItem>
        </Accordion>
    ),
    play: async ({ canvasElement }) => {
        await waitForStorybookReady(canvasElement);
        const canvas = within(canvasElement);

        const trigger1 = canvas.getByRole('button', { name: /is it accessible/i });
        await expect(trigger1).toBeInTheDocument();

        await userEvent.click(trigger1);
        const content1 = await canvas.findByText(/yes. it adheres to the wai-aria/i, {}, { timeout: 5000 });
        await expect(content1).toBeInTheDocument();
    },
};

export const Multiple: Story = {
    render: () => (
        <Accordion type="multiple" className="w-[400px]">
            <AccordionItem value="item-1">
                <AccordionTrigger>Section 1</AccordionTrigger>
                <AccordionContent>Content for section 1</AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
                <AccordionTrigger>Section 2</AccordionTrigger>
                <AccordionContent>Content for section 2</AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
                <AccordionTrigger>Section 3</AccordionTrigger>
                <AccordionContent>Content for section 3</AccordionContent>
            </AccordionItem>
        </Accordion>
    ),
    play: async ({ canvasElement }) => {
        await waitForStorybookReady(canvasElement);
        const canvas = within(canvasElement);

        const trigger1 = canvas.getByRole('button', { name: /section 1/i });
        const trigger2 = canvas.getByRole('button', { name: /section 2/i });

        await userEvent.click(trigger1);
        await userEvent.click(trigger2);

        const content1 = await canvas.findByText(/content for section 1/i, {}, { timeout: 5000 });
        const content2 = await canvas.findByText(/content for section 2/i, {}, { timeout: 5000 });
        await expect(content1).toBeInTheDocument();
        await expect(content2).toBeInTheDocument();
    },
};

export const SingleItem: Story = {
    render: () => (
        <Accordion type="single" collapsible className="w-[400px]">
            <AccordionItem value="item-1">
                <AccordionTrigger>Single Item Accordion</AccordionTrigger>
                <AccordionContent>
                    This accordion contains only one item. It can be expanded and collapsed.
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    ),
    play: async ({ canvasElement }) => {
        await waitForStorybookReady(canvasElement);
        const canvas = within(canvasElement);

        const trigger = canvas.getByRole('button', { name: /single item accordion/i });
        await expect(trigger).toBeInTheDocument();

        await userEvent.click(trigger);
        const content = await canvas.findByText(/this accordion contains only one item/i, {}, { timeout: 5000 });
        await expect(content).toBeInTheDocument();
    },
};
