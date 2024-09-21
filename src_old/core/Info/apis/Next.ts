type NextApiResponses = {
    web: YT_NextApiResponse | null;
};

import { YT_NextApiResponse } from '@/types/youtube';

import { Web } from '@/core/clients';

import { YTDL_ClientsParams } from '@/meta/Clients';

import ApiBase from './Base';

export default class NextApi {
    static async getApiResponses(nextApiParams: YTDL_ClientsParams): Promise<NextApiResponses> {
        const NEXT_API_PROMISE = {
                web: Web.getNextResponse(nextApiParams),
            },
            NEXT_API_PROMISES = await Promise.allSettled(Object.values(NEXT_API_PROMISE)),
            NEXT_API_RESPONSES: NextApiResponses = {
                web: ApiBase.checkResponse<YT_NextApiResponse>(NEXT_API_PROMISES[0], 'web')?.contents || null,
            };

        return NEXT_API_RESPONSES;
    }
}
