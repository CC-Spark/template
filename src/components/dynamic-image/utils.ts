/*
 * Copyright (c) 2025, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

// Tailwind CSS default breakpoints
// TODO: Replace with theme breakpoints
const defaultBreakpoints = {
    base: '0px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
} as const;

type Breakpoints = typeof defaultBreakpoints;
type BreakpointKey = keyof Breakpoints;

/**
 * @param {Object} breakpoints
 * @return {string[]} Breakpoint labels ordered from smallest. For example: ['base', 'sm', 'md', 'lg', 'xl', '2xl']
 */
const getBreakpointLabels = (breakpoints: Record<string, string>): string[] =>
    Object.entries(breakpoints)
        .sort((a, b) => parseFloat(a[1]) - parseFloat(b[1]))
        .map(([key]) => key);

const vwValue = /^\d+vw$/;
const pxValue = /^\d+px$/;
const emValue = /^\d+em$/;

let themeBreakpoints = defaultBreakpoints;
let breakpointLabels = getBreakpointLabels(themeBreakpoints);

/**
 * Helper to create very specific `media` attributes for responsive preload purposes.
 * @param {number} breakpointIndex
 * @return {({min?: string, max?: string} | undefined)}
 * @see {@link https://web.dev/articles/preload-responsive-images#picture}
 */
const obtainImageLinkMedia = (
    breakpointIndex: number,
    inputWidthsLength: number
): { min?: string; max?: string } | undefined => {
    const toMediaValue = (bp: string, type: 'min' | 'max') => {
        const val = themeBreakpoints[bp as BreakpointKey];
        if (emValue.test(val)) {
            // em value
            const parsed = parseFloat(val);
            return { [type]: type === 'max' ? `${parsed - 0.01}em` : `${parsed}em` };
        }

        const parsed = parseInt(val, 10);
        return { [type]: type === 'max' ? `${parsed - 1}px` : `${parsed}px` };
    };

    const nextBp = breakpointLabels[breakpointIndex + 1];
    const currentBp = breakpointLabels[breakpointIndex];
    if (breakpointIndex === 0) {
        // first
        return nextBp ? toMediaValue(nextBp, 'max') : undefined;
    } else if (breakpointIndex >= inputWidthsLength - 1) {
        // last - use inputWidthsLength instead of breakpointLabels.length
        return currentBp ? toMediaValue(currentBp, 'min') : undefined;
    }
    return currentBp && nextBp ? { ...toMediaValue(currentBp, 'min'), ...toMediaValue(nextBp, 'max') } : undefined;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isObject = (o: any): o is Record<string, any> => o?.constructor === Object;

/**
 * @param {Object} widths
 * @example
 * // returns the array [10, 10, 10, 50]
 * widthsAsArray({base: 10, lg: 50})
 */
const widthsAsArray = (widths: Record<string, number | string>): (number | string)[] => {
    const biggestBreakpoint = breakpointLabels.filter((bp) => Boolean(widths[bp])).pop();

    if (!biggestBreakpoint) {
        return [];
    }

    const biggestBreakpointIndex = breakpointLabels.indexOf(biggestBreakpoint);
    let mostRecent: number | string | undefined;
    return breakpointLabels
        .slice(0, biggestBreakpointIndex + 1)
        .map((bp) => {
            if (widths[bp]) {
                mostRecent = widths[bp];
                return widths[bp];
            }
            return mostRecent;
        })
        .filter((item): item is number | string => item !== undefined);
};

/**
 * @param {number} em
 * @param {number} [browserDefaultFontSize]
 */
const emToPx = (em: number, browserDefaultFontSize = 16): number => Math.round(em * browserDefaultFontSize);

/**
 * @param {number} vw
 * @param {string} breakpoint
 */
const vwToPx = (vw: number, breakpoint: string): number => {
    const result = (vw / 100) * parseFloat(themeBreakpoints[breakpoint as BreakpointKey]);
    const breakpointsDefinedInPx = Object.values(themeBreakpoints).some((val) => pxValue.test(val));

    // Assumes theme's breakpoints are defined in either em or px
    // See https://chakra-ui.com/docs/features/responsive-styles#customizing-breakpoints
    return breakpointsDefinedInPx ? result : emToPx(result);
};

/**
 * @param {string} dynamicSrc
 * @param {number} imageWidth
 * @return {string} Image url having the given width
 * @example
 * // returns https://example.com/image_720.jpg
 * getSrc('https://example.com/image[_{width}].jpg', 720)
 */
export const getSrc = (dynamicSrc: string, imageWidth: number): string => {
    // 1. remove the surrounding []
    // 2. replace {...} with imageWidth
    // 3. replace any existing sw= parameter with new width if needed

    let result = dynamicSrc.replace(/\[([^\]]+)\]/g, '$1').replace(/\{[^}]+\}/g, imageWidth.toString());

    // Handle URLs that already have sw= parameter
    if (result.includes('sw=')) {
        result = result.replace(/sw=\d+/, `sw=${imageWidth}`);
    }

    return result;
};

/**
 * @param {string} dynamicSrc
 * @example
 * // Returns 'https://example.com/image.jpg'
 * getSrcWithoutOptionalParams('https://example.com/image.jpg[?sw={width}]')
 */
const getSrcWithoutOptionalParams = (dynamicSrc: string): string => dynamicSrc.replace(/\[[^\]]+\]/g, '');

const padArray = (arr: (number | string)[]): (number | string)[] => {
    const l1 = arr.length;
    const l2 = breakpointLabels.length;
    if (l1 < l2) {
        const lastEntry = arr[arr.length - 1];
        const amountToPad = l2 - l1;
        return [...arr, ...Array(amountToPad).fill(lastEntry)];
    }
    return arr;
};

/**
 * @param {string[]|number[]} widths
 * @return {number[]}
 */
const convertToPxNumbers = (widths: (number | string)[]): number[] =>
    widths
        .map((width, i) => {
            if (typeof width === 'number') {
                return width;
            }

            if (vwValue.test(width)) {
                const vw = parseFloat(width);
                const currentBp = breakpointLabels[i];
                // We imagine the biggest image for the current breakpoint
                // to be when the viewport is closely approaching the _next breakpoint_.
                const nextBp = breakpointLabels[i + 1];

                if (nextBp) {
                    return vwToPx(vw, nextBp);
                }
                // We're already at the last breakpoint
                return widths[i] !== widths[i - 1] ? vwToPx(vw, currentBp) : undefined;
            } else if (pxValue.test(width)) {
                return parseInt(width, 10);
            } else {
                // eslint-disable-next-line no-console
                console.error('Expecting to see values with vw or px unit only', {
                    namespace: 'utils.convertToPxNumbers',
                });
                return 0;
            }
        })
        .filter((width): width is number => width !== undefined);

type ImageLink = {
    srcSet: string;
    sizes: string;
    media: { min?: string; max?: string };
};

type ConvertedImageLink = {
    srcSet: string;
    sizes: string;
    media: string;
};

/**
 * Transforms an array of preload link objects by converting the raw `media`
 * property of each entry (with `min` and/or `max` values) into actual media
 * queries using `(min-width)` and/or `(max-width)`.
 * @param {{srcSet: string, sizes: string, media: {min?: string, max?: string}}[]} links
 * @return {{srcSet: string, sizes: string, media: string}[]}
 */
const convertImageLinksMedia = (links: ImageLink[]): ConvertedImageLink[] =>
    links.map((link) => {
        const {
            media: { min, max },
        } = link;
        const acc: string[] = [];
        if (min) {
            acc.push(`(min-width: ${min})`);
        }
        if (max) {
            acc.push(`(max-width: ${max})`);
        }
        return { ...link, media: acc.join(' and ') };
    });

type Source = {
    srcSet: string;
    sizes: string;
    media: string;
};

type ResponsiveData = {
    sources: Source[];
    links: ConvertedImageLink[];
};

/**
 * Determines the data required for the responsive `<source>` and `<link rel="preload">
 * portions/elements.
 * @param {string} src
 * @param {(number[]|string[])} widths
 * @returns {{sources: {srcSet: string, sizes: string, media: string}[], links: {srcSet: string, sizes: string, media: string}[]}}
 */
const getResponsiveSourcesAndLinks = (src: string, widths: (number | string)[]): ResponsiveData => {
    // By default, unitless value is interpreted as px
    const sizesWidths = widths.map((width) => (typeof width === 'number' ? `${width}px` : width));
    const l = sizesWidths.length;

    const _sizes = breakpointLabels.map((bp, i) => {
        return i === 0
            ? {
                  media: '',
                  mediaLink: obtainImageLinkMedia(i, l),
                  sizes: sizesWidths[i],
              }
            : {
                  media: `(min-width: ${themeBreakpoints[bp as BreakpointKey]})`,
                  mediaLink: obtainImageLinkMedia(i, l),
                  sizes: sizesWidths.at(i >= l ? l - 1 : i),
              };
    });

    const sourcesWidths = convertToPxNumbers(padArray(widths));
    const sourcesLength = sourcesWidths.length;
    const { sources, links } = breakpointLabels.reduce(
        (acc: { sources: Source[]; links: ImageLink[] }, _bp, idx) => {
            // To support higher-density devices, request all images in 1x and 2x widths
            const width = sourcesWidths[idx >= sourcesLength ? sourcesLength - 1 : idx];
            const sizeData = _sizes[idx];
            if (!sizeData || !width) return acc;

            const { sizes, media, mediaLink } = sizeData;
            const lastSource = acc.sources[acc.sources.length - 1];
            const lastLink = acc.links[acc.links.length - 1];
            const srcSet = [1, 2]
                .map((factor) => {
                    const effectiveWidth = Math.round(width * factor);
                    const effectiveSize = Math.round(width * factor);

                    return `${getSrc(src, effectiveSize)} ${effectiveWidth}w`;
                })
                .join(', ');

            if (idx < sourcesLength && sizes && (lastSource?.sizes !== sizes || srcSet !== lastSource?.srcSet)) {
                // Only store new `<source>` if we haven't already stored those values
                acc.sources.push({ srcSet, sizes, media });
            }

            if (sizes && (lastLink?.sizes !== sizes || srcSet !== lastLink?.srcSet)) {
                // Only store new `<link>` if we haven't already stored those values
                acc.links.push({ srcSet, sizes, media: mediaLink || {} });
            } else if (lastLink && mediaLink) {
                // If we have already stored those values, update the `max` portion of the related `<link>` data
                if (mediaLink.max) {
                    lastLink.media.max = mediaLink.max;
                }
            }
            return acc;
        },
        { sources: [], links: [] }
    );
    return { sources: sources.reverse(), links: convertImageLinksMedia(links) };
};

type GetResponsivePictureAttributesProps = {
    src: string;
    /**
     * Image widths relative to the breakpoints. Supports multiple formats:
     * - Array of numbers: [100, 360, 720] (unitless, interpreted as px)
     * - Array of strings with units: ['50vw', '100vw', '500px'] (mixed px and vw units)
     * - Object with breakpoint keys: {base: 100, sm: 360, md: 720} (unitless, interpreted as px)
     * - Object with breakpoint keys and units: {base: '100vw', sm: '50vw', md: '500px'}
     */
    widths?: (number | string)[] | Record<string, number> | Record<string, string> | Record<string, number | string>;
    breakpoints?: Record<string, string>;
};

type ResponsivePictureAttributes = {
    sources: Source[];
    links: ConvertedImageLink[];
    src: string;
};

/**
 * Resolve the attributes required to create a DIS-optimized `<picture>` component.
 * @param {Object} props
 * @param {string} props.src - Dynamic src having an optional param that can vary with widths. For example: `image[_{width}].jpg` or `image.jpg[?sw={width}&q=60]`
 * @param {number[] | string[] | Record<string, number> | Record<string, string> | Record<string, number | string>} [props.widths] - Image widths relative to the breakpoints. Supports multiple formats: array of numbers (unitless, interpreted as px), array of strings with units (mixed px and vw), or object with breakpoint keys and values.
 * @param {Object} [props.breakpoints] - The current theme's breakpoints. If not given, Tailwind's default breakpoints will be used.
 * @return {Object} src, sizes, srcSet, media props for your image component
 * @see {@link DynamicImage}
 */
export const getResponsivePictureAttributes = ({
    src,
    widths,
    breakpoints = defaultBreakpoints,
}: GetResponsivePictureAttributesProps): ResponsivePictureAttributes => {
    if (!widths) {
        return {
            sources: [],
            links: [],
            src: getSrcWithoutOptionalParams(src),
        };
    }

    if (breakpoints !== themeBreakpoints) {
        themeBreakpoints = breakpoints as typeof defaultBreakpoints;
        breakpointLabels = getBreakpointLabels(themeBreakpoints);
    }

    const _widths = isObject(widths)
        ? widthsAsArray(widths as Record<string, number | string>)
        : (widths as (number | string)[]).slice(0);
    const { sources, links } = getResponsiveSourcesAndLinks(src, _widths);

    return {
        sources,
        links,
        src: getSrcWithoutOptionalParams(src),
    };
};
