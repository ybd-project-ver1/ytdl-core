import type { YT_PlayerApiResponse, YTDL_InnertubeResponseInfo, YTDL_RequestOptions } from '@/types';

import { PlayerRequestError, UnrecoverableError } from '@/core/errors';
import { Fetcher } from '@/core/Fetcher';

import type { YTDL_ClientsParams } from '@/utils/Clients';

export default class Base {
    private static playError(playerResponse: YT_PlayerApiResponse | null): Error | null {
        const PLAYABILITY = playerResponse && playerResponse.playabilityStatus;

        if (!PLAYABILITY) {
            return null;
        }

        if (PLAYABILITY.status === 'ERROR' || PLAYABILITY.status === 'LOGIN_REQUIRED') {
            return new UnrecoverableError(PLAYABILITY.reason || (PLAYABILITY.messages && PLAYABILITY.messages[0]));
        } else if (PLAYABILITY.status === 'LIVE_STREAM_OFFLINE') {
            return new UnrecoverableError(PLAYABILITY.reason || 'The live stream is offline.');
        } else if (PLAYABILITY.status === 'UNPLAYABLE') {
            return new UnrecoverableError(PLAYABILITY.reason || 'This video is unavailable.');
        }

        return null;
    }

    static request<T = YT_PlayerApiResponse>(url: string, requestOptions: { payload: string; headers: Record<string, any> }, params: YTDL_ClientsParams): Promise<YTDL_InnertubeResponseInfo<T>> {
        return new Promise(async (resolve, reject) => {
            const HEADERS: Record<string, string> = {
                    'Content-Type': 'application/json',
                    'X-Goog-Visitor-Id': params.options.visitorData || '',
                    ...requestOptions.headers,
                },
                OPTS: YTDL_RequestOptions = {
                    requestOptions: {
                        method: 'POST',
                        headers: HEADERS,
                        body: typeof requestOptions.payload === 'string' ? requestOptions.payload : JSON.stringify(requestOptions.payload),
                    },
                    rewriteRequest: params.options.rewriteRequest,
                    originalProxy: params.options.originalProxy,
                },
                IS_NEXT_API = url.includes('/next'),
                responseHandler = (response: YT_PlayerApiResponse) => {
                    const PLAY_ERROR = this.playError(response);

                    if (PLAY_ERROR) {
                        if (OPTS.originalProxy) {
                            OPTS.originalProxy = undefined;
                            Fetcher.request<YT_PlayerApiResponse>(url, OPTS)
                                .then(responseHandler)
                                .catch((err) => {
                                    reject({
                                        isError: true,
                                        error: err,
                                        contents: null,
                                    });
                                });

                            return;
                        }
                        return reject({
                            isError: true,
                            error: PLAY_ERROR,
                            contents: response,
                        });
                    }

                    if (!IS_NEXT_API && (!response.videoDetails || params.videoId !== response.videoDetails.videoId)) {
                        const ERROR = new PlayerRequestError('Malformed response from YouTube', response, null);
                        ERROR.response = response;

                        return reject({
                            isError: true,
                            error: ERROR,
                            contents: response,
                        });
                    }

                    resolve({
                        isError: false,
                        error: null,
                        contents: response as T,
                    });
                };

            try {
                Fetcher.request<YT_PlayerApiResponse>(url, OPTS)
                    .then(responseHandler)
                    .catch((err) => {
                        if (OPTS.originalProxy) {
                            OPTS.originalProxy = undefined;
                            Fetcher.request<YT_PlayerApiResponse>(url, OPTS)
                                .then(responseHandler)
                                .catch((err) => {
                                    reject({
                                        isError: true,
                                        error: err,
                                        contents: null,
                                    });
                                });
                        }

                        reject({
                            isError: true,
                            error: err,
                            contents: null,
                        });
                    });
            } catch (err: any) {
                reject({
                    isError: true,
                    error: err,
                    contents: null,
                });
            }
        });
    }
}
