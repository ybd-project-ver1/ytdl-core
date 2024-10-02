import express from 'express';
import got from 'got';

const app = express(),
    USER_AGENTS = {
        IOS: 'com.google.ios.youtube/19.29.1 (iPhone16,2; U; CPU iOS 17_5_1 like Mac OS X;)',
        ANDROID: 'com.google.android.youtube/19.29.37 (Linux; U; Android 11) gzip',
        TV: 'Mozilla/5.0 (ChromiumStylePlatform) Cobalt/Version',
        DEFAULT: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0',
    },
    ALLOWED_HOSTNAMES = ['youtube.com', 'googlevideo.com'];

app.use(express.json());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Cache-Control', 'public, max-age=2592000');

    const REQUEST_URL = (req.query.url || '').toString(),
        PARSED_URL = new URL(REQUEST_URL);

    if (!REQUEST_URL || !ALLOWED_HOSTNAMES.includes(PARSED_URL.hostname)) {
        res.status(400);
        res.end();

        return;
    }

    res.locals.REQUEST_URL = decodeURIComponent(REQUEST_URL.toString());

    next();
});

app.all('/', async (req, res) => {
    const REQUEST_URL = res.locals.REQUEST_URL;

    try {
        const HEADERS = req.rawHeaders.reduce((acc: Record<string, string>, curr, index) => {
                if (index % 2 === 0) {
                    acc[curr] = req.rawHeaders[index + 1];
                }

                return acc;
            }, {}),
            METHOD = req.method,
            BODY = req.body,
            RESPONSE_DATA = await fetch(REQUEST_URL, {
                method: req.method,
                headers: {
                    ...HEADERS,
                    'User-Agent': USER_AGENTS.DEFAULT,
                },
                body: BODY ? JSON.stringify(BODY) : undefined,
            }).then((response) => {
                const CONTENT_TYPE = response.headers.get('content-type') || '';
                res.setHeader('Content-Type', CONTENT_TYPE);
                return response.text();
            });

        console.log(`[${METHOD}]: ${REQUEST_URL}`);

        res.send(RESPONSE_DATA);
    } catch (err: any) {
        res.status(500).json({
            error: err.message,
        });
    }
});

app.all('/download/', async (req, res) => {
    const REQUEST_URL = res.locals.REQUEST_URL;

    console.log(`[${req.method}]: ${REQUEST_URL}`);
    fetch(REQUEST_URL).then(
        async (headRes) => {
            if (headRes.ok) {
                try {
                    const c = new URL(REQUEST_URL).searchParams.get('c') || 'WEB',
                        USER_AGENT = USER_AGENTS[c] || USER_AGENTS.DEFAULT;

                    console.log('[DEBUG]: Selected user agent:', USER_AGENT);

                    got.stream(REQUEST_URL, {
                        headers: {
                            Range: req.headers['range'] || req.get('range') || 'bytes=0-',
                            'cache-control': 'no-cache',
                            'Accept-Encoding': 'identity;q=1, *;q=0',
                            'User-Agent': USER_AGENT,
                        },
                        http2: false,
                        throwHttpErrors: false,
                    }).pipe(res);
                } catch (err: any) {
                    res.status(500).end();
                }
            } else {
                res.status(500).end();
            }
        },
        () => res.status(500).end(),
    );
});

app.listen(3000, () => {
    console.log('Server listening on port 3000 (http://localhost:3000/)');
});
