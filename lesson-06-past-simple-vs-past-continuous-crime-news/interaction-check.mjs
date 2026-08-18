import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const here=path.dirname(fileURLToPath(import.meta.url));
const browser="C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const source=fs.readFileSync(path.join(here,"index.html"),"utf8");
const fixture=path.join(here,".interaction-fixture.html");
const results=[];

const injected=String.raw`
<script>
(() => {
  const out=[],$=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
  const check=(name,pass,detail='')=>out.push([name,!!pass,detail]);
  const click=s=>{const n=$(s);if(!n)throw new Error('Missing '+s);n.click()};
  try{
    check('26 scenes load',$$('.scene').length===26,$$('.scene').length);
    check('all illustrations decode',document.images.length===7&&[...document.images].every(i=>i.complete&&i.naturalWidth>0),document.images.length);
    check('initial counter',$('#counter').textContent==='01 / 26',$('#counter').textContent);
    click('#next');check('next navigation',$('#counter').textContent==='02 / 26',$('#counter').textContent);
    click('#timeGrid .time-card:nth-child(3)');check('check-in time',$('#timeSignal').textContent.includes('9:00'));
    click('.scan-hot');check('visual scan',$('.scan-hot').classList.contains('open'));
    click('.case-card');check('vocabulary reveal',$('.case-card').classList.contains('open'));
    click('[data-kind="verb"][data-pair="a"]');click('[data-kind="verb"][data-pair="b"]');check('collocation single selection',$$('.match.active').length===1,$$('.match.active').length);click('[data-kind="noun"][data-pair="b"]');check('collocation matching',$$('.match.matched').length===2,$$('.match.matched').length);
    click('#soundGrid .sound');check('pronunciation signal',$('#soundGrid .sound').classList.contains('played'));
    click('[data-logic="event"]');check('grammar discovery',$('#logicFeedback').textContent.includes('completed event'));
    click('#frameButtons button:nth-child(4)');check('CCTV timeline',$('#frameReadout').textContent.includes('cleaner'));
    click('#connectorGrid .connector:first-child .option:first-of-type');check('when/while choice',$('#connectorGrid .connector:first-child .option:first-of-type').classList.contains('good'));
    click('#takeOptions .option:nth-child(2)');check('controlled practice',$('#takeOptions .option:nth-child(2)').classList.contains('good'));
    click('[data-build="subject"] .chip:nth-of-type(2)');check('sentence builder',$('#builderOutput').textContent.startsWith('The guard'));
    click('#editReveal');check('error correction',$('#editScreen').classList.contains('revealed'));
    click('#predictionGrid .prediction');check('pre-reading prediction',$('#predictionGrid .prediction').classList.contains('selected'));
    click('#labelGrid [data-answer="event"] .tagger:nth-child(2)');check('grammar labeling',$('#labelGrid [data-answer="event"] .tagger:nth-child(2)').classList.contains('good'));
    click('[data-witness="3"]');check('witness switch',$('#witnessLabel').textContent.includes('Witness D'));
    for(const n of [1,2,3,4,5])click('[data-order="'+n+'"]');click('#timelineCheck');check('case reconstruction',$('#timelineFeedback').textContent.startsWith('Timeline verified'),$('#timelineFeedback').textContent);
    click('[data-q="start"] .chip:nth-of-type(3)');check('question builder',$('#qOutput').textContent.startsWith('Did'));
    click('#headlineChoices [data-correct="true"]');check('headline editor',$('#headlineChoices [data-correct="true"]').classList.contains('good'));
    click('#timerStart');click('#timerStart');check('production timer controls',$('#timer').textContent==='02:00',$('#timer').textContent);
    click('#quizOptions .option:first-child');check('review quiz',$('#quizScore').textContent==='1',$('#quizScore').textContent);
    for(const n of [1,2,3])click('#exitButtons button:nth-child('+n+')');check('exit ticket',$('#exitFeedback').textContent.includes('3 / 3'),$('#exitFeedback').textContent);
    const overflow=[];$$('.scene').forEach((s,i)=>{$$('.scene').forEach(x=>x.classList.remove('active','past'));s.classList.add('active');if(s.scrollWidth>s.clientWidth+1||document.documentElement.scrollWidth>window.innerWidth+1)overflow.push({scene:i+1,sceneScroll:s.scrollWidth,sceneClient:s.clientWidth,doc:document.documentElement.scrollWidth,width:window.innerWidth})});
    check('no horizontal overflow',overflow.length===0,JSON.stringify(overflow));
  }catch(error){check('self-test harness',false,error.stack)}
  const marker=document.createElement('div');marker.id='self-test-results';marker.setAttribute('data-results',encodeURIComponent(JSON.stringify(out)));document.body.appendChild(marker);
})();
</script>`;

new Function(injected.match(/<script>([\s\S]*?)<\/script>/)[1]);
fs.writeFileSync(fixture,source.replace("</body>",()=>`${injected}\n</body>`));

function run(width,height){
  const profile=fs.mkdtempSync(path.join(os.tmpdir(),"lesson-06-dom-"));
  const command=spawnSync(browser,["--headless=new","--disable-gpu","--disable-software-rasterizer","--hide-scrollbars","--no-first-run",`--user-data-dir=${profile}`,`--window-size=${width},${height}`,"--force-device-scale-factor=1","--virtual-time-budget=3000","--dump-dom",pathToFileURL(fixture).href],{encoding:"utf8",maxBuffer:5_000_000,windowsHide:true});
  try{fs.rmSync(profile,{recursive:true,force:true,maxRetries:5,retryDelay:100})}catch{}
  if(command.error)throw command.error;
  const match=command.stdout.match(/id="self-test-results" data-results="([^"]+)"/);
  if(!match)throw new Error(`No self-test marker at ${width}x${height}. Exit ${command.status}. ${command.stderr.slice(-400)}`);
  return JSON.parse(decodeURIComponent(match[1]));
}

try{
  const desktop=run(1600,900),compact=run(500,844);
  for(const item of desktop)results.push([`desktop — ${item[0]}`,item[1],item[2]]);
  const compactOverflow=compact.find(item=>item[0]==='no horizontal overflow');results.push(['compact — no horizontal overflow',compactOverflow?.[1],compactOverflow?.[2]||'']);
  if(!process.env.SKIP_SHOTS){const shots=[[1600,900,1,'render-title.png'],[1600,900,9,'render-grammar.png'],[1600,900,17,'render-reading.png'],[500,844,19,'render-compact-witness.png']];
  for(const [width,height,scene,name] of shots){const profile=fs.mkdtempSync(path.join(os.tmpdir(),"lesson-06-shot-"));const shot=spawnSync(browser,["--headless=new","--disable-gpu","--disable-software-rasterizer","--hide-scrollbars","--no-first-run","--force-prefers-reduced-motion","--run-all-compositor-stages-before-draw",`--user-data-dir=${profile}`,`--window-size=${width},${height}`,"--force-device-scale-factor=1","--virtual-time-budget=1200",`--screenshot=${path.join(here,name)}`,`${pathToFileURL(path.join(here,"index.html")).href}#${scene}`],{encoding:"utf8",windowsHide:true});try{fs.rmSync(profile,{recursive:true,force:true,maxRetries:5,retryDelay:100})}catch{}results.push([`capture ${name}`,shot.status===0&&fs.existsSync(path.join(here,name)),shot.stderr.slice(-180)])}}
}catch(error){results.push(['harness',false,error.stack])}finally{try{fs.rmSync(fixture,{force:true})}catch{}}

for(const [name,pass,detail] of results)console.log(`${pass?'PASS':'FAIL'} — ${name}${detail?`: ${detail}`:''}`);
if(results.some(([,pass])=>!pass))process.exitCode=1;
