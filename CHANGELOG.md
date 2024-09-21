# Changelog

## v5.2.0 (2024/09/20) *Not released, planned.

### Features
* **YtdlCore:** Support for use in browsers. (To use, import `@ybd-project/ytdl-core/browser`)
* **YtdlCore:** Add a processing-optimized YtdlCore for deployment to serverless functions such as Vercel Functions (just use `@ybd-project/ytdl-core/serverless` when importing)

> [!NOTE]
> YtdlCore for serverless functions no longer uses class instances, but individual functions. (No need to import `{ YtdlCore }`, just like `{ getFullInfo }`)

* **YtdlCore:** Changed to be able to import types used in YtdlCore (To use, import `@ybd-project/ytdl-core/types`)
* **Search:** Supports search from YouTube

## v5.1.8 (2024/09/20)

### Features
* **Proxy:** Add `originalProxy` option.
* **Client:** With the addition of `WEB_EMBEDDED` in LuanRT/YouTube.js, ytdl-core also supports it

### Bug Fixes
* **VideoInfo:** Fixed issue with publish date not being included in video details

### Improvement
* **YtdlCore:** Overall improvements in performance, code, etc.

### Deprecated
* **Proxy:** The `originalProxyUrl` option has been rewritten to the `originalProxy` option due to lack of convenience of use.

## v5.1.7 (2024/09/18)

### Features
* **Proxy:** Add `originalProxyUrl` option.
* **M3U8:** Add `parsesHLSFormat` option. (Rename `notParsingHLSFormat`)

## v5.1.6 (2024/09/15)

### Features
* **Format Selection:** Changed to determine if the download URL is correct. (To address https://github.com/ybd-project/ytdl-core/issues/21)

## v5.1.5 (2024/09/14)

### Features
* **OAuth2:** Changed OAuth2 to test whether tokens can be used successfully. If not, disable the token.
* **Version:** Changed to check Node.js version; If Node.js is less than 16, the process will terminate due to an error.

### Improvement
* **Error:** Improved error handling, etc.

## v5.1.4 (2024/09/12)

### Bug Fixes
* **Syntax:** Fixed problem with "??=" still remaining.

## v5.1.3 (2024/09/12)

### Features
* **Cache:** Add `disableFileCache` option. (Specify if an error occurs in the file cache.)
* **M3U8:** Supports HLS formats that can be retrieved from IOS clients.
* **M3U8:** Add `notParsingHLSFormat` option. (do not parse HLS format)

### Bug Fixes
* **Syntax:** Fixed a problem in which the "??=" syntax caused errors in certain environments.
* **Fetch:** Fixed "ReferenceError: fetch is not defined" problem in certain environments

## v5.1.2 (2024/09/11)

### Features
* **Cache:** Cache PoToken, VisitorData, OAuth2 credentials, and htm5player data. (Data is stored in the CacheFiles directory in /package/core/)
* **Download:** Send a HEAD request to the download URL to determine if it is available.

### Changes
* **Format Selection:** Rename `filteringClients` to `excludingClients`.

### Improvement
* **Log:** Improved log output.

## v5.1.1 (2024/09/09)

### Features
* **Format Selection:** Added option `filteringClients` to filter format data by client name

### Bug Fixes
* **Log:** Fixed problem with incorrect indentation in success log

### Improvement
* **YtdlCore:** Improved option specification for YtdlCore classes
* **Format Selection:** Improved to exclude video URLs (audio URLs) from web clients unless specified with the `filteringClients` option since they return 403

## v5.1.0 (2024/09/09)

### Features
* **Operation:** Next API (/youtubei/v1/next) to stabilize the operation.
* **Request:** Refer to (https://github.com/distubejs/ytdl-core/pull/105)[https://github.com/distubejs/ytdl-core/pull/105] and add the `rewriteRequest` option

### Changes
* **YtdlCore:** YtdlCore is now a class so that options can be specified in a unified manner.

### Bug Fixes
* **OAuth2:** Fixed problem with updating OAuth2 tokens
* **Info:** Fixed to be able to retrieve channel subscribers and whether the channel is verified.

### Improvement
* **Performance:** Improved operating performance
* **Types:** Improved TypeScript type specification

### Deprecated
* **Traditional Use:** Traditional usage has been deprecated. Please use the new usage, YtdlCore class. See the API documentation for details.

## v5.0.17 (2024/09/07)

### Features
* **Clients:** Change supported clients to only those that work properly
* **OAuth2:** OAuth2 support

### Bug Fixes
* **Player:** Improved implementation of Player API to reduce errors (when specifying PoToken or OAuth2)

### Deprecated
* **getInfo:** The getInfo function has been deprecated. Please use the getFullInfo function instead. (The getInfo function can be used until v5.2.x.)

## v5.0.13, v5.0.14 (2024/09/05)

### Features
* **Log:** Changed to be able to check the status of the player API. (Specify `YTDL_DEBUG` in the environment variable)

### Bug Fixes
* **Player:** Fixed an issue where player API URLs for Android and iOS players were not set correctly

## v5.0.9, v5.0.9-2, v5.0.10, v5.0.11, v5.0.12 (2024/08/21)

### Bug Fixes
* **Client:** Fixed a problem that prevented clients from being set up properly

### Temporary Deletion
* **Client:** The tv_embedded support for age restrictions has been temporarily removed for various reasons. (Automatic switching)

## v5.0.8 (2024/08/21)

### Features

* **Client:** Support for tv_embedded player to make age-restricted videos available
* **Player:** Change to use [youtube-po-token-generator](https://github.com/YunzheZJU/youtube-po-token-generator) to get poToken automatically when poToken is not specified. (For stable operation, generate manually.)
* **Log:** Improved log output

## v5.0.7 (2024/08/20)

### Features

* **Client:** Support for a variety of clients (Can be specified by `clients` argument)
```typescript
ytdl.getInfo('VIDEO_URL', {
    clients: ['C1', 'C2'],
});
```

* **Data:** Support for specifying whether to include or exclude data used in processing to prevent data growth (Default: false)
```typescript
ytdl.getInfo('VIDEO_URL', {
    includesPlayerAPIResponse: true,
    includesWatchPageInfo: true,
});
```

* **Log:** Changed to display warning if poToken is not specified

## v5.0.0 (2024/08/20)

### Features

* **Code:** Rewrote all code to TypeScript
* **Player:** poToken, and visitorData support
```typescript
ytdl.getInfo('VIDEO_URL', {
    poToken: 'PO_TOKEN',
    visitorData: 'VISITOR_DATA',
});
```
