import type { YTDL_VideoInfo } from '@/types';
import { InternalDownloadOptions } from '@/core/types';

function downloadFromInfo(info: YTDL_VideoInfo, options: InternalDownloadOptions) {}
function download(link: string, options: InternalDownloadOptions) {}

export { download, downloadFromInfo };
