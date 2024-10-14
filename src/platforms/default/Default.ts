import fs from 'fs';
import path from 'path';
import os from 'os';
import { ReadableStream } from 'stream/web';
import fetch from 'node-fetch';
import { Headers } from 'headers-polyfill';

import { Platform } from '@/platforms/Platform';
import { CacheWithMap, YtdlCore_Cache } from '@/platforms/utils/Classes';
import { AvailableCacheFileNames, FileCacheOptions } from '@/platforms/types/FileCache';

import { VERSION, ISSUES_URL, USER_NAME, REPO_NAME } from '@/utils/Constants';
import { Logger } from '@/utils/Log';

import('./PoToken.mjs')
    .then((m) => {
        const SHIM = Platform.getShim();
        SHIM.poToken = m.generatePoToken;
        Platform.load(SHIM);
    })
    .catch(() => {});

class FileCache implements YtdlCore_Cache {
    isDisabled: boolean = false;
    cacheDir: string = path.resolve(__dirname, './.CacheFiles/');

    async get<T = unknown>(cacheName: AvailableCacheFileNames): Promise<T | null> {
        if (this.isDisabled) {
            return null;
        }

        try {
            if (!this.has(cacheName)) {
                return null;
            }

            const FILE_PATH = path.resolve(this.cacheDir, cacheName + '.txt'),
                PARSED_DATA = JSON.parse(fs.readFileSync(FILE_PATH, 'utf8'));

            if (Date.now() > PARSED_DATA.expiration) {
                return null;
            }

            Logger.debug(`[ FileCache ]: Cache key <blue>"${cacheName}"</blue> was available.`);

            try {
                return JSON.parse(PARSED_DATA.contents);
            } catch {
                return PARSED_DATA.contents;
            }
        } catch (err) {
            return null;
        }
    }

    async set(cacheName: AvailableCacheFileNames, data: string, options: FileCacheOptions = { ttl: 60 * 60 * 24 }): Promise<boolean> {
        if (this.isDisabled) {
            Logger.debug(`[ FileCache ]: <blue>"${cacheName}"</blue> is not cached.`);
            return false;
        }

        try {
            fs.writeFileSync(
                path.resolve(this.cacheDir, cacheName + '.txt'),
                JSON.stringify({
                    expiration: Date.now() + options.ttl * 1000,
                    contents: data,
                }),
            );

            Logger.debug(`[ FileCache ]: <success>"${cacheName}"</success> is cached.`);
            return true;
        } catch (err) {
            Logger.error(`Failed to cache ${cacheName}.\nDetails: `, err);

            return false;
        }
    }

    async has(cacheName: AvailableCacheFileNames): Promise<boolean> {
        if (this.isDisabled) {
            return true;
        }

        try {
            return fs.existsSync(path.resolve(this.cacheDir, cacheName + '.txt'));
        } catch {
            return false;
        }
    }

    async delete(cacheName: AvailableCacheFileNames): Promise<boolean> {
        if (this.isDisabled) {
            return true;
        }

        try {
            if (!this.has(cacheName)) {
                return true;
            }

            const FILE_PATH = path.resolve(this.cacheDir, cacheName + '.txt');

            fs.unlinkSync(FILE_PATH);
            Logger.debug(`[ FileCache ]: Cache key <blue>"${cacheName}"</blue> was deleted.`);

            return true;
        } catch (err) {
            return false;
        }
    }

    disable(): void {
        this.isDisabled = true;
    }

    initialization() {
        if (typeof process !== 'undefined') {
            this.isDisabled = !!(process.env._YTDL_DISABLE_FILE_CACHE !== 'false' && process.env._YTDL_DISABLE_FILE_CACHE);

            try {
                if (!fs.existsSync(this.cacheDir)) {
                    fs.mkdirSync(this.cacheDir);
                }
            } catch {
                try {
                    this.cacheDir = path.resolve(os.tmpdir(), './.YtdlCore-Cache/');
                    if (!fs.existsSync(this.cacheDir)) {
                        fs.mkdirSync(this.cacheDir);
                    }
                } catch {
                    process.env._YTDL_DISABLE_FILE_CACHE = 'true';

                    this.isDisabled = true;
                }
            }
        }
    }
}

Platform.load({
    runtime: 'default',
    server: true,
    cache: new CacheWithMap(),
    fileCache: new FileCache(),
    fetcher: fetch as unknown as typeof globalThis.fetch,
    poToken: () => Promise.resolve({ poToken: '', visitorData: '' }),
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
        Headers: Headers as unknown as typeof globalThis.Headers,
        ReadableStream: ReadableStream as unknown as typeof globalThis.ReadableStream,
    },
});

import { YtdlCore } from '@/YtdlCore';

export * from '@/types/index';
export { YtdlCore };
export default YtdlCore;
