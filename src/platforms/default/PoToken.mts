import { JSDOM } from 'jsdom';
import { BG, BgConfig } from 'bgutils-js';
import fetch from 'node-fetch';

import NextApi from '@/core/Info/apis/Next.js';
import { Logger } from '@/utils/Log.js';

const DOM = new JSDOM(),
    BG_CONFIG: BgConfig = {
        fetch: fetch as unknown as typeof globalThis.fetch,
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

        const INTERPRETER_JAVASCRIPT = CHALLENGE.interpreterJavascript.privateDoNotAccessOrElseSafeScriptWrappedValue;

        if (INTERPRETER_JAVASCRIPT) {
            new Function(INTERPRETER_JAVASCRIPT)();
        } else {
            Logger.debug('<warning>Unable to load VM.</warning>');
            resolve({
                poToken: '',
                visitorData: '',
            });
            return;
        }

        const PO_TOKEN = (
            await BG.PoToken.generate({
                program: CHALLENGE.program,
                globalName: CHALLENGE.globalName,
                bgConfig: BG_CONFIG,
            })
        ).poToken;

        Logger.debug(`[ PoToken ]: <success>Successfully</success> generated a poToken. (${PO_TOKEN})`);
        resolve({
            poToken: PO_TOKEN || '',
            visitorData: BG_CONFIG.identifier,
        });
    });
}

initialization();

export { generatePoToken };
