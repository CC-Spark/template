import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchPage, type PageDesignerPageParams } from './page';
import createClient from '@/lib/scapi';
import { createTestContext } from '@/lib/test-utils';

vi.mock('@/lib/scapi', () => ({
    default: vi.fn(),
}));

describe('fetchPage', () => {
    const mockGetPage = vi.fn();
    const mockClient = {
        ShopperExperience: {
            getPage: mockGetPage,
        },
    };

    const mockContext = createTestContext();

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(createClient).mockReturnValue(mockClient as never);
    });

    const basicParameterTestCases = [
        {
            description: 'should call getPage with all parameters provided',
            inputParameters: {
                pageId: 'product-page',
                mode: 'edit',
                pdToken: 'abc123',
                aspectType: 'mobile',
                categoryId: 'electronics',
                productId: 'laptop-001',
            },
            expectedParameters: {
                pageId: 'product-page',
                mode: 'edit',
                pdToken: 'abc123',
                aspectType: 'mobile',
                categoryId: 'electronics',
                productId: 'laptop-001',
            },
            mockResult: { id: 'product-page', name: 'Product Detail Page', pageType: 'productDetailPage' },
        },
        {
            description: 'should handle empty parameters',
            inputParameters: { pageId: '' },
            expectedParameters: {
                pageId: '',
                mode: undefined,
                pdToken: undefined,
                aspectType: undefined,
                categoryId: undefined,
                productId: undefined,
            },
            mockResult: { id: '', name: 'Default Page', pageType: 'storePage' },
        },
    ];

    it.each(basicParameterTestCases)('$description', async ({ inputParameters, expectedParameters, mockResult }) => {
        mockGetPage.mockResolvedValue(mockResult);

        const result = await fetchPage(mockContext, inputParameters);

        expect(createClient).toHaveBeenCalledWith(mockContext);
        expect(mockGetPage).toHaveBeenCalledWith({
            parameters: expectedParameters,
        });
        expect(result).toBe(mockResult);
    });

    describe('Page Designer design specific parameters', () => {
        const pageDesignerTestCases = [
            {
                description: 'should handle Page Designer edit mode',
                parameters: {
                    pageId: 'homepage',
                    mode: 'edit',
                    pdToken: 'edit-token-123',
                    categoryId: 'mens-clothing',
                    aspectType: 'category',
                },
                expected: {
                    pageId: 'homepage',
                    mode: 'edit',
                    pdToken: 'edit-token-123',
                    aspectType: 'category',
                    categoryId: 'mens-clothing',
                    productId: undefined,
                },
            },
            {
                description: 'should handle product context parameters',
                parameters: {
                    pageId: 'product-template',
                    productId: 'shirt-001',
                    categoryId: 'mens-shirts',
                    aspectType: 'product',
                },
                expected: {
                    pageId: 'product-template',
                    mode: undefined,
                    pdToken: undefined,
                    aspectType: 'product',
                    categoryId: 'mens-shirts',
                    productId: 'shirt-001',
                },
            },
        ];

        it.each(pageDesignerTestCases)('$description', async ({ parameters, expected }) => {
            const mockResult = {
                id: parameters.pageId,
                name: 'Test Page',
                pageType: 'storePage',
            };
            mockGetPage.mockResolvedValue(mockResult);

            await fetchPage(mockContext, parameters);

            expect(mockGetPage).toHaveBeenCalledWith({
                parameters: expected,
            });
        });
    });

    describe('error handling', () => {
        const errorTestCases = [
            {
                description: 'should propagate ShopperExperience API errors',
                error: new Error('Page not found'),
                inputParameters: { pageId: 'non-existent' },
                expectedErrorMessage: 'Page not found',
                shouldCheckParameters: true,
            },
            {
                description: 'should handle network errors',
                error: new Error('Network timeout'),
                inputParameters: { pageId: 'homepage' },
                expectedErrorMessage: 'Network timeout',
                shouldCheckParameters: false,
            },
            {
                description: 'should handle authentication errors',
                error: new Error('Unauthorized access'),
                inputParameters: {
                    pageId: 'secure-page',
                    mode: 'edit',
                    pdToken: 'invalid-token',
                },
                expectedErrorMessage: 'Unauthorized access',
                shouldCheckParameters: false,
            },
        ];

        it.each(errorTestCases)(
            '$description',
            async ({ error, inputParameters, expectedErrorMessage, shouldCheckParameters }) => {
                mockGetPage.mockRejectedValue(error);

                await expect(fetchPage(mockContext, inputParameters)).rejects.toThrow(expectedErrorMessage);

                if (shouldCheckParameters) {
                    expect(mockGetPage).toHaveBeenCalledWith({
                        parameters: {
                            pageId: inputParameters.pageId,
                            mode: (inputParameters as PageDesignerPageParams).mode,
                            pdToken: (inputParameters as PageDesignerPageParams).pdToken,
                            aspectType: (inputParameters as PageDesignerPageParams).aspectType,
                            categoryId: (inputParameters as PageDesignerPageParams).categoryId,
                            productId: (inputParameters as PageDesignerPageParams).productId,
                        } as PageDesignerPageParams,
                    });
                }
            }
        );
    });

    describe('return value validation', () => {
        const returnValueTestCases = [
            {
                description: 'should return the exact response from ShopperExperience.getPage',
                mockPageResponse: {
                    id: 'test-page',
                    name: 'Test Page',
                    pageType: 'storePage',
                    description: 'A test page for validation',
                    regions: [
                        {
                            id: 'header',
                            components: [],
                        },
                    ],
                    data: {
                        customAttribute: 'value',
                    },
                },
                inputParameters: { pageId: 'test-page' },
                shouldCheckReference: true,
            },
            {
                description: 'should handle empty page response',
                mockPageResponse: {},
                inputParameters: { pageId: 'empty-page' },
                shouldCheckReference: false,
            },
        ];

        it.each(returnValueTestCases)(
            '$description',
            async ({ mockPageResponse, inputParameters, shouldCheckReference }) => {
                mockGetPage.mockResolvedValue(mockPageResponse);

                const result = await fetchPage(mockContext, inputParameters);

                expect(result).toEqual(mockPageResponse);
                if (shouldCheckReference) {
                    expect(result).toBe(mockPageResponse);
                }
            }
        );
    });

    describe('context usage', () => {
        const contextTestCases = [
            {
                description: 'should pass the correct context to createClient',
                testFunction: async () => {
                    const customContext = createTestContext();
                    const mockResult = { id: 'test', name: 'Test Page', pageType: 'storePage' };
                    mockGetPage.mockResolvedValue(mockResult);

                    await fetchPage(customContext, { pageId: 'test' });

                    expect(createClient).toHaveBeenCalledWith(customContext);
                    expect(createClient).toHaveBeenCalledTimes(1);
                },
            },
            {
                description: 'should create a new client instance for each call',
                testFunction: async () => {
                    const mockResult = { id: 'test', name: 'Test Page', pageType: 'storePage' };
                    mockGetPage.mockResolvedValue(mockResult);

                    await fetchPage(mockContext, { pageId: 'test1' });
                    await fetchPage(mockContext, { pageId: 'test2' });

                    expect(createClient).toHaveBeenCalledTimes(2);
                    expect(createClient).toHaveBeenNthCalledWith(1, mockContext);
                    expect(createClient).toHaveBeenNthCalledWith(2, mockContext);
                },
            },
        ];

        it.each(contextTestCases)('$description', async ({ testFunction }) => {
            await testFunction();
        });
    });
});
