import { cva, type VariantProps } from 'class-variance-authority';

// Individual swatch component variants
const swatchVariants = cva(
    'rounded-full flex-shrink-0 relative group cursor-pointer transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    {
        variants: {
            size: {
                sm: 'w-4 h-4',
                md: 'w-6 h-6',
                lg: 'w-8 h-8',
            },
            variant: {
                default: 'border-2 border-gray-300 hover:border-gray-400',
                selected: 'border-2 border-white ring-2 ring-black ring-offset-1',
            },
        },
        defaultVariants: {
            size: 'md',
            variant: 'default',
        },
    }
);

export { swatchVariants };
export type SwatchVariantsProps = VariantProps<typeof swatchVariants>;
