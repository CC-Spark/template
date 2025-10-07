import React, { Children, useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

const DIRECTIONS = {
    FORWARD: 1,
    BACKWARD: -1,
} as const;

interface SwatchChild {
    props?: {
        value?: string;
        handleSelect?: (value: string) => void;
        selected?: boolean;
        isFocusable?: boolean;
    };
}

interface SwatchGroupProps {
    ariaLabel?: string;
    displayName?: string;
    children: React.ReactNode;
    label?: string;
    value?: string;
    handleChange?: (value: string) => void;
    className?: string;
}

const noop = (..._args: unknown[]): void => {
    // Intentionally empty - default no-op function for handleChange
};

export const SwatchGroup: React.FC<SwatchGroupProps> = ({
    ariaLabel,
    displayName,
    children,
    label = '',
    value,
    handleChange = noop,
    className,
}) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const onKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            const { key } = e;
            const childrenArray = Children.toArray(children);

            const move = (direction: typeof DIRECTIONS.FORWARD | typeof DIRECTIONS.BACKWARD = DIRECTIONS.FORWARD) => {
                // Find the currently focused element in the DOM to get accurate starting position
                let currentIndex = 0;
                if (typeof document !== 'undefined' && wrapperRef.current) {
                    const focusedElement = document.activeElement;
                    const elementIndex = Array.from(wrapperRef.current.children).findIndex(
                        (child) => child === focusedElement
                    );
                    if (elementIndex !== -1) {
                        currentIndex = elementIndex;
                    }
                }

                let index = currentIndex + direction;

                // Handle wrapping
                if (index >= childrenArray.length) {
                    index = 0; // Wrap to beginning
                } else if (index < 0) {
                    index = childrenArray.length - 1; // Wrap to end
                }

                const swatchEl = wrapperRef?.current?.children[index] as HTMLElement;

                setSelectedIndex(index);
                swatchEl?.focus();
            };

            switch (key) {
                case 'ArrowUp':
                case 'ArrowLeft':
                    e.preventDefault();
                    move(DIRECTIONS.BACKWARD);
                    break;
                case 'ArrowDown':
                case 'ArrowRight':
                    e.preventDefault();
                    move(DIRECTIONS.FORWARD);
                    break;
                default:
                    break;
            }
        },
        [children]
    );

    useEffect(() => {
        if (!value) {
            return;
        }
        const childrenArray = Children.toArray(children);
        const index = childrenArray.findIndex((child) => {
            const childElement = child as React.ReactElement<SwatchChild['props']>;
            return childElement.props?.value === value;
        });

        if (index !== -1) {
            setSelectedIndex(index);
        }
    }, [value, children]);

    useEffect(() => {
        const childrenArray = Children.toArray(children);
        const selectedChild = childrenArray[selectedIndex] as React.ReactElement<SwatchChild['props']>;
        const newValue = selectedChild?.props?.value;

        // Only call handleChange if the new value is different from the current value
        // and avoid calling it on initial render or when value prop changes externally
        if (newValue && handleChange && newValue !== value) {
            handleChange(newValue);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedIndex, children]);

    const containerClasses = cn('space-y-3', className);

    const labelClasses = 'flex items-center gap-2 text-sm text-foreground';

    const swatchesWrapperClasses = 'flex flex-wrap gap-2 focus:outline-none';

    return (
        <div className={containerClasses} onKeyDown={onKeyDown}>
            <div className="flex flex-col gap-3" role="radiogroup" aria-label={ariaLabel || label}>
                {label && (
                    <div className={labelClasses}>
                        <span className="font-semibold">{label}:</span>
                        {displayName && <span>{displayName}</span>}
                    </div>
                )}
                <div ref={wrapperRef} className={swatchesWrapperClasses}>
                    {Children.toArray(children).map((child, index) => {
                        const childElement = child as React.ReactElement<SwatchChild['props']>;
                        const selected = childElement.props?.value === value;

                        return React.cloneElement(childElement, {
                            key: childElement.props?.value || index,
                            handleSelect: handleChange,
                            selected,
                            isFocusable: value ? selected : index === 0,
                        });
                    })}
                </div>
            </div>
        </div>
    );
};

SwatchGroup.displayName = 'SwatchGroup';
