import fs from 'node:fs';import path from 'node:path';import{fileURLToPath}from'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));const html=fs.readFileSync(path.join(here,'index.html'),'utf8');const script=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];if(!script)throw new Error('No inline script found');new Function(script);console.log('PASS — JavaScript syntax');
