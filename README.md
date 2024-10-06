# @ybd-project/ytdl-core - v6

[![npm version](https://badge.fury.io/js/@ybd-project%2Fytdl-core.svg)](https://badge.fury.io/js/@ybd-project%2Fytdl-core)
[![jsDelivr](https://data.jsdelivr.com/v1/package/npm/@ybd-project/ytdl-core/badge?style=rounded)](https://www.jsdelivr.com/package/npm/@ybd-project/ytdl-core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

YBD Project fork of `ytdl-core`. This fork is dedicated to developing a YouTube downloader that is fast, stable, and takes into account various use cases, with reference to [LuanRT/YouTube.js](https://github.com/LuanRT/YouTube.js) and [yt-dlp](https://github.com/yt-dlp/yt-dlp).

> [!NOTE]
> If you are looking for v5 documentation for `@ybd-project/ytdl-core`, please click [here](https://github.com/ybd-project-ver1/ytdl-core/blob/latest/v5/README.md).

## Table of Contents

<ol>
    <li><a href="#ℹ️announcements-at-this-timeℹ️">ℹ️Announcements at this timeℹ️</a></li>
    <li><a href="#prerequisite">Prerequisite</a></li>
    <li>
        <a href="#operating-environment">Operating Environment</a>
        <ul>
            <li><a href="#default-nodejs">Default (Node.js)</a></li>
            <li><a href="#proxy-support">Browser</a></li>
            <li><a href="#serverless">Serverless</a></li>
        </ul>
    </li>
    <li><a href="#installation">Installation</a></li>
    <li><a href="#api-documentation">API Documentation</a></li>
    <li><a href="#basic-usage">Basic Usage</a></li>
    <li><a href="#examples">Examples</a></li>
    <li>
        <a href="#precautions">Precautions</a>
        <ul>
            <li><a href="#limitations">Limitations</a></li>
            <li><a href="#rate-limiting">Rate Limiting</a></li>
        </ul>
    </li>
    <li><a href="#license">License</a></li>
</ol>

## ℹ️Announcements at this timeℹ️

There are no announcements at this time.

<!-- > [!NOTE]
> As of v5.0.5, related videos cannot be retrieved. This will be fixed later.

> [!TIP]
> Optional information to help a user be more successful.

> [!IMPORTANT]
> Crucial information necessary for users to succeed.

> [!WARNING]
> Critical content demanding immediate user attention due to potential risks.

> [!CAUTION]
> Negative potential consequences of an action. -->

## Prerequisite

To use `@ybd-project/ytdl-core` without problems, **use Node.js 16 or higher.** (Recommended is Node.js 18 or higher.)

> [!IMPORTANT]
> Use with Node.js 16 is not recommended, but will be supported as much as possible.

## Operating Environment

> [!IMPORTANT] > `@ybd-project/ytdl-core` has not been tested in non-Node.js environments such as Deno. If you need ytdl-core optimized for these environments, please create an [issue](https://github.com/ybd-project-ver1/ytdl-core/issues/new?assignees=&labels=feature&projects=&template=feature_request.md&title=).

### Default (Node.js)

As usual, when using Node.js, as noted in the prerequisites, v16 or higher will work fine.
If you have an example that does not work with 16 or higher versions, please create an [issue](https://github.com/ybd-project-ver1/ytdl-core/issues/new?assignees=&labels=bug&projects=&template=bug_report.md&title=).

> [!NOTE]
> If the Node.js version is less than v16, an error will occur when creating an instance of YtdlCore. To disable it, set the option `disableVersionCheck` to `true`. **(Deprecated)**

### Browser

When using a browser, the latest version is preferred due to the API used.
However, when operating a website or other site, it is unknown which version and browser the client will use, so the following are the main browsers (Chrome, Edge, Firefox, Brave, Opera, Safari) that are currently confirmed to work.

> [!NOTE]
> In `@ybd-project/ytdl-core`, if a browser is determined to be not in line with the following versions, an error will be raised when instantiating the YtdlCore class, stating that the version is not supported. To disable it, set the option `disableVersionCheck` to `true`. **(Deprecated)**

#### List

**Live demo used for testing: [ytdlcore.static.jp](https://ytdlcore.static.jp/)**

|    Browser Name     | Supported Versions |
| :-----------------: | :----------------: |
|  **Google Chrome**  |    v76 - latest    |
| **Microsoft Edge**  |    v80 - latest    |
| **Mozilla FireFox** |    v78 - latest    |
|  **Apple Safari**   |    v14 - latest    |
|      **Brave**      |    v1 - latest     |
|      **Opera**      |    v63 - latest    |

(Tested with [BrowserStack](https://live.browserstack.com/))

### Serverless

We have confirmed that `ytdl-core` for serverless functions works properly in the following environment.

> [!TIP]
> We recommend deploying to Cloudflare Workers because of its simplicity and lower cost compared to other platforms.

|      Service Name      |                 Remarks                 |
| :--------------------: | :-------------------------------------: |
| **Cloudflare Workers** | With `nodejs_compat` compatibility flag |
|  **Vercel Functions**  |         Streaming doesn't work.         |

## Installation

```bash
npm install @ybd-project/ytdl-core@latest
```

Make sure you're installing the latest version of `@ybd-project/ytdl-core` to keep up with the latest fixes.

## API Documentation

For details API documentation, see the [Wiki](https://github.com/ybd-project-ver1/ytdl-core/wiki).

## Basic Usage

Only a simple example is given in the README. For a list of options and other advanced usage, please refer to the [API Documentation](#api-documentation).

```ts
import fs from 'fs';
import { YtdlCore } from '@ybd-project/ytdl-core';
// For browser: import { YtdlCore } from '@ybd-project/ytdl-core/browser';
// For serverless functions: import { YtdlCore } from '@ybd-project/ytdl-core/serverless';

// JavaScript: const { YtdlCore } = require('@ybd-project/ytdl-core');

const ytdl = new YtdlCore({
    // The options specified here will be the default values when functions such as getFullInfo are executed.
});

// Download a video
ytdl.download('https://www.youtube.com/watch?v=dQw4w9WgXcQ', {
    streamType: 'nodejs', // Note: If you do not set the `streamType` to `nodejs`, a pipable stream will not be returned.
}).then((stream) => stream.pipe(fs.createWriteStream('video.mp4')));

// Get video info
ytdl.getBasicInfo('https://www.youtube.com/watch?v=dQw4w9WgXcQ').then((info) => {
    console.log(info.videoDetails.title);
});
```

### OAuth2 Support

`@ybd-project/ytdl-core` supports OAuth2 Token.

These can be used to avoid age restrictions and bot errors. See below for instructions on how to use them.

> [!IMPORTANT] > **Be sure to generate tokens with accounts that can be banned, as accounts may be banned.**
> Note that OAuth2 may expire soon these days. In this case, do not use OAuth2.

> [!NOTE]
> The specified OAuth2 token is automatically updated by ytdl-core, so you do not need to update it yourself.

```ts
import { YtdlCore } from '@ybd-project/ytdl-core';

/* Normal usage */
const ytdl = new YtdlCore({
    oauth2Credentials: {
        accessToken: '...',
        refreshToken: '...',
        expiryDate: 'yyyy-MM-ddThh-mm-ssZ',
    },
});

/* If you need to specify a client ID and secret */
const ytdl = new YtdlCore({
    oauth2Credentials: {
        accessToken: '...',
        refreshToken: '...',
        expiryDate: 'yyyy-MM-ddThh-mm-ssZ',
        clientData: {
            clientId: '...',
            clientSecret: '...',
        },
    },
});

/* Specify to the function if there is a need to override what was specified during class initialization. */
// This `ytdl` is already initialized as in the other examples.
ytdl.getFullInfo('https://www.youtube.com/watch?v=dQw4w9WgXcQ', {
    oauth2Credentials: {
        accessToken: '...',
        refreshToken: '...',
        expiryDate: 'yyyy-MM-ddThh-mm-ssZ',
    },
});
```

#### Oauth2 Access Token generation

There are two recommended methods for generating OAuth2 tokens.

1. Generate using [imputnet/cobalt](https://github.com/imputnet/cobalt)
2. Generate using your own client ID and secret

> [!TIP]
> The method of production with cobalt is very stable and is recommended. Tokens generated using cobalt can be used in the normal way.

> [!IMPORTANT]
> If you generate it yourself, specify the client ID and secret in `clientData`. This is required to refresh the token.

To generate tokens using Cobalt, execute the following command.

```bash
git clone https://github.com/imputnet/cobalt
cd cobalt/api/src
npm install -g pnpm
pnpm install
npm run token:youtube
```

If you wish to generate your own, please refer to the example folder for an example.

### PoToken Support

`@ybd-project/ytdl-core` supports `PoToken`.

The `PoToken` can be used to avoid bot errors and must be specified with `VisitorData`. If you need to obtain `PoToken` or `VisitorData`, please use the following repository to generate them.

1. https://github.com/iv-org/youtube-trusted-session-generator
2. https://github.com/LuanRT/BgUtils
3. https://github.com/fsholehan/scrape-youtube

```ts
import { YtdlCore } from '@ybd-project/ytdl-core';

/* Basic Method */
const ytdl = new YtdlCore({ poToken: 'PO_TOKEN', visitorData: 'VISITOR_DATA' });

// PoToken, etc. specified at the time of class instantiation will be used.
// PoToken used: PO_TOKEN
ytdl.getFullInfo('https://www.youtube.com/watch?v=dQw4w9WgXcQ');

// Specified as function arguments take precedence over those specified at the time of class instantiation.
// PoToken used: OVERRIDE_PO_TOKEN
ytdl.getFullInfo('https://www.youtube.com/watch?v=dQw4w9WgXcQ', { poToken: 'OVERRIDE_PO_TOKEN', visitorData: 'OVERRIDE_VISITOR_DATA' });
```

#### Disable automatic PoToken generation

The `PoToken` is automatically generated if not specified by default. To disable this, set the option `disablePoTokenAutoGeneration` to `true`.

```ts
import { YtdlCore } from '@ybd-project/ytdl-core';

const ytdl = new YtdlCore({ disablePoTokenAutoGeneration: true });
```

### Proxy Support

`@ybd-project/ytdl-core` supports proxies.

> [!IMPORTANT]
> Try PoToken or OAuth2 before using a proxy. These may have the same effect as proxies.

Starting with v6.0.0, the `createProxyAgent` function and others are obsolete. Proxies must be implemented independently through the `fetcher` function.

```ts
import { YtdlCore } from '@ybd-project/ytdl-core';
import { fetch, ProxyAgent } from 'undici';

const AGENT = new ProxyAgent('http://xxx.xxx.xxx.xxx:PORT'),
    ytdl = new YtdlCore({
        fetcher: (url, options) => {
            const REQUEST_OPTIONS: RequestInit = {
                ...options,
                dispatcher: AGENT,
            };

            return fetch(url, REQUEST_OPTIONS);
        },
    });

ytdl.getFullInfo('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
```

#### Build and use your own proxy

Using a proxy sold by one service may not work. In such cases, you can deploy your own proxy, e.g., to Cloudflare Workers.

See the [example](https://github.com/ybd-project-ver1/ytdl-core/tree/main/examples/OriginalProxy/) for a proxy server implementation.

##### Use of proprietary proxies

```ts
import { YtdlCore } from '@ybd-project/ytdl-core';

const ytdl = new YtdlCore({
    originalProxy: {
        base: 'http://localhost:6543',
        download: 'http://localhost:6543/video-download',
        urlQueryName: 'apiUrl',
    },
});

/* With rewriteRequest, you can specify various things. (e.g., random selection of multiple proxies) */
const ytdl = new YtdlCore({
    rewriteRequest: (url, options, { isDownloadUrl }) => {
        if (isDownloadUrl) {
            // URL is like: https://***.googlevideo.com/playbackvideo?...

            return {
                url: `https://your-video-proxy.server.com/?url=${encodeURIComponent(url)}`,
                options,
            };
        }

        return {
            url: `https://your-proxy.server.com/?url=${encodeURIComponent(url)}`,
            options,
        };
    },
});

ytdl.getFullInfo('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
```

## Examples

See the Examples folder for [examples](https://github.com/ybd-project-ver1/ytdl-core/tree/main/examples) of using `@ybd-project/ytdl-core`.

## Precautions

### Limitations

`@ybd-project/ytdl-core` is unable to retrieve or download information from the following videos.

-   Regionally restricted (requires a [proxy](#proxy-support))
-   Private (if you have access, requires [OAuth2](#oauth2-support))
-   Rentals (if you have access, requires [OAuth2](#oauth2-support))
-   YouTube Premium content (if you have access, requires [OAuth2](#oauth2-support))
-   Only [HLS Livestreams](https://en.wikipedia.org/wiki/HTTP_Live_Streaming) are currently supported. Other formats will get filtered out in ytdl.chooseFormats

The URL to view the retrieved video is valid for 6 hours. (In some cases, downloading may only be possible from the same IP.)

### Rate Limiting

When doing too many requests YouTube might block. This will result in your requests getting denied with HTTP-StatusCode 429. The following steps might help you:

-   Update `@ybd-project/ytdl-core` to the latest version
-   Use OAuth2 (you can find an example [here](#oauth2-support))
-   Use proxies (you can find an example [here](#proxy-support))
-   Extend the Proxy Idea by rotating (IPv6-)Addresses
    -   read [this](https://github.com/fent/node-ytdl-core#how-does-using-an-ipv6-block-help) for more information about this
-   Wait it out (it usually goes away within a few days)

## License

Distributed under the [MIT](https://choosealicense.com/licenses/mit/) License.
