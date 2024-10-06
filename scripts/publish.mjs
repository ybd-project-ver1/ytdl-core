import fs from 'fs';
import { input } from '@inquirer/prompts';

const BASE_DIR = process.cwd(),
    PUBLISH_TYPE = process.argv[2] || 'latest',
    PKG = JSON.parse(fs.readFileSync(BASE_DIR + '/package.json', 'utf-8'));

let version = PKG.version;

switch (PUBLISH_TYPE) {
    case 'alpha': {
        const [MAIN, ALPHA] = version.split('-alpha.'),
            NEW_ALPHA_VERSION = parseInt(ALPHA, 10) + 1;

        version = `${MAIN}-alpha.${NEW_ALPHA_VERSION}`;
        break;
    }
    case 'beta': {
        const [MAIN, BETA] = version.split('-beta.'),
            NEW_BETA_VERSION = parseInt(BETA, 10) + 1;

        version = `${MAIN}-beta.${NEW_BETA_VERSION}`;
        break;
    }
    default: {
        console.log('Current version:', version);
        const ANSWER = await input({ message: 'Enter new version:' });

        version = ANSWER;
        break;
    }
}

PKG.version = version;
fs.writeFileSync(BASE_DIR + '/package.json', JSON.stringify(PKG, null, 4), 'utf-8');
