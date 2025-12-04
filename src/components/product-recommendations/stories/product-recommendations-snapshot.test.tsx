import { vi, expect, test, describe, afterEach } from 'vitest';
import { composeStories } from '@storybook/react-vite';
// eslint-disable-next-line import/no-namespace
import * as ProductRecommendationsStories from './index.stories';
import { render, cleanup } from '@testing-library/react';

// Mock the necessary hooks and providers
vi.mock('@/hooks/recommenders/use-recommenders', () => ({
    useRecommenders: vi.fn(() => ({
        isLoading: false,
        isEnabled: true,
        recommendations: {
            recoUUID: 'test-uuid',
            recommenderName: 'pdp-similar-items',
            displayMessage: 'You May Also Like',
            recs: [],
        },
        error: null,
        getRecommenders: vi.fn(),
        getRecommendations: vi.fn(),
        getZoneRecommendations: vi.fn(),
    })),
}));

// Mock react-router hooks
vi.mock('react-router', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        useNavigate: () => vi.fn(),
        useLocation: () => ({
            pathname: '/',
            search: '',
            hash: '',
            state: null,
            key: 'default',
        }),
        useResolvedPath: () => ({ pathname: '/', search: '', hash: '' }),
        useHref: () => '/',
        Link: (props: any) => (
            <a href={props.to} {...props}>
                {props.children}
            </a>
        ),
        NavLink: (props: any) => (
            <a href={props.to} {...props}>
                {props.children}
            </a>
        ),
    };
});

const composed = composeStories(ProductRecommendationsStories);

afterEach(() => {
    cleanup();
});

describe('ProductRecommendations stories snapshot', () => {
    for (const [storyName, Story] of Object.entries(composed)) {
        if (Story?.parameters?.snapshot === false || /interactiontests?/i.test(storyName)) continue;
        test(`${storyName} story renders and matches snapshot`, () => {
            const { container } = render(<Story />);
            expect(container.firstChild).toMatchSnapshot();
        });
    }
});
