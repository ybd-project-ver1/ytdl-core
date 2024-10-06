const got = require('got'),
    DIVIDER = '|----------------------|',
    TOKEN_API = 'https://oauth2.googleapis.com/token',
    CLIENT_ID = process.argv[2] || 'YOUR CLIENT ID HERE',
    CLIENT_SECRET = process.argv[3] || 'YOUR CLIENT SECRET HERE',
    REFRESH_TOKEN = process.argv[4] || 'YOUR REFRESH TOKEN HERE';

console.log(DIVIDER);
console.log('| Generate OAuth Token |');
console.log(DIVIDER);
console.log('|- OAuth2 Client Info -|');
console.log('| Client ID: ' + CLIENT_ID);
console.log('| Client Secret: ' + CLIENT_SECRET);
console.log(DIVIDER);

async function refreshToken(refreshToken) {
    const TOKEN_API_RESPONSE = await got.post(TOKEN_API, {
        form: {
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
        },
        responseType: 'json',
    });

    if (TOKEN_API_RESPONSE.statusCode !== 200) {
        throw new Error('Failed to refresh token: ' + TOKEN_API_RESPONSE.body);
    }

    const RESPONSE_DATA = TOKEN_API_RESPONSE.body,
        REFRESHED_TOKEN = {
            accessToken: RESPONSE_DATA.access_token,
            refreshToken: refreshToken,
            expiryDate: new Date(Date.now() + RESPONSE_DATA.expires_in * 1000).toISOString(),
            clientData: {
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
            },
        };

    console.log(REFRESHED_TOKEN);
    console.log(DIVIDER);
    console.log('| Important: The uniquely generated tokens may become unavailable if they are not updated for 2~3 days.');
}

if (CLIENT_ID === 'YOUR CLIENT ID HERE' || CLIENT_SECRET === 'YOUR CLIENT SECRET HERE' || REFRESH_TOKEN === 'YOUR REFRESH TOKEN HERE') {
    console.error(DIVIDER);
    console.error('| Missing client ID, client secret, or refresh token..');
    console.error(DIVIDER);
} else {
    refreshToken(REFRESH_TOKEN);
}
