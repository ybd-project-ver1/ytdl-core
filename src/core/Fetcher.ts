import path from 'path';

import type { YTDL_RequestOptions } from '@/types/Options';
import { Platform } from '@/platforms/Platform';
import { Logger } from '@/utils/Log';

import { RequestError } from './errors';
import { UserAgent } from '@/utils/UserAgents';

function getCaller() {
    const ERROR_STACK = new Error().stack || '',
        STACK_LINES = ERROR_STACK.split('\n'),
        CALLER_INDEX = STACK_LINES.findIndex((line) => line.includes('getCaller')) + 2;

    if (STACK_LINES[CALLER_INDEX]) {
        const FILE_PATH = STACK_LINES[CALLER_INDEX].trim().split(' ')[1];

        if (!FILE_PATH.includes('C:\\')) {
            return FILE_PATH;
        }

        const PARSED = path.parse(FILE_PATH);
        return PARSED.name + PARSED.ext;
    }

    return 'Unknown';
}

class Fetcher {
    static async fetch(url: string, options?: RequestInit, noProxyAdaptation = false): Promise<Response> {
        const SHIM = Platform.getShim(),
            { rewriteRequest, originalProxy } = SHIM.default.proxy;

        if (!noProxyAdaptation) {
            if (typeof rewriteRequest === 'function') {
                const WROTE_REQUEST = rewriteRequest(url, options || {}, { isDownloadUrl: false });
                options = WROTE_REQUEST.options;
                url = WROTE_REQUEST.url;
            }

            if (originalProxy) {
                try {
                    const PARSED = new URL(originalProxy.base);

                    if (!url.includes(PARSED.host)) {
                        url = `${PARSED.protocol}//${PARSED.host}/?url=${encodeURIComponent(url)}`;
                    }
                } catch {}
            }
        }

        Logger.debug(`[ Request ]: <magenta>${options?.method || 'GET'}</magenta> -> ${url} (From ${getCaller()})`);

        const HEADERS = new Headers();
        if (options?.headers) {
            Object.entries(options.headers).forEach(([key, value]) => {
                if (value) {
                    HEADERS.append(key, value.toString());
                }
            });
        }

        if (!HEADERS.has('User-Agent')) {
            HEADERS.append('User-Agent', UserAgent.getRandomUserAgent('desktop'));
        }

        return await SHIM.fetcher(url, {
            method: options?.method || 'GET',
            headers: HEADERS,
            body: options?.body?.toString(),
        });
    }

    static async request<T = unknown>(url: string, { requestOptions, rewriteRequest, originalProxy }: YTDL_RequestOptions = {}): Promise<T> {
        if (typeof rewriteRequest === 'function') {
            const WROTE_REQUEST = rewriteRequest(url, requestOptions || {}, { isDownloadUrl: false });
            requestOptions = WROTE_REQUEST.options;
            url = WROTE_REQUEST.url;
        }

        if (originalProxy) {
            try {
                const PARSED = new URL(originalProxy.base);

                if (!url.includes(PARSED.host)) {
                    url = `${PARSED.protocol}//${PARSED.host}/?url=${encodeURIComponent(url)}`;
                }
            } catch {}
        }

        const REQUEST_RESULTS = await this.fetch(url, {
                method: requestOptions?.method || 'GET',
                headers: requestOptions?.headers,
                body: requestOptions?.body?.toString(),
            }, true),
            STATUS_CODE = REQUEST_RESULTS.status.toString(),
            LOCATION = REQUEST_RESULTS.headers.get('location') || null;

        if (STATUS_CODE.startsWith('2')) {
            const CONTENT_TYPE = REQUEST_RESULTS.headers.get('content-type') || '';

            if (CONTENT_TYPE.includes('application/json')) {
                return REQUEST_RESULTS.json() as T;
            }

            return REQUEST_RESULTS.text() as T;
        } else if (STATUS_CODE.startsWith('3') && LOCATION) {
            return this.request(LOCATION.toString(), { requestOptions, rewriteRequest, originalProxy });
        }

        const ERROR = new RequestError(`Status Code: ${STATUS_CODE}`, REQUEST_RESULTS.status);

        throw ERROR;
    }
}

export { Fetcher };
