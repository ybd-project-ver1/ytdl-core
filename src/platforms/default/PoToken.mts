import { JSDOM } from 'jsdom';
import { BG, BgConfig } from 'bgutils-js';

import NextApi from '@/core/Info/apis/Next.js';
import { Logger } from '@/utils/Log.js';

const DOM = new JSDOM(),
    BG_CONFIG: BgConfig = {
        fetch: (url, options) => fetch(url, options),
        globalObj: globalThis,
        identifier: '',
        requestKey: 'O43z0dpjhgX20SCx4KAo',
    };

Object.assign(globalThis, {
    window: DOM.window,
    document: DOM.window.document,
});

function initialization() {
    NextApi.default
        .getApiResponses({
            videoId: 'dQw4w9WgXcQ',
            signatureTimestamp: 0,
            options: {
                oauth2: null,
            },
        })
        .then((data) => {
            BG_CONFIG.identifier = data.web?.responseContext.visitorData || '';
            Logger.debug('[ PoToken ]: VisitorData was <success>successfully</success> retrieved.');
        })
        .catch(() => {
            Logger.debug('[ PoToken ]: <error>Failed</error> to retrieve VisitorData.');
        });
}

function generatePoToken(): Promise<{ poToken: string; visitorData: string }> {
    return new Promise(async (resolve) => {
        if (!BG_CONFIG.identifier) {
            resolve({
                poToken: '',
                visitorData: '',
            });
        }

        const CHALLENGE = await BG.Challenge.create(BG_CONFIG);

        if (!CHALLENGE) {
            resolve({
                poToken: '',
                visitorData: '',
            });
            return;
        }

        if (CHALLENGE.script) {
            const SCRIPT = CHALLENGE.script.find((sc) => sc !== null);
            if (SCRIPT) {
                new Function(SCRIPT)();
            }
        } else {
            Logger.debug('<warning>Unable to load Botguard.</warning>');
        }

        const PO_TOKEN = await BG.PoToken.generate({
            program: CHALLENGE.challenge,
            globalName: CHALLENGE.globalName,
            bgConfig: BG_CONFIG,
        });

        Logger.debug(`[ PoToken ]: <success>Successfully</success> generated a poToken. (${PO_TOKEN})`);
        resolve({
            poToken: PO_TOKEN || '',
            visitorData: BG_CONFIG.identifier,
        });
    });
}

initialization();

export { generatePoToken };
