import { InternalDownloadOptions } from '@/core/types';
import { YT_PlayerApiResponse, YT_StreamingAdaptiveFormat, YTDL_VideoInfo } from '@/types';

import { Signature } from '@/core/Signature';

import { Platform } from '@/platforms/Platform';

import Utils from '@/utils/Utils';
import { Url } from '@/utils/Url';
import { FormatUtils } from '@/utils/Format';

import { FormatParser } from './parser/Formats';
import { _getBasicInfo } from './BasicInfo';

/* Private Constants */
const CACHE = Platform.getShim().cache,
    SIGNATURE = new Signature();

async function _getFullInfo(id: string, options: InternalDownloadOptions): Promise<YTDL_VideoInfo> {
    const INFO: YTDL_VideoInfo = await _getBasicInfo(id, options, true),
        FUNCTIONS = [];

    try {
        const FORMATS = INFO.formats as unknown as Array<YT_StreamingAdaptiveFormat>;

        FUNCTIONS.push(SIGNATURE.decipherFormats(FORMATS));
        if (options.parsesHLSFormat && INFO._playerApiResponses?.ios) {
            FUNCTIONS.push(...FormatParser.parseAdditionalManifests(INFO._playerApiResponses.ios, options));
        }
    } catch {}

    const RESULTS: Array<YT_StreamingAdaptiveFormat> = Object.values(Object.assign({}, ...(await Promise.all(FUNCTIONS))));

    INFO.formats = RESULTS.map((format) => FormatUtils.addFormatMeta(format, options.includesOriginalFormatData ?? false));
    INFO.formats.sort(FormatUtils.sortFormats);

    INFO.full = true;

    if (!options.includesPlayerAPIResponse) {
        delete INFO._playerApiResponses;
    }

    if (!options.includesNextAPIResponse) {
        delete INFO._nextApiResponses;
    }

    return INFO;
}

async function getFullInfo(link: string, options: InternalDownloadOptions): Promise<YTDL_VideoInfo> {
    Utils.checkForUpdates();

    const ID = Url.getVideoID(link) || (Url.validateID(link) ? link : null);

    if (!ID) {
        throw new Error('The URL specified is not a valid URL.');
    }

    const CACHE_KEY = ['getFullInfo', ID, options.hl, options.gl].join('-');

    if (await CACHE.has(CACHE_KEY)) {
        return CACHE.get(CACHE_KEY) as Promise<YTDL_VideoInfo>;
    }

    const RESULTS = await _getFullInfo(ID, options);

    CACHE.set(CACHE_KEY, RESULTS, {
        ttl: 60 * 30, //30Min
    });

    return RESULTS;
}

export { getFullInfo };
