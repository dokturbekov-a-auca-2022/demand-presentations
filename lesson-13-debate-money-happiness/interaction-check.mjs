import fs from 'node:fs';import path from 'node:path';import{fileURLToPath}from'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));const html=fs.readFileSync(path.join(here,'index.html'), 'utf8');let failed=false;
for(const token of ['ArrowRight','PageDown','touchstart','data-jump','timerReset','data-answer','data-vote','data-item']){const ok=html.includes(token);console.log(`${ok?'PASS':'FAIL'} — interaction hook: ${token}`);failed||=!ok}if(failed)process.exitCode=1;
