import fs from 'node:fs';
import path from 'node:path';

const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]):/, '$1:'));
const source = fs.readFileSync(path.join(here, 'index.html'), 'utf8');
const scenes = [...source.matchAll(/<section class="scene(?: [^"]+)?"/g)];
const ids = [...source.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
const assets = [...source.matchAll(/(?:src|href)="(assets\/[^"]+)"/g)].map(m => m[1]);
const uniqueAssets = [...new Set(assets)];
const results = [];
const check = (name, pass, detail) => results.push([name, pass, detail]);

check('25 scenes', scenes.length === 25, scenes.length);
check('unique DOM IDs', new Set(ids).size === ids.length, ids.length + ' IDs');
check('three visual assets referenced', uniqueAssets.length === 3, uniqueAssets.join(', '));
check('all assets exist', uniqueAssets.every(file => fs.existsSync(path.join(here, file))), 'checked');
check('teacher notes on every scene', (source.match(/<aside class="teacher">/g) || []).length === scenes.length, (source.match(/<aside class="teacher">/g) || []).length);
check('no external runtime URLs', !/https?:\/\//.test(source), 'checked');
check('keyboard, swipe, menu, notes, fullscreen controls', ['ArrowRight','touchstart','menuBtn','notesBtn','requestFullscreen'].every(token => source.includes(token)), 'checked');
check('animated scene transitions', source.includes('transition:opacity') && source.includes('@keyframes'), 'checked');

for (const [name, pass, detail] of results) console.log((pass ? 'PASS' : 'FAIL') + ' — ' + name + ': ' + detail);
if (results.some(([, pass]) => !pass)) process.exitCode = 1;
