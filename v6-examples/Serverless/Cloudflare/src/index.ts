import { YTDL_DefaultStreamType, YtdlCore } from '@ybd-project/ytdl-core/serverless';

export default {
    async fetch(req: Request): Promise<Response> {
        return new Promise((resolve) => {
            const ytdl = new YtdlCore({
                    hl: 'en',
                    gl: 'US',
                    logDisplay: ['debug', 'info', 'success', 'warning', 'error'],
                    disablePoTokenAutoGeneration: true,
                    filter: 'videoandaudio',
                    streamType: 'default',
                }),
                SEARCH_PARAMS = new URL(req.url || '').searchParams,
                VIDEO_ID = SEARCH_PARAMS.get('id');

            if (!VIDEO_ID) {
                const RESPONSE = JSON.stringify({
                    error: 'No video ID provided',
                });

                resolve(new Response(RESPONSE, { headers: { 'Content-Type': 'application/json' } }));
                return;
            }

            function errorHandler(err: Error) {
                const RESPONSE = new Response(
                    JSON.stringify({
                        error: err.message,
                    }),
                    { headers: { 'Content-Type': 'application/json' } },
                );

                resolve(RESPONSE);
            }

            if (req.url.includes('/streaming')) {
                ytdl.download<YTDL_DefaultStreamType>('https://www.youtube.com/watch?v=' + VIDEO_ID)
                    .then(async (stream) => {
                        resolve(new Response(stream, { headers: { 'Content-Type': 'video/mp4' } }));
                    })
                    .catch(errorHandler);
            } else {
                ytdl.getFullInfo('https://www.youtube.com/watch?v=' + VIDEO_ID)
                    .then((results) => {
                        resolve(new Response(JSON.stringify(results), { headers: { 'Content-Type': 'application/json' } }));
                    })
                    .catch(errorHandler);
            }
        });
    },
};
