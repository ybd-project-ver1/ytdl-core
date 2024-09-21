import { request as undiciRequest } from 'undici';

import { YTDL_RequestOptions } from '@/types/Options';

import { RequestError } from './errors';
import { Logger } from '@/utils/Log';
import path from 'path';

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

export default class Fetcher {
    static async request<T = unknown>(url: string, { requestOptions, rewriteRequest, originalProxy }: YTDL_RequestOptions = {}): Promise<T> {
        if (typeof rewriteRequest === 'function') {
            const WROTE_REQUEST = rewriteRequest(url, requestOptions, { isDownloadUrl: false });
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

        Logger.debug(`[ Request ]: <magenta>${requestOptions?.method || 'GET'}</magenta> -> ${url} (From ${getCaller()})`);
        const REQUEST_RESULTS = await undiciRequest(url, requestOptions),
            STATUS_CODE = REQUEST_RESULTS.statusCode.toString(),
            LOCATION = REQUEST_RESULTS.headers['location'] || null;

        if (STATUS_CODE.startsWith('2')) {
            const CONTENT_TYPE = REQUEST_RESULTS.headers['content-type'] || '';

            if (CONTENT_TYPE.includes('application/json')) {
                return REQUEST_RESULTS.body.json() as T;
            }

            return REQUEST_RESULTS.body.text() as T;
        } else if (STATUS_CODE.startsWith('3') && LOCATION) {
            return this.request(LOCATION.toString(), { requestOptions, rewriteRequest, originalProxy });
        }

        const ERROR = new RequestError(`Status Code: ${STATUS_CODE}`);
        ERROR.statusCode = REQUEST_RESULTS.statusCode;

        throw ERROR;
    }
}
