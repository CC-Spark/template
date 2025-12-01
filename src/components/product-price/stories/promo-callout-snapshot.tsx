import * as PromoCalloutStories from './promo-callout.stories';
import { composeStories } from '@storybook/react-vite';
import { render } from '@testing-library/react';
import { describe, test, expect } from 'vitest';

const { Default, HtmlContent, NoPromo } = composeStories(PromoCalloutStories);

describe('PromoCallout Snapshots', () => {
    test('Default snapshot', () => {
        const { container } = render(<Default />);
        expect(container).toMatchSnapshot();
    });

    test('HtmlContent snapshot', () => {
        const { container } = render(<HtmlContent />);
        expect(container).toMatchSnapshot();
    });

    test('NoPromo snapshot', () => {
        const { container } = render(<NoPromo />);
        expect(container).toMatchSnapshot();
    });
});
