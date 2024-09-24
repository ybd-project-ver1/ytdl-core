declare module 'youtube-po-token-generator' {
    export function generate(): Promise<{ visitorData: string; poToken: string }>;
}

declare module 'chrono-node' {
    export function parseDate(date: string): Date;
}
