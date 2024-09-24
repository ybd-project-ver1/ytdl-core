import { YTDL_DownloadOptions } from '@/types';
import { YtdlCore_Cache } from './utils/Classes';

interface YtdlCore_Shim {
    runtime: 'default' | 'browser' | 'serverless';
    server: boolean;
    cache: YtdlCore_Cache;
    fileCache: YtdlCore_Cache;
    fetcher: (url: URL | RequestInfo, options?: RequestInit) => Promise<Response>;
    poToken: () => Promise<{ poToken: string; visitorData: string }>;
    default: {
        options: YTDL_DownloadOptions;
    };
    requestRelated: {
        rewriteRequest: YTDL_DownloadOptions['rewriteRequest'];
        originalProxy: YTDL_DownloadOptions['originalProxy'] | null;
    };
    info: {
        version: string;
        repoUrl: string;
        issuesUrl: string;
    };
}

export class Platform {
    static #shim: YtdlCore_Shim | undefined;

    static load(shim: YtdlCore_Shim) {
        shim.fileCache.initialization();

        this.#shim = shim;
    }

    static getShim() {
        if (!this.#shim) {
            throw new Error('Platform is not loaded');
        }

        return this.#shim;
    }
}
