import { YTDL_GetInfoOptions } from '@/types/Options';
import { YT_StreamingAdaptiveFormat } from '@/types/youtube';
import { YTDL_VideoDetailsAdditions, YTDL_VideoInfo } from '@/types/Ytdl';

import { Cache } from '@/core/Cache';
import PoToken from '@/core/PoToken';
import { OAuth2 } from '@/core/OAuth2';

import { YTDL_ClientTypes } from '@/meta/Clients';

import { Logger } from '@/utils/Log';
import Url from '@/utils/Url';
import { VERSION } from '@/utils/constants';
import utils from '@/utils/Utils';
import DownloadOptionsUtils from '@/utils/DownloadOptions';

import getHtml5Player from './parser/Html5Player';
import Formats from './parser/Formats';
import PlayerApi from './apis/Player';
import NextApi from './apis/Next';
import InfoExtras from './Extras';

/* Private Constants */
const AGE_RESTRICTED_URLS = ['support.google.com/youtube/?p=age_restrictions', 'youtube.com/t/community_guidelines'],
    SUPPORTED_CLIENTS = ['web', 'webCreator', 'webEmbedded', 'ios', 'android', 'mweb', 'tv', 'tvEmbedded'],
    BASE_CLIENTS: Array<YTDL_ClientTypes> = ['web', 'webCreator', 'tvEmbedded', 'ios', 'android'],
    BASIC_INFO_CACHE = new Cache();

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

/* Public Functions */

/** Gets info from a video without getting additional formats. */
async function _getBasicInfo(id: string, options: YTDL_GetInfoOptions, isFromGetInfo?: boolean): Promise<YTDL_VideoInfo> {
    process.env._YTDL_DISABLE_FILE_CACHE = options.disableFileCache?.toString() || 'false';

    DownloadOptionsUtils.applyIPv6Rotations(options);
    DownloadOptionsUtils.applyDefaultHeaders(options);
    DownloadOptionsUtils.applyDefaultAgent(options);
    DownloadOptionsUtils.applyOldLocalAddress(options);

    options.requestOptions = options.requestOptions || {};

    const { jar, dispatcher } = options.agent || {};

    utils.setPropInsensitive(options.requestOptions?.headers, 'cookie', jar?.getCookieStringSync('https://www.youtube.com'));
    options.requestOptions.dispatcher = options.requestOptions.dispatcher || dispatcher;

    const HTML5_PLAYER_PROMISE = getHtml5Player(id, options);

    if (options.oauth2 && options.oauth2 instanceof OAuth2 && options.oauth2.shouldRefreshToken()) {
        Logger.info('The specified OAuth2 token has expired and will be renewed automatically.');
        await options.oauth2.refreshAccessToken();
    }

    if (!options.poToken && !options.disablePoTokenAutoGeneration) {
        Logger.warning('Specify poToken for stable and fast operation. See README for details.');
        Logger.info('Automatically generates poToken, but stable operation cannot be guaranteed.');

        const { poToken, visitorData } = await PoToken.generatePoToken();
        options.poToken = poToken;
        options.visitorData = visitorData;
    }

    if (options.poToken && !options.visitorData) {
        Logger.warning('If you specify a poToken, you must also specify the visitorData.');
    }

    options.clients = setupClients(options.clients || BASE_CLIENTS, options.disableDefaultClients ?? false);

    const HTML5_PLAYER_RESPONSE = await HTML5_PLAYER_PROMISE,
        HTML5_PLAYER_URL = HTML5_PLAYER_RESPONSE.playerUrl;

    if (!HTML5_PLAYER_URL) {
        throw new Error('Unable to find html5player file');
    }

    const SIGNATURE_TIMESTAMP = parseInt(HTML5_PLAYER_RESPONSE.signatureTimestamp || ''),
        PLAYER_API_PARAMS = {
            videoId: id,
            signatureTimestamp: SIGNATURE_TIMESTAMP,
            options,
        },
        PLAYER_API_PROMISE = PlayerApi.getApiResponses(PLAYER_API_PARAMS, options.clients),
        NEXT_API_PROMISE = NextApi.getApiResponses(PLAYER_API_PARAMS),
        { isMinimalMode, responses: PLAYER_RESPONSES } = await PLAYER_API_PROMISE,
        NEXT_RESPONSES = await NEXT_API_PROMISE,
        PLAYER_RESPONSE_ARRAY = Object.values(PLAYER_RESPONSES) || [],
        VIDEO_INFO: YTDL_VideoInfo = {
            videoDetails: {},
            relatedVideos: [],
            formats: [],
            full: false,
            _metadata: {
                html5Player: null,
                clients: options.clients,
                isMinimumMode: false,
                id,
                options,
            },
            _ytdl: {
                version: VERSION,
            },
        } as any;

    VIDEO_INFO._metadata.isMinimumMode = isMinimalMode;
    VIDEO_INFO._metadata.html5Player = HTML5_PLAYER_URL;

    if (options.includesPlayerAPIResponse || isFromGetInfo) {
        VIDEO_INFO._playerApiResponses = PLAYER_RESPONSES;
    }

    if (options.includesNextAPIResponse || isFromGetInfo) {
        VIDEO_INFO._nextApiResponses = NEXT_RESPONSES;
    }

    /* Filtered */
    const INCLUDE_STORYBOARDS = PLAYER_RESPONSE_ARRAY.filter((p) => p?.storyboards)[0],
        VIDEO_DETAILS = (PLAYER_RESPONSE_ARRAY.filter((p) => p?.videoDetails)[0]?.videoDetails as any) || {},
        MICROFORMAT = PLAYER_RESPONSE_ARRAY.filter((p) => p?.microformat)[0]?.microformat || null;

    VIDEO_DETAILS.liveBroadcastDetails = PLAYER_RESPONSES.web?.microformat?.playerMicroformatRenderer.liveBroadcastDetails || undefined;

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
        },
        FORMATS = PLAYER_RESPONSE_ARRAY.reduce((items: Array<YT_StreamingAdaptiveFormat>, playerResponse) => {
            return [...items, ...Formats.parseFormats(playerResponse)];
        }, []) as any;

    VIDEO_INFO.videoDetails = InfoExtras.cleanVideoDetails(Object.assign({}, VIDEO_DETAILS, ADDITIONAL_DATA), MICROFORMAT?.playerMicroformatRenderer || null, options.lang);

    VIDEO_INFO.relatedVideos = options.includesRelatedVideo ? InfoExtras.getRelatedVideos(NEXT_RESPONSES.web, options.lang || 'en') : [];
    VIDEO_INFO.formats = isFromGetInfo ? FORMATS : [];

    return VIDEO_INFO;
}

async function getBasicInfo(link: string, options: YTDL_GetInfoOptions = {}): Promise<YTDL_VideoInfo> {
    utils.checkForUpdates();
    const ID = Url.getVideoID(link),
        CACHE_KEY = ['getBasicInfo', ID, options.lang].join('-');

    return BASIC_INFO_CACHE.getOrSet(CACHE_KEY, () => _getBasicInfo(ID, options)) as Promise<YTDL_VideoInfo>;
}

export { _getBasicInfo };
export default getBasicInfo;
