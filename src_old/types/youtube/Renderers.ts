import { YT_Thumbnail } from './Misc';

export type YT_CompactVideoRenderer = {
    videoId: string;
    thumbnail: {
        thumbnails: Array<YT_Thumbnail>;
    };
    title: {
        simpleText: string;
    };
    publishedTimeText: {
        simpleText: string;
    };
    viewCountText: {
        simpleText: string;
    };
    shortViewCountText: {
        simpleText: string;
    };
    shortBylineText: {
        runs: [
            {
                text: string;
                navigationEndpoint: {
                    browseEndpoint: {
                        browseId: string;
                        canonicalBaseUrl: string;
                    };
                };
            },
        ];
    };
    channelThumbnail: {
        thumbnails: Array<YT_Thumbnail>;
    };
    lengthText: {
        simpleText: string;
    };
    ownerBadges?: Array<any>;
    richThumbnail?: {
        movingThumbnailRenderer: {
            movingThumbnailDetails: {
                thumbnails: Array<YT_Thumbnail>;
            };
        };
    };
    badges?: Array<{
        metadataBadgeRenderer: {
            label: string;
        };
    }>;
};

export type YT_EndscreenElementRenderer = {
    endscreenElementRenderer: {
        style: 'CHANNEL';
        image: {
            thumbnails: Array<YT_Thumbnail>;
        };
        title: {
            runs: Array<{ text: string }>;
        };
        metadata: {
            runs: Array<{ text: string }>;
        };
        endpoint: {
            browseEndpoint: {
                browseId: string;
            };
        };
    };
};

export type YT_MicroformatRenderer = {
    thumbnail: {
        thumbnails: Array<YT_Thumbnail>;
    };
    embed: {
        iframeUrl: string;
        width: number;
        height: number;
        flashUrl?: string;
        flashSecureUrl?: string;
    };
    title: {
        simpleText: string;
    };
    description: {
        simpleText: string;
    };
    lengthSeconds: string;
    ownerProfileUrl: string;
    externalChannelId: string;
    isFamilySafe: boolean;
    availableCountries: Array<string>;
    isUnlisted: boolean;
    hasYpcMetadata: boolean;
    viewCount: string;
    category: string;
    publishDate: string;
    ownerChannelName: string;
    uploadDate: string;
    isShortsEligible: boolean;

    ownerGplusProfileUrl?: string;
    liveBroadcastDetails?: {
        isLiveNow: boolean;
        startTimestamp: string;
        endTimestamp?: string;
    };
};

export type YT_ItemSectionRenderer = {
    contents: Array<YT_CompactVideoRenderer>;
};

export type YT_VideoViewCountRenderer = {
    viewCount: {
        simpleText: string;
    };
    extraShortViewCount: {
        simpleText: string;
    };
    originalViewCount: string;
};

type YT_SegmentedLikeDislikeButtonViewModel = {
    likeButtonViewModel: {
        likeButtonViewModel: any
    }
    likeCountEntity: {
        likeCountIfLiked: {
            content: string;
        };
        likeCountIfLikedNumber: string;
        sentimentFactoidA11yTextIfLiked: {
            content: string;
        };
    };
};
export type YT_MenuRenderer = {
    topLevelButtons: [{
        segmentedLikeDislikeButtonViewModel: YT_SegmentedLikeDislikeButtonViewModel;
    }];
};

export type YT_VideoPrimaryInfoRenderer = {
    videoPrimaryInfoRenderer: {
        title: {
            runs: Array<{ text: string }>;
        };
        viewCount: {
            videoViewCountRenderer: YT_VideoViewCountRenderer;
        };
        videoActions: {
            menuRenderer: YT_MenuRenderer;
        };
        dateText: {
            simpleText: string;
        };
        relativeDateText: {
            simpleText: string;
        };
    };
};

type YT_MetadataBadgeRenderer = {
    icon: {
        iconType: string;
    };
    style: string;
    tooltip: string;
    accessibilityData: {
        label: string;
    };
};
export type YT_VideoOwnerRenderer = {
    thumbnail: {
        thumbnails: Array<YT_Thumbnail>;
    };
    title: {
        runs: [
            {
                text: string;
            },
        ];
    };
    navigationEndpoint: {
        browseEndpoint: {
            browseId: string;
            canonicalBaseUrl: string;
        };
    };
    subscriberCountText: {
        simpleText: string;
    };
    badges: Array<{
        metadataBadgeRenderer: YT_MetadataBadgeRenderer;
    }>;
};

export type YT_VideoSecondaryInfoRenderer = {
    videoSecondaryInfoRenderer: {
        owner: {
            videoOwnerRenderer: YT_VideoOwnerRenderer;
        };
    };
};
