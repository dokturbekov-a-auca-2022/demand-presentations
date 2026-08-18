import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';

const root=path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]):/,'$1:'));
const browser='C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const decks=[
  ['lesson-09-speaking-club-technology-ai',26,25,'mission-note','kinetic-figure',5],
  ['lesson-10-future-continuous-travel-plans',25,24,'task-ticket','travel-visual',25],
  ['lesson-11-video-jobs-careers',22,21,'career-lens','career-film',21],
  ['lesson-12-second-conditional-dreams',24,23,'dream-orbit','dream-portal',24]
];
let failed=false;

for(const [dirName,expectedScenes,expectedTasks,taskClass,visualClass,expectedVisuals] of decks){
  for(const [width,height,label] of [[1600,900,'desktop'],[500,844,'iphone']]){
    const dir=path.join(root,dirName),source=fs.readFileSync(path.join(dir,'index.html'),'utf8');
    const fixture=path.join(dir,`.__qa-${width}.html`);
    const probe=`<script>setTimeout(()=>{const scenes=[...document.querySelectorAll('.scene')],active=document.querySelector('.scene.active'),controls=document.querySelector('.controls,.tools'),visual=active?.querySelector('.${visualClass}'),infoBtn=document.querySelector('#v2Info'),taskPanel=document.querySelector('.v2-panel');infoBtn?.click();const panelOpen=taskPanel?.classList.contains('open')||false;if('${dirName}'.startsWith('lesson-10')&&location.hash==='#6'){const wrong=document.querySelector('#sortGrid [data-kind="thing"]'),right=document.querySelector('#sortGrid [data-kind="action"]');wrong?.click();right?.click()}const result={scenes:scenes.length,visualSlides:scenes.filter(s=>s.querySelector('img')).length,tasks:document.querySelectorAll('.${taskClass}').length,info:!!infoBtn,full:!!document.querySelector('#v2Full'),panel:!!taskPanel,panelOpen,horizontal:document.documentElement.scrollWidth<=innerWidth+2,activeHorizontal:!active||active.scrollWidth<=active.clientWidth+2||getComputedStyle(active).overflowX==='hidden',visualBottom:visual&&controls?Math.round(controls.getBoundingClientRect().top-visual.getBoundingClientRect().bottom):null,sortWrong:document.querySelector('#sortGrid [data-kind="thing"]')?.classList.contains('bad')??null,sortRight:document.querySelector('#sortGrid [data-kind="action"]')?.classList.contains('good')??null};if('${dirName}'.startsWith('lesson-10')&&location.hash==='#10'){const tabs=document.querySelector('#formTabs'),panel=document.querySelector('[data-panel].active'),feed=document.querySelector('#formFeedback'),formula=panel?.querySelector('.formula');result.formNoOverlap=!!tabs&&!!panel&&!!feed&&tabs.getBoundingClientRect().bottom<=panel.getBoundingClientRect().top+1&&panel.getBoundingClientRect().bottom<=feed.getBoundingClientRect().top+1;result.formFits=!formula||formula.scrollWidth<=formula.clientWidth+2}document.body.innerHTML='<pre id="qa">'+JSON.stringify(result)+'</pre>'},1300)</script>`;
    fs.writeFileSync(fixture,source.replace('</body>',`${probe}</body>`));
    const profile=fs.mkdtempSync(path.join(os.tmpdir(),'deck-qa-profile-'));
    const hash=dirName.startsWith('lesson-10')?(label==='desktop'?'#10':'#6'):'#2';
    const run=spawnSync(browser,['--headless=new','--disable-gpu','--disable-software-rasterizer','--hide-scrollbars','--no-first-run',`--user-data-dir=${profile}`,`--window-size=${width},${height}`,'--force-device-scale-factor=1','--virtual-time-budget=3000','--dump-dom',pathToFileURL(fixture).href+hash],{encoding:'utf8',maxBuffer:5_000_000,windowsHide:true});
    fs.unlinkSync(fixture);try{fs.rmSync(profile,{recursive:true,force:true,maxRetries:4,retryDelay:80})}catch{}
    const match=run.stdout.match(/<pre id="qa">(.*?)<\/pre>/s);let data={};try{data=JSON.parse(match?.[1].replaceAll('&quot;','"')||'{}')}catch{}
    const checks=[['scene count',data.scenes===expectedScenes,data.scenes],['illustrated slides',data.visualSlides===expectedVisuals,data.visualSlides],['task guidance',data.tasks===expectedTasks,data.tasks],['info/full controls and panel',data.info&&data.full&&data.panel&&data.panelOpen,`${data.info}/${data.full}/${data.panel}/${data.panelOpen}`],['no horizontal overflow',data.horizontal&&data.activeHorizontal,`${data.horizontal}/${data.activeHorizontal}`]];
    if(dirName.startsWith('lesson-10')&&label==='desktop')checks.push(['slide 10 forms fit and render',data.formFits===true,data.formFits]);
    if(dirName.startsWith('lesson-10')&&label==='iphone')checks.push(['slide 6 correct/incorrect states',data.sortWrong&&data.sortRight,`${data.sortWrong}/${data.sortRight}`]);
    for(const [name,pass,detail] of checks){failed||=!pass;console.log(`${pass?'PASS':'FAIL'} — ${dirName} ${label} — ${name}: ${detail}`)}
  }
}
if(failed)process.exitCode=1;
