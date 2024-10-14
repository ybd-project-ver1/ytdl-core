import { Platform } from '@/platforms/Platform';
import { YtdlCore_Cache } from '@/platforms/utils/Classes';
import { VERSION, ISSUES_URL, USER_NAME, REPO_NAME } from '@/utils/Constants';

class CacheWithCacheStorage implements YtdlCore_Cache {
    isDisabled: boolean = false;

    constructor(private ttl: number = 60) {}

    private async getCache(): Promise<Cache> {
        return await caches.open('ytdlCoreCache');
    }

    async get<T = unknown>(key: string): Promise<T | null> {
        if (this.isDisabled) {
            return null;
        }

        const CACHE = await this.getCache(),
            RESPONSE = await CACHE.match(key);

        if (RESPONSE) {
            try {
                const DATA = await RESPONSE.json();

                if (Date.now() > DATA.expiration) {
                    return null;
                }

                return DATA.contents as T;
            } catch {}
        }

        return null;
    }

    async set(key: string, value: any, { ttl }: { ttl: number } = { ttl: this.ttl }): Promise<boolean> {
        if (this.isDisabled) {
            return true;
        }

        const CACHE = await this.getCache(),
            DATA = JSON.stringify({
                contents: value,
                expiration: Date.now() + ttl * 1000,
            }),
            RESPONSE: Response = new Response(DATA, {
                headers: { 'Content-Type': 'application/json' },
            });

        try {
            await CACHE.put(key, RESPONSE);

            return true;
        } catch {
            return false;
        }
    }

    async has(key: string): Promise<boolean> {
        if (this.isDisabled) {
            return false;
        }

        const CACHE = await this.getCache(),
            RESPONSE = await CACHE.match(key);

        return RESPONSE !== undefined;
    }

    async delete(key: string): Promise<boolean> {
        if (this.isDisabled) {
            return true;
        }

        const CACHE = await this.getCache();

        try {
            return await CACHE.delete(key);
        } catch {
            return false;
        }
    }

    disable(): void {
        this.isDisabled = true;
    }

    initialization(): void {}
}

Platform.load({
    runtime: 'browser',
    server: false,
    cache: new CacheWithCacheStorage(),
    fileCache: new CacheWithCacheStorage(),
    fetcher: (url, options) => fetch(url, options),
    poToken: () => {
        return new Promise((resolve) => {
            resolve({
                poToken: '',
                visitorData: '',
            });
        });
    },
    options: {
        download: {
            hl: 'en',
            gl: 'US',
            includesPlayerAPIResponse: false,
            includesNextAPIResponse: false,
            includesOriginalFormatData: false,
            includesRelatedVideo: true,
            clients: ['web', 'webCreator', 'tvEmbedded', 'ios', 'android'],
            disableDefaultClients: false,
            disableFileCache: false,
            parsesHLSFormat: true,
        },
        other: {
            logDisplay: ['info', 'success', 'warning', 'error'],
            noUpdate: false,
        },
    },
    requestRelated: {
        rewriteRequest: (url, options) => {
            return { url, options };
        },
        originalProxy: null,
    },
    info: {
        version: VERSION,
        repo: {
            user: USER_NAME,
            name: REPO_NAME,
        },
        issuesUrl: ISSUES_URL,
    },
    polyfills: {
        Headers,
        ReadableStream,
    },
});

import { YtdlCore } from '@/YtdlCore';

export * from '@/types/index';
export { YtdlCore };
export default YtdlCore;
