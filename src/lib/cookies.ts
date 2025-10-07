/* eslint-disable @typescript-eslint/no-explicit-any */
import Cookies from 'js-cookie';

/**
 * Returns the decoded value of a cookie that originally got created by React Router's server runtime (e.g.
 * `createCookie`). The method uses {@link decodeURIComponent} twice because of the two involved libraries
 * on the server.
 * @see {@link https://github.com/remix-run/react-router/blob/cb9a090316003988ff367bb2f2d1ef5bd03bd3af/packages/react-router/lib/server-runtime/cookies.ts#L178}
 * @see {@link https://github.com/jshttp/cookie/blob/13d558f6840fac9c66243be217597a6e2f288335/src/index.ts#L366}
 */
export const getCookie = <T extends Record<string, any>>(name: string): T => {
    try {
        const cookie = Cookies.get(name);
        return (cookie ? JSON.parse(decodeURIComponent(atob(decodeURIComponent(cookie)))) : {}) as T;
    } catch {
        return {} as T;
    }
};

/**
 * Sets an encoded value for a cookie that that can seamlessly be used by React Router's server runtime (e.g.
 * `createCookie`). The method uses {@link encodeURIComponent} twice because of the two involved libraries
 * on the server.
 * @see {@link https://github.com/remix-run/react-router/blob/cb9a090316003988ff367bb2f2d1ef5bd03bd3af/packages/react-router/lib/server-runtime/cookies.ts#L174}
 * @see {@link https://github.com/jshttp/cookie/blob/13d558f6840fac9c66243be217597a6e2f288335/src/index.ts#L253}
 */
export const setCookie = <T extends Record<string, any>>(
    name: string,
    value: T,
    options?: Cookies.CookieAttributes
): string | undefined => {
    const encodedValue = value ? encodeURIComponent(btoa(encodeURIComponent(JSON.stringify(value)))) : '';
    return Cookies.set(name, encodedValue, options);
};

export const removeCookie = (name: string): void => {
    Cookies.remove(name);
};
