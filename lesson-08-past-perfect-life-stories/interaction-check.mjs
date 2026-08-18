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
    check('all illustrations registered',document.images.length===11,document.images.length);
    const visualSlides=$$('.scene').filter(s=>s.querySelector('img,.icon-strip,.word-train,.stamp-row,.memory-motif,.station-chain,.sound-wave')).length;
    check('visual elements on at least 18 slides',visualSlides>=18,visualSlides);
    check('initial counter',$('#counter').textContent==='01 / 26',$('#counter').textContent);
    click('#next');check('next navigation',$('#counter').textContent==='02 / 26',$('#counter').textContent);
    click('#checkGrid .check:first-child');check('station check-in',$('#checkOutput').textContent.includes('fresh start'));
    click('.recap');check('homework reveal',$('.recap').classList.contains('open'));
    click('.hot');check('object inference clue',$('.hot').classList.contains('open'));
    click('.milestone');check('milestone reveal',$('.milestone').classList.contains('open'));
    click('#vocabMatch [data-kind="left"][data-pair="a"]');
    click('#vocabMatch [data-kind="left"][data-pair="b"]');
    check('vocabulary single selection',$$('#vocabMatch .match.active').length===1,$$('#vocabMatch .match.active').length);
    click('#vocabMatch [data-kind="right"][data-pair="b"]');
    check('vocabulary matching',$$('#vocabMatch .match.matched').length===2,$$('#vocabMatch .match.matched').length);
    click('#participleGrid .participle:first-child');check('participle validator',$('#participleFeedback').textContent.includes('1 / 8'));
    click('#discovery [data-role="earlier"]');click('#discovery [data-role="later"]');check('grammar discovery',$('#discoveryFeedback').textContent.startsWith('Past Perfect'),$('#discoveryFeedback').textContent);
    click('#formTabs [data-form="negative"]');check('form turnstile',$('.form-panel[data-panel="negative"]').classList.contains('active'));
    click('#tenseGrid [data-answer="had left"] .option:nth-child(2)');check('tense contrast',$('#tenseGrid [data-answer="had left"] .option:nth-child(2)').classList.contains('good'));
    click('.signal');check('signal reveal',$('.signal').classList.contains('open'));
    click('#soundGrid .sound:first-child');check('pronunciation signal',$('#soundGrid .sound:first-child').classList.contains('played'));
    click('#scenarioGrid [data-answer="had forgotten"] .option:nth-child(2)');check('controlled practice',$('#scenarioGrid [data-answer="had forgotten"] .option:nth-child(2)').classList.contains('good'));
    click('#builder [data-part="subject"] .chip:nth-child(3)');check('sentence builder',$('#builderOutput').textContent.startsWith('They'),$('#builderOutput').textContent);
    click('.repair');check('error repair',$('.repair').classList.contains('open'));
    click('#predictionGrid .prediction:first-child');check('pre-reading prediction',$('#predictionGrid .prediction:first-child').classList.contains('selected'));
    for(const n of [1,2,3,4,5,6])click('#sequence [data-order="'+n+'"]');click('#sequenceCheck');check('reading sequence',$('#sequenceFeedback').textContent.startsWith('Route restored'),$('#sequenceFeedback').textContent);
    click('#detectiveGrid [data-answer="earlier background"] .option:first-child');check('grammar detective',$('#detectiveGrid [data-answer="earlier background"] .option:first-child').classList.contains('good'));
    click('[data-profile="4"]');check('profile switch',$('#profileLabel').textContent.includes('Traveler E'),$('#profileLabel').textContent);
    const question=$('#interviewQuestion').textContent;click('#newQuestion');check('interview prompt generator',$('#interviewQuestion').textContent!==question,$('#interviewQuestion').textContent);
    click('#interviewStart');click('#interviewStart');check('interview timer controls',$('#interviewTimer').textContent==='01:30',$('#interviewTimer').textContent);
    const story=$('#storyPrompt').textContent;click('#newStory');check('story route generator',$('#storyPrompt').textContent!==story,$('#storyPrompt').textContent);
    click('#storyStart');click('#storyStart');check('production timer controls',$('#storyTimer').textContent==='03:00',$('#storyTimer').textContent);
    click('#quizOptions .option:nth-child(2)');check('review quiz',$('#quizScore').textContent==='1',$('#quizScore').textContent);
    for(const n of [1,2,3])click('#exitButtons button:nth-child('+n+')');check('exit ticket',$('#exitFeedback').textContent.includes('3 / 3'),$('#exitFeedback').textContent);
    const overflow=[];$$('.scene').forEach((s,i)=>{$$('.scene').forEach(x=>x.classList.remove('active','past'));s.classList.add('active');if(s.scrollWidth>s.clientWidth+1||document.documentElement.scrollWidth>window.innerWidth+1){const offenders=$$('*',s).filter(el=>el.scrollWidth>el.clientWidth+1).slice(0,8).map(el=>({tag:el.tagName,class:el.className,scroll:el.scrollWidth,client:el.clientWidth,text:(el.textContent||'').trim().slice(0,45)}));overflow.push({scene:i+1,sceneScroll:s.scrollWidth,sceneClient:s.clientWidth,doc:document.documentElement.scrollWidth,width:window.innerWidth,offenders})}});
    check('no horizontal overflow',overflow.length===0,JSON.stringify(overflow));
    const vertical=[];$$('.scene').forEach((s,i)=>{const frame=s.getBoundingClientRect();const offenders=$$('*',s).filter(el=>{const box=el.getBoundingClientRect();return box.height>0&&box.bottom>frame.bottom+1}).slice(0,8).map(el=>({tag:el.tagName,class:el.className,bottom:Math.round(el.getBoundingClientRect().bottom),text:(el.textContent||'').trim().slice(0,45)}));if(offenders.length)vertical.push({scene:i+1,scroll:s.scrollHeight,client:s.clientHeight,offenders})});
    check('no desktop vertical overflow',vertical.length===0,JSON.stringify(vertical));
  }catch(error){check('self-test harness',false,error.stack)}
  const marker=document.createElement('div');marker.id='self-test-results';marker.setAttribute('data-results',encodeURIComponent(JSON.stringify(out)));document.body.appendChild(marker);
})();
</script>`;

new Function(injected.match(/<script>([\s\S]*?)<\/script>/)[1]);
fs.writeFileSync(fixture,source.replace("</body>",()=>`${injected}\n</body>`));

function run(width,height){
  const profile=fs.mkdtempSync(path.join(os.tmpdir(),"lesson-08-dom-"));
  const command=spawnSync(browser,["--headless=new","--disable-gpu","--disable-software-rasterizer","--hide-scrollbars","--no-first-run",`--user-data-dir=${profile}`,`--window-size=${width},${height}`,"--force-device-scale-factor=1","--virtual-time-budget=3000","--dump-dom",pathToFileURL(fixture).href],{encoding:"utf8",maxBuffer:5_000_000,windowsHide:true});
  try{fs.rmSync(profile,{recursive:true,force:true,maxRetries:5,retryDelay:100})}catch{}
  if(command.error)throw command.error;
  const match=command.stdout.match(/id="self-test-results" data-results="([^"]+)"/);
  if(!match)throw new Error(`No self-test marker at ${width}x${height}. Exit ${command.status}. ${command.stderr.slice(-400)}`);
  return JSON.parse(decodeURIComponent(match[1]));
}

try{
  // Edge's headless window reserves 92px for browser chrome in --dump-dom mode.
  // Add it here so the CSS viewports match the 1600x900 and 500x844 capture targets.
  const desktop=run(1600,992),compact=run(500,936);
  for(const item of desktop)results.push([`desktop — ${item[0]}`,item[1],item[2]]);
  const compactOverflow=compact.find(item=>item[0]==='no horizontal overflow');results.push(['compact — no horizontal overflow',compactOverflow?.[1],compactOverflow?.[2]||'']);
  if(!process.env.SKIP_SHOTS){
    const shots=[[1600,900,1,'render-title.png'],[1600,900,4,'render-warmup.png'],[1600,900,11,'render-form.png'],[1600,900,19,'render-reading.png'],[500,844,24,'render-compact-production.png']];
    for(const [width,height,scene,name] of shots){
      const profile=fs.mkdtempSync(path.join(os.tmpdir(),"lesson-08-shot-"));
      const shot=spawnSync(browser,["--headless=new","--disable-gpu","--disable-software-rasterizer","--hide-scrollbars","--no-first-run","--force-prefers-reduced-motion","--run-all-compositor-stages-before-draw",`--user-data-dir=${profile}`,`--window-size=${width},${height}`,"--force-device-scale-factor=1","--virtual-time-budget=1200",`--screenshot=${path.join(here,name)}`,`${pathToFileURL(path.join(here,"index.html")).href}#${scene}`],{encoding:"utf8",windowsHide:true});
      try{fs.rmSync(profile,{recursive:true,force:true,maxRetries:5,retryDelay:100})}catch{}
      results.push([`capture ${name}`,shot.status===0&&fs.existsSync(path.join(here,name)),shot.stderr.slice(-180)]);
    }
  }
}catch(error){results.push(['harness',false,error.stack])}finally{try{fs.rmSync(fixture,{force:true})}catch{}}

for(const [name,pass,detail] of results)console.log(`${pass?'PASS':'FAIL'} — ${name}${detail?`: ${detail}`:''}`);
if(results.some(([,pass])=>!pass))process.exitCode=1;
