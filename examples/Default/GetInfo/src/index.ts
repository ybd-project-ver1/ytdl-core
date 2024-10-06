import { YtdlCore } from '@ybd-project/ytdl-core';
// For browser: import { YtdlCore, YTDL_NodejsStreamType } from '@ybd-project/ytdl-core/browser';
// For serverless: import { YtdlCore, YTDL_NodejsStreamType } from '@ybd-project/ytdl-core/serverless';

const ytdl = new YtdlCore({
    hl: 'en',
    gl: 'US',
});

// Video: Never Gonna give you up
const VIDEO_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

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

/* Specify the client (player) to use */
ytdl.getFullInfo(VIDEO_URL, {
    clients: ['web', 'mweb', 'webCreator', 'android', 'ios', 'tv', 'tvEmbedded'], // <- All available clients
});

/* Specify PoToken and VisitorData */
ytdl.getFullInfo(VIDEO_URL, {
    poToken: 'PO_TOKEN',
    visitorData: 'VISITOR_DATA',
});

/* Specify OAuth2 Access Token */

/* Normal usage */
const ytdl_withOAuth2 = new YtdlCore({
    oauth2Credentials: {
        accessToken: 'ACCESS_TOKEN',
        refreshToken: 'REFRESH_TOKEN',
        expiryDate: 'EXPIRY_DATE',
    },
});

ytdl_withOAuth2.getFullInfo(VIDEO_URL);

/* Override default options */
ytdl_withOAuth2.getFullInfo(VIDEO_URL, {
    oauth2Credentials: {
        accessToken: 'ACCESS_TOKEN_2',
        refreshToken: 'REFRESH_TOKEN_2',
        expiryDate: 'EXPIRY_DATE_2',
    },
});

/* Specify OAuth2 Access Token with your own client */
ytdl.getFullInfo(VIDEO_URL, {
    oauth2Credentials: {
        accessToken: 'ACCESS_TOKEN',
        refreshToken: 'REFRESH_TOKEN',
        expiryDate: 'EXPIRY_DATE',
        clientData: {
            clientId: 'CLIENT_ID',
            clientSecret: 'CLIENT_SECRET',
        },
    },
});