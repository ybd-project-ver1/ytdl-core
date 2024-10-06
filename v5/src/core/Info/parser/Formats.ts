type YTDL_M3U8Data = { itag: number; url: string };
type YTDL_DashManifestData = {
    itag: number;
    url: string;
    bitrate: number;
    mimeType: string;
    audioSampleRate?: number;
    width?: number;
    height?: number;
    fps?: number;
};

import sax from 'sax';

import { YTDL_RequestOptions } from '@/types/Options';
import { YT_StreamingAdaptiveFormat, YT_PlayerApiResponse } from '@/types/youtube';

import Fetcher from '@/core/Fetcher';

import Url from '@/utils/Url';

export default class Formats {
    static parseFormats(playerResponse: YT_PlayerApiResponse | null): Array<YT_StreamingAdaptiveFormat> {
        let formats: Array<YT_StreamingAdaptiveFormat> = [];

        if (playerResponse && playerResponse.streamingData) {
            formats = formats.concat(playerResponse.streamingData.formats).concat(playerResponse.streamingData.adaptiveFormats);
        }

        return formats;
    }

    static async getM3U8(url: string, options: YTDL_RequestOptions): Promise<Record<string, YTDL_M3U8Data>> {
        const _URL = new URL(url, Url.getBaseUrl()),
            BODY = await Fetcher.request<string>(_URL.toString(), options),
            FORMATS: Record<string, YTDL_M3U8Data> = {};

        BODY.split('\n')
            .filter((line) => /^https?:\/\//.test(line))
            .forEach((line) => {
                const MATCH = line.match(/\/itag\/(\d+)\//) || [],
                    ITAG = parseInt(MATCH[1]);

                FORMATS[line] = { itag: ITAG, url: line };
            });

        return FORMATS;
    }

    static getDashManifest(url: string, options: YTDL_RequestOptions): Promise<Record<string, YTDL_DashManifestData>> {
        return new Promise((resolve, reject) => {
            const PARSER = sax.parser(false),
                FORMATS: Record<string, YTDL_DashManifestData> = {};

            PARSER.onerror = reject;
            let adaptationSet: any = null;

            PARSER.onopentag = (node) => {
                const ATTRIBUTES = node.attributes as any;

                if (node.name === 'ADAPTATIONSET') {
                    adaptationSet = ATTRIBUTES;
                } else if (node.name === 'REPRESENTATION') {
                    const ITAG = parseInt(ATTRIBUTES.ID);
                    if (!isNaN(ITAG)) {
                        const SOURCE = (() => {
                            if (node.attributes.HEIGHT) {
                                return {
                                    width: parseInt(ATTRIBUTES.WIDTH),
                                    height: parseInt(ATTRIBUTES.HEIGHT),
                                    fps: parseInt(ATTRIBUTES.FRAMERATE),
                                };
                            } else {
                                return {
                                    audioSampleRate: ATTRIBUTES.AUDIOSAMPLINGRATE,
                                };
                            }
                        })();

                        FORMATS[url] = Object.assign(
                            {
                                itag: ITAG,
                                url,
                                bitrate: parseInt(ATTRIBUTES.BANDWIDTH),
                                mimeType: `${adaptationSet.MIMETYPE}; codecs="${ATTRIBUTES.CODECS}"`,
                            },
                            SOURCE,
                        );

                        Object.assign;
                    }
                }
            };

            PARSER.onend = () => {
                resolve(FORMATS);
            };

            Fetcher.request(new URL(url, Url.getBaseUrl()).toString(), options)
                .then((res: any) => {
                    PARSER.write(res);
                    PARSER.close();
                })
                .catch(reject);
        });
    }

    static parseAdditionalManifests(playerResponse: YT_PlayerApiResponse | null, options: YTDL_RequestOptions): Array<Promise<Record<string, YTDL_M3U8Data | YTDL_DashManifestData>>> {
        const STREAMING_DATA = playerResponse && playerResponse.streamingData,
            MANIFESTS: Array<Promise<Record<string, YTDL_M3U8Data | YTDL_DashManifestData>>> = [];

        if (STREAMING_DATA) {
            if (STREAMING_DATA.dashManifestUrl) {
                MANIFESTS.push(Formats.getDashManifest(STREAMING_DATA.dashManifestUrl, options));
            }

            if (STREAMING_DATA.hlsManifestUrl) {
                MANIFESTS.push(Formats.getM3U8(STREAMING_DATA.hlsManifestUrl, options));
            }
        }

        return MANIFESTS;
    }
}
