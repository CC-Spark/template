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
import { type ElementType, type ImgHTMLAttributes, useMemo } from 'react';
import { preload } from 'react-dom';
import { useConfig } from '@/config';
import { cn, isServer } from '@/lib/utils';
import {
    defaultImageFormats,
    getResponsivePictureAttributes,
    replaceImageFormat,
    toImageUrl,
} from '@/lib/dynamic-image';
import { useDynamicImageContext } from '@/providers/dynamic-image';

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
    imageProps?: ImgHTMLAttributes<HTMLImageElement>;
    as?: ElementType;
    className?: string;
    loading?: HTMLImageElement['loading'];
    priority?: HTMLImageElement['fetchPriority'];
}

/**
 * Responsive image component optimized to work with the Dynamic Imaging Service.
 * Via this component it's easy to create a `<picture>` element with related
 * theme-aware `<source>` elements and responsive preloading for high-priority
 * images using React 19's `preload` function.
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
 * @see {@link https://react.dev/reference/react-dom/preload}
 */
const DynamicImage = ({
    src,
    alt = '',
    widths,
    imageProps = {},
    as: Component = 'img',
    className,
    loading,
    priority,
    ...rest
}: DynamicImageProps) => {
    const config = useConfig();
    const {
        images: {
            quality: defaultQuality = 70,
            formats: configFormats = defaultImageFormats,
            fallbackFormat: defaultFallbackFormat = 'jpg',
            enableDis = true,
        } = {},
    } = config;

    // When DIS is disabled, transform the source URL to relative static paths
    // and skip all DIS-dependent behavior (format conversion, responsive <source> generation).
    const transformedSrc = useMemo(() => {
        if (enableDis) return src;
        return toImageUrl({ src, config }) || src;
    }, [src, config, enableDis]);

    // When DIS is disabled, use empty formats to skip <source> generation and format conversion.
    // Without DIS, format conversion (webp/avif) and server-side resizing are not available.
    const effectiveFormats = useMemo(() => (enableDis ? configFormats : []), [enableDis, configFormats]);

    const responsiveImageProps = useMemo(() => {
        return getResponsivePictureAttributes({
            src: transformedSrc,
            widths,
            quality: enableDis ? defaultQuality : undefined,
            formats: effectiveFormats,
        });
    }, [transformedSrc, widths, defaultQuality, effectiveFormats, enableDis]);
    const imageContext = useDynamicImageContext();

    const effectivePriority = priority ?? (imageContext?.hasSource(transformedSrc) ? 'high' : 'auto');
    const effectiveLoading = loading ?? (effectivePriority === 'high' ? 'eager' : 'lazy');
    const effectiveImageProps = {
        ...imageProps,
        loading: effectiveLoading,
        fetchPriority: effectivePriority,
        alt,
        src: enableDis ? replaceImageFormat(responsiveImageProps.src, defaultFallbackFormat) : responsiveImageProps.src,
    };

    if (isServer() && effectivePriority === 'high') {
        responsiveImageProps.links.forEach(({ type, media, sizes, srcSet }) => {
            preload(srcSet, {
                as: 'image',
                fetchPriority: 'high',
                imageSrcSet: srcSet,
                imageSizes: sizes,
                type,
                media,
            });
        });
    }

    return (
        <>
            <div className={cn(className)} {...rest}>
                {responsiveImageProps.sources.length > 0 ? (
                    <picture>
                        {responsiveImageProps.sources.map(({ type, srcSet, sizes, media }, idx) => (
                            // eslint-disable-next-line react/no-array-index-key
                            <source key={idx} type={type} {...(media && { media })} sizes={sizes} srcSet={srcSet} />
                        ))}
                        <Component {...effectiveImageProps} />
                    </picture>
                ) : (
                    <Component {...effectiveImageProps} />
                )}
            </div>
        </>
    );
};

DynamicImage.displayName = 'DynamicImage';

export { DynamicImage };
