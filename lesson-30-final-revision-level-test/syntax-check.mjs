import fs from 'node:fs';import vm from 'node:vm';
const p=fs.readFileSync('index.html','utf8');
const scripts=[...p.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
for(const s of scripts)new vm.Script(s);
console.log(`PASS — JavaScript syntax (${scripts.length} scripts)`);
