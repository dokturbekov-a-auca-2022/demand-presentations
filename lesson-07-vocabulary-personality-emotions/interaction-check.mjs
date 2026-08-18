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
    check('all illustrations registered',document.images.length===9,document.images.length);
    check('initial counter',$('#counter').textContent==='01 / 26',$('#counter').textContent);
    click('#next');check('next navigation',$('#counter').textContent==='02 / 26',$('#counter').textContent);
    click('#moodGrid .mood:first-child');check('mood check-in',$('#moodOutput').textContent.includes('calm'));
    click('.door-hot');check('visual room clue',$('.door-hot').classList.contains('open'));
    click('.word-card');check('vocabulary reveal',$('.word-card').classList.contains('open'));
    click('#soundGrid .sound');check('pronunciation signal',$('#soundGrid .sound').classList.contains('played'));
    click('[data-kind="word"][data-pair="a"]');click('[data-kind="behavior"][data-pair="a"]');check('trait matching',$$('#traitMatch .match.matched').length===2,$$('#traitMatch .match.matched').length);
    click('.pair-card');check('word relation reveal',$('.pair-card').classList.contains('open'));
    click('[data-face="6"]');check('emotion portrait switch',$('#faceEmotion').textContent==='frustrated',$('#faceEmotion').textContent);
    click('#intensity .lift:first-child button:nth-of-type(2)');check('intensity elevator',$('#intensityFeedback').textContent.includes('anxious'));
    click('#situationGrid [data-answer="relieved"] .option:nth-child(2)');check('situation inference',$('#situationGrid [data-answer="relieved"] .option:nth-child(2)').classList.contains('good'));
    click('#sortGrid .sort-item:first-child');check('trait/emotion sorter',$('#sortGrid .sort-item:first-child').dataset.bucket==='trait',$('#sortGrid .sort-item:first-child').dataset.bucket);
    click('#collocationBoard [data-kind="left"][data-pair="a"]');click('#collocationBoard [data-kind="right"][data-pair="a"]');check('collocation matching',$$('#collocationBoard .match.matched').length===2,$$('#collocationBoard .match.matched').length);
    click('#predictionGrid .prediction:first-child');check('pre-reading prediction',$('#predictionGrid .prediction:first-child').classList.contains('selected'));
    click('#contextGrid [data-answer="did what she promised"] .option:first-child');check('context meaning',$('#contextGrid [data-answer="did what she promised"] .option:first-child').classList.contains('good'));
    for(const n of [1,2,3,4,5])click('#sequence [data-order="'+n+'"]');click('#sequenceCheck');check('reading sequence',$('#sequenceFeedback').textContent.startsWith('Sequence restored'),$('#sequenceFeedback').textContent);
    click('.dialogue-options[data-gap="gap1"] .option:nth-child(2)');check('dialogue completion',$('#gap1').textContent==='anxious',$('#gap1').textContent);
    click('[data-profile="5"]');check('profile switch',$('#profileLabel').textContent.includes('Guest F'),$('#profileLabel').textContent);
    for(const n of [1,2,3,5])click('#candidateGrid .candidate:nth-child('+n+')');click('#teamCheck');check('team problem solving',$('#teamFeedback').textContent.startsWith('Balanced coverage'),$('#teamFeedback').textContent);
    const before=$('#guestName').textContent;click('#newGuest');check('guest-card generator',$('#guestName').textContent!==before,$('#guestName').textContent);
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
  const profile=fs.mkdtempSync(path.join(os.tmpdir(),"lesson-07-dom-"));
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
  if(!process.env.SKIP_SHOTS){
    const shots=[[1600,900,1,'render-title.png'],[1600,900,12,'render-emotions.png'],[1600,900,18,'render-reading.png'],[500,844,22,'render-compact-profiles.png']];
    for(const [width,height,scene,name] of shots){
      const profile=fs.mkdtempSync(path.join(os.tmpdir(),"lesson-07-shot-"));
      const shot=spawnSync(browser,["--headless=new","--disable-gpu","--disable-software-rasterizer","--hide-scrollbars","--no-first-run","--force-prefers-reduced-motion","--run-all-compositor-stages-before-draw",`--user-data-dir=${profile}`,`--window-size=${width},${height}`,"--force-device-scale-factor=1","--virtual-time-budget=1200",`--screenshot=${path.join(here,name)}`,`${pathToFileURL(path.join(here,"index.html")).href}#${scene}`],{encoding:"utf8",windowsHide:true});
      try{fs.rmSync(profile,{recursive:true,force:true,maxRetries:5,retryDelay:100})}catch{}
      results.push([`capture ${name}`,shot.status===0&&fs.existsSync(path.join(here,name)),shot.stderr.slice(-180)]);
    }
  }
}catch(error){results.push(['harness',false,error.stack])}finally{try{fs.rmSync(fixture,{force:true})}catch{}}

for(const [name,pass,detail] of results)console.log(`${pass?'PASS':'FAIL'} — ${name}${detail?`: ${detail}`:''}`);
if(results.some(([,pass])=>!pass))process.exitCode=1;
