export type FileCacheOptions = {
    /** Seconds
     * @default 60 * 60 * 24
     */
    ttl: number;
};

export type AvailableCacheFileNames = 'poToken' | 'visitorData' | 'oauth2' | 'html5Player' | (string & {});