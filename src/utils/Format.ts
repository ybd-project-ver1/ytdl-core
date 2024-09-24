import type { YT_StreamingAdaptiveFormat, YTDL_ClientTypes, YTDL_VideoFormat, YTDL_ChooseFormatOptions } from '@/types';

import { FORMATS } from '@/meta/formats';

import utils from './Utils';

/* Private Constants */
// Use these to help sort formats, higher index is better.
const AUDIO_ENCODING_RANKS = ['mp4a', 'mp3', 'vorbis', 'aac', 'opus', 'flac'],
    VIDEO_ENCODING_RANKS = ['mp4v', 'avc1', 'Sorenson H.283', 'MPEG-4 Visual', 'VP8', 'VP9', 'av01', 'H.264'];

/* Private Functions */
function getEncodingRank(ranks: Array<string>, format: YTDL_VideoFormat): number {
    return ranks.findIndex((enc) => format.codec.text && format.codec.text.includes(enc));
}

function getVideoBitrate(format: YTDL_VideoFormat): number {
    return format.bitrate || 0;
}
function getVideoEncodingRank(format: YTDL_VideoFormat): number {
    return getEncodingRank(VIDEO_ENCODING_RANKS, format);
}

function getAudioBitrate(format: YTDL_VideoFormat): number {
    return format.audioBitrate || 0;
}
function getAudioEncodingRank(format: YTDL_VideoFormat): number {
    return getEncodingRank(AUDIO_ENCODING_RANKS, format);
}

/** Sort formats by a list of functions. */
function sortFormatsBy(a: Object, b: Object, sortBy: Array<Function>) {
    let res = 0;

    for (const FUNC of sortBy) {
        res = FUNC(b) - FUNC(a);

        if (res !== 0) {
            break;
        }
    }

    return res;
}

function getQualityLabel(format: YTDL_VideoFormat): number {
    return parseInt(format.quality.label) || 0;
}
function sortFormatsByVideo(a: Object, b: Object) {
    return sortFormatsBy(a, b, [getQualityLabel, getVideoBitrate, getVideoEncodingRank]);
}

function sortFormatsByAudio(a: Object, b: Object) {
    return sortFormatsBy(a, b, [getAudioBitrate, getAudioEncodingRank]);
}

/** Gets a format based on quality or array of quality's */
function getFormatByQuality(quality: YTDL_ChooseFormatOptions['quality'], formats: Array<YTDL_VideoFormat>): YTDL_VideoFormat | null {
    const getFormat = (itag: string | number) => formats.find((format) => `${format.itag}` === `${itag}`) || null;

    if (Array.isArray(quality)) {
        const FOUND = quality.find((itag) => getFormat(itag));

        if (!FOUND) {
            return null;
        }

        return getFormat(FOUND) || null;
    } else {
        return getFormat(quality || '') || null;
    }
}

/* Public Class */
class FormatUtils {
    static sortFormats(a: Object, b: Object) {
        return sortFormatsBy(a, b, [
            // Formats with both video and audio are ranked highest.
            (format: YTDL_VideoFormat) => +!!format.isHLS,
            (format: YTDL_VideoFormat) => +!!format.isDashMPD,
            (format: YTDL_VideoFormat) => +(parseInt(format.contentLength) > 0),
            (format: YTDL_VideoFormat) => +(format.hasVideo && format.hasAudio),
            (format: YTDL_VideoFormat) => +format.hasVideo,
            (format: YTDL_VideoFormat) => parseInt(format.quality.label) || 0,
            getVideoBitrate,
            getAudioBitrate,
            getVideoEncodingRank,
            getAudioEncodingRank,
        ]);
    }

    static filterFormats(formats: Array<YTDL_VideoFormat>, filter?: YTDL_ChooseFormatOptions['filter']): Array<YTDL_VideoFormat> {
        let fn: Function;

        switch (filter) {
            case 'videoandaudio':
            case 'audioandvideo': {
                fn = (format: YTDL_VideoFormat) => format.hasVideo && format.hasAudio;
                break;
            }

            case 'video': {
                fn = (format: YTDL_VideoFormat) => format.hasVideo;
                break;
            }

            case 'videoonly': {
                fn = (format: YTDL_VideoFormat) => format.hasVideo && !format.hasAudio;
                break;
            }

            case 'audio': {
                fn = (format: YTDL_VideoFormat) => format.hasAudio;
                break;
            }

            case 'audioonly': {
                fn = (format: YTDL_VideoFormat) => format.hasAudio && !format.hasVideo;
                break;
            }

            default: {
                if (typeof filter === 'function') {
                    fn = filter;
                } else {
                    throw new TypeError(`Given filter (${filter}) is not supported`);
                }
            }
        }

        return formats.filter((format) => !!format.url && fn(format));
    }

    static chooseFormat(formats: Array<YTDL_VideoFormat>, options: YTDL_ChooseFormatOptions): YTDL_VideoFormat {
        if (typeof options.format === 'object') {
            if (!options.format.url) {
                throw new Error('Invalid format given, did you use `ytdl.getFullInfo()`?');
            }

            return options.format;
        }

        if (options.filter) {
            formats = this.filterFormats(formats, options.filter);
        }

        if (options.excludingClients) {
            formats = formats.filter((format) => !options.excludingClients?.includes(format.sourceClientName as any));
        }

        if (options.includingClients && options.includingClients !== 'all') {
            formats = formats.filter((format) => options.includingClients?.includes(format.sourceClientName as any));
        }

        if (formats.some((format) => format.isHLS)) {
            formats = formats.filter((format) => format.isHLS || !format.isLive);
        }

        const QUALITY: YTDL_ChooseFormatOptions['quality'] = options.quality || 'highest';
        let format;

        switch (QUALITY) {
            case 'highest': {
                format = formats[0];
                break;
            }

            case 'lowest': {
                format = formats[formats.length - 1];
                break;
            }

            case 'highestaudio': {
                formats = this.filterFormats(formats, 'audio');
                formats.sort(sortFormatsByAudio);

                const BEST_AUDIO_FORMAT = formats[0];
                formats = formats.filter((format) => sortFormatsByAudio(BEST_AUDIO_FORMAT, format) === 0);

                const WORST_VIDEO_QUALITY = formats.map((format) => parseInt(format.quality.label) || 0).sort((a, b) => a - b)[0];

                format = formats.find((format) => (parseInt(format.quality.label) || 0) === WORST_VIDEO_QUALITY);
                break;
            }

            case 'lowestaudio': {
                formats = this.filterFormats(formats, 'audio');
                formats.sort(sortFormatsByAudio);
                format = formats[formats.length - 1];
                break;
            }

            case 'highestvideo': {
                formats = this.filterFormats(formats, 'video');
                formats.sort(sortFormatsByVideo);

                const BEST_VIDEO_FORMAT = formats[0];
                formats = formats.filter((format) => sortFormatsByVideo(BEST_VIDEO_FORMAT, format) === 0);

                const WORST_VIDEO_QUALITY = formats.map((format) => format.audioBitrate || 0).sort((a, b) => a - b)[0];

                format = formats.find((format) => (format.audioBitrate || 0) === WORST_VIDEO_QUALITY);
                break;
            }

            case 'lowestvideo': {
                formats = this.filterFormats(formats, 'video');
                formats.sort(sortFormatsByVideo);
                format = formats[formats.length - 1];
                break;
            }

            default: {
                format = getFormatByQuality(QUALITY, formats);
                break;
            }
        }

        if (!format) {
            throw new Error(`No such format found: ${QUALITY}`);
        }

        return format;
    }

    static getClientName(url: string): YTDL_ClientTypes | 'unknown' {
        try {
            const C = new URL(url).searchParams.get('c');

            switch (C) {
                case 'WEB': {
                    return 'web';
                }
                case 'MWEB': {
                    return 'mweb';
                }
                case 'WEB_CREATOR': {
                    return 'webCreator';
                }
                case 'WEB_EMBEDDED_PLAYER': {
                    return 'webEmbedded';
                }
                case 'IOS': {
                    return 'ios';
                }
                case 'ANDROID': {
                    return 'android';
                }
                case 'TVHTML5_SIMPLY_EMBEDDED_PLAYER': {
                    return 'tvEmbedded';
                }
                default: {
                    return 'unknown';
                }
            }
        } catch (err) {
            return 'unknown';
        }
    }

    static addFormatMeta(adaptiveFormat: YT_StreamingAdaptiveFormat, includesOriginalFormatData: boolean): YTDL_VideoFormat {
        const ITAG = adaptiveFormat.itag,
            ADDITIONAL_FORMAT_DATA = FORMATS[ITAG] || null,
            CODEC = adaptiveFormat.mimeType && utils.between(adaptiveFormat.mimeType, 'codecs="', '"'),
            IS_HLS = /\/manifest\/hls_(variant|playlist)\//.test(adaptiveFormat.url),
            FORMAT: YTDL_VideoFormat = {
                itag: ITAG,
                url: adaptiveFormat.url,
                mimeType: adaptiveFormat.mimeType || 'video/mp4',
                codec: {
                    text: CODEC || 'h264',
                    video: null,
                    audio: null,
                },
                quality: {
                    text: adaptiveFormat.quality,
                    label: adaptiveFormat.qualityLabel || (IS_HLS ? 'video' : 'audio'),
                },
                bitrate: adaptiveFormat.bitrate || ADDITIONAL_FORMAT_DATA?.bitrate || NaN,
                audioBitrate: ADDITIONAL_FORMAT_DATA?.audioBitrate || NaN,
                contentLength: adaptiveFormat.contentLength,
                container: (adaptiveFormat.mimeType?.split(';')[0].split('/')[1] as YTDL_VideoFormat['container']) || null,
                hasVideo: !!adaptiveFormat.qualityLabel || !!!adaptiveFormat.audioQuality,
                hasAudio: !!adaptiveFormat.audioQuality,
                isLive: /\bsource[/=]yt_live_broadcast\b/.test(adaptiveFormat.url),
                isHLS: IS_HLS,
                isDashMPD: /\/manifest\/dash\//.test(adaptiveFormat.url),
                sourceClientName: IS_HLS ? 'ios' : this.getClientName(adaptiveFormat.url) || 'unknown',
            },
            SPLITTED_CODEC = FORMAT.codec.text.split(', ');

        if (includesOriginalFormatData) {
            FORMAT.originalData = adaptiveFormat;
        }

        FORMAT.codec.video = FORMAT.hasVideo ? SPLITTED_CODEC[0] : null;
        FORMAT.codec.audio = FORMAT.hasAudio ? SPLITTED_CODEC[1] || SPLITTED_CODEC[0] : null;

        return FORMAT;
    }
}

export { FormatUtils };
