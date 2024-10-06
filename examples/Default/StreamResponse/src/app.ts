import express from 'express';
import { YtdlCore, YTDL_NodejsStreamType } from '@ybd-project/ytdl-core';

const app = express(),
    ytdl = new YtdlCore({
        hl: 'en',
        gl: 'US',
        streamType: 'nodejs',
    });

app.get('/api/download', (req, res) => {
    const VIDEO_ID = req.query.videoId;

    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', 'attachment; filename="video.mp4"');

    ytdl.download<YTDL_NodejsStreamType>(`https://www.youtube.com/watch?v=${VIDEO_ID}`, {
        filter: 'audioandvideo',
    })
        .then((stream) => {
            stream.pipe(res);
        })
        .catch((err) => {
            res.json({
                error: err.message,
            });
        });
});

app.get('/api/download/audio', (req, res) => {
    const VIDEO_ID = req.query.videoId;

    res.setHeader('Content-Type', 'audio/mp3');
    res.setHeader('Content-Disposition', 'attachment; filename="audio.mp3"');

    ytdl.download<YTDL_NodejsStreamType>(`https://www.youtube.com/watch?v=${VIDEO_ID}`, {
        filter: 'audioonly',
    })
        .then((stream) => {
            stream.pipe(res);
        })
        .catch((err) => {
            res.json({
                error: err.message,
            });
        });
});

app.get('/api/download', (req, res) => {
    const VIDEO_ID = req.query.videoId;

    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', 'attachment; filename="video.mp4"');

    ytdl.download<YTDL_NodejsStreamType>(`https://www.youtube.com/watch?v=${VIDEO_ID}`, {
        filter: 'videoonly',
    })
        .then((stream) => {
            stream.pipe(res);
        })
        .catch((err) => {
            res.json({
                error: err.message,
            });
        });
});

app.listen(3000, () => {
    console.log('Listening on port 3000');
});
