import type { ReactElement } from 'react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';

export default function Hero({
    title,
    subtitle,
    imageUrl,
    imageAlt,
    ctaText = 'Shop Now',
    ctaLink = '/category/root',
}: {
    title: string;
    subtitle?: string;
    imageUrl: string;
    imageAlt: string;
    ctaText?: string;
    ctaLink?: string;
}): ReactElement {
    return (
        <div className="relative w-full h-full min-h-[500px] max-h-[70vh] overflow-hidden">
            <img src={imageUrl} alt={imageAlt} fetchPriority="high" className="w-full h-full object-cover" />

            <div className="absolute inset-0 z-10 flex items-center">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-2xl">
                        <h1 className="text-3xl font-bold text-foreground mb-6 leading-none tracking-tight">{title}</h1>

                        {subtitle && (
                            <p className="text-lg font-normal text-muted-foreground mb-8 leading-none tracking-wide">
                                {subtitle}
                            </p>
                        )}

                        <Button asChild className="text-xl p-6">
                            <Link to={ctaLink}>{ctaText}</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
