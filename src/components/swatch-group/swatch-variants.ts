import { cva } from 'class-variance-authority';

// Individual swatch component variants
const swatchVariants = cva(
    'flex-shrink-0 relative group cursor-pointer transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    {
        variants: {
            size: {
                sm: 'min-w-4 min-h-4',
                md: 'min-w-6 min-h-6',
                lg: 'min-w-8 min-h-8',
                auto: 'min-w-8 min-h-8', // Auto-sizing for text content
            },
            variant: {
                default: 'border-2 border-gray-300 hover:border-gray-400',
                selected: 'border-2 border-white ring-2 ring-black ring-offset-1',
            },
            shape: {
                circle: 'rounded-full w-6 h-6', // Fixed size for circles (images)
                square: 'rounded-md px-3 py-1', // Flexible sizing for squares (text)
            },
        },
        defaultVariants: {
            size: 'md',
            variant: 'default',
            shape: 'circle',
        },
    }
);

export { swatchVariants };
