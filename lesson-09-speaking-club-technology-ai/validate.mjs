import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const html=fs.readFileSync(path.join(here,'index.html'),'utf8');
const test=(name,ok,detail='')=>console.log(`${ok?'PASS':'FAIL'} — ${name}${detail?`: ${detail}`:''}`);
// Scenes and teacher notes are rendered from the data array at runtime.
const scenes=(html.match(/\bt:'/g)||[]).length;
const notes=(html.match(/\bn:'/g)||[]).length;
let failed=false;const check=(n,o,d)=>{test(n,o,d);if(!o)failed=true};
check('26 scenes',scenes===26,String(scenes));
check('teacher note per scene',notes===26,String(notes));
for(const asset of ['signal-city.png','idea-garden.png','signal-swap.png'])check(asset,fs.existsSync(path.join(here,'assets',asset)));
check('navigation controls',/id="next"/.test(html)&&/id="prev"/.test(html)&&/id="menu"/.test(html));
check('interactive activity hooks',/matchBoard/.test(html)&&/opinionGame/.test(html)&&/buildTimer/.test(html)&&/exitButtons/.test(html));
if(failed)process.exitCode=1;
