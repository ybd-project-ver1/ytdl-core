const readline = require('readline'),
    fluentFFmpeg = require('fluent-ffmpeg'),
    { YtdlCore } = require('@ybd-project/ytdl-core');

process.env.YTDL_DEBUG = true;

const ID = '7wNb0pHyGuI',
    STREAM = YtdlCore.download(`https://www.youtube.com/watch?v=${ID}`, {
        quality: 'highestaudio',
    }),
    START = Date.now();

fluentFFmpeg(STREAM)
    .audioBitrate(128)
    .save(`${__dirname}/${ID}.mp3`)
    .on('progress', (p) => {
        readline.cursorTo(process.stdout, 0);
        process.stdout.write(`${p.targetSize}kb downloaded`);
    })
    .on('end', () => {
        console.log(`\ndone, thanks - ${(Date.now() - START) / 1000}s`);
    });
