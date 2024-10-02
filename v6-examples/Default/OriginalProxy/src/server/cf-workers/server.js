const BASE_HEADERS = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': '*',
        'Access-Control-Allow-Headers': '*',
        'Cache-Control': 'public, max-age=2592000',
    },
    USER_AGENTS = {
        IOS: 'com.google.ios.youtube/19.29.1 (iPhone16,2; U; CPU iOS 17_5_1 like Mac OS X;)',
        ANDROID: 'com.google.android.youtube/19.29.37 (Linux; U; Android 11) gzip',
        TV: 'Mozilla/5.0 (ChromiumStylePlatform) Cobalt/Version',
        DEFAULT: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0',
    };

export default {
    async fetch(req) {
        if (req.method === 'OPTIONS') {
            return new Response(null, { status: 200, headers: BASE_HEADERS });
        }

        const url = new URL(req.url),
            REQUEST_URL = decodeURIComponent(url.searchParams.get('url') || '');

        if (!REQUEST_URL || !/(youtube\.com|googlevideo\.com)/.test(REQUEST_URL)) {
            return new Response(null, { status: 400, headers: BASE_HEADERS });
        }

        if (req.url.includes('/download/')) {
            const C = new URL(REQUEST_URL).searchParams.get('c') || 'WEB',
                USER_AGENT = USER_AGENTS[C] || USER_AGENTS.DEFAULT;

            console.log('[DEBUG]: Selected user agent:', USER_AGENT);

            const RESPONSE = await fetch(REQUEST_URL, {
                headers: {
                    Range: req.headers['range'] || 'bytes=0-',
                    'cache-control': 'no-cache',
                    'Accept-Encoding': 'identity;q=1, *;q=0',
                    'User-Agent': USER_AGENT,
                },
            });

            if (!RESPONSE.body) {
                return new Response(null, { status: 500, headers: BASE_HEADERS });
            }

            return new Response(await RESPONSE.arrayBuffer(), { status: 200, headers: { Connection: 'keep-alive', ...BASE_HEADERS } });
        }

        try {
            let contentType = 'text/plain';

            const HEADERS = req.headers,
                METHOD = req.method,
                BODY = await req.text(),
                RESPONSE_DATA = await fetch(REQUEST_URL, {
                    method: METHOD,
                    headers: {
                        ...HEADERS,
                        'User-Agent': USER_AGENTS.DEFAULT,
                    },
                    body: BODY ? BODY : undefined,
                }).then((response) => {
                    const CONTENT_TYPE = response.headers.get('content-type') || '';

                    if (CONTENT_TYPE) {
                        contentType = CONTENT_TYPE;
                    }
                    return response.text();
                });

            return new Response(RESPONSE_DATA, { status: 200, headers: { 'Content-Type': contentType, ...BASE_HEADERS } });
        } catch (err) {
            return Response.json({ error: err.message }, { status: 500, headers: BASE_HEADERS });
        }
    },
};
