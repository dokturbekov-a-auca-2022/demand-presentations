import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const source = fs.readFileSync(path.join(root, 'experience-v2.js'), 'utf8');
new vm.Script(source, { filename: 'experience-v2.js' });
console.log('PASS — JavaScript syntax (experience-v2.js)');
