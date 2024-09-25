import { Clients, YTDL_ClientsParams } from '@/utils/Clients';
import Base from './Base';

export default class Tv {
    static async getPlayerResponse(params: YTDL_ClientsParams) {
        const { url, payload, headers } = Clients.tv(params);

        return await Base.request(url, { payload, headers }, params);
    }
}
