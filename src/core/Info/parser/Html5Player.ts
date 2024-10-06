type Html5PlayerInfo = { url: string; body: string | null; id: string; signatureTimestamp: string };

import type { YTDL_GetInfoOptions } from '@/types/Options';

import { Platform } from '@/platforms/Platform';

import { Signature } from '@/core/Signature';
import { Fetcher } from '@/core/Fetcher';

import { Url } from '@/utils/Url';
import { CURRENT_PLAYER_ID } from '@/utils/Constants';

const SHIM = Platform.getShim(),
    GITHUB_API_BASE_URL = `https://api.github.com/repos/${SHIM.info.repo.user}/${SHIM.info.repo.name}/contents/data/player`,
    FileCache = SHIM.fileCache;

function getPlayerId(body?: string): string | null {
    if (!body) {
        return null;
    }

    const MATCH = body.match(/player\\\/([a-zA-Z0-9]+)\\\//);

    if (MATCH) {
        return MATCH[1];
    }

    return null;
}

async function getHtml5Player(options: YTDL_GetInfoOptions): Promise<Html5PlayerInfo> {
    const CACHE = await FileCache.get<Html5PlayerInfo>('html5Player');

    if (CACHE && CACHE.url) {
        return {
            url: CACHE.url,
            body: CACHE.body,
            id: CACHE.id,
            signatureTimestamp: CACHE.signatureTimestamp,
        };
    }

    let playerId = undefined,
        signatureTimestamp = undefined;

    try {
        const IFRAME_API_BODY = await Fetcher.request<string>(Url.getIframeApiUrl(), options);
        playerId = getPlayerId(IFRAME_API_BODY);
    } catch {}

    if (!playerId) {
        try {
            const GITHUB_PLAYER_JSON = await Fetcher.request<{ playerId: string; signatureTimestamp: string }>(GITHUB_API_BASE_URL + '/data.json?ref=dev');
            playerId = GITHUB_PLAYER_JSON.playerId;
            signatureTimestamp = GITHUB_PLAYER_JSON.signatureTimestamp;
        } catch {}
    }

    if (!playerId) {
        playerId = CURRENT_PLAYER_ID;
    }

    const PLAYER_URL = Url.getPlayerJsUrl(playerId),
        HTML5_PLAYER_BODY = (PLAYER_URL ? await Fetcher.request<string>(PLAYER_URL, options) : '') || (await Fetcher.request<string>(GITHUB_API_BASE_URL + '/base.js?ref=dev')),
        DATA = {
            url: PLAYER_URL,
            body: HTML5_PLAYER_BODY || null,
            id: playerId,
            signatureTimestamp: signatureTimestamp || (PLAYER_URL ? Signature.getSignatureTimestamp(HTML5_PLAYER_BODY) || '' : ''),
        };

    FileCache.set('html5Player', JSON.stringify(DATA));

    return DATA;
}

export { getHtml5Player };
