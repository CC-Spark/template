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
import { render, screen } from '@testing-library/react';
import { DynamicImage } from './index';

const src =
    'https://edge.disstg.commercecloud.salesforce.com/dw/image/v2/ZZRF_001/on/demandware.static/-/Sites-apparel-m-catalog/default/dw4cd0a798/images/large/PG.10216885.JJ169XX.PZ.jpg';

describe('Dynamic Image Component', () => {
    test('renders an image with default props', () => {
        render(<DynamicImage src={src} alt="Test image" />);

        const img = screen.getByRole('img');
        expect(img).toHaveAttribute('src', src);
        expect(img).toHaveAttribute('alt', 'Test image');
        expect(img).toHaveAttribute('loading', 'lazy');
        expect(img).toHaveAttribute('fetchpriority', 'low');
    });

    test('renders an image with custom className', () => {
        render(<DynamicImage src={src} alt="Test image" className="custom-class" />);

        const wrapper = screen.getByRole('img').parentElement;
        expect(wrapper).toHaveClass('custom-class');
    });

    test('renders with custom as prop', () => {
        const { container } = render(<DynamicImage src={src} alt="Test image" as="div" />);

        const element = container.querySelector('div[alt="Test image"]');
        expect(element).toBeInTheDocument();
        expect(element?.tagName).toBe('DIV');
        expect(element).toHaveAttribute('alt', 'Test image');
    });

    test('renders with priority high', () => {
        render(<DynamicImage src={src} alt="Test image" priority="high" />);

        const img = screen.getByRole('img');
        expect(img).toHaveAttribute('loading', 'eager');
        expect(img).toHaveAttribute('fetchpriority', 'high');
    });

    test('renders with custom imageProps', () => {
        render(
            <DynamicImage
                src={src}
                alt="Test image"
                imageProps={
                    {
                        title: 'Custom title',
                        'data-testid': 'custom-img',
                    } as any
                }
            />
        );

        const img = screen.getByTestId('custom-img');
        expect(img).toHaveAttribute('title', 'Custom title');
    });

    describe('responsive images', () => {
        test('renders responsive image with widths array', () => {
            render(<DynamicImage src={src} alt="Test image" widths={[100, 200, 400]} />);

            const picture = screen.getByRole('img').closest('picture');
            expect(picture).toBeInTheDocument();

            const sources = picture?.querySelectorAll('source');
            expect(sources).toHaveLength(3);

            // Check that sources have proper attributes
            sources?.forEach((source: any, index: number) => {
                expect(source).toHaveAttribute('srcset');
                expect(source).toHaveAttribute('sizes');
                if (index < sources.length - 1) {
                    expect(source).toHaveAttribute('media');
                }
            });
        });

        test('renders responsive image with vw widths', () => {
            render(<DynamicImage src={src} alt="Test image" widths={['50vw', '100vw', '25vw']} />);

            const picture = screen.getByRole('img').closest('picture');
            expect(picture).toBeInTheDocument();

            const sources = picture?.querySelectorAll('source');
            expect(sources).toHaveLength(5);
        });

        test('renders responsive image with breakpoint object', () => {
            render(<DynamicImage src={src} alt="Test image" widths={{ base: 100, sm: 200, md: 400 }} />);

            const picture = screen.getByRole('img').closest('picture');
            expect(picture).toBeInTheDocument();

            const sources = picture?.querySelectorAll('source');
            expect(sources).toHaveLength(3);
        });

        test('renders simple image without widths', () => {
            render(<DynamicImage src={src} alt="Test image" />);

            const img = screen.getByRole('img');
            expect(img).toBeInTheDocument();
            expect(img.closest('picture')).not.toBeInTheDocument();
        });

        test('renders image with SFCC URL and sw parameter', () => {
            const sfccSrc = 'https://example.com/image.jpg?sw=300&q=60';
            render(<DynamicImage src={sfccSrc} alt="Test image" widths={[468]} />);

            const picture = screen.getByRole('img').closest('picture');
            expect(picture).toBeInTheDocument();

            const sources = picture?.querySelectorAll('source');
            expect(sources).toHaveLength(1);

            const srcset = sources?.[0]?.getAttribute('srcset');
            expect(srcset).toContain('sw=468');
        });
    });

    describe('edge cases', () => {
        test('handles empty widths array', () => {
            render(<DynamicImage src={src} alt="Test image" widths={[]} />);

            const img = screen.getByRole('img');
            expect(img).toBeInTheDocument();
            expect(img.closest('picture')).not.toBeInTheDocument();
        });

        test('handles undefined alt', () => {
            render(<DynamicImage src={src} />);

            const img = screen.getByRole('presentation');
            expect(img).toHaveAttribute('alt', '');
        });

        test('handles custom loading values', () => {
            render(<DynamicImage src={src} alt="Test image" loading="eager" />);

            const img = screen.getByRole('img');
            expect(img).toHaveAttribute('loading', 'eager');
        });

        test('handles mixed width types', () => {
            render(<DynamicImage src={src} alt="Test image" widths={[100, '50vw', 300]} />);

            const picture = screen.getByRole('img').closest('picture');
            expect(picture).toBeInTheDocument();

            const sources = picture?.querySelectorAll('source');
            expect(sources).toHaveLength(3);
        });
    });
});
