import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const source=fs.readFileSync(path.join(here,'index.html'),'utf8');
const scenes=[...source.matchAll(/<section class="scene[^\"]*" data-title=/g)];
const ids=[...source.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
const images=[...source.matchAll(/<img\s+[^>]*src="([^"]+)"[^>]*>/g)].map(match=>({tag:match[0],src:match[1]}));
const assetRefs=[...new Set(images.map(image=>image.src).filter(src=>src.startsWith('assets/')))];
const results=[];
const check=(name,pass,detail='')=>results.push([name,Boolean(pass),detail]);

check('27 scenes',scenes.length===27,scenes.length);
check('unique DOM IDs',new Set(ids).size===ids.length,ids.length+' IDs');
check('three local artwork assets',assetRefs.length===3,assetRefs.join(', '));
check('all artwork exists',assetRefs.every(file=>fs.existsSync(path.join(here,file))),assetRefs.length+' checked');
check('every image has alt text',images.every(image=>/\balt="[^"]+"/.test(image.tag)),images.length+' images');
check('teacher note on every scene',(source.match(/<aside class="teacher">/g)||[]).length===27,(source.match(/<aside class="teacher">/g)||[]).length);
check('no external runtime URLs',!/https?:\/\//.test(source),'offline');
check('responsive layout',source.includes('@media(max-width:860px)')&&source.includes('@media(max-width:520px)'),'two compact breakpoints');
check('reduced motion support',source.includes('@media(prefers-reduced-motion:reduce)'),'present');
check('keyboard, swipe, map, notes and fullscreen',['ArrowRight','touchstart','routeOverlay','notesOverlay','requestFullscreen'].every(token=>source.includes(token)),'present');
check('grammar coverage',['will be + verb-ing','won\'t be','Will + subject + be + verb-ing?','action in progress'].every(token=>source.includes(token)),'meaning and forms');
check('required lesson stages',['Vocabulary discovery','Grammar discovery','Controlled practice','Teacher-read listening','Pair speaking','Final production','Review quiz','Homework + reflection + exit'].every(token=>source.includes(token)),'complete');
check('interactive controls',(source.match(/<button\b/g)||[]).length>=70,(source.match(/<button\b/g)||[]).length+' buttons');

const script=source.match(/<script>([\s\S]*?)<\/script>/)?.[1];
try{new Function(script);check('inline JavaScript parses',true,'ok');}catch(error){check('inline JavaScript parses',false,error.message);}

for(const [name,pass,detail] of results)console.log(`${pass?'PASS':'FAIL'} - ${name}: ${detail}`);
if(results.some(([,pass])=>!pass))process.exitCode=1;
