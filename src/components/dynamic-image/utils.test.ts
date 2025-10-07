/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { getResponsivePictureAttributes, getSrc } from './utils';

const disImageURL = {
    withOptionalParams:
        'https://edge.disstg.commercecloud.salesforce.com/dw/image/v2/ZZRF_001/on/demandware.static/-/Sites-apparel-m-catalog/default/dw1e4fcb17/images/large/PG.10212867.JJ3XYXX.PZ.jpg[?sw={width}&q=60]',
    withoutOptionalParams:
        'https://edge.disstg.commercecloud.salesforce.com/dw/image/v2/ZZRF_001/on/demandware.static/-/Sites-apparel-m-catalog/default/dw1e4fcb17/images/large/PG.10212867.JJ3XYXX.PZ.jpg',
};

const urlWithWidth = (width: number) => getSrc(disImageURL.withOptionalParams, width);

describe('getResponsivePictureAttributes()', () => {
    test('vw widths', () => {
        let props = getResponsivePictureAttributes({
            src: disImageURL.withOptionalParams,
            widths: ['50vw', '50vw', '20vw', '20vw', '25vw'],
        });

        // Breakpoints
        // base: "0px",
        // sm: "640px",
        // md: "768px",
        // lg: "1024px",
        // xl: "1280px",
        // "2xl": "1536px"

        // 50vw of sm => 320px
        // 50vw of md => 384px
        // 20vw of lg => 204.8px
        // 20vw of xl => 256px
        // 25vw of 2xl => 384px

        expect(props).toStrictEqual({
            src: disImageURL.withoutOptionalParams,
            sources: [
                {
                    media: '(min-width: 1280px)',
                    sizes: '25vw',
                    srcSet: [384, 768].map((width) => `${urlWithWidth(width)} ${width}w`).join(', '),
                },
                {
                    media: '(min-width: 1024px)',
                    sizes: '20vw',
                    srcSet: [256, 512].map((width) => `${urlWithWidth(width)} ${width}w`).join(', '),
                },
                {
                    media: '(min-width: 768px)',
                    sizes: '20vw',
                    srcSet: [205, 410].map((width) => `${urlWithWidth(width)} ${width}w`).join(', '),
                },
                {
                    media: '(min-width: 640px)',
                    sizes: '50vw',
                    srcSet: [384, 768].map((width) => `${urlWithWidth(width)} ${width}w`).join(', '),
                },
                {
                    media: '',
                    sizes: '50vw',
                    srcSet: [320, 640].map((width) => `${urlWithWidth(width)} ${width}w`).join(', '),
                },
            ],
            links: [
                {
                    media: '(max-width: 639px)',
                    sizes: '50vw',
                    srcSet: [320, 640].map((width) => `${urlWithWidth(width)} ${width}w`).join(', '),
                },
                {
                    media: '(min-width: 640px) and (max-width: 767px)',
                    sizes: '50vw',
                    srcSet: [384, 768].map((width) => `${urlWithWidth(width)} ${width}w`).join(', '),
                },
                {
                    media: '(min-width: 768px) and (max-width: 1023px)',
                    sizes: '20vw',
                    srcSet: [205, 410].map((width) => `${urlWithWidth(width)} ${width}w`).join(', '),
                },
                {
                    media: '(min-width: 1024px) and (max-width: 1279px)',
                    sizes: '20vw',
                    srcSet: [256, 512].map((width) => `${urlWithWidth(width)} ${width}w`).join(', '),
                },
                {
                    media: '(min-width: 1280px)',
                    sizes: '25vw',
                    srcSet: [384, 768].map((width) => `${urlWithWidth(width)} ${width}w`).join(', '),
                },
            ],
        });

        // This time as _object_
        props = getResponsivePictureAttributes({
            src: disImageURL.withOptionalParams,
            widths: {
                base: '100vw',
                sm: '100vw',
                md: '50vw',
            },
        });
        expect(props).toStrictEqual({
            src: disImageURL.withoutOptionalParams,
            sources: [
                {
                    media: '(min-width: 1280px)',
                    sizes: '50vw',
                    srcSet: [768, 1536].map((width) => `${urlWithWidth(width)} ${width}w`).join(', '),
                },
                {
                    media: '(min-width: 1024px)',
                    sizes: '50vw',
                    srcSet: [640, 1280].map((width) => `${urlWithWidth(width)} ${width}w`).join(', '),
                },
                {
                    media: '(min-width: 768px)',
                    sizes: '50vw',
                    srcSet: [512, 1024].map((width) => `${urlWithWidth(width)} ${width}w`).join(', '),
                },
                {
                    media: '(min-width: 640px)',
                    sizes: '100vw',
                    srcSet: [768, 1536].map((width) => `${urlWithWidth(width)} ${width}w`).join(', '),
                },
                {
                    media: '',
                    sizes: '100vw',
                    srcSet: [640, 1280].map((width) => `${urlWithWidth(width)} ${width}w`).join(', '),
                },
            ],
            links: [
                {
                    media: '(max-width: 639px)',
                    sizes: '100vw',
                    srcSet: [640, 1280].map((width) => `${urlWithWidth(width)} ${width}w`).join(', '),
                },
                {
                    media: '(min-width: 640px) and (max-width: 767px)',
                    sizes: '100vw',
                    srcSet: [768, 1536].map((width) => `${urlWithWidth(width)} ${width}w`).join(', '),
                },
                {
                    media: '(min-width: 768px)',
                    sizes: '50vw',
                    srcSet: [512, 1024].map((width) => `${urlWithWidth(width)} ${width}w`).join(', '),
                },
                {
                    media: '(min-width: 1024px)',
                    sizes: '50vw',
                    srcSet: [640, 1280].map((width) => `${urlWithWidth(width)} ${width}w`).join(', '),
                },
                {
                    media: '(min-width: 1280px)',
                    sizes: '50vw',
                    srcSet: [768, 1536].map((width) => `${urlWithWidth(width)} ${width}w`).join(', '),
                },
            ],
        });

        // Edge case: testing changing width at the very last breakpoint (2xl)
        props = getResponsivePictureAttributes({
            src: disImageURL.withOptionalParams,
            widths: {
                base: '100vw',
                '2xl': '50vw',
            },
        });

        // 100vw of sm => 640px
        // 100vw of md => 768px
        // 100vw of lg => 1024px
        // 100vw of xl => 1280px
        // 100vw of 2xl => 1536px
        // 50vw of 2xl => 768px
        expect(props).toStrictEqual({
            src: disImageURL.withoutOptionalParams,
            sources: [
                {
                    media: '(min-width: 1536px)',
                    sizes: '50vw',
                    srcSet: [768, 1536].map((width) => `${urlWithWidth(width)} ${width}w`).join(', '),
                },
                {
                    media: '(min-width: 1280px)',
                    sizes: '100vw',
                    srcSet: [1536, 3072].map((width) => `${urlWithWidth(width)} ${width}w`).join(', '),
                },
                {
                    media: '(min-width: 1024px)',
                    sizes: '100vw',
                    srcSet: [1280, 2560].map((width) => `${urlWithWidth(width)} ${width}w`).join(', '),
                },
                {
                    media: '(min-width: 768px)',
                    sizes: '100vw',
                    srcSet: [1024, 2048].map((width) => `${urlWithWidth(width)} ${width}w`).join(', '),
                },
                {
                    media: '(min-width: 640px)',
                    sizes: '100vw',
                    srcSet: [768, 1536].map((width) => `${urlWithWidth(width)} ${width}w`).join(', '),
                },
                {
                    media: '',
                    sizes: '100vw',
                    srcSet: [640, 1280].map((width) => `${urlWithWidth(width)} ${width}w`).join(', '),
                },
            ],
            links: [
                {
                    media: '(max-width: 639px)',
                    sizes: '100vw',
                    srcSet: [640, 1280].map((width) => `${urlWithWidth(width)} ${width}w`).join(', '),
                },
                {
                    media: '(min-width: 640px) and (max-width: 767px)',
                    sizes: '100vw',
                    srcSet: [768, 1536].map((width) => `${urlWithWidth(width)} ${width}w`).join(', '),
                },
                {
                    media: '(min-width: 768px) and (max-width: 1023px)',
                    sizes: '100vw',
                    srcSet: [1024, 2048].map((width) => `${urlWithWidth(width)} ${width}w`).join(', '),
                },
                {
                    media: '(min-width: 1024px) and (max-width: 1279px)',
                    sizes: '100vw',
                    srcSet: [1280, 2560].map((width) => `${urlWithWidth(width)} ${width}w`).join(', '),
                },
                {
                    media: '(min-width: 1280px) and (max-width: 1535px)',
                    sizes: '100vw',
                    srcSet: [1536, 3072].map((width) => `${urlWithWidth(width)} ${width}w`).join(', '),
                },
                {
                    media: '(min-width: 1536px)',
                    sizes: '50vw',
                    srcSet: [768, 1536].map((width) => `${urlWithWidth(width)} ${width}w`).join(', '),
                },
            ],
        });
    });

    test('px values', () => {
        // widths in array format
        let props = getResponsivePictureAttributes({
            src: disImageURL.withOptionalParams,
            widths: [100, 500, 1000],
        });
        expect(props).toStrictEqual({
            src: disImageURL.withoutOptionalParams,
            sources: [
                {
                    media: '(min-width: 768px)',
                    sizes: '1000px',
                    srcSet: [1000, 2000].map((width) => `${urlWithWidth(width)} ${width}w`).join(', '),
                },
                {
                    media: '(min-width: 640px)',
                    sizes: '500px',
                    srcSet: [500, 1000].map((width) => `${urlWithWidth(width)} ${width}w`).join(', '),
                },
                {
                    media: '',
                    sizes: '100px',
                    srcSet: [100, 200].map((width) => `${urlWithWidth(width)} ${width}w`).join(', '),
                },
            ],
            links: [
                {
                    media: '(max-width: 639px)',
                    sizes: '100px',
                    srcSet: [100, 200].map((width) => `${urlWithWidth(width)} ${width}w`).join(', '),
                },
                {
                    media: '(min-width: 640px) and (max-width: 767px)',
                    sizes: '500px',
                    srcSet: [500, 1000].map((width) => `${urlWithWidth(width)} ${width}w`).join(', '),
                },
                {
                    media: '(min-width: 768px)',
                    sizes: '1000px',
                    srcSet: [1000, 2000].map((width) => `${urlWithWidth(width)} ${width}w`).join(', '),
                },
            ],
        });

        props = getResponsivePictureAttributes({
            src: disImageURL.withOptionalParams,
            widths: {
                base: 100,
                sm: 500,
                md: 1000,
                '2xl': 500,
            },
        });
        expect(props).toStrictEqual({
            src: disImageURL.withoutOptionalParams,
            sources: [
                {
                    media: '(min-width: 1536px)',
                    sizes: '500px',
                    srcSet: [500, 1000].map((width) => `${urlWithWidth(width)} ${width}w`).join(', '),
                },
                {
                    media: '(min-width: 768px)',
                    sizes: '1000px',
                    srcSet: [1000, 2000].map((width) => `${urlWithWidth(width)} ${width}w`).join(', '),
                },
                {
                    media: '(min-width: 640px)',
                    sizes: '500px',
                    srcSet: [500, 1000].map((width) => `${urlWithWidth(width)} ${width}w`).join(', '),
                },
                {
                    media: '',
                    sizes: '100px',
                    srcSet: [100, 200].map((width) => `${urlWithWidth(width)} ${width}w`).join(', '),
                },
            ],
            links: [
                {
                    media: '(max-width: 639px)',
                    sizes: '100px',
                    srcSet: [100, 200].map((width) => `${urlWithWidth(width)} ${width}w`).join(', '),
                },
                {
                    media: '(min-width: 640px) and (max-width: 767px)',
                    sizes: '500px',
                    srcSet: [500, 1000].map((width) => `${urlWithWidth(width)} ${width}w`).join(', '),
                },
                {
                    media: '(min-width: 768px) and (max-width: 1535px)',
                    sizes: '1000px',
                    srcSet: [1000, 2000].map((width) => `${urlWithWidth(width)} ${width}w`).join(', '),
                },
                {
                    media: '(min-width: 1536px)',
                    sizes: '500px',
                    srcSet: [500, 1000].map((width) => `${urlWithWidth(width)} ${width}w`).join(', '),
                },
            ],
        });
    });

    test('mixture of px and vw values', () => {
        const props = getResponsivePictureAttributes({
            src: disImageURL.withOptionalParams,
            widths: ['100vw', '720px', 500],
        });

        expect(props).toStrictEqual({
            src: disImageURL.withoutOptionalParams,
            sources: [
                {
                    media: '(min-width: 768px)',
                    sizes: '500px',
                    srcSet: [500, 1000].map((width) => `${urlWithWidth(width)} ${width}w`).join(', '),
                },
                {
                    media: '(min-width: 640px)',
                    sizes: '720px',
                    srcSet: [720, 1440].map((width) => `${urlWithWidth(width)} ${width}w`).join(', '),
                },
                {
                    media: '',
                    sizes: '100vw',
                    srcSet: [640, 1280].map((width) => `${urlWithWidth(width)} ${width}w`).join(', '),
                },
            ],
            links: [
                {
                    media: '(max-width: 639px)',
                    sizes: '100vw',
                    srcSet: [640, 1280].map((width) => `${urlWithWidth(width)} ${width}w`).join(', '),
                },
                {
                    media: '(min-width: 640px) and (max-width: 767px)',
                    sizes: '720px',
                    srcSet: [720, 1440].map((width) => `${urlWithWidth(width)} ${width}w`).join(', '),
                },
                {
                    media: '(min-width: 768px)',
                    sizes: '500px',
                    srcSet: [500, 1000].map((width) => `${urlWithWidth(width)} ${width}w`).join(', '),
                },
            ],
        });
    });

    test('only src', () => {
        let props = getResponsivePictureAttributes({
            src: disImageURL.withoutOptionalParams,
        });
        expect(props).toStrictEqual({
            sources: [],
            links: [],
            src: disImageURL.withoutOptionalParams,
        });

        // This time _with_ the optional params
        props = getResponsivePictureAttributes({
            src: disImageURL.withOptionalParams,
        });
        expect(props).toStrictEqual({
            sources: [],
            links: [],
            src: disImageURL.withoutOptionalParams,
        });
    });

    test('passing in theme breakpoints', () => {
        const props = getResponsivePictureAttributes({
            src: disImageURL.withOptionalParams,
            widths: ['100vw', 360],
            breakpoints: {
                base: '0px',
                sm: '320px',
                md: '768px',
                lg: '960px',
                xl: '1200px',
                '2xl': '1536px',
            },
        });
        expect(props).toStrictEqual({
            src: disImageURL.withoutOptionalParams,
            sources: [
                {
                    media: '(min-width: 320px)',
                    sizes: '360px',
                    srcSet: [360, 720].map((width) => `${urlWithWidth(width)} ${width}w`).join(', '),
                },
                {
                    media: '',
                    sizes: '100vw',
                    srcSet: [320, 640].map((width) => `${urlWithWidth(width)} ${width}w`).join(', '),
                },
            ],
            links: [
                {
                    media: '(max-width: 319px)',
                    sizes: '100vw',
                    srcSet: [320, 640].map((width) => `${urlWithWidth(width)} ${width}w`).join(', '),
                },
                {
                    media: '(min-width: 320px)',
                    sizes: '360px',
                    srcSet: [360, 720].map((width) => `${urlWithWidth(width)} ${width}w`).join(', '),
                },
            ],
        });
    });
});
