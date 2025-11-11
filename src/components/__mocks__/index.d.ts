declare module '@/components/__mocks__/mock-data' {
    export const mockCategory: any;
}

declare module '@/components/__mocks__/product-search-hit-data' {
    export const mockProductSearchItem: any;
    export const mockStandardProductHit: any;
    export const mockMasterProductHitWithOneVariant: any;
    export const mockMasterProductHitWithMultipleVariants: any;
    export const mockProductSetHit: any;
}

declare module '@/components/__mocks__/standard-product' {
    export const mockStandardProductOrderable: any;
}

declare module '@/components/__mocks__/empty-basket' {
    const emptyBasket: any;
    export default emptyBasket;
}

declare module '@/components/__mocks__/basket-with-dress' {
    export const basketWithOneItem: any;
    export const inBasketProductDetails: any;
}

declare module '@/components/__mocks__/variant-750518699578M' {
    const mockVariantProduct: any;
    export default mockVariantProduct;
}

declare module '@/components/__mocks__/basket-with-multiple-items' {
    export const basketWithMultipleItems: any;
    export const inBasketProductDetails: any;
}

declare module '@/components/__mocks__/checkout-data' {
    export const checkoutWithMultipleItems: any;
    export const checkoutWithOneItem: any;
}
