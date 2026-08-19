import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const browser='C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const source=fs.readFileSync(path.join(here,'index.html'),'utf8');
const fixture=path.join(here,'.interaction-fixture.html');

const injected=String.raw`
<script>
(() => {
  const out=[],$=(selector,root=document)=>root.querySelector(selector),all=(selector,root=document)=>[...root.querySelectorAll(selector)];
  const check=(name,pass,detail='')=>out.push([name,Boolean(pass),detail]);
  const click=selector=>{const node=$(selector);if(!node)throw new Error('Missing '+selector);node.click();};
  try{
    check('27 scenes load',all('.scene').length===27,all('.scene').length);
    check('three image assets used in four placements',all('img').length===4,all('img').length);
    check('initial counter',$('#counter').textContent==='01 / 27',$('#counter').textContent);
    click('#nextBtn');check('next navigation',$('#counter').textContent==='02 / 27',$('#counter').textContent);
    click('#checkGrid .choice:first-child');check('check-in choice',$('#checkOutput').textContent.includes('At 8 p.m.'),$('#checkOutput').textContent);
    click('#bridgeReveal');check('bridge reveal',$('#bridgeReveal').classList.contains('open'));
    click('#imagePrompts .choice:first-child');check('visual prompt',$('#imageOutput').textContent.includes('boarding'));
    click('#vocabLenses .reveal:first-child');check('vocabulary reveal',$('#vocabLenses .reveal:first-child').classList.contains('open'));
    click('#matchZone [data-side="left"][data-pair="a"]');click('#matchZone [data-side="right"][data-pair="a"]');check('collocation matching',all('#matchZone .matched').length===2,all('#matchZone .matched').length);
    click('#stressLine .stress:first-child');check('stress interaction',$('#stressLine .stress:first-child').classList.contains('played'));
    click('#discoveryCompare [data-discovery="progress"]');check('grammar discovery',$('#discoveryOutput').textContent.startsWith('Correct'));
    click('#timeDial .time-chip:first-child');check('time lens',$('#timeDialOutput').textContent.includes('This time tomorrow'));
    click('#formTabs [data-form="question"]');check('form tabs',$('.form-panel[data-panel="question"]').classList.contains('active'));
    click('#politeChoices [data-polite="expected"]');check('polite plan question',$('#politeOutput').textContent.startsWith('Yes'));
    click('#timeSignals [data-valid="true"]');check('time signal sort',$('#timeSignals [data-valid="true"]').classList.contains('good'));
    click('#tenseChoice [data-tense="continuous"]');check('tense contrast',$('#tenseOutput').textContent.includes('9:15'));
    click('#repairGrid .repair:first-child');check('error repair',$('#repairGrid .repair:first-child').classList.contains('open'));
    click('#practiceGrid .option:first-child');check('controlled practice',all('#practiceOutput button').length===2,all('#practiceOutput button').length);
    click('#builder [data-part="subject"] .chip');click('#builder [data-part="time"] .chip');click('#builder [data-part="action"] .chip');check('sentence builder',$('#builderOutput').textContent.includes('will be boarding'));
    click('.story-marker:first-of-type');check('visual story',$('#storyOutput').textContent.includes('packing'));
    click('#transcriptToggle');check('listening reveal',!$('#transcript').classList.contains('hidden-text'));
    click('#readingQuestions .reveal:first-child');check('comprehension reveal',$('#readingQuestions .reveal:first-child').classList.contains('open'));
    click('#infoGap [data-reveal]');check('information gap',$('#infoGap [data-reveal]').textContent!=='hidden');
    click('#productionStart');click('#productionStart');check('production timer',$('#productionTimer').textContent==='03:00',$('#productionTimer').textContent);
    click('#quizGrid [data-correct="true"]');check('review quiz',$('#quizScore').textContent==='1',$('#quizScore').textContent);
    click('#exitStrip .exit-btn:first-child');check('exit ticket',$('#exitOutput').textContent.includes('1 / 3'));
    click('#menuBtn');check('scene map',$('#routeOverlay').classList.contains('open'));click('[data-close="routeOverlay"]');
    click('#notesBtn');check('teacher notes',$('#notesOverlay').classList.contains('open'));

    const horizontal=[];
    all('.scene').forEach((scene,index)=>{
      all('.scene').forEach(item=>item.classList.remove('active'));scene.classList.add('active');scene.scrollTop=0;
      if(scene.scrollWidth>scene.clientWidth+2||document.documentElement.scrollWidth>window.innerWidth+2){
        const offenders=all('*',scene).filter(node=>node.scrollWidth>node.clientWidth+2).slice(0,6).map(node=>({tag:node.tagName,className:node.className,scroll:node.scrollWidth,client:node.clientWidth,text:(node.textContent||'').trim().slice(0,45)}));
        horizontal.push({scene:index+1,sceneScroll:scene.scrollWidth,sceneClient:scene.clientWidth,doc:document.documentElement.scrollWidth,width:window.innerWidth,offenders});
      }
    });
    check('no horizontal overflow',horizontal.length===0,JSON.stringify(horizontal));
    if(window.innerWidth>=1000){
      const vertical=[];
      all('.scene').forEach((scene,index)=>{
        all('.scene').forEach(item=>item.classList.remove('active'));scene.classList.add('active');
        const frame=scene.getBoundingClientRect();
        const offenders=all('*',scene).filter(node=>{if(node.classList.contains('teacher'))return false;const box=node.getBoundingClientRect();return box.height>0&&box.bottom>frame.bottom+2;}).slice(0,6).map(node=>({tag:node.tagName,className:node.className,bottom:Math.round(node.getBoundingClientRect().bottom),frameBottom:Math.round(frame.bottom),text:(node.textContent||'').trim().slice(0,45)}));
        if(offenders.length)vertical.push({scene:index+1,offenders});
      });
      check('no desktop vertical clipping',vertical.length===0,JSON.stringify(vertical));
    }
  }catch(error){check('self-test harness',false,error.stack);}
  const marker=document.createElement('div');marker.id='self-test-results';marker.setAttribute('data-results',encodeURIComponent(JSON.stringify(out)));document.body.appendChild(marker);
})();
</script>`;

fs.writeFileSync(fixture,source.replace('</body>',`${injected}\n</body>`));

function run(width,height){
  const profile=fs.mkdtempSync(path.join(os.tmpdir(),'lesson10-meanwhile-dom-'));
  const command=spawnSync(browser,['--headless=new','--disable-gpu','--hide-scrollbars','--no-first-run',`--user-data-dir=${profile}`,`--window-size=${width},${height}`,'--force-device-scale-factor=1','--virtual-time-budget=3500','--dump-dom',pathToFileURL(fixture).href],{encoding:'utf8',maxBuffer:8_000_000,windowsHide:true});
  try{fs.rmSync(profile,{recursive:true,force:true,maxRetries:5,retryDelay:100});}catch{}
  if(command.error)throw command.error;
  const match=command.stdout.match(/id="self-test-results" data-results="([^"]+)"/);
  if(!match)throw new Error(`No self-test marker at ${width}x${height}. Exit ${command.status}. STDERR: ${command.stderr.slice(-700)} STDOUT: ${command.stdout.slice(-1200)}`);
  return JSON.parse(decodeURIComponent(match[1]));
}

const results=[];
try{
  const desktop=run(1600,992);
  const compact=run(500,936);
  for(const item of desktop)results.push([`desktop - ${item[0]}`,item[1],item[2]]);
  const compactOverflow=compact.find(item=>item[0]==='no horizontal overflow');
  results.push(['compact - no horizontal overflow',compactOverflow?.[1],compactOverflow?.[2]||'']);
}catch(error){results.push(['harness',false,error.stack]);}
finally{if(!process.env.KEEP_FIXTURE){try{fs.rmSync(fixture,{force:true});}catch{}}}

for(const [name,pass,detail] of results)console.log(`${pass?'PASS':'FAIL'} - ${name}${detail?`: ${detail}`:''}`);
if(results.some(([,pass])=>!pass))process.exitCode=1;
