import { YTDL_GetInfoOptions } from './Options';

export type YTDL_ClientTypes = 'web' | 'webCreator' | 'webEmbedded' | 'android' | 'ios' | 'mweb' | 'tv' | 'tvEmbedded';

export type YTDL_ClientsParams = {
    videoId: string;
    signatureTimestamp: number;
    options: YTDL_GetInfoOptions;
};
