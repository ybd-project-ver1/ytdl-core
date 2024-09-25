import type { OAuth2 } from '@/core/OAuth2';
import type { YTDL_DownloadOptions } from '@/types';

export type InternalDownloadOptions = YTDL_DownloadOptions & {
    oauth2: OAuth2 | null;
};
