'use client';

import { createContext, type PropsWithChildren, useContext } from 'react';
import type { ShopperBasketsTypes } from 'commerce-sdk-isomorphic';

const BasketContext = createContext<ShopperBasketsTypes.Basket | undefined>(undefined);

/**
 * Provider for given basket data that's typically retrieved by the basket middleware.
 *
 * **Note:** In the current implementation, basket data is only retrieved on the client, i.e., during the server-side
 * rendering phase there's no basket data available. That means that all components relying on basket data have to
 * take the possibility into account that the data is `undefined`.
 */
const BasketProvider = ({ children, value }: PropsWithChildren<{ value?: ShopperBasketsTypes.Basket }>) => {
    return <BasketContext.Provider value={value}>{children}</BasketContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useBasket = (): ShopperBasketsTypes.Basket | undefined => {
    return useContext(BasketContext);
};

export default BasketProvider;
