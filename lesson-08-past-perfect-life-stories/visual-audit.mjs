import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const here=path.dirname(fileURLToPath(import.meta.url));
const browser="C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const output=fs.mkdtempSync(path.join(os.tmpdir(),"lesson08-visual-audit-"));
const page=pathToFileURL(path.join(here,"index.html")).href;
let failed=0;

for(let scene=1;scene<=26;scene++){
  const profile=fs.mkdtempSync(path.join(os.tmpdir(),"lesson08-audit-profile-"));
  const name=`scene-${String(scene).padStart(2,"0")}.png`;
  const shot=spawnSync(browser,["--headless=new","--disable-gpu","--disable-software-rasterizer","--hide-scrollbars","--no-first-run","--force-prefers-reduced-motion","--run-all-compositor-stages-before-draw",`--user-data-dir=${profile}`,"--window-size=1600,900","--force-device-scale-factor=1","--virtual-time-budget=900",`--screenshot=${path.join(output,name)}`,`${page}#${scene}`],{encoding:"utf8",windowsHide:true});
  try{fs.rmSync(profile,{recursive:true,force:true,maxRetries:5,retryDelay:100})}catch{}
  if(shot.status!==0||!fs.existsSync(path.join(output,name)))failed++;
}

console.log(`AUDIT_DIR=${output}`);
console.log(`${failed?"FAIL":"PASS"} — captured ${26-failed} / 26 scenes`);
if(failed)process.exitCode=1;
