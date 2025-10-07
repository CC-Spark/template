'use client';

import { createContext, type PropsWithChildren, useContext } from 'react';
import type { SessionData } from '@/lib/api/types';

const AuthContext = createContext<SessionData | undefined>(undefined);

/**
 * Provider for given auth/session data that's typically retrieved by the auth middleware.
 * @see {@link authMiddleware}
 *
 * **Note:** In the current implementation, session data is both retrieved on the server and the client and shared
 * via a cookie. During the server-side rendering phase there's a guarantee that the session data is available
 * synchronously before any component rendering. On the client things are slightly more subtle. The immediate
 * availability of session data on the client depends on whether setting/reusing the server-side cookie has worked.
 * This should usually be the case. However, if a system component such as a CDN strips the “Set-Cookie” header,
 * we would fall back to autonomous session retrieval on the client. In this case, the session data on the client
 * could be temporarily `undefined`. Any components depending on session data should therefore behave accordingly.
 */
const AuthProvider = ({ children, value }: PropsWithChildren<{ value?: SessionData }>) => {
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): SessionData | undefined => {
    return useContext(AuthContext);
};

export default AuthProvider;
