import { YTDL_GetInfoOptions } from '@/types/Options';
import { YT_PlayerApiResponse, YT_StreamingAdaptiveFormat } from '@/types/youtube';
import { YTDL_VideoInfo } from '@/types/Ytdl';

import { Cache } from '@/core/Cache';
import sig from '@/core/Signature';

import Url from '@/utils/Url';
import { Logger } from '@/utils/Log';
import utils from '@/utils/Utils';
import downloadOptionsUtils from '@/utils/DownloadOptions';
import formatUtils from '@/utils/Format';

import { _getBasicInfo } from './BasicInfo';
import Formats from './parser/Formats';

const CACHE = new Cache();

/* Public Functions */

/** Gets info from a video additional formats and deciphered Url. */
async function _getFullInfo(id: string, options: YTDL_GetInfoOptions): Promise<YTDL_VideoInfo> {
    downloadOptionsUtils.applyIPv6Rotations(options);
    downloadOptionsUtils.applyDefaultHeaders(options);
    downloadOptionsUtils.applyDefaultAgent(options);
    downloadOptionsUtils.applyOldLocalAddress(options);

    const INFO: YTDL_VideoInfo = await _getBasicInfo(id, options, true),
        FUNCTIONS = [];

    try {
        const FORMATS = INFO.formats as any as Array<YT_PlayerApiResponse>;

        FUNCTIONS.push(sig.decipherFormats(FORMATS, INFO._metadata.html5Player, options));
        if (options.parsesHLSFormat && INFO._playerApiResponses?.ios) {
            FUNCTIONS.push(...Formats.parseAdditionalManifests(INFO._playerApiResponses.ios, options));
        }
    } catch (err) {}

    const RESULTS: Array<YT_StreamingAdaptiveFormat> = Object.values(Object.assign({}, ...(await Promise.all(FUNCTIONS))));

    INFO.formats = RESULTS.map((format) => formatUtils.addFormatMeta(format, options.includesOriginalFormatData ?? false));
    INFO.formats.sort(formatUtils.sortFormats);

    INFO.full = true;

    if (!options.includesPlayerAPIResponse) {
        delete INFO._playerApiResponses;
    }

    if (!options.includesNextAPIResponse) {
        delete INFO._nextApiResponses;
    }

    return INFO;
}

/** @deprecated */
async function getInfo(link: string, options: YTDL_GetInfoOptions = {}): Promise<YTDL_VideoInfo> {
    Logger.warning('`getInfo` is deprecated and will be removed in the next major version. Please use `getFullInfo` instead.');
    utils.checkForUpdates();
    const ID = Url.getVideoID(link),
        CACHE_KEY = ['getFullInfo', ID, options.lang].join('-');

    return CACHE.getOrSet(CACHE_KEY, () => _getFullInfo(ID, options)) as Promise<YTDL_VideoInfo>;
}

async function getFullInfo(link: string, options: YTDL_GetInfoOptions = {}): Promise<YTDL_VideoInfo> {
    utils.checkForUpdates();
    const ID = Url.getVideoID(link),
        CACHE_KEY = ['getFullInfo', ID, options.lang].join('-');

    return CACHE.getOrSet(CACHE_KEY, () => _getFullInfo(ID, options)) as Promise<YTDL_VideoInfo>;
}

export { getInfo };
export default getFullInfo;
