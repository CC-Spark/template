import {
    type FC,
    type MouseEvent,
    type ReactNode,
    type TouchEvent,
    useCallback,
    useEffect,
    useState,
    memo,
} from 'react';
import { NavLink } from 'react-router';
import { cn } from '@/lib/utils';
import { swatchVariants } from './swatch-variants';
import type { VariantProps } from 'class-variance-authority';

interface SwatchProps extends VariantProps<typeof swatchVariants> {
    children?: ReactNode;
    disabled?: boolean;
    href?: string;
    label?: string;
    name?: string;
    selected?: boolean;
    isFocusable?: boolean;
    value?: string;
    handleSelect?: (value: string) => void;
    onClick?: (e: MouseEvent | TouchEvent) => void;
}

const SwatchComponent: FC<SwatchProps> = ({
    children,
    disabled = false,
    href,
    label,
    name,
    selected = false,
    isFocusable = false,
    value = '',
    handleSelect,
    size = 'md',
    shape = 'circle',
}) => {
    const [selectHandlers, setSelectHandlers] = useState<Record<string, (e: MouseEvent | TouchEvent) => void>>({});

    const onSelect = useCallback(
        (e: MouseEvent | TouchEvent) => {
            e.preventDefault();
            if (handleSelect && value) {
                handleSelect(value);
            }
        },
        [handleSelect, value]
    );

    useEffect(() => {
        if (!handleSelect) {
            return;
        }

        const isDesktop = window.matchMedia('(min-width: 1024px)').matches;

        setSelectHandlers({
            [isDesktop ? 'onMouseEnter' : 'onClick']: onSelect,
        });
    }, [onSelect, handleSelect]);

    const baseClasses = cn(
        swatchVariants({
            size,
            shape,
            variant: selected ? 'selected' : 'default',
        }),
        {
            'opacity-50 cursor-not-allowed': disabled,
            'cursor-pointer': !disabled && !href,
        }
    );

    const innerClasses = 'flex items-center justify-center w-full h-full text-sm font-medium text-foreground';

    const commonProps = {
        'aria-label': name || label,
        'aria-checked': selected,
        role: 'radio',
        tabIndex: isFocusable ? 0 : -1,
        className: baseClasses,
        ...(href ? {} : selectHandlers),
    };

    if (href) {
        return (
            <NavLink to={href} preventScrollReset={true} {...commonProps}>
                <div className={innerClasses}>
                    {children}
                    {label && <span className="ml-1">{label}</span>}
                </div>
            </NavLink>
        );
    }

    return (
        <button type="button" {...commonProps} disabled={disabled}>
            <div className={innerClasses}>
                {children}
                {label && <span className="ml-1">{label}</span>}
            </div>
        </button>
    );
};

export const Swatch = memo(SwatchComponent);
Swatch.displayName = 'Swatch';
