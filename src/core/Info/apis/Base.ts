import type { YT_NextApiResponse, YT_PlayerApiResponse, YTDL_InnertubeResponseInfo, YTDL_ClientTypes } from '@/types';
import { Logger } from '@/utils/Log';

export default class ApiBase {
    static checkResponse<T = YT_PlayerApiResponse>(res: PromiseSettledResult<YTDL_InnertubeResponseInfo<YT_PlayerApiResponse | YT_NextApiResponse> | null>, client: YTDL_ClientTypes | 'next'): YTDL_InnertubeResponseInfo<T> | null {
        try {
            if (res.status === 'fulfilled') {
                if (res.value === null) {
                    return null;
                }

                Logger.debug(`[ ${client} ]: <success>Success</success>`);

                return Object.assign({}, res.value) as YTDL_InnertubeResponseInfo<T>;
            } else {
                const REASON = (res.reason as YTDL_InnertubeResponseInfo<T>) || {};
                Logger.debug(`[ ${client} ]: <error>Error</error>\nReason: <error>${REASON.error?.message || REASON.error?.toString()}</error>`);

                return REASON;
            }
        } catch (err) {
            return ((res as any) || {})?.reason as YTDL_InnertubeResponseInfo<T>;
        }
    }
}
