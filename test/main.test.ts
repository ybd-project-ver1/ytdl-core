import { YtdlCore as DefaultYtdlCore, YTDL_Constructor } from '../package/platforms/Default/Default';
import { YtdlCore as BrowserYtdlCore } from '../package/platforms/Browser/Browser';
import { YtdlCore as ServerlessYtdlCore } from '../package/platforms/Serverless/Serverless';
import { VIDEO_IDS } from './videoIds';

jest.useRealTimers();
jest.setTimeout(120000);

const CLIENTS: any = ['web', 'webCreator', 'android', 'ios', 'tv', 'tvEmbedded'],
    YTDL_CORE_OPTIONS: YTDL_Constructor = {
        hl: 'ja',
        gl: 'JP',
        disablePoTokenAutoGeneration: true,
        logDisplay: [],
        disableDefaultClients: true,
        includingClients: 'all',
        clients: CLIENTS,
        rewriteRequest: (url: string, options: RequestInit) => {
            return { url, options };
        },
    },
    ytdl_default = new DefaultYtdlCore(YTDL_CORE_OPTIONS),
    ytdl_browser = new BrowserYtdlCore(YTDL_CORE_OPTIONS),
    ytdl_serverless = new ServerlessYtdlCore(YTDL_CORE_OPTIONS);

describe('【@ybd-project/ytdl-core】機能テスト', () => {
    describe('GetInfo 関数テスト', () => {
        describe('デフォルト', () => {
            const { normal, private: privateVideo, beforePublication, limitedPublication, forChildren, ageRestricted, unavailable, invalid } = VIDEO_IDS;

            it(`通常（ID: ${normal}）`, async () => {
                const RESULTS = await ytdl_default.getFullInfo('https://www.youtube.com/watch?v=' + normal);
                expect(RESULTS.videoDetails.videoId).toBe(normal);
            });

            it(`非公開（ID: ${privateVideo}）`, async () => {
                await expect(ytdl_default.getFullInfo('https://www.youtube.com/watch?v=' + privateVideo)).rejects.toThrow();
            });

            it(`公開前（ID: ${beforePublication}, プレミア公開前）`, async () => {
                const RESULTS = await ytdl_default.getFullInfo('https://www.youtube.com/watch?v=' + beforePublication);
                expect(RESULTS.videoDetails.videoId).toBe(beforePublication);
            });

            it(`限定公開（ID: ${limitedPublication}）`, async () => {
                const RESULTS = await ytdl_default.getFullInfo('https://www.youtube.com/watch?v=' + limitedPublication);
                expect(RESULTS.videoDetails.videoId).toBe(limitedPublication);
            });

            it(`子供向け（ID: ${forChildren}）`, async () => {
                const RESULTS = await ytdl_default.getFullInfo('https://www.youtube.com/watch?v=' + forChildren);
                expect(RESULTS.videoDetails.videoId).toBe(forChildren);
            });

            it(`年齢制限（ID: ${ageRestricted}）`, async () => {
                const RESULTS = await ytdl_default.getFullInfo('https://www.youtube.com/watch?v=' + ageRestricted);
                expect(RESULTS.videoDetails.videoId).toBe(ageRestricted);
            });

            it(`利用不可（ID: ${unavailable}）`, async () => {
                await expect(ytdl_default.getFullInfo('https://www.youtube.com/watch?v=' + unavailable)).rejects.toThrow();
            });

            it(`無効なID（ID: ${invalid}）`, async () => {
                await expect(ytdl_default.getFullInfo('https://www.youtube.com/watch?v=' + invalid)).rejects.toThrow();
            });
        });

        describe('ブラウザ', () => {
            const { normal, private: privateVideo, beforePublication, limitedPublication, forChildren, ageRestricted, unavailable, invalid } = VIDEO_IDS;

            it(`通常（ID: ${normal}）`, async () => {
                const RESULTS = await ytdl_browser.getFullInfo('https://www.youtube.com/watch?v=' + normal);
                expect(RESULTS.videoDetails.videoId).toBe(normal);
            });

            it(`非公開（ID: ${privateVideo}）`, async () => {
                await expect(ytdl_browser.getFullInfo('https://www.youtube.com/watch?v=' + privateVideo)).rejects.toThrow();
            });

            it(`公開前（ID: ${beforePublication}, プレミア公開前）`, async () => {
                const RESULTS = await ytdl_browser.getFullInfo('https://www.youtube.com/watch?v=' + beforePublication);
                expect(RESULTS.videoDetails.videoId).toBe(beforePublication);
            });

            it(`限定公開（ID: ${limitedPublication}）`, async () => {
                const RESULTS = await ytdl_browser.getFullInfo('https://www.youtube.com/watch?v=' + limitedPublication);
                expect(RESULTS.videoDetails.videoId).toBe(limitedPublication);
            });

            it(`子供向け（ID: ${forChildren}）`, async () => {
                const RESULTS = await ytdl_browser.getFullInfo('https://www.youtube.com/watch?v=' + forChildren);
                expect(RESULTS.videoDetails.videoId).toBe(forChildren);
            });

            it(`年齢制限（ID: ${ageRestricted}）`, async () => {
                const RESULTS = await ytdl_browser.getFullInfo('https://www.youtube.com/watch?v=' + ageRestricted);
                expect(RESULTS.videoDetails.videoId).toBe(ageRestricted);
            });

            it(`利用不可（ID: ${unavailable}）`, async () => {
                await expect(ytdl_browser.getFullInfo('https://www.youtube.com/watch?v=' + unavailable)).rejects.toThrow();
            });

            it(`無効なID（ID: ${invalid}）`, async () => {
                await expect(ytdl_browser.getFullInfo('https://www.youtube.com/watch?v=' + invalid)).rejects.toThrow();
            });
        });

        describe('サーバーレス', () => {
            const { normal, private: privateVideo, beforePublication, limitedPublication, forChildren, ageRestricted, unavailable, invalid } = VIDEO_IDS;

            it(`通常（ID: ${normal}）`, async () => {
                const RESULTS = await ytdl_serverless.getFullInfo('https://www.youtube.com/watch?v=' + normal);
                expect(RESULTS.videoDetails.videoId).toBe(normal);
            });

            it(`非公開（ID: ${privateVideo}）`, async () => {
                await expect(ytdl_serverless.getFullInfo('https://www.youtube.com/watch?v=' + privateVideo)).rejects.toThrow();
            });

            it(`公開前（ID: ${beforePublication}, プレミア公開前）`, async () => {
                const RESULTS = await ytdl_serverless.getFullInfo('https://www.youtube.com/watch?v=' + beforePublication);
                expect(RESULTS.videoDetails.videoId).toBe(beforePublication);
            });

            it(`限定公開（ID: ${limitedPublication}）`, async () => {
                const RESULTS = await ytdl_serverless.getFullInfo('https://www.youtube.com/watch?v=' + limitedPublication);
                expect(RESULTS.videoDetails.videoId).toBe(limitedPublication);
            });

            it(`子供向け（ID: ${forChildren}）`, async () => {
                const RESULTS = await ytdl_serverless.getFullInfo('https://www.youtube.com/watch?v=' + forChildren);
                expect(RESULTS.videoDetails.videoId).toBe(forChildren);
            });

            it(`年齢制限（ID: ${ageRestricted}）`, async () => {
                const RESULTS = await ytdl_serverless.getFullInfo('https://www.youtube.com/watch?v=' + ageRestricted);
                expect(RESULTS.videoDetails.videoId).toBe(ageRestricted);
            });

            it(`利用不可（ID: ${unavailable}）`, async () => {
                await expect(ytdl_serverless.getFullInfo('https://www.youtube.com/watch?v=' + unavailable)).rejects.toThrow();
            });

            it(`無効なID（ID: ${invalid}）`, async () => {
                await expect(ytdl_serverless.getFullInfo('https://www.youtube.com/watch?v=' + invalid)).rejects.toThrow();
            });
        });
    });
});
