import { CookieJar } from 'tough-cookie';
import { Dispatcher } from 'undici';

export type YTDL_Agent = {
    dispatcher: Dispatcher;
    jar: CookieJar;
    localAddress?: string;
};
