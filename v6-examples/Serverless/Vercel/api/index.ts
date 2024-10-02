import type { VercelRequest, VercelResponse } from '@vercel/node';
import { YtdlCore } from '@ybd-project/ytdl-core/serverless';

export default function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Headers', '*');

    const ytdl = new YtdlCore({
            hl: 'en',
            gl: 'US',
            logDisplay: ['debug', 'info', 'success', 'warning', 'error'],
            disablePoTokenAutoGeneration: true,
            filter: 'videoandaudio',
            streamType: 'default',
        }),
        VIDEO_ID = req.query.id;

    if (!VIDEO_ID) {
        return res.json({
            error: 'No video ID provided',
        });
    }

    ytdl.getFullInfo('https://www.youtube.com/watch?v=' + VIDEO_ID)
        .then((results) => {
            res.setHeader('Cache-Control', 'public, max-age=7200, s-maxage=7200');
            res.json(results);
        })
        .catch((err) => {
            console.error(err);
            res.json({
                error: err.message,
            });
        });
}
