export type YT_Itag = number;
export type YT_Quality = 'tiny' | 'small' | 'medium' | 'large' | 'hd720' | 'hd1080' | 'hd1440' | 'hd2160' | 'highres' | (string & {});
export type YT_QualityLabel = '144p' | '144p 15fps' | '144p60 HDR' | '240p' | '240p60 HDR' | '270p' | '360p' | '360p60 HDR' | '480p' | '480p60 HDR' | '720p' | '720p60' | '720p60 HDR' | '1080p' | '1080p60' | '1080p60 HDR' | '1440p' | '1440p60' | '1440p60 HDR' | '2160p' | '2160p60' | '2160p60 HDR' | '4320p' | '4320p60' | 'video' | 'audio';

export type YT_StreamingAdaptiveFormat = {
    itag: YT_Itag;
    url: string;
    signatureCipher?: string;
    cipher?: string;
    mimeType?: string;
    bitrate?: number;
    audioBitrate?: number;
    width?: number;
    height?: number;
    initRange?: { start: string; end: string };
    indexRange?: { start: string; end: string };
    lastModified: string;
    contentLength: string;
    quality: YT_Quality;
    qualityLabel: YT_QualityLabel;
    projectionType?: 'RECTANGULAR';
    fps?: number;
    averageBitrate?: number;
    audioQuality?: 'AUDIO_QUALITY_LOW' | 'AUDIO_QUALITY_MEDIUM';
    colorInfo?: {
        primaries: string;
        transferCharacteristics: string;
        matrixCoefficients: string;
    };
    highReplication?: boolean;
    approxDurationMs?: string;
    targetDurationSec?: number;
    maxDvrDurationSec?: number;
    audioSampleRate?: string;
    audioChannels?: number;
};