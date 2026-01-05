/**
 * Copyright 2026 Salesforce, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { useMemo, useEffect } from 'react';
import { preload } from 'react-dom';
import { cn } from '@/lib/utils';
import { getResponsivePictureAttributes } from './utils';

interface DynamicImageProps {
    src: string;
    alt?: string;
    /**
     * Image widths relative to the breakpoints. Supports multiple formats:
     * - Array of numbers: [100, 360, 720] (unitless, interpreted as px)
     * - Array of strings with units: ['50vw', '100vw', '500px'] (mixed px and vw units)
     * - Object with breakpoint keys: {base: 100, sm: 360, md: 720} (unitless, interpreted as px)
     * - Object with breakpoint keys and units: {base: '100vw', sm: '50vw', md: '500px'}
     */
    widths?: (number | string)[] | Record<string, number> | Record<string, string> | Record<string, number | string>;
    imageProps?: React.ImgHTMLAttributes<HTMLImageElement>;
    as?: React.ElementType;
    className?: string;
    loading?: 'lazy' | 'eager';
    priority?: 'high' | 'low';
}

/**
 * Responsive image component optimized to work with the Dynamic Imaging Service.
 * Via this component it's easy to create a `<picture>` element with related
 * theme-aware `<source>` elements and responsive preloading for high-priority
 * images using React 19's preload function.
 * @example Widths without a unit defined as array (interpreted as px values)
 * <DynamicImage
 *   src="http://example.com/image.jpg[?sw={width}&q=60]"
 *   widths={[100, 360, 720]} />
 * @example Widths without a unit defined as object (interpreted as px values)
 * <DynamicImage
 *   src="http://example.com/image.jpg[?sw={width}&q=60]"
 *   widths={{base: 100, sm: 360, md: 720}} />
 * @example Widths with mixed px and vw units defined as array
 * <DynamicImage
 *   src="http://example.com/image.jpg[?sw={width}&q=60]"
 *   widths={['50vw', '100vw', '500px']} />
 * @example Eagerly load image with high priority and responsive preloading
 * <DynamicImage
 *   src="http://example.com/image.jpg[?sw={width}&q=60]"
 *   widths={['50vw', '50vw', '20vw', '20vw', '25vw']}
 *   imageProps={{loading: 'eager'}}
 *   />
 * @example Preload all picture sources using React 19's preload function
 * <DynamicImage
 *   src="http://example.com/image.jpg[?sw={width}&q=60]"
 *   widths={[400, 800, 1200]}
 *   priority="high"
 *   />
 * @see {@link https://web.dev/learn/design/responsive-images}
 * @see {@link https://web.dev/learn/design/picture-element}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/picture}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Responsive_images}
 * @see {@link https://help.salesforce.com/s/articleView?id=cc.b2c_image_transformation_service.htm&type=5}
 */
const DynamicImage = ({
    src,
    alt = '',
    widths,
    imageProps = {},
    as: Component = 'img',
    className,
    loading = 'lazy',
    priority = 'low',
    ...rest
}: DynamicImageProps) => {
    const responsiveImageProps = useMemo(() => {
        return getResponsivePictureAttributes({
            src,
            widths,
        });
    }, [src, widths]);

    const effectiveImageProps = {
        ...imageProps,
        loading: priority === 'high' ? 'eager' : loading,
        fetchPriority: priority,
        alt,
        src: responsiveImageProps.src,
    };

    // Preload image sources using React 19's preload function
    useEffect(() => {
        if (priority === 'high') {
            responsiveImageProps.links.forEach((link) => {
                preload(link.srcSet, {
                    as: 'image' as const,
                    fetchPriority: priority as 'high' | 'low' | 'auto',
                    media: link.media,
                    imageSizes: link.sizes,
                    imageSrcSet: link.srcSet,
                });
            });

            // Also preload the fallback image with basic attributes
            preload(responsiveImageProps.src, {
                as: 'image' as const,
                fetchPriority: priority as 'high' | 'low' | 'auto',
            });
        }
    }, [responsiveImageProps.sources, responsiveImageProps.src, responsiveImageProps.links, priority]);

    return (
        <div className={cn(className)} {...rest}>
            {responsiveImageProps.sources.length > 0 ? (
                <picture>
                    {responsiveImageProps.sources.map(({ srcSet, sizes, media }, idx) => (
                        // eslint-disable-next-line react/no-array-index-key
                        <source key={idx} {...(media && { media })} sizes={sizes} srcSet={srcSet} />
                    ))}
                    <Component {...effectiveImageProps} />
                </picture>
            ) : (
                <Component {...effectiveImageProps} />
            )}
        </div>
    );
};

DynamicImage.displayName = 'DynamicImage';

export { DynamicImage };
