import { YtdlCore } from '@ybd-project/ytdl-core';
import { fetch, ProxyAgent } from 'undici';

// Video: Never Gonna give you up
const VIDEO_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    AGENT = new ProxyAgent('http://xxx.xxx.xxx.xxx:PORT'),
    ytdl = new YtdlCore({
        hl: 'en',
        gl: 'US',
        fetcher: (url, options) => {
            return fetch(url, {
                ...options,
                dispatcher: AGENT,
            });
        },
    });

/* Normal usage (Basic Info) */
ytdl.getBasicInfo(VIDEO_URL)
    .then((results) => {
        // ...
    })
    .catch((error) => {
        // ...
    });

/* Normal usage (Full Info) */
ytdl.getFullInfo(VIDEO_URL);
