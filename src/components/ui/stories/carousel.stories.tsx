import type { Meta, StoryObj } from '@storybook/react-vite';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../carousel';
import { expect, within, userEvent, waitFor } from 'storybook/test';
import { waitForStorybookReady } from '@storybook/test-utils';

const meta: Meta<typeof Carousel> = {
    title: 'UI/Carousel',
    component: Carousel,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component:
                    'A carousel component built with Embla Carousel. Supports horizontal and vertical orientations with navigation controls.',
            },
        },
    },
    tags: ['autodocs', 'interaction'],
    argTypes: {
        orientation: {
            description: 'Orientation of the carousel',
            control: 'select',
            options: ['horizontal', 'vertical'],
        },
    },
};

export default meta;
type Story = StoryObj<typeof Carousel>;

export const Default: Story = {
    render: () => {
        const slides = Array.from({ length: 5 }, (_, i) => ({ id: `slide-${i}`, number: i + 1 }));
        return (
            <Carousel className="w-full max-w-xs">
                <CarouselContent>
                    {slides.map((slide) => (
                        <CarouselItem key={slide.id}>
                            <div className="flex aspect-square items-center justify-center bg-muted rounded-lg">
                                <span className="text-4xl font-semibold">{slide.number}</span>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
            </Carousel>
        );
    },
    play: async ({ canvasElement }) => {
        await waitForStorybookReady(canvasElement);
        const canvas = within(canvasElement);

        const nextButton = await canvas.findByRole('button', { name: /next slide/i }, { timeout: 5000 });
        await expect(nextButton).toBeInTheDocument();

        // Wait for the carousel to initialize and the button to become enabled
        await waitFor(
            () => {
                void expect(nextButton).not.toBeDisabled();
            },
            { timeout: 5000 }
        );

        await userEvent.click(nextButton);
    },
};

export const Vertical: Story = {
    render: () => {
        const slides = Array.from({ length: 5 }, (_, i) => ({ id: `vertical-slide-${i}`, number: i + 1 }));
        return (
            <Carousel orientation="vertical" className="w-full max-w-xs">
                <CarouselContent className="-mt-1 h-[200px]">
                    {slides.map((slide) => (
                        <CarouselItem key={slide.id} className="pt-1 md:basis-1/2">
                            <div className="flex aspect-square items-center justify-center bg-muted rounded-lg">
                                <span className="text-4xl font-semibold">{slide.number}</span>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
            </Carousel>
        );
    },
    play: async ({ canvasElement }) => {
        await waitForStorybookReady(canvasElement);
        const canvas = within(canvasElement);

        const nextButton = canvas.getByRole('button', { name: /next slide/i });
        await expect(nextButton).toBeInTheDocument();
    },
};

export const WithImages: Story = {
    render: () => {
        const slides = Array.from({ length: 3 }, (_, i) => ({
            id: `image-slide-${i}`,
            src: `https://images.unsplash.com/photo-${1588345921523 + i}?w=400&h=400&fit=crop`,
            alt: `Slide ${i + 1}`,
        }));
        return (
            <Carousel className="w-full max-w-xs">
                <CarouselContent>
                    {slides.map((slide) => (
                        <CarouselItem key={slide.id}>
                            <div className="flex aspect-square items-center justify-center bg-muted rounded-lg overflow-hidden">
                                <img src={slide.src} alt={slide.alt} className="w-full h-full object-cover" />
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
            </Carousel>
        );
    },
    play: async ({ canvasElement }) => {
        await waitForStorybookReady(canvasElement);
        const images = canvasElement.querySelectorAll('img');
        await expect(images.length).toBeGreaterThan(0);
    },
};
