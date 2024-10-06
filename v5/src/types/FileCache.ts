export type PoTokenCache = string;
export type VisitorDataCache = string;
export type OAuth2Cache = {
    accessToken: string;
    refreshToken: string;
    expiryDate: string;
    clientData: {
        clientId: string;
        clientSecret: string;
    };
};
export type Html5PlayerCache = {
    playerPath: string;
    playerUrl: string;
    signatureTimestamp: string;
    playerBody: string | null;
};
