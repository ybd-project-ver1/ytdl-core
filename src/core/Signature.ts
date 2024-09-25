import { YT_StreamingAdaptiveFormat } from '@/types';

import { Platform } from '@/platforms/Platform';

import { Logger } from '@/utils/Log';

/* Private Constants */
const DECIPHER_NAME_REGEXPS = ['\\bm=([a-zA-Z0-9$]{2,})\\(decodeURIComponent\\(h\\.s\\)\\)', '\\bc&&\\(c=([a-zA-Z0-9$]{2,})\\(decodeURIComponent\\(c\\)\\)', '(?:\\b|[^a-zA-Z0-9$])([a-zA-Z0-9$]{2,})\\s*=\\s*function\\(\\s*a\\s*\\)\\s*\\{\\s*a\\s*=\\s*a\\.split\\(\\s*""\\s*\\)', '([\\w$]+)\\s*=\\s*function\\((\\w+)\\)\\{\\s*\\2=\\s*\\2\\.split\\(""\\)\\s*;'];

// LavaPlayer regexps
const VARIABLE_PART = '[a-zA-Z_\\$][a-zA-Z_0-9]*',
    VARIABLE_PART_DEFINE = `\\"?${VARIABLE_PART}\\"?`,
    BEFORE_ACCESS = '(?:\\[\\"|\\.)',
    AFTER_ACCESS = '(?:\\"\\]|)',
    VARIABLE_PART_ACCESS = BEFORE_ACCESS + VARIABLE_PART + AFTER_ACCESS,
    REVERSE_PART = ':function\\(a\\)\\{(?:return )?a\\.reverse\\(\\)\\}',
    SLICE_PART = ':function\\(a,b\\)\\{return a\\.slice\\(b\\)\\}',
    SPLICE_PART = ':function\\(a,b\\)\\{a\\.splice\\(0,b\\)\\}',
    SWAP_PART = ':function\\(a,b\\)\\{' + 'var c=a\\[0\\];a\\[0\\]=a\\[b%a\\.length\\];a\\[b(?:%a.length|)\\]=c(?:;return a)?\\}',
    DECIPHER_REGEXP = `function(?: ${VARIABLE_PART})?\\(a\\)\\{` + `a=a\\.split\\(""\\);\\s*` + `((?:(?:a=)?${VARIABLE_PART}${VARIABLE_PART_ACCESS}\\(a,\\d+\\);)+)` + `return a\\.join\\(""\\)` + `\\}`,
    HELPER_REGEXP = `var (${VARIABLE_PART})=\\{((?:(?:${VARIABLE_PART_DEFINE}${REVERSE_PART}|${VARIABLE_PART_DEFINE}${SLICE_PART}|${VARIABLE_PART_DEFINE}${SPLICE_PART}|${VARIABLE_PART_DEFINE}${SWAP_PART}),?\\n?)+)\\};`,
    SCVR = '[a-zA-Z0-9$_]',
    FNR = `${SCVR}+`,
    AAR = '\\[(\\d+)]',
    N_TRANSFORM_NAME_REGEXPS = [
        // NewPipeExtractor regexps
        `${SCVR}+="nn"\\[\\+${SCVR}+\\.${SCVR}+],${SCVR}+=${SCVR}+\\.get\\(${SCVR}+\\)\\)&&\\(${SCVR}+=(${SCVR}+)\\[(\\d+)]`,
        `${SCVR}+="nn"\\[\\+${SCVR}+\\.${SCVR}+],${SCVR}+=${SCVR}+\\.get\\(${SCVR}+\\)\\).+\\|\\|(${SCVR}+)\\(""\\)`,
        `\\(${SCVR}=String\\.fromCharCode\\(110\\),${SCVR}=${SCVR}\\.get\\(${SCVR}\\)\\)&&\\(${SCVR}=(${FNR})(?:${AAR})?\\(${SCVR}\\)`,
        `\\.get\\("n"\\)\\)&&\\(${SCVR}=(${FNR})(?:${AAR})?\\(${SCVR}\\)`,
        // Skick regexps
        '(\\w+).length\\|\\|\\w+\\(""\\)',
        '\\w+.length\\|\\|(\\w+)\\(""\\)',
    ];

// LavaPlayer regexps
const N_TRANSFORM_REGEXP = 'function\\(\\s*(\\w+)\\s*\\)\\s*\\{' + 'var\\s*(\\w+)=(?:\\1\\.split\\(""\\)|String\\.prototype\\.split\\.call\\(\\1,""\\)),' + '\\s*(\\w+)=(\\[.*?]);\\s*\\3\\[\\d+]' + '(.*?try)(\\{.*?})catch\\(\\s*(\\w+)\\s*\\)\\s*\\' + '{\\s*return"enhanced_except_([A-z0-9-]+)"\\s*\\+\\s*\\1\\s*}' + '\\s*return\\s*(\\2\\.join\\(""\\)|Array\\.prototype\\.join\\.call\\(\\2,""\\))};',
    DECIPHER_ARGUMENT = 'sig',
    N_ARGUMENT = 'ncode',
    DECIPHER_FUNC_NAME = 'YBDProjectDecipherFunc',
    N_TRANSFORM_FUNC_NAME = 'YBDProjectNTransformFunc';

/* ----------- */

const SIGNATURE_TIMESTAMP_REGEX = /signatureTimestamp:(\d+)/g,
    SHIM = Platform.getShim();

let decipherWarning = false,
    nTransformWarning = false;

/* Private Functions */
function matchRegex(regex: string, str: string) {
    const MATCH = str.match(new RegExp(regex, 's'));
    if (!MATCH) {
        throw new Error(`Could not match ${regex}`);
    }
    return MATCH;
}

function matchFirst(regex: string, str: string) {
    return matchRegex(regex, str)[0];
}

function matchGroup1(regex: string, str: string) {
    return matchRegex(regex, str)[1];
}

function getFunctionName(body: string, regexps: Array<string>) {
    let fn;
    for (const REGEX of regexps) {
        try {
            fn = matchGroup1(REGEX, body);
            try {
                fn = matchGroup1(`${fn.replace(/\$/g, '\\$')}=\\[([a-zA-Z0-9$\\[\\]]{2,})\\]`, body);
            } catch (err) {}
            break;
        } catch (err) {
            continue;
        }
    }

    if (!fn || fn.includes('[')) throw Error();
    return fn;
}

function getExtractFunctions(extractFunctions: Array<Function>, body: string): string | null {
    for (const extractFunction of extractFunctions) {
        try {
            const FUNC = extractFunction(body);
            if (!FUNC) continue;
            return FUNC;
        } catch {
            continue;
        }
    }

    return null;
}

/* Decipher */
function extractDecipherFunc(body: string) {
    try {
        const HELPER_OBJECT = matchFirst(HELPER_REGEXP, body),
            DECIPHER_FUNCTION = matchFirst(DECIPHER_REGEXP, body),
            RESULTS_FUNCTION = `var ${DECIPHER_FUNC_NAME}=${DECIPHER_FUNCTION};`,
            CALLER_FUNCTION = `${DECIPHER_FUNC_NAME}(${DECIPHER_ARGUMENT});`;
        return HELPER_OBJECT + RESULTS_FUNCTION + CALLER_FUNCTION;
    } catch (e) {
        return null;
    }
}

function extractDecipherWithName(body: string): string | null {
    try {
        const DECIPHER_FUNCTION_NAME = getFunctionName(body, DECIPHER_NAME_REGEXPS),
            FUNC_PATTERN = `(${DECIPHER_FUNCTION_NAME.replace(/\$/g, '\\$')}function\\([a-zA-Z0-9_]+\\)\\{.+?\\})`,
            DECIPHER_FUNCTION = `var ${matchGroup1(FUNC_PATTERN, body)};`,
            HELPER_OBJECT_NAME = matchGroup1(';([A-Za-z0-9_\\$]{2,})\\.\\w+\\(', DECIPHER_FUNCTION),
            HELPER_PATTERN = `(var ${HELPER_OBJECT_NAME.replace(/\$/g, '\\$')}=\\{[\\s\\S]+?\\}\\};)`,
            HELPER_OBJECT = matchGroup1(HELPER_PATTERN, body),
            CALLER_FUNCTION = `${DECIPHER_FUNC_NAME}(${DECIPHER_ARGUMENT});`;

        return HELPER_OBJECT + DECIPHER_FUNCTION + CALLER_FUNCTION;
    } catch (e) {
        return null;
    }
}

/* N-Transform */
function extractNTransformFunc(body: string) {
    try {
        const N_FUNCTION = matchFirst(N_TRANSFORM_REGEXP, body),
            RESULTS_FUNCTION = `var ${N_TRANSFORM_FUNC_NAME}=${N_FUNCTION};`,
            CALLER_FUNCTION = `${N_TRANSFORM_FUNC_NAME}(${N_ARGUMENT});`;

        return RESULTS_FUNCTION + CALLER_FUNCTION;
    } catch (e) {
        return null;
    }
}

function extractNTransformWithName(body: string): string | null {
    try {
        const N_FUNCTION_NAME = getFunctionName(body, N_TRANSFORM_NAME_REGEXPS),
            FUNCTION_PATTERN = `(${N_FUNCTION_NAME.replace(/\$/g, '\\$')}=\\s*function([\\S\\s]*?\\}\\s*return (([\\w$]+?\\.join\\(""\\))|(Array\\.prototype\\.join\\.call\\([\\w$]+?,[\\n\\s]*(("")|(\\("",""\\)))\\)))\\s*\\}))`,
            N_TRANSFORM_FUNCTION = `var ${matchGroup1(FUNCTION_PATTERN, body)};`,
            CALLER_FUNCTION = `${N_FUNCTION_NAME}(${N_ARGUMENT});`;

        return N_TRANSFORM_FUNCTION + CALLER_FUNCTION;
    } catch (e) {
        return null;
    }
}

/* Eval */
function runInNewContext(code: string, contextObject = {}) {
    // コンテキストオブジェクトのプロパティをローカル変数として定義
    const CONTEXT_VARIABLE = Object.keys(contextObject)
            .map((key) => `let ${key} = contextObject.${key};`)
            .join('\n'),
        RESULTS_VARIABLE = '__result__',
        FULL_CODE = `
            ${CONTEXT_VARIABLE}
            ${RESULTS_VARIABLE} = (function() {${code}})();
        `;

    eval(FULL_CODE);
    return eval(RESULTS_VARIABLE);
}

/* Decipher */
function getDownloadURL(format: YT_StreamingAdaptiveFormat, decipherFunction: string | null, nTransformFunction: string | null) {
    if (!decipherFunction) {
        return;
    }

    const decipher = (url: string): string => {
            const SEARCH_PARAMS = new URLSearchParams(url),
                PARAMS_URL = SEARCH_PARAMS.get('url')?.toString() || '';

            if (!SEARCH_PARAMS.get('s')) {
                return PARAMS_URL;
            }

            const COMPONENTS = new URL(decodeURIComponent(PARAMS_URL)),
                CONTEXT: Record<string, string> = {};

            CONTEXT[DECIPHER_ARGUMENT] = decodeURIComponent(PARAMS_URL);

            COMPONENTS.searchParams.set(SEARCH_PARAMS.get('sp')?.toString() || 'sig', runInNewContext(decipherFunction, CONTEXT));

            return COMPONENTS.toString();
        },
        nTransform = (url: string): string => {
            const COMPONENTS = new URL(decodeURIComponent(url)),
                N = COMPONENTS.searchParams.get('n');

            if (!N || !nTransformFunction) {
                return url;
            }

            const CONTEXT: Record<string, string> = {};

            CONTEXT[N_ARGUMENT] = N;

            COMPONENTS.searchParams.set('n', runInNewContext(nTransformFunction, CONTEXT));

            return COMPONENTS.toString();
        },
        CIPHER = !format.url,
        VIDEO_URL = format.url || format.signatureCipher || format.cipher;

    if (!VIDEO_URL) {
        return;
    }

    format.url = nTransform(CIPHER ? decipher(VIDEO_URL) : VIDEO_URL);
    delete format.signatureCipher;
    delete format.cipher;
}

class Signature {
    public decipherFunction: string | null = null;
    public nTransformFunction: string | null = null;

    public static getSignatureTimestamp(body: string): string {
        const MATCH = body.match(SIGNATURE_TIMESTAMP_REGEX);

        if (MATCH) {
            return MATCH[0].split(':')[1];
        }

        return '0';
    }

    public decipherFormats(formats: Array<YT_StreamingAdaptiveFormat>): Record<string, YT_StreamingAdaptiveFormat> {
        const DECIPHERED_FORMATS: Record<string, YT_StreamingAdaptiveFormat> = {};

        formats.forEach((format: any) => {
            if (!format) {
                return;
            }

            getDownloadURL(format, this.decipherFunction, this.nTransformFunction);

            DECIPHERED_FORMATS[format.url] = format;
        });

        return DECIPHERED_FORMATS;
    }

    public getDecipherFunctions(playerId: string, body: string) {
        if (this.decipherFunction) {
            return this.decipherFunction;
        }

        const DECIPHER_FUNCTION = getExtractFunctions([extractDecipherWithName, extractDecipherFunc], body);

        if (!DECIPHER_FUNCTION && !decipherWarning) {
            Logger.warning(`Could not parse decipher function.\nPlease report this issue with "${playerId}" in Issues at ${SHIM.info.issuesUrl}.\nStream URL will be missing.`);
            decipherWarning = true;
        }

        this.decipherFunction = DECIPHER_FUNCTION;

        return DECIPHER_FUNCTION;
    }

    public getNTransform(playerId: string, body: string) {
        if (this.nTransformFunction) {
            return this.nTransformFunction;
        }

        const N_TRANSFORM_FUNCTION = getExtractFunctions([extractNTransformFunc, extractNTransformWithName], body);

        if (!N_TRANSFORM_FUNCTION && !nTransformWarning) {
            Logger.warning(`Could not parse n transform function.\nPlease report this issue with "${playerId}" in Issues at ${SHIM.info.issuesUrl}.`);
            nTransformWarning = true;
        }

        this.nTransformFunction = N_TRANSFORM_FUNCTION;

        return N_TRANSFORM_FUNCTION;
    }
}

export { Signature };
