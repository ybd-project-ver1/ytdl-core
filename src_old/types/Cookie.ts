import { Cookie } from 'tough-cookie';

export type YTDL_Cookie = {
    name: string;
    value: string;
    expirationDate?: number;
    domain?: string;
    path?: string;
    secure?: boolean;
    session?: boolean;
    httpOnly?: boolean;
    hostOnly?: boolean;
    sameSite?: string;
};

export type YTDL_Cookies = (YTDL_Cookie | Cookie)[];
