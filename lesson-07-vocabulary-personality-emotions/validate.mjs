import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const here=path.dirname(fileURLToPath(import.meta.url));
const html=fs.readFileSync(path.join(here,"index.html"),"utf8");
const scenes=[...html.matchAll(/<section class="scene[^>]*data-title="([^"]+)"/g)];
const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]);
const duplicates=ids.filter((id,i)=>ids.indexOf(id)!==i);
const refs=[...html.matchAll(/(?:src|href)="(assets\/[^"]+)"/g)].map(m=>m[1]);
const uniqueRefs=[...new Set(refs)];
const missing=uniqueRefs.filter(r=>!fs.existsSync(path.join(here,r)));
const notes=(html.match(/<aside class="teacher">/g)||[]).length;
const checks=[
  ["26 scenes",scenes.length===26,scenes.length],
  ["unique IDs",duplicates.length===0,duplicates.join(", ")||ids.length],
  ["seven visual assets referenced",uniqueRefs.length===7,uniqueRefs.join(", ")],
  ["all assets exist",missing.length===0,missing.join(", ")||"yes"],
  ["teacher notes on every scene",notes===26,notes],
  ["no external runtime URLs",!/(?:src|href)="https?:\/\//.test(html),"checked"]
];
for(const [name,pass,detail] of checks)console.log(`${pass?"PASS":"FAIL"} — ${name}: ${detail}`);
if(checks.some(([,pass])=>!pass))process.exitCode=1;
