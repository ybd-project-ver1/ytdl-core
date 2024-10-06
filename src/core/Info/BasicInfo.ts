import { YT_PlayerApiResponse, YT_StreamingAdaptiveFormat, YT_VideoDetails, YTDL_ClientTypes, YTDL_VideoDetailsAdditions, YTDL_VideoInfo } from '@/types';
import { InternalDownloadOptions } from '@/core/types';

import { OAuth2 } from '@/core/OAuth2';

import { Platform } from '@/platforms/Platform';

import { Logger } from '@/utils/Log';
import Utils from '@/utils/Utils';
import { Url } from '@/utils/Url';

import { getHtml5Player } from './parser/Html5Player';
import { FormatParser } from './parser/Formats';
import PlayerApi from './apis/Player';
import NextApi from './apis/Next';
import InfoExtras from './Extras';
import { UnrecoverableError } from '../errors';

/* Private Constants */
const AGE_RESTRICTED_URLS = ['support.google.com/youtube/?p=age_restrictions', 'youtube.com/t/community_guidelines'],
    SUPPORTED_CLIENTS = ['web', 'webCreator', 'webEmbedded', 'ios', 'android', 'mweb', 'tv', 'tvEmbedded'],
    BASE_CLIENTS: Array<YTDL_ClientTypes> = ['web', 'webCreator', 'tvEmbedded', 'ios', 'android'],
    _SHIM = Platform.getShim(),
    CACHE = _SHIM.cache,
    BASE_INFO: YTDL_VideoInfo = {
        videoDetails: {
            videoUrl: '',
            videoId: '',
            playabilityStatus: 'UNKNOWN',
            title: '',
            author: null,
            lengthSeconds: 0,
            viewCount: 0,
            likes: null,
            media: null,
            storyboards: [],
            chapters: [],
            thumbnails: [],
            description: null,
            keywords: [],
            channelId: '',
            ageRestricted: false,
            allowRatings: false,
            isOwnerViewing: false,
            isCrawlable: false,
            isPrivate: false,
            isUnpluggedCorpus: false,
            isLiveContent: false,
            isUpcoming: false,
            isLowLatencyLiveStream: false,
            liveBroadcastDetails: {
                isLiveNow: false,
                startTimestamp: '',
            },
            published: null,
            publishDate: null,
            latencyClass: null,
        },
        relatedVideos: [],
        formats: [],
        full: false,
        _metadata: {
            isMinimumMode: false,
            clients: [],
            html5PlayerUrl: '',
            id: '',
            options: {},
        },
        _ytdl: {
            version: _SHIM.info.version,
        },
    },
    BASE_INFO_STRING: string = JSON.stringify(BASE_INFO);

/* ----------- */

/* Private Functions */
function setupClients(clients: Array<YTDL_ClientTypes>, disableDefaultClients: boolean): Array<YTDL_ClientTypes> {
    if (clients && clients.length === 0) {
        Logger.warning('At least one client must be specified.');
        clients = BASE_CLIENTS;
    }

    clients = clients.filter((client) => SUPPORTED_CLIENTS.includes(client));

    if (disableDefaultClients) {
        return clients;
    }

    return [...new Set([...BASE_CLIENTS, ...clients])];
}

/* ----------- */

async function _getBasicInfo(id: string, options: InternalDownloadOptions, isFromGetInfo: boolean): Promise<YTDL_VideoInfo> {
    const SHIM = Platform.getShim(),
        HTML5_PLAYER_PROMISE = getHtml5Player(options);

    if (options.oauth2 && options.oauth2 instanceof OAuth2 && options.oauth2.shouldRefreshToken()) {
        Logger.info('The specified OAuth2 token has expired and will be renewed automatically.');
        await options.oauth2.refreshAccessToken();
    }

    if (!options.poToken && !options.disablePoTokenAutoGeneration) {
        Logger.warning('Specify poToken for stable and fast operation. See README for details.');
        Logger.info('Automatically generates poToken, but stable operation cannot be guaranteed.');

        const { poToken, visitorData } = await SHIM.poToken();
        options.poToken = poToken;
        options.visitorData = visitorData;
    }

    if (options.poToken && !options.visitorData) {
        Logger.warning('If you specify a poToken, you must also specify the visitorData.');
    }

    options.clients = setupClients(options.clients || BASE_CLIENTS, options.disableDefaultClients ?? false);

    const HTML5_PLAYER_RESPONSE = await HTML5_PLAYER_PROMISE,
        HTML5_PLAYER_URL = HTML5_PLAYER_RESPONSE.url;

    if (!HTML5_PLAYER_URL) {
        throw new UnrecoverableError(`HTML5Player was not found, please report it via Issues (${SHIM.info.issuesUrl}).`);
    }

    /* Initialization */
    const SIGNATURE_TIMESTAMP = parseInt(HTML5_PLAYER_RESPONSE.signatureTimestamp || '0') || 0,
        PLAYER_API_PARAMS = {
            videoId: id,
            signatureTimestamp: SIGNATURE_TIMESTAMP,
            options,
        },
        VIDEO_INFO: YTDL_VideoInfo = JSON.parse(BASE_INFO_STRING);

    /* Request */
    const PROMISES = {
            playerApiRequest: PlayerApi.getApiResponses(PLAYER_API_PARAMS, options.clients),
            nextApiRequest: NextApi.getApiResponses(PLAYER_API_PARAMS),
        },
        { isMinimalMode, responses: PLAYER_RESPONSES } = await PROMISES.playerApiRequest,
        NEXT_RESPONSES = await PROMISES.nextApiRequest,
        PLAYER_RESPONSE_LIST = Object.values(PLAYER_RESPONSES) || [];

    VIDEO_INFO._metadata.isMinimumMode = isMinimalMode;
    VIDEO_INFO._metadata.html5PlayerUrl = HTML5_PLAYER_URL;
    VIDEO_INFO._metadata.clients = options.clients;
    VIDEO_INFO._metadata.options = options;
    VIDEO_INFO._metadata.id = id;

    if (options.includesPlayerAPIResponse || isFromGetInfo) {
        VIDEO_INFO._playerApiResponses = PLAYER_RESPONSES;
    }

    if (options.includesNextAPIResponse || isFromGetInfo) {
        VIDEO_INFO._nextApiResponses = NEXT_RESPONSES;
    }

    /** Filter out null values */
    function getValue<T = unknown>(array: Array<any>, name: string, value?: string): T {
        return array.filter((v) => v && v[name] && (value ? v[name] === value : true))[0] as T;
    }

    const INCLUDE_STORYBOARDS = getValue<YT_PlayerApiResponse>(PLAYER_RESPONSE_LIST, 'storyboards'),
        VIDEO_DETAILS = (getValue<YT_PlayerApiResponse>(PLAYER_RESPONSE_LIST, 'videoDetails').videoDetails as YT_VideoDetails) || {},
        MICROFORMAT = getValue<YT_PlayerApiResponse>(PLAYER_RESPONSE_LIST, 'microformat').microformat || null,
        LIVE_BROADCAST_DETAILS = PLAYER_RESPONSES.web?.microformat?.playerMicroformatRenderer.liveBroadcastDetails || null;

    /* Data Processing */
    const STORYBOARDS = InfoExtras.getStoryboards(INCLUDE_STORYBOARDS),
        MEDIA = InfoExtras.getMedia(PLAYER_RESPONSES.web) || InfoExtras.getMedia(PLAYER_RESPONSES.webCreator) || InfoExtras.getMedia(PLAYER_RESPONSES.ios) || InfoExtras.getMedia(PLAYER_RESPONSES.android) || InfoExtras.getMedia(PLAYER_RESPONSES.webEmbedded) || InfoExtras.getMedia(PLAYER_RESPONSES.tvEmbedded) || InfoExtras.getMedia(PLAYER_RESPONSES.mweb) || InfoExtras.getMedia(PLAYER_RESPONSES.tv),
        AGE_RESTRICTED = !!MEDIA && AGE_RESTRICTED_URLS.some((url) => Object.values(MEDIA || {}).some((v) => typeof v === 'string' && v.includes(url))),
        ADDITIONAL_DATA: YTDL_VideoDetailsAdditions = {
            videoUrl: Url.getWatchPageUrl(id),
            author: InfoExtras.getAuthor(NEXT_RESPONSES.web),
            media: MEDIA,
            likes: InfoExtras.getLikes(NEXT_RESPONSES.web),
            ageRestricted: AGE_RESTRICTED,
            storyboards: STORYBOARDS,
            chapters: InfoExtras.getChapters(NEXT_RESPONSES.web),
            thumbnails: [],
            description: '',
        },
        FORMATS = PLAYER_RESPONSE_LIST.reduce((items: Array<YT_StreamingAdaptiveFormat>, playerResponse) => {
            return [...items, ...FormatParser.parseFormats(playerResponse)];
        }, []);

    VIDEO_INFO.videoDetails = InfoExtras.cleanVideoDetails(Object.assign(VIDEO_INFO.videoDetails, VIDEO_DETAILS, ADDITIONAL_DATA), MICROFORMAT?.playerMicroformatRenderer || null, options.hl);
    VIDEO_INFO.videoDetails.playabilityStatus = getValue<YT_PlayerApiResponse>(PLAYER_RESPONSE_LIST, 'playabilityStatus', 'OK')?.playabilityStatus.status || PLAYER_RESPONSE_LIST[0]?.playabilityStatus.status || 'UNKNOWN';
    VIDEO_INFO.videoDetails.liveBroadcastDetails = LIVE_BROADCAST_DETAILS;

    VIDEO_INFO.relatedVideos = options.includesRelatedVideo ? InfoExtras.getRelatedVideos(NEXT_RESPONSES.web) : [];
    VIDEO_INFO.formats = isFromGetInfo ? (FORMATS as any) : [];

    return VIDEO_INFO;
}

async function getBasicInfo(link: string, options: InternalDownloadOptions): Promise<YTDL_VideoInfo> {
    Utils.checkForUpdates();

    const ID = Url.getVideoID(link) || (Url.validateID(link) ? link : null);

    if (!ID) {
        throw new Error('The URL specified is not a valid URL.');
    }

    const CACHE_KEY = ['getBasicInfo', ID, options.hl, options.gl].join('-');

    if (await CACHE.has(CACHE_KEY)) {
        return CACHE.get(CACHE_KEY) as Promise<YTDL_VideoInfo>;
    }

    const RESULTS = await _getBasicInfo(ID, options, false);

    CACHE.set(CACHE_KEY, RESULTS, {
        ttl: 60 * 30, //30Min
    });

    return RESULTS;
}

export { _getBasicInfo, getBasicInfo };
