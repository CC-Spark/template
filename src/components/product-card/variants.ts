import { cva, type VariantProps } from 'class-variance-authority';

const productCardVariants = cva('group bg-accent/10 border-accent/50', {
    variants: {
        variant: {
            default: 'bg-accent/10 border-accent/50',
            elevated: 'bg-accent/20 border-accent/70 shadow-sm',
        },
    },
    defaultVariants: {
        variant: 'default',
    },
});

export { productCardVariants };
export type ProductCardVariantsProps = VariantProps<typeof productCardVariants>;
