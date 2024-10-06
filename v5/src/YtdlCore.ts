type YTDL_Constructor = Omit<YTDL_DownloadOptions, 'format'> & {
    debug?: boolean;
};

import { fetch, Response } from 'undici';
import { PassThrough } from 'stream';
import miniget from 'miniget';
import m3u8stream, { parseTimestamp } from 'm3u8stream';

import { YTDL_ChooseFormatOptions, YTDL_DownloadOptions, YTDL_GetInfoOptions, YTDL_OAuth2Credentials } from './types/Options';
import { YTDL_VideoFormat, YTDL_VideoInfo } from './types/Ytdl';
import { YTDL_Agent } from './types/Agent';
import { YTDL_Hreflang } from './types/Language';

import { getBasicInfo, getFullInfo, getInfo } from './core/Info';
import getHtml5Player from './core/Info/parser/Html5Player';
import { createAgent, createProxyAgent } from './core/Agent';
import { OAuth2 } from './core/OAuth2';
import PoToken from './core/PoToken';
import { FileCache } from './core/Cache';
import { getSignatureTimestamp } from './core/Signature';
import Fetcher from './core/Fetcher';

import { YTDL_ClientTypes } from './meta/Clients';

import utils from './utils/Utils';
import Url from './utils/Url';
import DownloadOptionsUtils from './utils/DownloadOptions';
import { chooseFormat, filterFormats } from './utils/Format';
import { VERSION } from './utils/constants';
import { Logger } from './utils/Log';
import IP from './utils/IP';

/* Private Constants */
const STREAM_EVENTS = ['abort', 'request', 'response', 'error', 'redirect', 'retry', 'reconnect'];

/* Private Functions */
function isNodeVersionOk(version: string): boolean {
    return parseInt(version.replace('v', '').split('.')[0]) >= 16;
}

async function isDownloadUrlValid(format: YTDL_VideoFormat): Promise<{ valid: boolean; reason?: string }> {
    return new Promise((resolve) => {
        const successResponseHandler = (res: Response) => {
                if (res.status === 200) {
                    Logger.debug(`[ ${format.sourceClientName} ]: <success>Video URL is normal.</success> The response was received with status code <success>"${res.status}"</success>.`);
                    resolve({ valid: true });
                } else {
                    errorResponseHandler(new Error(`Status code: ${res.status}`));
                }
            },
            errorResponseHandler = (reason: Error) => {
                Logger.debug(`[ ${format.sourceClientName} ]: The URL for the video <error>did not return a successful response</error>. Got another format.\nReason: ${reason.message}`);
                resolve({ valid: false, reason: reason.message });
            };

        try {
            fetch(format.url, {
                method: 'HEAD',
            }).then(
                (res) => successResponseHandler(res),
                (reason) => errorResponseHandler(reason),
            );
        } catch (err: any) {
            errorResponseHandler(err);
        }
    });
}

function getValidDownloadUrl(stream: PassThrough, formats: YTDL_VideoInfo['formats'], options: YTDL_DownloadOptions): Promise<YTDL_VideoFormat> {
    return new Promise(async (resolve, reject) => {
        let excludingClients: Array<YTDL_ClientTypes> = ['web'],
            format,
            isOk = false;

        try {
            format = chooseFormat(formats, options);
        } catch (e) {
            stream.emit('error', e);
            return reject(e);
        }

        if (!format) {
            return reject(new Error('Failed to retrieve format data.'));
        }

        while (isOk === false) {
            if (!format) {
                reject(new Error('Failed to retrieve format data.'));
                break;
            }

            const { valid, reason } = await isDownloadUrlValid(format);

            if (valid) {
                isOk = true;
            } else {
                if (format.sourceClientName !== 'unknown') {
                    excludingClients.push(format.sourceClientName);
                }

                try {
                    format = chooseFormat(formats, {
                        excludingClients,
                        includingClients: reason?.includes('403') ? ['ios', 'android'] : 'all',
                        quality: options.quality,
                        filter: options.filter,
                    });
                } catch (e) {
                    stream.emit('error', e);
                    return reject(e);
                }
            }
        }

        resolve(format);
    });
}

function createStream(options: YTDL_DownloadOptions = {}) {
    const STREAM = new PassThrough({
        highWaterMark: (options && options.highWaterMark) || 1024 * 512,
    });

    STREAM._destroy = () => {
        STREAM.destroyed = true;
    };

    return STREAM;
}

function pipeAndSetEvents(req: m3u8stream.Stream, stream: PassThrough, end: boolean) {
    // Forward events from the request to the stream.
    STREAM_EVENTS.forEach((event) => {
        req.prependListener(event, stream.emit.bind(stream, event));
    });

    req.pipe(stream, { end });
}

async function downloadFromInfoCallback(stream: PassThrough, info: YTDL_VideoInfo, options: YTDL_DownloadOptions) {
    options = options || {};
    options.requestOptions = options.requestOptions || {};

    if (!info.formats.length) {
        stream.emit('error', Error('This video is unavailable'));
        return;
    }

    let format;

    try {
        format = await getValidDownloadUrl(stream, info.formats, options);
    } catch {
        return;
    }

    if (info._metadata.clients.every((client) => client === 'web')) {
        Logger.warning('<warning>The web client format is deprecated for downloads as it often returns 403.</warning> Include non-WEB clients in the `clients` option. (Example: webCreator, ios, android)');
    }

    stream.emit('info', info, format);
    if (stream.destroyed) {
        return;
    }

    let contentLength: number,
        downloaded = 0;

    const onData = (chunk: Buffer) => {
        downloaded += chunk.length;
        stream.emit('progress', chunk.length, downloaded, contentLength);
    };

    DownloadOptionsUtils.applyDefaultHeaders(options);
    if (options.IPv6Block) {
        options.requestOptions = Object.assign({}, options.requestOptions, {
            localAddress: IP.getRandomIPv6(options.IPv6Block),
        });
    }
    if (options.agent) {
        if (options.agent.jar) {
            utils.setPropInsensitive(options.requestOptions.headers, 'cookie', options.agent.jar.getCookieStringSync('https://www.youtube.com'));
        }

        if (options.agent.localAddress) {
            (options.requestOptions as any).localAddress = options.agent.localAddress;
        }
    }

    // Download the file in chunks, in this case the default is 10MB,
    // anything over this will cause youtube to throttle the download
    const DL_CHUNK_SIZE = typeof options.dlChunkSize === 'number' ? options.dlChunkSize : 1024 * 1024 * 10;

    let req: m3u8stream.Stream;
    let shouldEnd = true;

    /* Request Setup */
    if (options.rewriteRequest) {
        const { url, options: reqOptions } = options.rewriteRequest(format.url, options.requestOptions, {
            isDownloadUrl: true,
        });

        format.url = url;
        options.requestOptions = reqOptions;
    }

    if (options.originalProxyUrl) {
        const PARSED = new URL(options.originalProxyUrl);

        if (!format.url.includes(PARSED.host)) {
            format.url = `${PARSED.protocol}//${PARSED.host}/download/?url=${encodeURIComponent(format.url)}`;
        }
    }

    if (format.isHLS || format.isDashMPD) {
        req = m3u8stream(format.url, {
            chunkReadahead: info.live_chunk_readahead ? +info.live_chunk_readahead : undefined,
            begin: options.begin || (format.isLive ? Date.now() : undefined),
            liveBuffer: options.liveBuffer,
            requestOptions: options.requestOptions as any,
            parser: format.isDashMPD ? 'dash-mpd' : 'm3u8',
            id: format.itag.toString(),
        });

        req.on('progress', (segment, totalSegments) => {
            stream.emit('progress', segment.size, segment.num, totalSegments);
        });

        pipeAndSetEvents(req, stream, shouldEnd);
    } else {
        const requestOptions = Object.assign({}, options.requestOptions, {
            maxReconnects: 6,
            maxRetries: 3,
            backoff: { inc: 500, max: 10000 },
        });

        let shouldBeChunked = DL_CHUNK_SIZE !== 0 && (!format.hasAudio || !format.hasVideo);

        if (shouldBeChunked) {
            let start = (options.range && options.range.start) || 0;
            let end = start + DL_CHUNK_SIZE;
            const rangeEnd = options.range && options.range.end;

            contentLength = options.range ? (rangeEnd ? rangeEnd + 1 : parseInt(format.contentLength)) - start : parseInt(format.contentLength);

            const getNextChunk = () => {
                if (stream.destroyed) return;
                if (!rangeEnd && end >= contentLength) end = 0;
                if (rangeEnd && end > rangeEnd) end = rangeEnd;
                shouldEnd = !end || end === rangeEnd;

                requestOptions.headers = Object.assign({}, requestOptions.headers, {
                    Range: `bytes=${start}-${end || ''}`,
                });
                req = miniget(format.url, requestOptions as any);
                req.on('data', onData);
                req.on('end', () => {
                    if (stream.destroyed) return;
                    if (end && end !== rangeEnd) {
                        start = end + 1;
                        end += DL_CHUNK_SIZE;
                        getNextChunk();
                    }
                });
                pipeAndSetEvents(req, stream, shouldEnd);
            };
            getNextChunk();
        } else {
            // Audio only and video only formats don't support begin
            if (options.begin) {
                format.url += `&begin=${parseTimestamp(options.begin)}`;
            }

            if (options.range && (options.range.start || options.range.end)) {
                requestOptions.headers = Object.assign({}, requestOptions.headers, {
                    Range: `bytes=${options.range.start || '0'}-${options.range.end || ''}`,
                });
            }

            req = miniget(format.url, requestOptions as any);

            req.on('response', (res) => {
                if (stream.destroyed) return;
                contentLength = contentLength || parseInt(res.headers['content-length']);
            });

            req.on('data', onData);

            pipeAndSetEvents(req, stream, shouldEnd);
        }
    }

    stream._destroy = () => {
        stream.destroyed = true;
        if (req) {
            req.destroy();
            req.end();
        }
    };
}

function downloadFromInfo(info: YTDL_VideoInfo, options: YTDL_DownloadOptions = {}) {
    const STREAM = createStream(options);

    if (!info.full) {
        throw new Error('Cannot use `ytdl.downloadFromInfo()` when called with info from `ytdl.getBasicInfo()`');
    }

    setImmediate(() => {
        downloadFromInfoCallback(STREAM, info, options);
    });

    return STREAM;
}

function download(link: string, options: YTDL_DownloadOptions = {}) {
    const STREAM = createStream(options);

    getFullInfo(link, options).then((info) => {
        downloadFromInfoCallback(STREAM, info, options);
    }, STREAM.emit.bind(STREAM, 'error'));

    return STREAM;
}

/* Public CLass */
class YtdlCore {
    public static download = download;
    public static downloadFromInfo = downloadFromInfo;

    public static getBasicInfo = getBasicInfo;
    /** @deprecated */
    public static getInfo = getInfo;
    public static getFullInfo = getFullInfo;

    public static chooseFormat = chooseFormat;
    public static filterFormats = filterFormats;

    public static validateID = Url.validateID;
    public static validateURL = Url.validateURL;
    public static getURLVideoID = Url.getURLVideoID;
    public static getVideoID = Url.getVideoID;

    public static createAgent = createAgent;
    public static createProxyAgent = createProxyAgent;

    public static OAuth2 = OAuth2;

    /* Get Info Options */
    public lang: YTDL_Hreflang = 'en';
    public requestOptions: any = {};
    public rewriteRequest: YTDL_GetInfoOptions['rewriteRequest'];
    public agent: YTDL_Agent | undefined;
    public poToken: string | undefined;
    public disablePoTokenAutoGeneration: boolean = false;
    public visitorData: string | undefined;
    public includesPlayerAPIResponse: boolean = false;
    public includesNextAPIResponse: boolean = false;
    public includesOriginalFormatData: boolean = false;
    public includesRelatedVideo: boolean = true;
    public clients: Array<YTDL_ClientTypes> | undefined;
    public disableDefaultClients: boolean = false;
    public oauth2: OAuth2 | undefined;
    public parsesHLSFormat: boolean = false;
    public originalProxy: YTDL_GetInfoOptions['originalProxy'];

    /* Format Selection Options */
    public quality: YTDL_ChooseFormatOptions['quality'] | undefined;
    public filter: YTDL_ChooseFormatOptions['filter'] | undefined;
    public excludingClients: Array<YTDL_ClientTypes> = [];
    public includingClients: Array<YTDL_ClientTypes> | 'all' = 'all';

    /* Download Options */
    public range: YTDL_DownloadOptions['range'] | undefined;
    public begin: YTDL_DownloadOptions['begin'] | undefined;
    public liveBuffer: YTDL_DownloadOptions['liveBuffer'] | undefined;
    public highWaterMark: YTDL_DownloadOptions['highWaterMark'] | undefined;
    public IPv6Block: YTDL_DownloadOptions['IPv6Block'] | undefined;
    public dlChunkSize: YTDL_DownloadOptions['dlChunkSize'] | undefined;

    /* Metadata */
    public version = VERSION;

    /* Setup */
    private setPoToken(poToken?: string) {
        const PO_TOKEN_CACHE = FileCache.get<string>('poToken');

        if (poToken) {
            this.poToken = poToken;
        } else if (PO_TOKEN_CACHE) {
            Logger.debug('PoToken loaded from cache.');
            this.poToken = PO_TOKEN_CACHE || undefined;
        }

        FileCache.set('poToken', this.poToken || '', { ttl: 60 * 60 * 24 * 365 });
    }

    private setVisitorData(visitorData?: string) {
        const VISITOR_DATA_CACHE = FileCache.get<string>('visitorData');

        if (visitorData) {
            this.visitorData = visitorData;
        } else if (VISITOR_DATA_CACHE) {
            Logger.debug('VisitorData loaded from cache.');
            this.visitorData = VISITOR_DATA_CACHE || undefined;
        }

        FileCache.set('visitorData', this.visitorData || '', { ttl: 60 * 60 * 24 * 365 });
    }

    private setOAuth2(oauth2?: OAuth2) {
        const OAUTH2_CACHE = FileCache.get<YTDL_OAuth2Credentials>('oauth2') || undefined;

        try {
            this.oauth2 = oauth2 || new OAuth2(OAUTH2_CACHE) || undefined;
        } catch {
            this.oauth2 = undefined;
        }
    }

    private automaticallyGeneratePoToken() {
        if (!this.poToken && !this.visitorData) {
            Logger.info('Since PoToken and VisitorData are not specified, they are generated automatically.');

            PoToken.generatePoToken()
                .then(({ poToken, visitorData }) => {
                    this.poToken = poToken;
                    this.visitorData = visitorData;

                    FileCache.set('poToken', this.poToken || '', { ttl: 60 * 60 * 24 * 365 });
                    FileCache.set('visitorData', this.visitorData || '', { ttl: 60 * 60 * 24 * 365 });
                })
                .catch(() => {});
        }
    }

    private initializeHtml5PlayerCache() {
        const HTML5_PLAYER = FileCache.get<{ playerUrl: string }>('html5Player');

        if (!HTML5_PLAYER && !process.env._YTDL_DISABLE_HTML5_PLAYER_CACHE) {
            Logger.debug('To speed up processing, html5Player and signatureTimestamp are pre-fetched and cached.');
            getHtml5Player('dQw4w9WgXcQ', {});
        }
    }

    constructor({ lang, requestOptions, rewriteRequest, agent, poToken, disablePoTokenAutoGeneration, visitorData, includesPlayerAPIResponse, includesNextAPIResponse, includesOriginalFormatData, includesRelatedVideo, clients, disableDefaultClients, oauth2, parsesHLSFormat, originalProxyUrl, originalProxy, quality, filter, excludingClients, includingClients, range, begin, liveBuffer, highWaterMark, IPv6Block, dlChunkSize, debug, disableFileCache }: YTDL_Constructor = {}) {
        /* Other Options */
        process.env.YTDL_DEBUG = (debug ?? false).toString();
        process.env._YTDL_DISABLE_FILE_CACHE = (disableFileCache ?? false).toString();

        /* Get Info Options */
        this.lang = lang || 'en';
        this.requestOptions = requestOptions || {};
        this.rewriteRequest = rewriteRequest || undefined;
        this.agent = agent || undefined;
        this.disablePoTokenAutoGeneration = disablePoTokenAutoGeneration ?? false;
        this.includesPlayerAPIResponse = includesPlayerAPIResponse ?? false;
        this.includesNextAPIResponse = includesNextAPIResponse ?? false;
        this.includesOriginalFormatData = includesOriginalFormatData ?? false;
        this.includesRelatedVideo = includesRelatedVideo ?? true;
        this.clients = clients || undefined;
        this.disableDefaultClients = disableDefaultClients ?? false;
        this.parsesHLSFormat = parsesHLSFormat ?? false;

        this.originalProxy = originalProxy || undefined;
        if (originalProxyUrl && !originalProxy) {
            Logger.info('<warning>`originalProxyUrl` is deprecated.</warning> Use `originalProxy` instead.');

            if (!this.originalProxy) {
                try {
                    this.originalProxy = {
                        base: originalProxyUrl,
                        download: new URL(originalProxyUrl).origin + '/download',
                        urlQueryName: 'url',
                    };
                } catch {}
            }
        }
        if (this.originalProxy) {
            Logger.debug(`<debug>"${this.originalProxy.base}"</debug> is used for <blue>API requests</blue>.`);
            Logger.debug(`<debug>"${this.originalProxy.download}"</debug> is used for <blue>video downloads</blue>.`);
            Logger.debug(`The query name <debug>"${this.originalProxy.urlQueryName || 'url'}"</debug> is used to specify the URL in the request. <blue>(?url=...)</blue>`);
        }

        this.setPoToken(poToken);
        this.setVisitorData(visitorData);
        this.setOAuth2(oauth2);

        /* Format Selection Options */
        this.quality = quality || undefined;
        this.filter = filter || undefined;
        this.excludingClients = excludingClients || [];
        this.includingClients = includingClients || 'all';

        /* Download Options */
        this.range = range || undefined;
        this.begin = begin || undefined;
        this.liveBuffer = liveBuffer || undefined;
        this.highWaterMark = highWaterMark || undefined;
        this.IPv6Block = IPv6Block || undefined;
        this.dlChunkSize = dlChunkSize || undefined;

        if (!this.disablePoTokenAutoGeneration) {
            this.automaticallyGeneratePoToken();
        }
        this.initializeHtml5PlayerCache();

        /* Version Check */
        if (!isNodeVersionOk(process.version)) {
            throw new Error(`You are using Node.js ${process.version} which is not supported. Minimum version required is v16.`);
        }
    }

    private setupOptions(options: YTDL_DownloadOptions) {
        options.lang = options.lang || this.lang;
        options.requestOptions = options.requestOptions || this.requestOptions;
        options.rewriteRequest = options.rewriteRequest || this.rewriteRequest;
        options.agent = options.agent || this.agent;
        options.poToken = options.poToken || this.poToken;
        options.disablePoTokenAutoGeneration = options.disablePoTokenAutoGeneration || this.disablePoTokenAutoGeneration;
        options.visitorData = options.visitorData || this.visitorData;
        options.includesPlayerAPIResponse = options.includesPlayerAPIResponse || this.includesPlayerAPIResponse;
        options.includesNextAPIResponse = options.includesNextAPIResponse || this.includesNextAPIResponse;
        options.includesOriginalFormatData = options.includesOriginalFormatData || this.includesOriginalFormatData;
        options.includesRelatedVideo = options.includesRelatedVideo || this.includesRelatedVideo;
        options.clients = options.clients || this.clients;
        options.disableDefaultClients = options.disableDefaultClients || this.disableDefaultClients;
        options.oauth2 = options.oauth2 || this.oauth2;
        options.parsesHLSFormat = options.parsesHLSFormat || this.parsesHLSFormat;
        options.originalProxy = options.originalProxy || this.originalProxy || undefined;

        if (options.originalProxyUrl && !options.originalProxy) {
            Logger.info('<warning>originalProxyUrl is deprecated.</warning> Use `originalProxy` instead.');

            try {
                options.originalProxy = {
                    base: options.originalProxyUrl,
                    download: new URL(options.originalProxyUrl).origin + '/download',
                    urlQueryName: 'url',
                };
            } catch {}
        }

        /* Format Selection Options */
        options.quality = options.quality || this.quality || undefined;
        options.filter = options.filter || this.filter || undefined;
        options.excludingClients = options.excludingClients || this.excludingClients || [];
        options.includingClients = options.includingClients || this.includingClients || 'all';

        /* Download Options */
        options.range = options.range || this.range || undefined;
        options.begin = options.begin || this.begin || undefined;
        options.liveBuffer = options.liveBuffer || this.liveBuffer || undefined;
        options.highWaterMark = options.highWaterMark || this.highWaterMark || undefined;
        options.IPv6Block = options.IPv6Block || this.IPv6Block || undefined;
        options.dlChunkSize = options.dlChunkSize || this.dlChunkSize || undefined;

        if (!this.oauth2 && options.oauth2) {
            Logger.warning('The OAuth2 token should be specified when instantiating the YtdlCore class, not as a function argument.');
        }

        return options;
    }

    public download(link: string, options: YTDL_DownloadOptions = {}) {
        return download(link, this.setupOptions(options));
    }
    public downloadFromInfo(info: YTDL_VideoInfo, options: YTDL_DownloadOptions = {}) {
        return downloadFromInfo(info, this.setupOptions(options));
    }

    /** TIP: The options specified in new YtdlCore() are applied by default. (The function arguments specified will take precedence.) */
    public getBasicInfo(link: string, options: YTDL_DownloadOptions = {}) {
        return getBasicInfo(link, this.setupOptions(options));
    }
    /** TIP: The options specified in new YtdlCore() are applied by default. (The function arguments specified will take precedence.)
     * @deprecated
     */
    public getInfo(link: string, options: YTDL_DownloadOptions = {}) {
        return getInfo(link, this.setupOptions(options));
    }
    /** TIP: The options specified in new YtdlCore() are applied by default. (The function arguments specified will take precedence.) */
    public getFullInfo(link: string, options: YTDL_DownloadOptions = {}) {
        return getFullInfo(link, this.setupOptions(options));
    }
}

module.exports.YtdlCore = YtdlCore;
export { YtdlCore };
