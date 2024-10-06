import { YTDL_DownloadOptions } from '@/types/Options';

import AGENT from '@/core/Agent';

import { Logger } from './Log';
import UserAgent from './UserAgents';
import { getPropInsensitive } from './Utils';
import IP from './IP';

let oldCookieWarning = true,
    oldDispatcherWarning = true,
    oldLocalAddressWarning = true,
    oldIpRotationsWarning = true;

export default class DownloadOptionsUtils {
    static applyDefaultAgent(options: YTDL_DownloadOptions) {
        if (!options.agent) {
            const { jar } = AGENT.defaultAgent,
                COOKIE = getPropInsensitive<string>(options?.requestOptions?.headers, 'cookie');

            if (COOKIE) {
                jar.removeAllCookiesSync();
                AGENT.addCookiesFromString(jar, COOKIE);

                if (oldCookieWarning) {
                    oldCookieWarning = false;
                    Logger.warning('Using old cookie format, please use the new one instead. (https://github.com/ybd-project/ytdl-core#cookies-support)');
                }
            }

            if (options.requestOptions?.dispatcher && oldDispatcherWarning) {
                oldDispatcherWarning = false;
                Logger.warning('Your dispatcher is overridden by `ytdl.Agent`. To implement your own, check out the documentation. (https://github.com/ybd-project/ytdl-core#how-to-implement-ytdlagent-with-your-own-dispatcher)');
            }

            options.agent = AGENT.defaultAgent;
        }
    }

    static applyOldLocalAddress(options: YTDL_DownloadOptions) {
        const REQUEST_OPTION_LOCAL_ADDRESS = (options.requestOptions as any).localAddress;

        if (!options.requestOptions || !REQUEST_OPTION_LOCAL_ADDRESS || REQUEST_OPTION_LOCAL_ADDRESS === options.agent?.localAddress) {
            return;
        }

        options.agent = AGENT.createAgent(undefined, {
            localAddress: REQUEST_OPTION_LOCAL_ADDRESS,
        });

        if (oldLocalAddressWarning) {
            oldLocalAddressWarning = false;
            Logger.warning('Using old localAddress option, please add it to the agent options instead. (https://github.com/ybd-project/ytdl-core#ip-rotation)');
        }
    }

    static applyIPv6Rotations(options: YTDL_DownloadOptions) {
        if (options.IPv6Block) {
            options.requestOptions = Object.assign({}, options.requestOptions, {
                localAddress: IP.getRandomIPv6(options.IPv6Block),
            });

            if (oldIpRotationsWarning) {
                oldIpRotationsWarning = false;
                oldLocalAddressWarning = false;
                Logger.warning('IPv6Block option is deprecated, ' + 'please create your own ip rotation instead. (https://github.com/ybd-project/ytdl-core#ip-rotation)');
            }
        }
    }

    static applyDefaultHeaders(options: YTDL_DownloadOptions) {
        options.requestOptions = Object.assign({}, options.requestOptions);
        options.requestOptions.headers = Object.assign(
            {},
            {
                'User-Agent': UserAgent.default,
            },
            options.requestOptions.headers,
        );
    }
}
