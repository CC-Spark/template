import { type ReactElement } from 'react';
import { Link } from 'react-router';

function formatCurrency(amount: number, currencySymbol: string): string {
    const fixed = amount.toFixed(2);
    return `${currencySymbol}${fixed}`;
}

export default function ShippingPromoBar({
    currentAmount = 0,
    thresholdAmount,
    currencySymbol = '$',
    detailHref = '#',
    className = '',
}: {
    currentAmount?: number;
    thresholdAmount: number;
    currencySymbol?: string;
    detailHref?: string;
    className?: string;
}): ReactElement {
    const clampedCurrent = Math.max(0, Math.min(currentAmount, thresholdAmount));
    const remaining = Math.max(0, thresholdAmount - clampedCurrent);
    const progress = thresholdAmount > 0 ? (clampedCurrent / thresholdAmount) * 100 : 0;
    const progressPercent = Math.max(0, Math.min(progress, 100));

    return (
        <div className={`content-stretch flex flex-col gap-2 items-start px-0 py-8 w-full ${className}`}>
            {/* Message */}
            <div className="flex flex-col justify-center text-center w-full text-foreground text-sm">
                <p>
                    <span>You are </span>
                    <span className="font-bold">{formatCurrency(remaining, currencySymbol)}</span>
                    <span> from </span>
                    <Link to={detailHref} className="font-bold text-primary underline-offset-2 hover:underline">
                        Free Shipping
                    </Link>
                </p>
            </div>

            {/* Labels */}
            <div className="content-stretch flex items-center text-sm text-foreground w-full">
                <div className="basis-0 grow min-w-px min-h-px">
                    <p>{formatCurrency(clampedCurrent, currencySymbol)}</p>
                </div>
                <div className="basis-0 grow min-w-px min-h-px text-right font-semibold">
                    <p>{formatCurrency(thresholdAmount, currencySymbol)}</p>
                </div>
            </div>

            {/* Progress */}
            <div
                role="progressbar"
                aria-label="Free shipping progress"
                aria-valuemin={0}
                aria-valuemax={thresholdAmount}
                aria-valuenow={clampedCurrent}
                className="relative w-full h-2 rounded-full overflow-hidden bg-secondary">
                <div
                    className="absolute inset-y-0 left-0 rounded-l-full bg-primary"
                    style={{ width: `${progressPercent}%` }}
                />
            </div>
        </div>
    );
}
