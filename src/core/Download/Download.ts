import type { YTDL_ClientTypes, YTDL_VideoFormat, YTDL_VideoInfo } from '@/types';
import { InternalDownloadOptions } from '@/core/types';

import { getFullInfo } from '@/core/Info';

import { FormatUtils } from '@/utils/Format';
import { Logger } from '@/utils/Log';
import { Platform } from '@/platforms/Platform';
import { UserAgent } from '@/utils/UserAgents';

const DOWNLOAD_REQUEST_OPTIONS: RequestInit = {
    method: 'GET',
    headers: {
        accept: '*/*',
        origin: 'https://www.youtube.com',
        referer: 'https://www.youtube.com',
        DNT: '?1',
    },
    redirect: 'follow',
};

async function isDownloadUrlValid(format: YTDL_VideoFormat): Promise<{ valid: boolean; reason?: string }> {
    return new Promise((resolve) => {
        const successResponseHandler = (res: Response) => {
                if (res.status === 200) {
                    Logger.debug(`[ ${format.sourceClientName} ]: <success>Video URL is normal.</success> The response was received with status code <success>"${res.status}"</success>.`);
                    resolve({ valid: true });
                } else {
                    errorResponseHandler(new Error(`Status code: ${res.status}`));
                }
            },
            errorResponseHandler = (reason: Error) => {
                Logger.debug(`[ ${format.sourceClientName} ]: The URL for the video <error>did not return a successful response</error>. Got another format.\nReason: ${reason.message}`);
                resolve({ valid: false, reason: reason.message });
            };

        try {
            Platform.getShim()
                .fetcher(format.url, {
                    method: 'HEAD',
                })
                .then(
                    (res) => successResponseHandler(res),
                    (reason) => errorResponseHandler(reason),
                );
        } catch (err: any) {
            errorResponseHandler(err);
        }
    });
}

function getValidDownloadUrl(formats: YTDL_VideoInfo['formats'], options: InternalDownloadOptions): Promise<YTDL_VideoFormat> {
    return new Promise(async (resolve) => {
        let excludingClients: Array<YTDL_ClientTypes> = ['web'],
            format,
            isOk = false;

        try {
            format = FormatUtils.chooseFormat(formats, options);
        } catch (e) {
            throw e;
        }

        if (!format) {
            throw new Error('Failed to retrieve format data.');
        }

        while (isOk === false) {
            if (!format) {
                throw new Error('Failed to retrieve format data.');
            }

            const { valid, reason } = await isDownloadUrlValid(format);

            if (valid) {
                isOk = true;
            } else {
                if (format.sourceClientName !== 'unknown') {
                    excludingClients.push(format.sourceClientName);
                }

                try {
                    format = FormatUtils.chooseFormat(formats, {
                        excludingClients,
                        includingClients: reason?.includes('403') ? ['ios', 'android'] : 'all',
                        quality: options.quality,
                        filter: options.filter,
                    });
                } catch (e) {
                    throw e;
                }
            }
        }

        resolve(format);
    });
}

/** Reference: LuanRT/YouTube.js - Utils.ts */
export async function* streamToIterable(stream: ReadableStream<Uint8Array>) {
    const READER = stream.getReader();

    try {
        while (true) {
            const { done, value } = await READER.read();
            if (done) {
                return;
            }

            yield value;
        }
    } finally {
        READER.releaseLock();
    }
}

async function downloadFromInfoCallback(info: YTDL_VideoInfo, options: InternalDownloadOptions): Promise<ReadableStream<Uint8Array>> {
    if (!info.formats.length) {
        throw new Error('This video is not available due to lack of video format.');
    }

    const DL_CHUNK_SIZE = typeof options.dlChunkSize === 'number' ? options.dlChunkSize : 1024 * 1024 * 10,
        NO_NEED_SPECIFY_RANGE = (options.filter === 'audioandvideo' || options.filter === 'videoandaudio') && !options.range;

    let format: YTDL_VideoFormat = Object.freeze(await getValidDownloadUrl(info.formats, options)),
        requestOptions = { ...DOWNLOAD_REQUEST_OPTIONS },
        chunkStart = options.range ? options.range.start : 0,
        chunkEnd = options.range ? options.range.end || DL_CHUNK_SIZE : DL_CHUNK_SIZE,
        shouldEnd = false,
        cancel: AbortController,
        firstFormatUrl = NO_NEED_SPECIFY_RANGE ? format.url : format.url + '&range=' + chunkStart + '-' + chunkEnd;

    const AGENT_TYPE = format.sourceClientName === 'ios' || format.sourceClientName === 'android' ? format.sourceClientName : format.sourceClientName.includes('tv') ? 'tv' : 'desktop';

    requestOptions.headers = {
        ...requestOptions.headers,
        'User-Agent': UserAgent.getRandomUserAgent(AGENT_TYPE),
    };

    /* Request Setup */
    if (options.rewriteRequest) {
        const { url, options: reqOptions } = options.rewriteRequest(firstFormatUrl, requestOptions, {
            isDownloadUrl: true,
        });

        firstFormatUrl = url;
        requestOptions = reqOptions;
    }

    if (options.originalProxy) {
        try {
            const PARSED = new URL(options.originalProxy.download);

            if (!firstFormatUrl.includes(PARSED.host)) {
                firstFormatUrl = `${PARSED.protocol}//${PARSED.host}${PARSED.pathname}?${options.originalProxy.urlQueryName || 'url'}=${encodeURIComponent(firstFormatUrl)}`;
            }
        } catch {}
    }

    /* Reference: LuanRT/YouTube.js */
    if (NO_NEED_SPECIFY_RANGE) {
        const RESPONSE = await Platform.getShim().fetcher(firstFormatUrl, requestOptions);

        if (!RESPONSE.ok) {
            throw new Error(`Download failed with status code <warning>"${RESPONSE.status}"</warning>.`);
        }

        const BODY = RESPONSE.body;

        if (!BODY) {
            throw new Error('Failed to retrieve response body.');
        }

        return BODY;
    }

    const READABLE_STREAM = new ReadableStream<Uint8Array>(
        {
            start() {},
            pull: async (controller) => {
                if (shouldEnd) {
                    controller.close();
                    return;
                }

                const CONTENT_LENGTH = format.contentLength ? parseInt(format.contentLength) : 0;
                if (chunkEnd >= CONTENT_LENGTH || options.range) {
                    shouldEnd = true;
                }

                return new Promise(async (resolve, reject) => {
                    try {
                        cancel = new AbortController();

                        let formatUrl = format.url + '&range=' + chunkStart + '-' + chunkEnd;

                        if (options.rewriteRequest) {
                            const { url, options: reqOptions } = options.rewriteRequest(formatUrl, requestOptions, {
                                isDownloadUrl: true,
                            });

                            formatUrl = url;
                            requestOptions = reqOptions;
                        }

                        if (options.originalProxy) {
                            try {
                                const PARSED = new URL(options.originalProxy.download);

                                if (!formatUrl.includes(PARSED.host)) {
                                    formatUrl = `${PARSED.protocol}//${PARSED.host}${PARSED.pathname}?${options.originalProxy.urlQueryName || 'url'}=${encodeURIComponent(formatUrl)}`;
                                }
                            } catch {}
                        }

                        const RESPONSE = await Platform.getShim().fetcher(firstFormatUrl, requestOptions);

                        if (!RESPONSE.ok) {
                            throw new Error(`Download failed with status code <warning>"${RESPONSE.status}"</warning>.`);
                        }

                        const BODY = RESPONSE.body;

                        if (!BODY) {
                            throw new Error('Failed to retrieve response body.');
                        }

                        for await (const CHUNK of streamToIterable(BODY)) {
                            controller.enqueue(CHUNK);
                        }

                        chunkStart = chunkEnd + 1;
                        chunkEnd += DL_CHUNK_SIZE;

                        resolve();
                    } catch (err) {
                        reject(err);
                    }
                });
            },
            async cancel(reason) {
                cancel.abort(reason);
            },
        },
        {
            highWaterMark: options.highWaterMark || 1024 * 512,
            size(chunk) {
                return chunk?.byteLength || 0;
            },
        },
    );

    return READABLE_STREAM;
}

async function downloadFromInfo(info: YTDL_VideoInfo, options: InternalDownloadOptions): Promise<ReadableStream<Uint8Array>> {
    if (!info.full) {
        throw new Error('Cannot use `ytdl.downloadFromInfo()` when called with info from `ytdl.getBasicInfo()`');
    }

    return await downloadFromInfoCallback(info, options);
}

function download(link: string, options: InternalDownloadOptions): Promise<ReadableStream<Uint8Array>> {
    return new Promise<ReadableStream<Uint8Array>>((resolve) => {
        getFullInfo(link, options)
            .then((info) => {
                resolve(downloadFromInfoCallback(info, options));
            })
            .catch((err) => {
                throw err;
            });
    });
}

export { download, downloadFromInfo };
