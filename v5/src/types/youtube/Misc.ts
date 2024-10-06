export type YT_Thumbnail = {
    url: string;
    width: number;
    height: number;
};

export type YT_Author = {
    id: string;
    name: string;
    thumbnails: Array<YT_Thumbnail>;
    verified: boolean;
    user?: string;
    channel_url: string;
    external_channel_url?: string;
    user_url?: string;
    subscriber_count?: number;
};