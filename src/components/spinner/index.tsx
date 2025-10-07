import { forwardRef, type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const spinnerVariants = cva('animate-spin rounded-full border-2 border-border border-t-primary', {
    variants: {
        size: {
            sm: 'size-4',
            md: 'size-6',
            lg: 'size-8',
            xl: 'size-12',
        },
    },
    defaultVariants: {
        size: 'md',
    },
});

/**
 * Props for the Spinner component
 */
export interface SpinnerProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof spinnerVariants> {}

/**
 * A customizable loading spinner component with size variants
 *
 * @param props - Component props
 * @param props.size - Size variant of the spinner ('sm' | 'md' | 'lg' | 'xl')
 * @param props.className - Optional CSS class name for additional styling
 * @param props.ref - Ref to the underlying div element
 * @returns JSX element with animated spinner
 *
 * @example
 * ```tsx
 * <Spinner size="lg" />
 * <Spinner className="text-blue-500" />
 * ```
 */
const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(({ className, size, ...props }, ref) => {
    return <div className={cn(spinnerVariants({ size, className }))} ref={ref} {...props} />;
});
Spinner.displayName = 'Spinner';

export { Spinner };
