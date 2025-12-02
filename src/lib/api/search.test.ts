import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchSearchSuggestions } from './search';
import { createApiClients } from '@/lib/api-clients';
import { createTestContext } from '@/lib/test-utils';

vi.mock('@/lib/api-clients', () => ({
    createApiClients: vi.fn(),
}));

describe('fetchSearchSuggestions', () => {
    const mockGetSearchSuggestions = vi.fn();
    const mockClients = {
        shopperSearch: {
            getSearchSuggestions: mockGetSearchSuggestions,
        },
        use: vi.fn(),
    };

    const mockContext = createTestContext();

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(createApiClients).mockReturnValue(mockClients as never);
    });

    it('should call getSearchSuggestions with basic parameters', async () => {
        const mockResult = { searchPhrase: 'dress' };
        mockGetSearchSuggestions.mockResolvedValue({ data: mockResult });

        const result = await fetchSearchSuggestions(mockContext, { q: 'dress' });

        expect(createApiClients).toHaveBeenCalledWith(mockContext);
        expect(mockGetSearchSuggestions).toHaveBeenCalledWith({
            params: {
                query: {
                    q: 'dress',
                },
            },
        });
        expect(result).toBe(mockResult);
    });

    it('should call getSearchSuggestions with all parameters', async () => {
        const mockResult = { searchPhrase: 'shirt' };
        mockGetSearchSuggestions.mockResolvedValue({ data: mockResult });

        await fetchSearchSuggestions(mockContext, {
            q: 'shirt',
            expand: ['images', 'prices'],
            limit: 10,
            currency: 'EUR',
        });

        expect(mockGetSearchSuggestions).toHaveBeenCalledWith({
            params: {
                query: {
                    q: 'shirt',
                    expand: ['images', 'prices'],
                    limit: 10,
                    currency: 'EUR',
                },
            },
        });
    });

    it('should exclude undefined optional parameters', async () => {
        const mockResult = { searchPhrase: 'jacket' };
        mockGetSearchSuggestions.mockResolvedValue({ data: mockResult });

        await fetchSearchSuggestions(mockContext, {
            q: 'jacket',
            expand: undefined,
            limit: undefined,
            currency: undefined,
        });

        expect(mockGetSearchSuggestions).toHaveBeenCalledWith({
            params: {
                query: {
                    q: 'jacket',
                },
            },
        });
    });

    it('should include includeEinsteinSuggestedPhrases when true', async () => {
        const mockResult = { searchPhrase: 'shoes' };
        mockGetSearchSuggestions.mockResolvedValue({ data: mockResult });

        await fetchSearchSuggestions(mockContext, {
            q: 'shoes',
            includeEinsteinSuggestedPhrases: true,
        });

        expect(mockGetSearchSuggestions).toHaveBeenCalledWith({
            params: {
                query: {
                    q: 'shoes',
                    includeEinsteinSuggestedPhrases: true,
                },
            },
        });
    });

    it('should include includeEinsteinSuggestedPhrases when false', async () => {
        const mockResult = { searchPhrase: 'shoes' };
        mockGetSearchSuggestions.mockResolvedValue({ data: mockResult });

        await fetchSearchSuggestions(mockContext, {
            q: 'shoes',
            includeEinsteinSuggestedPhrases: false,
        });

        expect(mockGetSearchSuggestions).toHaveBeenCalledWith({
            params: {
                query: {
                    q: 'shoes',
                    includeEinsteinSuggestedPhrases: false,
                },
            },
        });
    });

    it('should exclude includeEinsteinSuggestedPhrases when undefined', async () => {
        const mockResult = { searchPhrase: 'shoes' };
        mockGetSearchSuggestions.mockResolvedValue({ data: mockResult });

        await fetchSearchSuggestions(mockContext, {
            q: 'shoes',
            includeEinsteinSuggestedPhrases: undefined,
        });

        expect(mockGetSearchSuggestions).toHaveBeenCalledWith({
            params: {
                query: {
                    q: 'shoes',
                },
            },
        });
    });

    it('should handle includeEinsteinSuggestedPhrases with all other parameters', async () => {
        const mockResult = { searchPhrase: 'accessories' };
        mockGetSearchSuggestions.mockResolvedValue({ data: mockResult });

        await fetchSearchSuggestions(mockContext, {
            q: 'accessories',
            expand: ['images', 'prices'],
            limit: 15,
            currency: 'EUR',
            includeEinsteinSuggestedPhrases: true,
        });

        expect(mockGetSearchSuggestions).toHaveBeenCalledWith({
            params: {
                query: {
                    q: 'accessories',
                    expand: ['images', 'prices'],
                    limit: 15,
                    currency: 'EUR',
                    includeEinsteinSuggestedPhrases: true,
                },
            },
        });
    });

    it('should handle includeEinsteinSuggestedPhrases with mixed undefined parameters', async () => {
        const mockResult = { searchPhrase: 'bags' };
        mockGetSearchSuggestions.mockResolvedValue({ data: mockResult });

        await fetchSearchSuggestions(mockContext, {
            q: 'bags',
            expand: ['images'],
            limit: undefined,
            currency: 'USD',
            includeEinsteinSuggestedPhrases: false,
        });

        expect(mockGetSearchSuggestions).toHaveBeenCalledWith({
            params: {
                query: {
                    q: 'bags',
                    expand: ['images'],
                    currency: 'USD',
                    includeEinsteinSuggestedPhrases: false,
                },
            },
        });
    });
});
