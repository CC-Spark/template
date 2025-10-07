'use client';

import { forwardRef, type ComponentProps } from 'react';
import { cn } from '@/lib/utils';
import { swatchVariants, type SwatchVariantsProps } from './swatch-variants';

interface SwatchProps extends ComponentProps<'div'>, SwatchVariantsProps {
    imageUrl: string;
    alt: string;
    isSelected?: boolean;
    onClick?: () => void;
}

const Swatch = forwardRef<HTMLDivElement, SwatchProps>(
    ({ className, imageUrl, alt, size, isSelected = false, onClick, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    swatchVariants({
                        size,
                        variant: isSelected ? 'selected' : 'default',
                    }),
                    className
                )}
                title={alt}
                onClick={onClick}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onClick?.();
                    }
                }}
                {...props}>
                <img
                    src={`${imageUrl}?sw=60&q=60`}
                    alt={alt}
                    className="w-full h-full rounded-full object-cover"
                    loading="lazy"
                />
            </div>
        );
    }
);
Swatch.displayName = 'Swatch';

export { Swatch };
export type { SwatchProps };
