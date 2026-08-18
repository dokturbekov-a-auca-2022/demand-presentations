import fs from 'node:fs';
import path from 'node:path';

const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]):/, '$1:'));
const source = fs.readFileSync(path.join(here, 'index.html'), 'utf8');
const script = source.match(/<script>([\s\S]*?)<\/script>/)?.[1];
if (!script) throw new Error('No inline script found');
new Function(script);
console.log('PASS — JavaScript syntax');
