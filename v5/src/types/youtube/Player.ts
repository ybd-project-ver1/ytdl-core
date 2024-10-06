import { YT_StreamingAdaptiveFormat } from './Formats';
import { YT_Thumbnail } from './Misc';
import { YT_EndscreenElementRenderer, YT_MicroformatRenderer } from './Renderers';

export type YT_VideoDetails = {
    videoId: string;
    title: string;
    lengthSeconds: string;
    keywords: Array<string>;
    channelId: string;
    isOwnerViewing: boolean;
    shortDescription: string;
    isCrawlable: boolean;
    thumbnail: {
        thumbnails: Array<YT_Thumbnail>;
    };
    allowRatings: boolean;
    viewCount: string;
    author: string;
    isPrivate: boolean;
    isUnpluggedCorpus: boolean;
    isLiveContent: boolean;
};

export type YT_PlayerApiResponse = {
    playabilityStatus: { status: 'OK' | 'ERROR' | 'LOGIN_REQUIRED' | 'LIVE_STREAM_OFFLINE' | 'UNPLAYABLE'; reason?: string; messages?: string[] };
    streamingData: {
        expiresInSeconds: string;
        adaptiveFormats: Array<YT_StreamingAdaptiveFormat>;
        formats: Array<YT_StreamingAdaptiveFormat>;
        dashManifestUrl?: string;
        hlsManifestUrl?: string;
    };
    videoDetails: YT_VideoDetails;
    storyboards: { playerStoryboardSpecRenderer: { spec: string; recommendedLevel: number; highResolutionRecommendedLevel?: number } };
    microformat?: { playerMicroformatRenderer: YT_MicroformatRenderer };
    endscreen?: {
        endscreenRenderer: {
            elements: Array<YT_EndscreenElementRenderer>;
        };
    };
};
