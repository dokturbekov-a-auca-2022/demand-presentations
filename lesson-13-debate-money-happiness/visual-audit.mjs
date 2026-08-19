import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const browser='C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const output=process.env.QA_DIR?path.resolve(process.env.QA_DIR):path.join(here,'qa');
fs.mkdirSync(output,{recursive:true});
const page=pathToFileURL(path.join(here,'index.html')).href;
let failed=0,captured=0;
for(const [label,width,height] of [['desktop',1600,900],['compact',500,844]]){
  const folder=path.join(output,label);fs.mkdirSync(folder,{recursive:true});
  for(let scene=1;scene<=28;scene++){
    const profile=fs.mkdtempSync(path.join(os.tmpdir(),`lesson13-${label}-`));
    const target=path.join(folder,`scene-${String(scene).padStart(2,'0')}.png`);
    const shot=spawnSync(browser,['--headless=new','--disable-gpu','--hide-scrollbars','--no-first-run','--force-prefers-reduced-motion',`--user-data-dir=${profile}`,`--window-size=${width},${height}`,'--force-device-scale-factor=1','--virtual-time-budget=1400',`--screenshot=${target}`,`${page}#${scene}`],{encoding:'utf8',windowsHide:true});
    try{fs.rmSync(profile,{recursive:true,force:true,maxRetries:5,retryDelay:100});}catch{}
    if(shot.status!==0||!fs.existsSync(target))failed++;else captured++;
  }
}
console.log(`AUDIT_DIR=${output}`);console.log(`${failed?'FAIL':'PASS'} - captured ${captured} / 56 visual states`);if(failed)process.exitCode=1;
