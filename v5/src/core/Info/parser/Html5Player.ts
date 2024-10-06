type Html5PlayerInfo = { playerUrl: string | null; path: string | null; signatureTimestamp: string };

import type { YTDL_GetInfoOptions } from '@/types/Options';
import Url from '@/utils/Url';
import YouTubePageExtractor from './PageExtractor';
import { FileCache } from '@/core/Cache';
import { getSignatureTimestamp } from '@/core/Signature';
import { Logger } from '@/utils/Log';
import Fetcher from '@/core/Fetcher';

function getPlayerPathFromBody(body: string): string | null {
    const HTML5_PLAYER_RES = /<script\s+src="([^"]+)"(?:\s+type="text\/javascript")?\s+name="player_ias\/base"\s*>|"jsUrl":"([^"]+)"/.exec(body);

    return HTML5_PLAYER_RES ? HTML5_PLAYER_RES[1] || HTML5_PLAYER_RES[2] : null;
}

async function getPlayerPath(id: string, options: YTDL_GetInfoOptions): Promise<string | null> {
    const WATCH_PAGE_BODY_PROMISE = YouTubePageExtractor.getWatchPageBody(id, options),
        WATCH_PAGE_BODY = await WATCH_PAGE_BODY_PROMISE,
        PLAYER_PATH = getPlayerPathFromBody(WATCH_PAGE_BODY) || getPlayerPathFromBody(await YouTubePageExtractor.getEmbedPageBody(id, options));

    return PLAYER_PATH;
}

export default async function getHtml5Player(id: string, options: YTDL_GetInfoOptions): Promise<Html5PlayerInfo> {
    const CACHE = FileCache.get<Html5PlayerInfo>('html5Player');

    if (CACHE) {
        return {
            playerUrl: CACHE.playerUrl,
            path: CACHE.path,
            signatureTimestamp: CACHE.signatureTimestamp,
        };
    }

    const PLAYER_PATH = await getPlayerPath(id, options);

    let playerUrl = PLAYER_PATH ? new URL(PLAYER_PATH, Url.getBaseUrl()).toString() : null;

    if (!playerUrl && (options.originalProxy || options.originalProxyUrl)) {
        Logger.debug('Could not get html5Player using your own proxy. It is retrieved again with its own proxy disabled. (Other requests will not invalidate it.)');

        const PATH = await getPlayerPath(id, {
            ...options,
            originalProxy: undefined,
            originalProxyUrl: undefined,
        });

        playerUrl = PATH ? new URL(PATH, Url.getBaseUrl()).toString() : null;
    }

    const HTML5_PLAYER_BODY = playerUrl ? await Fetcher.request<string>(playerUrl, options) : '',
        DATA = {
            playerUrl,
            path: PLAYER_PATH,
            signatureTimestamp: playerUrl ? (await getSignatureTimestamp(HTML5_PLAYER_BODY)) || '' : '',
            playerBody: HTML5_PLAYER_BODY || null,
        };

    FileCache.set('html5Player', JSON.stringify(DATA));

    return DATA;
}
