import { YtdlCore } from '@ybd-project/ytdl-core';

const ytdl = new YtdlCore({
    originalProxy: {
        base: 'https://original-proxy-1.example.com',
        download: 'https://original-proxy-1.example.com/video-download',
        urlQueryName: 'apiUrl',
    },
});

/* Normal Usage */
ytdl.getFullInfo('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
    .then((info) => {
        console.log(info);
    })
    .catch((err) => {
        console.error(err);
    });

/* Proxy Override */
ytdl.getFullInfo('https://www.youtube.com/watch?v=dQw4w9WgXcQ', {
    originalProxy: {
        base: 'https://original-proxy-2.example.com',
        download: 'https://original-proxy-2.example.com/video-download',
        urlQueryName: 'url',
    },
})
    .then((info) => {
        console.log(info);
    })
    .catch((err) => {
        console.error(err);
    });
