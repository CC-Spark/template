import { vi, expect, test, describe, afterEach } from 'vitest';

vi.mock('@/components/toast', () => ({
    useToast: () => ({
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        addToast: () => {},
    }),
}));

// Mock window.location and navigator for share functionality
Object.defineProperty(window, 'location', {
    value: {
        href: 'https://example.com/product/test-product-123',
    },
    writable: true,
});

Object.defineProperty(navigator, 'clipboard', {
    value: {
        writeText: vi.fn().mockResolvedValue(undefined),
    },
    writable: true,
});

Object.defineProperty(navigator, 'share', {
    value: vi.fn().mockResolvedValue(undefined),
    writable: true,
});

import { composeStories } from '@storybook/react-vite';
// eslint-disable-next-line import/no-namespace
import * as ShareButtonStories from './share-button.stories';
import { render, cleanup } from '@testing-library/react';
import { ConfigProvider } from '@/config';
import { mockConfig } from '@/test-utils/config';

const composed = composeStories(ShareButtonStories);

afterEach(() => {
    cleanup();
});

describe('ShareButton stories snapshot', () => {
    for (const [storyName, Story] of Object.entries(composed)) {
        test(`${storyName} story renders and matches snapshot`, () => {
            const { container } = render(
                <ConfigProvider config={mockConfig}>
                    <Story />
                </ConfigProvider>
            );
            expect(container.firstChild).toMatchSnapshot();
        });
    }
});
