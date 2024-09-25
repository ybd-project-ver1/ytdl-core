export abstract class YtdlCore_Cache {
    abstract get<T = unknown>(key: any): Promise<T | null>;
    abstract set(key: any, value: any, options?: any): Promise<boolean>;
    abstract has(key: string): Promise<boolean>;
    abstract delete(key: string): Promise<boolean>;

    abstract disable(): void;

    abstract initialization(): void;
}

export class CacheWithMap implements YtdlCore_Cache {
    private cache: Map<string, any>;
    private timeouts: Map<string, NodeJS.Timeout>;

    constructor(private ttl: number = 60) {
        this.cache = new Map();
        this.timeouts = new Map();
    }

    async get<T = unknown>(key: string): Promise<T | null> {
        return this.cache.get(key) || null;
    }

    async set(key: string, value: any, { ttl }: { ttl: number } = { ttl: this.ttl }): Promise<boolean> {
        this.cache.set(key, value);

        if (this.timeouts.has(key)) {
            clearTimeout(this.timeouts.get(key)!);
        }

        const timeout = setTimeout(() => {
            this.delete(key);
        }, ttl * 1000);

        this.timeouts.set(key, timeout);

        return true;
    }

    async has(key: string): Promise<boolean> {
        return this.cache.has(key);
    }

    async delete(key: string): Promise<boolean> {
        if (this.timeouts.has(key)) {
            clearTimeout(this.timeouts.get(key)!);
            this.timeouts.delete(key);
        }

        return this.cache.delete(key);
    }

    disable(): void {}

    initialization() {}
}
