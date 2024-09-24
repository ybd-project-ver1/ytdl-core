type UserAgentType = 'desktop' | 'ios' | 'android' | 'tv';

const USER_AGENTS: Record<UserAgentType, Array<string>> = {
    desktop: [
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.3 Safari/605.1.15',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36 Edg/109.0.1518.61',
    ],
    ios: [
        'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/127.0.0.0 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (iPad; CPU OS 15_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/126.0.1.45 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/123.0.2.98 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (iPad; CPU OS 16_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/125.0.3.110 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 15_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/124.0.5.72 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (iPad; CPU OS 14_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/122.0.4.82 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 16_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/128.0.1.101 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (iPad; CPU OS 15_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/125.0.1.95 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_8 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/121.0.2.67 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (iPad; CPU OS 16_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/129.0.0.85 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 15_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/126.0.3.92 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (iPad; CPU OS 14_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/123.0.5.105 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/127.0.2.56 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (iPad; CPU OS 15_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/124.0.1.30 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/120.0.4.102 Mobile/15E148 Safari/604.1',
    ],
    android: [
        'Mozilla/5.0 (Linux; Android 12; SM-G996B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 11; Pixel 4a) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.85 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 10; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.1.102 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 9; Mi 9T Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.3.56 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 11; Samsung SM-G980F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.1.74 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 12; OnePlus 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.4.90 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 10; Huawei P30 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.2.98 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 8.1.0; Nexus 6P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.1.84 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 11; Pixel 4 XL) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.3.40 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 9; Redmi Note 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.5.25 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 12; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.2.56 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 10; Sony Xperia 1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.74 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 11; Galaxy Note 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.5.86 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 9; LG G8 ThinQ) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.2.98 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 10; OnePlus 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.3.40 Mobile Safari/537.36',
    ],
    tv: ['Mozilla/5.0 (ChromiumStylePlatform) Cobalt/Version'],
};

class UserAgent {
    static default = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36';
    static ios = 'com.google.ios.youtube/19.29.1 (iPhone16,2; U; CPU iOS 17_5_1 like Mac OS X;)';
    static android = 'com.google.android.youtube/19.29.37 (Linux; U; Android 11) gzip';
    static tv = 'Mozilla/5.0 (ChromiumStylePlatform) Cobalt/Version';

    static getRandomUserAgent(type: UserAgentType): string {
        const AGENTS = USER_AGENTS[type];

        if (AGENTS) {
            return AGENTS[Math.floor(Math.random() * AGENTS.length)];
        }

        return USER_AGENTS.desktop[0];
    }
}

export { UserAgent };
