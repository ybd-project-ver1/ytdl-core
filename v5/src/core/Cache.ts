type FileCacheOptions = {
    /** Seconds
     * @default 60 * 60 * 24
     */
    ttl: number;
};

type AvailableCacheFileNames = 'poToken' | 'visitorData' | 'oauth2' | 'html5Player' | (string & {});

import { setTimeout } from 'timers';
import fs from 'fs';
import path from 'path';

import { Logger } from '@/utils/Log';

const CACHE_DIR_PATH = path.resolve(__dirname, './CacheFiles');

try {
    if (!fs.existsSync(CACHE_DIR_PATH)) {
        fs.mkdirSync(CACHE_DIR_PATH);
    }
} catch {
    process.env._YTDL_DISABLE_HTML5_PLAYER_CACHE = 'true';
}

export class Cache extends Map {
    private timeout: number;

    // timeout = 30 seconds
    constructor(timeout = 1000 * 30) {
        super();
        this.timeout = timeout;
    }

    set(key: any, value: any): this {
        if (this.has(key)) {
            clearTimeout(super.get(key).tid);
        }

        super.set(key, {
            tid: setTimeout(this.delete.bind(this, key), this.timeout).unref(),
            value,
        });

        return this;
    }

    get<T = unknown>(key: string): T | null {
        const ENTRY = super.get(key);
        if (ENTRY) {
            return ENTRY.value;
        }

        return null;
    }

    getOrSet<T = unknown>(key: string, fn: () => any): T | null {
        if (this.has(key)) {
            return this.get<T>(key);
        } else {
            let value = fn();
            this.set(key, value);

            (async () => {
                try {
                    await value;
                } catch (err) {
                    this.delete(key);
                }
            })();

            return value;
        }
    }

    delete(key: string): boolean {
        let ENTRY = super.get(key);

        if (ENTRY) {
            clearTimeout(ENTRY.tid);
            return super.delete(key);
        }

        return false;
    }

    clear() {
        for (const ENTRY of this.values()) {
            clearTimeout(ENTRY.tid);
        }

        super.clear();
    }
}

export class FileCache {
    static set(cacheName: AvailableCacheFileNames, data: string, options: FileCacheOptions = { ttl: 60 * 60 * 24 }): boolean {
        if (process.env._YTDL_DISABLE_FILE_CACHE !== 'false' && process.env._YTDL_DISABLE_FILE_CACHE) {
            Logger.debug(`[ FileCache ]: <blue>"${cacheName}"</blue> is not cached by the _YTDL_DISABLE_FILE_CACHE option.`);
            return false;
        }

        try {
            fs.writeFileSync(
                path.resolve(__dirname, './CacheFiles/' + cacheName + '.txt'),
                JSON.stringify({
                    date: Date.now() + options.ttl * 1000,
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

    static get<T = unknown>(cacheName: AvailableCacheFileNames): T | null {
        if (process.env._YTDL_DISABLE_FILE_CACHE !== 'false' && process.env._YTDL_DISABLE_FILE_CACHE) {
            return null;
        }

        try {
            const PARSED_DATA = JSON.parse(fs.readFileSync(path.resolve(__dirname, './CacheFiles/' + cacheName + '.txt'), 'utf8'));

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
}
