import { YTDL_DownloadOptions } from '@/types';

import { PlatformError } from '@/core/errors';

import { Logger } from '@/utils/Log';

import { YtdlCore_Cache } from './utils/Classes';

interface YtdlCore_Shim {
    runtime: 'default' | 'browser' | 'serverless';
    server: boolean;
    cache: YtdlCore_Cache;
    fileCache: YtdlCore_Cache;
    fetcher: (url: URL | RequestInfo, options?: RequestInit) => Promise<Response>;
    poToken: () => Promise<{ poToken: string; visitorData: string }>;
    options: {
        download: YTDL_DownloadOptions;
        other: {
            logDisplay: Array<'debug' | 'info' | 'success' | 'warning' | 'error'>;
            noUpdate: boolean;
        };
    };
    requestRelated: {
        rewriteRequest: YTDL_DownloadOptions['rewriteRequest'];
        originalProxy: YTDL_DownloadOptions['originalProxy'] | null;
    };
    info: {
        version: string;
        repo: {
            user: string;
            name: string;
        };
        issuesUrl: string;
    };
}

export class Platform {
    static #shim: YtdlCore_Shim | undefined;

    static load(shim: YtdlCore_Shim) {
        shim.fileCache.initialization();

        this.#shim = shim;
        Logger.initialization();
    }

    static getShim() {
        if (!this.#shim) {
            throw new PlatformError('Platform is not loaded');
        }

        return this.#shim;
    }
}
