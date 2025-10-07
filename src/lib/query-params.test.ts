import { describe, it, expect } from 'vitest';
import { PRODUCT_SEARCH_QUERY_PARAMS, getQueryParam, getAllQueryParams } from './query-params';

describe('query-params', () => {
    it('should have type-safe query parameter constants', () => {
        expect(PRODUCT_SEARCH_QUERY_PARAMS.SORT).toBe('sort');
        expect(PRODUCT_SEARCH_QUERY_PARAMS.REFINE).toBe('refine');
        expect(PRODUCT_SEARCH_QUERY_PARAMS.Q).toBe('q');
    });

    it('should get query parameter values safely', () => {
        const searchParams = new URLSearchParams('sort=price&refine=color:red&refine=size:large');

        expect(getQueryParam(searchParams, PRODUCT_SEARCH_QUERY_PARAMS.SORT)).toBe('price');
        expect(getQueryParam(searchParams, PRODUCT_SEARCH_QUERY_PARAMS.Q)).toBe('');
    });

    it('should get all query parameter values for array parameters', () => {
        const searchParams = new URLSearchParams('sort=price&refine=color:red&refine=size:large');

        expect(getAllQueryParams(searchParams, PRODUCT_SEARCH_QUERY_PARAMS.REFINE)).toEqual([
            'color:red',
            'size:large',
        ]);
    });
});
