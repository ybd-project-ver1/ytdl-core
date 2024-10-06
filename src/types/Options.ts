import type { YTDL_ClientTypes } from './Clients';
import { YTDL_VideoFormat } from './Ytdl';
import { YTDL_GeoCountry, YTDL_Hreflang } from './Language';

export type YTDL_Filter = 'audioandvideo' | 'videoandaudio' | 'video' | 'videoonly' | 'audio' | 'audioonly' | ((format: YTDL_VideoFormat) => boolean);

export type YTDL_ChooseFormatOptions = {
    quality?: 'lowest' | 'highest' | 'highestaudio' | 'lowestaudio' | 'highestvideo' | 'lowestvideo' | (string & {}) | number | string[] | number[];
    filter?: YTDL_Filter;

    /** You can specify which clients to exclude from format selection. (This option takes precedence over includingClients.)
     * @default ['web']
     */
    excludingClients?: Array<YTDL_ClientTypes>;

    /** You can specify which clients to include in the format selection.
     * @note Do not specify because the web client will return a 403 error.
     */
    includingClients?: Array<YTDL_ClientTypes> | 'all';

    format?: YTDL_VideoFormat;
};

export interface YTDL_OAuth2ClientData {
    clientId: string;
    clientSecret: string;
}

export type YTDL_OAuth2Credentials = {
    accessToken: string;
    refreshToken: string;
    expiryDate: string;
    clientData?: YTDL_OAuth2ClientData;
};

export type YTDL_ProxyOptions = {
    /** API requests can be rewritten. (This is also a great way to debug what requests are being sent). */
    rewriteRequest?: (url: string, options: RequestInit, details: { isDownloadUrl: boolean }) => { url: string; options: RequestInit };

    /** You can specify your own proxy. (See "Proxy Support" in the README for details.)
     * @advance For advanced use, use the `rewriteRequest` function.
     * @reference https://github.com/ybd-project/ytdl-core/tree/main/examples/OriginalProxy/src/server
     * @details https://github.com/ybd-project/ytdl-core?tab=readme-ov-file#use-of-proprietary-proxies
     */
    originalProxy?: {
        base: string;
        download: string;
        urlQueryName?: 'url' | (string & {});
    };
};

export type YTDL_GetInfoOptions = YTDL_ProxyOptions & {
    /** You can specify the language to be set when making a request to the API. */
    hl?: YTDL_Hreflang;

    /* You can specify the country name to be specified when making a request to the API. */
    gl?: YTDL_GeoCountry;

    /** You can specify a valid PoToken to avoid bot errors. */
    poToken?: string;

    /** You can disable the automatic generation of PoToken. */
    disablePoTokenAutoGeneration?: boolean;

    /** You can specify a valid VisitorData to avoid bot errors, etc. */
    visitorData?: string;

    /** You can specify whether to include Player API responses.
     * @default false
     */
    includesPlayerAPIResponse?: boolean;

    /** You can specify whether to include Next API responses.
     * @default false
     */
    includesNextAPIResponse?: boolean;

    /** You can specify whether to include the original streaming adaptive data in the formatted data.
     * @default false
     */
    includesOriginalFormatData?: boolean;

    /** You can specify whether to include related videos.
     * @default true
     */
    includesRelatedVideo?: boolean;

    /** You can specify the client from which you want to retrieve video information.
     * @note To stabilize functionality, web, webCreator, tvEmbedded, IOS, and android are always included. To disable it, specify `disableDefaultClients`. (If clients is not specified, it will be included.)
     * @default ["web", "webCreator", "tvEmbedded", "ios", "android"]
     */
    clients?: Array<YTDL_ClientTypes>;

    /** You can disable the default client. (If clients is not specified, it will be included.) */
    disableDefaultClients?: boolean;

    /** You can specify whether or not to disable the normal cache.  */
    disableBasicCache?: boolean;

    /** You can specify whether to disable the file cache. Disable this if you encounter errors.  */
    disableFileCache?: boolean;

    /** You can specify whether to parse the HLS format. */
    parsesHLSFormat?: boolean;

    /** You can specify OAuth2 tokens to avoid age restrictions and bot errors.
     * @default null
     */
    oauth2Credentials?: YTDL_OAuth2Credentials;
};

export interface YTDL_DownloadOptions extends YTDL_GetInfoOptions, YTDL_ChooseFormatOptions {
    range?: {
        start?: number;
        end?: number;
    };
    begin?: string | number;
    liveBuffer?: number;
    highWaterMark?: number;
    IPv6Block?: string;
    dlChunkSize?: number;

    /** You can specify the type of stream you want to get.
     * @details If you want to write to a file using `fs.createWriteStream`, e.g. Node.js, specify `nodejs`. If you want to get something else (ReadableStream), specify `default`.
     * @default 'default'
     */
    streamType?: 'default' | 'nodejs';
}

export type YTDL_RequestOptions = { requestOptions?: RequestInit; rewriteRequest?: YTDL_GetInfoOptions['rewriteRequest']; originalProxy?: YTDL_GetInfoOptions['originalProxy'] };
