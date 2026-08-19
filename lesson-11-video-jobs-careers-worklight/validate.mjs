import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const source=fs.readFileSync(path.join(here,'index.html'),'utf8');
const scenes=[...source.matchAll(/<section class="scene[^\"]*" data-title=/g)];
const ids=[...source.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
const images=[...source.matchAll(/<img\s+[^>]*src="([^"]+)"[^>]*>/g)].map(match=>({tag:match[0],src:match[1]}));
const cssImages=[...source.matchAll(/url\(['"]?(assets\/[^)'"\s]+)['"]?\)/g)].map(match=>match[1]);
const assets=[...new Set([...images.map(image=>image.src),...cssImages].filter(src=>src.startsWith('assets/')))];
const audio=[...new Set([...source.matchAll(/assets\/audio\/[a-z-]+\.wav/g)].map(match=>match[0]))];
const results=[];
const check=(name,pass,detail='')=>results.push([name,Boolean(pass),detail]);

check('27 scenes',scenes.length===27,scenes.length);
check('unique DOM IDs',new Set(ids).size===ids.length,ids.length+' IDs');
check('nine distinct artwork assets',assets.length===9,assets.join(', '));
check('eight semantic image placements',images.length===8,images.length+' placements');
check('all artwork exists',assets.every(file=>fs.existsSync(path.join(here,file))),assets.length+' checked');
check('every image has alt text',images.every(image=>/\balt="[^"]+"/.test(image.tag)),images.length+' images');
check('six offline audio clips',audio.length===6&&audio.every(file=>fs.existsSync(path.join(here,file))),audio.join(', '));
check('teacher note on every scene',(source.match(/<aside class="teacher">/g)||[]).length===27,(source.match(/<aside class="teacher">/g)||[]).length);
check('no external runtime URLs',!/https?:\/\//.test(source),'offline');
check('responsive breakpoints',source.includes('@media(max-width:860px)')&&source.includes('@media(max-width:520px)'),'present');
check('reduced motion support',source.includes('@media(prefers-reduced-motion:reduce)'),'present');
check('rich animation system',(source.match(/@keyframes/g)||[]).length>=14,(source.match(/@keyframes/g)||[]).length+' keyframes');
check('video, listening and production stages',['videoPlay','Listening interview','productionTimer','Review quiz'].every(token=>source.includes(token)),'complete');
check('keyboard, swipe, map, notes and fullscreen',['ArrowRight','touchstart','mapOverlay','notesOverlay','requestFullscreen'].every(token=>source.includes(token)),'present');
check('interactive controls',(source.match(/<button\b/g)||[]).length>=90,(source.match(/<button\b/g)||[]).length+' buttons');

const script=source.match(/<script>([\s\S]*?)<\/script>/)?.[1];
try{new Function(script);check('inline JavaScript parses',true,'ok');}catch(error){check('inline JavaScript parses',false,error.message);}

for(const [name,pass,detail] of results)console.log(`${pass?'PASS':'FAIL'} - ${name}: ${detail}`);
if(results.some(([,pass])=>!pass))process.exitCode=1;
