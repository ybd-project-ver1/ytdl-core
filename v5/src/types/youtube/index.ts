import type { PlayerRequestError } from '@/core/errors';

export * from './Renderers';
export * from './Misc';
export * from './Player';
export * from './Next';
export * from './Formats';

export type YTDL_InnertubeResponseInfo<T = unknown> = { isError: boolean; error: PlayerRequestError | null; contents: T };
