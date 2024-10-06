import fs from 'fs';
import { execSync } from 'child_process';

const BASE_DIR = process.cwd(),
    PKG = JSON.parse(fs.readFileSync(BASE_DIR + '/package.json', 'utf-8'));

let version = PKG.version;
execSync(`git tag -a v${version} -m "v${version}"`);
execSync(`git push origin tags/v${version}`);
