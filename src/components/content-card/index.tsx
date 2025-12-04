import { forwardRef, type ComponentProps } from 'react';
import { Link } from 'react-router';
import { cn, resolveAssetUrl } from '@/lib/utils';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Component } from '@/lib/decorators/component';
import { AttributeDefinition } from '@/lib/decorators/attribute-definition';

interface ContentCardProps extends ComponentProps<'div'> {
    title?: string;
    description?: string;
    imageUrl?: string;
    imageAlt?: string;
    buttonText?: string;
    buttonLink?: string;
    showBackground?: boolean;
    showBorder?: boolean;
    loading?: 'lazy' | 'eager';

    // Page Designer props (need to be extracted to avoid passing to DOM)
    designMetadata?: unknown;
    regionId?: string;
    componentData?: unknown;
    page?: unknown;
}

/* v8 ignore start - do not test decorators in unit tests, decorator functionality is tested separately*/
@Component('contentCard', {
    name: 'Content Card',
    description: 'Flexible card component with optional image, title, description, and call-to-action button',
})
export class ContentCardMetadata {
    @AttributeDefinition()
    title?: string;

    @AttributeDefinition()
    description?: string;

    @AttributeDefinition()
    imageUrl?: string;

    @AttributeDefinition()
    imageAlt?: string;

    @AttributeDefinition()
    buttonText?: string;

    @AttributeDefinition()
    buttonLink?: string;

    @AttributeDefinition()
    showBackground?: boolean;

    @AttributeDefinition()
    showBorder?: boolean;
}
/* v8 ignore stop */

export const ContentCard = forwardRef<HTMLDivElement, ContentCardProps>(
    (
        {
            className,
            title,
            description,
            imageUrl,
            imageAlt,
            buttonText,
            buttonLink,
            showBackground = true,
            showBorder = true,
            loading = 'lazy',
            designMetadata: _designMetadata,
            regionId: _regionId,
            componentData: _componentData,
            page: _page,
            ...props
        },
        ref
    ) => {
        return (
            <Card
                ref={ref}
                className={cn(
                    'h-full overflow-hidden',
                    showBackground ? 'ring-secondary/40 bg-muted/50' : 'bg-transparent',
                    !showBorder && 'border-0 shadow-none',
                    className
                )}
                {...props}>
                {imageUrl && (
                    <CardContent className="p-0">
                        <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-secondary/20">
                            <img
                                src={resolveAssetUrl(imageUrl)}
                                alt={imageAlt || title || ''}
                                className="w-full h-full object-cover"
                                loading={loading}
                            />
                        </div>
                    </CardContent>
                )}

                {(title || description || (buttonText && buttonLink)) && (
                    <CardFooter className="flex-col items-start gap-4 p-6 flex-1">
                        {(title || description) && (
                            <div className="flex-1">
                                {title && <h3 className="text-2xl font-bold text-foreground mb-3">{title}</h3>}
                                {description && <p className="text-sm text-muted-foreground">{description}</p>}
                            </div>
                        )}
                        {buttonText && buttonLink && (
                            <Button asChild className="w-full">
                                <Link to={buttonLink}>{buttonText}</Link>
                            </Button>
                        )}
                    </CardFooter>
                )}
            </Card>
        );
    }
);
ContentCard.displayName = 'ContentCard';

export default ContentCard;
