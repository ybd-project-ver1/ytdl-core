type Html5PlayerInfo = { playerUrl: string | null; signatureTimestamp: string };

import type { YTDL_GetInfoOptions } from '@/types/Options';
import { Platform } from '@/platforms/Platform';
import { Signature } from '@/core/Signature';
import { Fetcher } from '@/core/Fetcher';
import { Url } from '@/utils/Url';
import { Logger } from '@/utils/Log';

const FileCache = Platform.getShim().fileCache;

function getPlayerId(body: string): string | null {
    const MATCH = body.match(/player\/([a-zA-Z0-9]+)\//);

    if (MATCH) {
        return MATCH[1];
    }

    return null;
}

async function getHtml5Player(options: YTDL_GetInfoOptions): Promise<Html5PlayerInfo> {
    const CACHE = await FileCache.get<Html5PlayerInfo>('html5Player');

    if (CACHE) {
        return {
            playerUrl: CACHE.playerUrl,
            signatureTimestamp: CACHE.signatureTimestamp,
        };
    }

    const PLAYER_BODY = await Fetcher.request<string>(Url.getIframeApiUrl(), options),
        PLAYER_ID = getPlayerId(PLAYER_BODY);

    let playerUrl = PLAYER_ID ? Url.getPlayerJsUrl(PLAYER_ID) : null;

    if (!playerUrl && options.originalProxy) {
        Logger.debug('Could not get html5Player using your own proxy. It is retrieved again with its own proxy disabled. (Other requests will not invalidate it.)');

        const BODY = await Fetcher.request<string>(Url.getIframeApiUrl(), {
                ...options,
                rewriteRequest: undefined,
                originalProxy: undefined,
            }),
            PLAYER_ID = getPlayerId(BODY);

        playerUrl = PLAYER_ID ? Url.getPlayerJsUrl(PLAYER_ID) : null;
    }

    const HTML5_PLAYER_BODY = playerUrl ? await Fetcher.request<string>(playerUrl, options) : '',
        DATA = {
            playerUrl,
            signatureTimestamp: playerUrl ? Signature.getSignatureTimestamp(HTML5_PLAYER_BODY) || '' : '',
            playerBody: HTML5_PLAYER_BODY || null,
        };

    FileCache.set('html5Player', JSON.stringify(DATA));

    return DATA;
}

export { getHtml5Player };
