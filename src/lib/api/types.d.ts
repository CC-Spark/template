// TODO: (Re)move
export type SessionData = {
    access_token?: string;
    access_token_expiry?: number;
    refresh_token?: string;
    refresh_token_expiry?: number;

    customer_id?: string;
    userType?: 'guest' | 'registered';
    usid?: string;

    // social login
    codeVerifier?: string;

    // idp
    idp_access_token?: string;
    idp_refresh_token?: string;

    //hybrid
    dwsid?: string;

    // dnt
    // TODO take care of this in separate ticket
    dnt?: string;
};

export type CustomQueryParameters = {
    [key in `c_${string}`]: string | number | boolean | string[] | number[];
};
