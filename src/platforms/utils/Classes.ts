export abstract class YtdlCore_Cache {
    abstract get<T = unknown>(key: any): Promise<T | null>;
    abstract set(key: any, value: any, options?: any): Promise<boolean>;
    abstract has(key: string): Promise<boolean>;
    abstract delete(key: string): Promise<boolean>;

    abstract disable(): void;

    abstract initialization(): void;
}

export class CacheWithMap implements YtdlCore_Cache {
    private cache: Map<string, { contents: any; expiration: number }>;
    isDisabled: boolean = false;

    constructor(private ttl: number = 60) {
        this.cache = new Map();
    }

    async get<T = unknown>(key: string): Promise<T | null> {
        if (this.isDisabled) {
            return null;
        }

        const { contents, expiration } = this.cache.get(key) || { contents: null, expiration: 0 };

        if (Date.now() > expiration || !contents) {
            return null;
        }

        return contents;
    }

    async set(key: string, value: any, { ttl }: { ttl: number } = { ttl: this.ttl }): Promise<boolean> {
        if (this.isDisabled) {
            return true;
        }

        this.cache.set(key, {
            contents: value,
            expiration: Date.now() + ttl * 1000,
        });

        return true;
    }

    async has(key: string): Promise<boolean> {
        if (this.isDisabled) {
            return false;
        }

        return this.cache.has(key);
    }

    async delete(key: string): Promise<boolean> {
        if (this.isDisabled) {
            return true;
        }

        return this.cache.delete(key);
    }

    disable(): void {
        this.isDisabled = true;
    }

    initialization() {}
}
