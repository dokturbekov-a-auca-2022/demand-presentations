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
  const out=[],one=(selector,root=document)=>root.querySelector(selector),all=(selector,root=document)=>[...root.querySelectorAll(selector)];
  const check=(name,pass,detail='')=>out.push([name,Boolean(pass),detail]);
  const click=selector=>{const node=one(selector);if(!node)throw new Error('Missing '+selector);node.click();};
  try{
    check('27 scenes load',all('.scene').length===27,all('.scene').length);
    check('eight unique image placements',all('img').length===8,all('img').length);
    check('initial counter',one('#counter').textContent==='01 / 27',one('#counter').textContent);
    click('#nextBtn');check('next navigation',one('#counter').textContent==='02 / 27',one('#counter').textContent);
    click('#energyChoices .choice');check('check-in choice',one('#energyOutput').textContent.includes('helping people'));
    click('#bridgeReveal');check('lesson bridge',one('#bridgeReveal').classList.contains('selected'));
    click('#resultChoices .choice');check('visual hook',one('#resultOutput').textContent.includes('preparation'));
    click('#jobHotspots .job-hotspot');check('job picture reveal',one('#jobHotspots .job-hotspot').classList.contains('open'));
    click('#responsibilityMatch [data-side="left"][data-pair="a"]');click('#responsibilityMatch [data-side="right"][data-pair="a"]');check('responsibility matching',all('#responsibilityMatch .matched').length===2,all('#responsibilityMatch .matched').length);
    click('#workplaces .workplace');check('workplace image',one('#placeOutput').textContent.includes('paramedic'));
    click('#skillBeams .skill-beam');check('skill beam',one('#skillBeams .skill-beam').classList.contains('selected'));
    click('#pronounceRow .pronounce');check('pronunciation',one('#pronounceRow .pronounce').classList.contains('played'));
    click('#predictions .choice');check('pre-viewing prediction',one('#predictionOutput').textContent.includes('preparation'));
    click('.frame-dot[data-frame="2"]');check('video frame control',one('#videoStatus').textContent.includes('listen'),one('#videoStatus').textContent);
    click('#videoPlay');click('#videoPlay');check('video play pause',!one('#videoPlay').classList.contains('playing'));
    click('#bigIdea [data-correct="true"]');check('first-viewing check',one('#bigIdeaOutput').textContent.startsWith('Yes'));
    click('#detailChecklist button');check('detail checklist',one('#detailOutput').textContent.includes('1 / 4'));
    click('#frameGrid .frame-card button');check('frame reveal',one('#frameGrid .frame-card').classList.contains('open'));
    click('#trueFalse .option');check('true false choices',all('#tfOutput button').length===3,all('#tfOutput button').length);
    for(const order of [1,2,3,4])click('#sequence [data-order="'+order+'"]');click('#sequenceCheck');check('sequence activity',one('#sequenceOutput').classList.contains('success')&&one('#sequenceOutput').textContent.startsWith('Correct'));
    click('#languageBuilder .builder-col:nth-child(1) button');click('#languageBuilder .builder-col:nth-child(2) button');click('#languageBuilder .builder-col:nth-child(3) button');check('language builder',one('#languageOutput').textContent.includes('needs to'));
    click('#practiceGrid [data-good="true"]');check('controlled practice',one('#practiceGrid [data-good="true"]').classList.contains('good'));
    click('#repairGrid .repair');check('error repair',one('#repairGrid .repair').classList.contains('open'));
    check('interview audio control',one('#interviewPlay').dataset.idle==='Play interview');click('#transcriptToggle');check('interview transcript',one('#transcript').classList.contains('open'));
    click('#interviewQuestions .reveal');check('interview comprehension',one('#interviewOutput').textContent.includes('studio'));
    click('#infoGap .hidden-slot');check('information gap',one('#infoGap .hidden-slot').textContent!=='hidden');
    click('#productionStart');click('#productionStart');check('production timer',one('#productionTimer').textContent==='04:00',one('#productionTimer').textContent);
    click('#newMission');check('production mission',one('#mission').textContent.includes('goes wrong'));
    click('#quizGrid [data-correct="true"]');check('review quiz',one('#quizScore').textContent==='1',one('#quizScore').textContent);
    click('#exitStrip .exit');check('exit ticket',one('#exitOutput').textContent.includes('1 / 3'));
    click('#menuBtn');check('scene map',one('#mapOverlay').classList.contains('open'));click('[data-close="mapOverlay"]');
    click('#notesBtn');check('teacher notes',one('#notesOverlay').classList.contains('open'));

    const horizontal=[];
    all('.scene').forEach((scene,index)=>{all('.scene').forEach(item=>item.classList.remove('active'));scene.classList.add('active');scene.scrollTop=0;if(scene.scrollWidth>scene.clientWidth+2||document.documentElement.scrollWidth>window.innerWidth+2){const offenders=all('*',scene).filter(node=>node.scrollWidth>node.clientWidth+2).slice(0,6).map(node=>({tag:node.tagName,className:node.className,scroll:node.scrollWidth,client:node.clientWidth,text:(node.textContent||'').trim().slice(0,45)}));horizontal.push({scene:index+1,sceneScroll:scene.scrollWidth,sceneClient:scene.clientWidth,doc:document.documentElement.scrollWidth,width:window.innerWidth,offenders});}});
    check('no horizontal overflow',horizontal.length===0,JSON.stringify(horizontal));
    if(window.innerWidth>=1000){const vertical=[];all('.scene').forEach((scene,index)=>{all('.scene').forEach(item=>item.classList.remove('active'));scene.classList.add('active');const frame=scene.getBoundingClientRect();const offenders=all('*',scene).filter(node=>{if(node.classList.contains('teacher')||node.closest('.credits'))return false;const box=node.getBoundingClientRect();return box.height>0&&box.bottom>frame.bottom+2;}).slice(0,6).map(node=>({tag:node.tagName,className:node.className,bottom:Math.round(node.getBoundingClientRect().bottom),frameBottom:Math.round(frame.bottom),text:(node.textContent||'').trim().slice(0,45)}));if(offenders.length)vertical.push({scene:index+1,offenders});});check('no desktop vertical clipping',vertical.length===0,JSON.stringify(vertical));}
  }catch(error){check('self-test harness',false,error.stack);}
  const marker=document.createElement('div');marker.id='self-test-results';marker.setAttribute('data-results',encodeURIComponent(JSON.stringify(out)));document.body.appendChild(marker);
})();
</script>`;

fs.writeFileSync(fixture,source.replace('</body>',`${injected}\n</body>`));
function run(width,height){const profile=fs.mkdtempSync(path.join(os.tmpdir(),'lesson11-worklight-dom-'));const command=spawnSync(browser,['--headless=new','--disable-gpu','--hide-scrollbars','--no-first-run',`--user-data-dir=${profile}`,`--window-size=${width},${height}`,'--force-device-scale-factor=1','--virtual-time-budget=4200','--dump-dom',pathToFileURL(fixture).href],{encoding:'utf8',maxBuffer:10_000_000,windowsHide:true});try{fs.rmSync(profile,{recursive:true,force:true,maxRetries:5,retryDelay:100});}catch{}if(command.error)throw command.error;const match=command.stdout.match(/id="self-test-results" data-results="([^"]+)"/);if(!match)throw new Error(`No self-test marker at ${width}x${height}. Exit ${command.status}. ${command.stderr.slice(-600)}`);return JSON.parse(decodeURIComponent(match[1]));}
const results=[];try{const desktop=run(1600,992),compact=run(500,936);for(const item of desktop)results.push([`desktop - ${item[0]}`,item[1],item[2]]);const compactOverflow=compact.find(item=>item[0]==='no horizontal overflow');results.push(['compact - no horizontal overflow',compactOverflow?.[1],compactOverflow?.[2]||'']);}catch(error){results.push(['harness',false,error.stack]);}finally{try{fs.rmSync(fixture,{force:true});}catch{}}
for(const [name,pass,detail] of results)console.log(`${pass?'PASS':'FAIL'} - ${name}${detail?`: ${detail}`:''}`);if(results.some(([,pass])=>!pass))process.exitCode=1;
