import { Readable } from 'readable-stream';

import type { YT_Itag, YT_MicroformatRenderer, YT_NextApiResponse, YT_PlayerApiResponse, YT_Quality, YT_QualityLabel, YT_StreamingAdaptiveFormat, YT_Thumbnail } from './YouTube';
import type { YTDL_ClientTypes } from './Clients';
import type { YTDL_DownloadOptions, YTDL_GetInfoOptions } from './Options';

export type YTDL_Author = {
    id: string;
    name: string;
    thumbnails: Array<YT_Thumbnail>;
    channelUrl: string;
    subscriberCount: number | null;
    verified: boolean;
    user?: string;
    externalChannelUrl?: string;
    userUrl?: string;
};

export type YTDL_Media = {
    category: string;
    categoryUrl: string;
    thumbnails: Array<YT_Thumbnail>;
    game?: string;
    gameUrl?: string;
    year?: number;
    song?: string;
    artist?: string;
    artistUrl?: string;
    writers?: string;
    licensedBy?: string;
};

export type YTDL_Storyboard = {
    templateUrl: string;
    thumbnailWidth: number;
    thumbnailHeight: number;
    thumbnailCount: number;
    interval: number;
    columns: number;
    rows: number;
    storyboardCount: number;
};

export type YTDL_Chapter = {
    title: string;
    startTime: number;
};

export type YTDL_VideoDetailsAdditions = {
    videoUrl: string;
    ageRestricted: boolean;
    likes: number | null;
    media: YTDL_Media | null;
    author: YTDL_Author | null;
    storyboards: Array<YTDL_Storyboard>;
    chapters: Array<YTDL_Chapter>;
    thumbnails: Array<YT_Thumbnail>;
    description: string | null;
};

export type YTDL_VideoDetails = YTDL_VideoDetailsAdditions & {
    videoId: string;
    title: string;
    playabilityStatus: YT_PlayerApiResponse['playabilityStatus']['status'] | 'UNKNOWN';
    lengthSeconds: number;
    keywords: Array<string>;
    channelId: string;
    isOwnerViewing: boolean;
    isCrawlable: boolean;
    allowRatings: boolean;
    viewCount: number;
    isPrivate: boolean;
    isUnpluggedCorpus: boolean;
    isLiveContent: boolean;
    isUpcoming: boolean;
    isLowLatencyLiveStream: boolean;
    liveBroadcastDetails: YT_MicroformatRenderer['liveBroadcastDetails'] | null;
    published: string | null;
    publishDate: string | null;
    latencyClass: string | null;
};

export type YTDL_RelatedVideo = {
    id: string;
    title: string;
    author: YTDL_Author;
    thumbnails: Array<YT_Thumbnail>;
    richThumbnails: Array<YT_Thumbnail>;
    isLive: boolean;
    published: string | null;
    shortViewCountText: string | null;
    viewCount: number | null;
    lengthSeconds: number | null;
};

export type YTDL_VideoFormat = {
    itag: YT_Itag;
    url: string;
    mimeType: string;
    codec: {
        text: string;
        audio: string | null;
        video: string | null;
    };
    quality: {
        text: YT_Quality;
        label: YT_QualityLabel;
    };
    bitrate: number;
    audioBitrate: number;
    contentLength: string;
    container: 'flv' | '3gp' | 'mp4' | 'webm' | 'ts' | null;
    hasVideo: boolean;
    hasAudio: boolean;
    isLive: boolean;
    isHLS: boolean;
    isDashMPD: boolean;
    sourceClientName: YTDL_ClientTypes | 'unknown';
    originalData?: YT_StreamingAdaptiveFormat;
};

export type YTDL_VideoInfo = {
    videoDetails: YTDL_VideoDetails;
    relatedVideos: Array<YTDL_RelatedVideo>;
    formats: Array<YTDL_VideoFormat>;
    full: boolean;
    live_chunk_readahead?: number;

    _metadata: {
        isMinimumMode: boolean;
        clients: Array<YTDL_ClientTypes>;
        html5PlayerUrl: string;
        id: string;
        options: YTDL_GetInfoOptions;
    };
    _ytdl: {
        version: string;
    };

    _playerApiResponses?: {
        webCreator: YT_PlayerApiResponse | null;
        tvEmbedded: YT_PlayerApiResponse | null;
        ios: YT_PlayerApiResponse | null;
        android: YT_PlayerApiResponse | null;
        web?: YT_PlayerApiResponse | null;
        mweb?: YT_PlayerApiResponse | null;
        tv?: YT_PlayerApiResponse | null;
    };
    _nextApiResponses?: {
        web: YT_NextApiResponse | null;
    };
};

export type YTDL_Constructor = Omit<YTDL_DownloadOptions, 'format'> & {
    fetcher?: (url: URL | RequestInfo, options?: RequestInit) => Promise<Response>;
    logDisplay?: Array<'debug' | 'info' | 'success' | 'warning' | 'error'> | 'none';
    noUpdate?: boolean;
};

export class YTDL_DefaultStreamType extends ReadableStream<any> {}
export class YTDL_NodejsStreamType extends Readable {}
