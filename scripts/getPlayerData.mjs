import fs from 'fs';

function getPlayerId(body) {
    const MATCH = body.match(/player\\\/([a-zA-Z0-9]+)\\\//);

    if (MATCH) {
        return MATCH[1];
    }

    return null;
}

function adaptToConstants(id) {
    const DATA = fs.readFileSync(process.cwd() + '/src/utils/Constants.ts', 'utf8'),
        SPLIT_LINES = DATA.split('\n'),
        PLAYER_ID_LINE = SPLIT_LINES.findIndex((v) => v.startsWith('export const CURRENT_PLAYER_ID = '));

    SPLIT_LINES[PLAYER_ID_LINE] = `export const CURRENT_PLAYER_ID = '${id}';`;
    fs.writeFileSync(process.cwd() + '/src/utils/Constants.ts', SPLIT_LINES.join('\n'));

    console.log('Player ID has been successfully adapted.');
}

function adaptToPlayerJson(id) {
    const PLAYER_JSON = JSON.parse(fs.readFileSync(process.cwd() + '/data/player/data.json', 'utf8'));

    fetch(`https://www.youtube.com/s/player/${id}/player_ias.vflset/en_US/base.js`)
        .then((res) => res.text())
        .then((script) => {
            const SIGNATURE_TIMESTAMP = script.match(/signatureTimestamp:(\d+)/)[1];
            PLAYER_JSON.signatureTimestamp = SIGNATURE_TIMESTAMP;
            PLAYER_JSON.playerId = id;

            fs.writeFileSync(process.cwd() + '/data/player/data.json', JSON.stringify(PLAYER_JSON));
            fs.writeFileSync(process.cwd() + '/data/player/base.js', script);
            console.log('Player JSON has been successfully adapted.');
        })
        .catch((err) => {
            console.error('Failed to retrieve information from base.js:', err);
        });
}

fetch('https://www.youtube.com/iframe_api', {
    cache: 'no-store',
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
        'x-browser-channel': 'stable',
        'x-browser-copyright': 'Copyright 2024 Google LLC. All rights reserved.',
        'x-browser-validation': 'g+9zsjnuPhmKvFM5e6eaEzcB1JY=',
        'x-browser-year': '2024',
    },
})
    .then((res) => res.text())
    .then((data) => {
        const PLAYER_ID = getPlayerId(data);

        if (PLAYER_ID) {
            console.log('The latest player ID has been successfully retrieved:', PLAYER_ID, '\n');
            console.log('Adapting player ID...');

            try {
                if (process.argv[2] !== '--only-player-json') {
                    adaptToConstants(PLAYER_ID);
                }

                adaptToPlayerJson(PLAYER_ID);
            } catch (err) {
                console.error('Failed to set the latest player ID: please manually adapt ' + PLAYER_ID + ' to utils/Constants.ts and data/player.json.');
                console.error('Error Details:', err);
            }
        } else {
            console.error('Failed to retrieve the latest player ID.');
        }
    })
    .catch((err) => {
        console.error('Failed to retrieve information from iframe_api:', err);
    });
