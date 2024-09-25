import fs from 'fs';
import path from 'path';
import os from 'os';

import { AvailableCacheFileNames, FileCacheOptions } from '@/platforms/types/FileCache';

import { Platform } from '@/platforms/Platform';
import { CacheWithMap, YtdlCore_Cache } from '@/platforms/utils/Classes';
import { VERSION, REPO_URL, ISSUES_URL } from '@/utils/Constants';

class FileCache implements YtdlCore_Cache {
    private timeouts: Map<string, NodeJS.Timeout> = new Map();
    isDisabled: boolean = false;
    cacheDir: string = path.resolve(os.tmpdir(), './.YtdlCore-Cache/');

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

            if (Date.now() > PARSED_DATA.date) {
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
                    date: Date.now() + options.ttl * 1000,
                    contents: data,
                }),
            );

            if (this.timeouts.has(cacheName)) {
                clearTimeout(this.timeouts.get(cacheName)!);
            }

            const TIMEOUT = setTimeout(() => {
                this.delete(cacheName);
            }, options.ttl * 1000);

            this.timeouts.set(cacheName, TIMEOUT);

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

            if (this.timeouts.has(cacheName)) {
                clearTimeout(this.timeouts.get(cacheName)!);
                this.timeouts.delete(cacheName);
            }

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
                process.env._YTDL_DISABLE_FILE_CACHE = 'true';

                this.isDisabled = true;
            }
        }
    }
}

Platform.load({
    runtime: 'serverless',
    server: true,
    cache: new CacheWithMap(),
    fileCache: new FileCache(),
    fetcher: fetch,
    poToken: () => {
        return new Promise((resolve) => {
            resolve({
                poToken: '',
                visitorData: '',
            });
        });
    },
    default: {
        options: {
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
    },
    requestRelated: {
        rewriteRequest: (url, options) => {
            return { url, options };
        },
        originalProxy: null,
    },
    info: {
        version: VERSION,
        repoUrl: REPO_URL,
        issuesUrl: ISSUES_URL,
    },
});

import { YtdlCore } from '@/YtdlCore';
import { Logger } from '@/utils/Log';

export * from '@/types/index';
export { YtdlCore };
export default YtdlCore;
