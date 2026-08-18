import fs from 'node:fs';import path from 'node:path';
const here=path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]):/,'$1:'));const src=fs.readFileSync(path.join(here,'index.html'),'utf8');const match=src.match(/<script>([\s\S]*?)<\/script>/);if(!match)throw new Error('No inline script found');new Function(match[1]);console.log('PASS — inline JavaScript parses');
