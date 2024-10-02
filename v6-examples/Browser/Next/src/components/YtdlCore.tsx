'use client';

import { useEffect, useState } from 'react';
import { YtdlCore } from '@ybd-project/ytdl-core/browser';

export default function YtdlCoreComponent() {
    const [results, setResults] = useState('');

    useEffect(() => {
        const BASE_URL = 'https://server.originalProxy.com',
            ytdl = new YtdlCore({
                logDisplay: ['debug', 'info', 'success', 'warning', 'error'],
                disablePoTokenAutoGeneration: true,
                // disableBasicCache: true,
                originalProxy: {
                    base: BASE_URL,
                    download: BASE_URL + '/download',
                    urlQueryName: 'url',
                },
            });

        ytdl.getFullInfo('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
            .then((results) => {
                setResults(`<p>Video Title: ${results.videoDetails.title}</p>`);
            })
            .catch((err) => {
                console.error(err);
                setResults(err.message);
            });
    }, []);

    return (
        <>
            <p dangerouslySetInnerHTML={{ __html: results }}></p>
        </>
    );
}
