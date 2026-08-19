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
  const out=[],one=(s,r=document)=>r.querySelector(s),all=(s,r=document)=>[...r.querySelectorAll(s)],check=(n,p,d='')=>out.push([n,!!p,d]),click=s=>{const n=one(s);if(!n)throw new Error('Missing '+s);n.click();};
  try{
    check('26 scenes load',all('.scene').length===26,all('.scene').length);
    check('five unique images',all('img').length===5,all('img').length);
    check('initial counter',one('#counter').textContent==='01 / 26',one('#counter').textContent);
    click('#nextBtn');check('next navigation',one('#counter').textContent==='02 / 26',one('#counter').textContent);
    click('#ruleChoices .choice');check('check-in',one('#ruleOutput').textContent.includes('If '));
    click('.bridge-choice[data-answer="imagined"]');check('language bridge',one('#bridgeOutput').textContent.includes('Imagined'));
    click('#worldGrid .hotspot');check('visual hook',one('#worldOutput').textContent.includes('floated'));
    click('#vocabFlips .flip');check('vocabulary flip',one('#vocabFlips .flip').classList.contains('open'));
    click('#verbMatch [data-side="left"][data-pair="a"]');click('#verbMatch [data-side="right"][data-pair="a"]');check('vocabulary match',all('#verbMatch .matched').length===2);
    click('#ifReveal');click('#resultReveal');check('grammar discovery',one('#discoveryOutput').textContent.includes('RESULT'));
    click('#meaningCards [data-type="imagined"]');click('#realityMeter [data-type="imagined"]');check('meaning meter',one('#meaningOutput').classList.contains('good'));
    for(const word of ['If','I','could','redesign','my school,','I','would','add','quiet rooms.']){const candidates=all('#sentenceBuilder .chip').filter(b=>b.dataset.word===word&&!b.classList.contains('used'));candidates[0].click();}click('#builderCheck');check('sentence builder',one('#builderOutput').classList.contains('good'));
    click('#formTabs [data-panel="negativePanel"]');check('form tabs',one('#negativePanel').classList.contains('active'));
    click('.advice-choice[data-good="true"]');check('advice form',one('.advice-choice[data-good="true"]').classList.contains('good'));
    click('#practiceGrid [data-good="true"]');check('controlled practice',one('#practiceGrid [data-good="true"]').classList.contains('good'));
    click('#repairGrid .flip');check('error repair',one('#repairGrid .flip').classList.contains('open'));
    click('#pronounceRow .pronounce');check('pronunciation audio',one('#pronounceOutput').textContent.includes('Listen'));
    click('#listeningPredictions .choice');check('listening prediction',one('#listeningPredictions .choice').classList.contains('selected'));
    check('listening audio control',one('#linaPlay').dataset.idle==="Play Lina's pitch");
    click('#linaTranscriptToggle');check('listening transcript',one('#linaTranscript').classList.contains('open'));
    click('#listeningQuestions [data-good="true"]');check('listening comprehension',one('#listeningQuestions [data-good="true"]').classList.contains('good'));
    click('.article mark');check('reading highlight',one('.article mark').classList.contains('open'));
    click('#readingQuestions [data-good="true"]');check('reading comprehension',one('#readingQuestions [data-good="true"]').classList.contains('good'));
    click('#purposeLabels [data-purpose="advice"]');check('purpose contrast',one('#purposeOutput').textContent.startsWith('Advice'));
    check('dialogue audio control',one('#dialoguePlay').dataset.idle==='Play advice model');
    click('#productionStart');click('#productionStart');check('production timer',one('#productionTimer').textContent==='04:00',one('#productionTimer').textContent);
    click('#newMission');check('production brief',one('#mission').textContent.includes('school day'));
    click('#quizGrid [data-correct="true"]');check('review quiz',one('#quizScore').textContent==='1');
    click('.exit-card[data-exit]');check('exit ticket',one('#exitOutput').textContent.includes('1 reflection'));
    click('#menuBtn');check('scene map',one('#mapOverlay').classList.contains('open'));click('[data-close="mapOverlay"]');
    click('#notesBtn');check('teacher notes',one('#notesOverlay').classList.contains('open'));
    const horizontal=[];all('.scene').forEach((scene,index)=>{all('.scene').forEach(item=>item.classList.remove('active'));scene.classList.add('active');scene.scrollTop=0;if(scene.scrollWidth>scene.clientWidth+2||document.documentElement.scrollWidth>innerWidth+2)horizontal.push({scene:index+1,scroll:scene.scrollWidth,client:scene.clientWidth,doc:document.documentElement.scrollWidth,width:innerWidth});});check('no horizontal overflow',horizontal.length===0,JSON.stringify(horizontal));
    if(innerWidth>=1000){const vertical=[];all('.scene').forEach((scene,index)=>{all('.scene').forEach(item=>item.classList.remove('active'));scene.classList.add('active');const frame=scene.getBoundingClientRect();const bad=all('*',scene).filter(node=>{if(node.classList.contains('teacher')||node.closest('.production'))return false;const b=node.getBoundingClientRect();return b.height>0&&b.bottom>frame.bottom+2;}).slice(0,4);if(bad.length)vertical.push({scene:index+1,tags:bad.map(n=>n.className)});});check('no desktop vertical clipping',vertical.length===0,JSON.stringify(vertical));}
  }catch(error){check('self-test harness',false,error.stack);}
  const marker=document.createElement('div');marker.id='self-test-results';marker.setAttribute('data-results',encodeURIComponent(JSON.stringify(out)));document.body.appendChild(marker);
})();
</script>`;
fs.writeFileSync(fixture,source.replace('</body>',`${injected}\n</body>`));
function run(width,height){const profile=fs.mkdtempSync(path.join(os.tmpdir(),'lesson12-remix-dom-'));const command=spawnSync(browser,['--headless=new','--disable-gpu','--hide-scrollbars','--no-first-run',`--user-data-dir=${profile}`,`--window-size=${width},${height}`,'--force-device-scale-factor=1','--virtual-time-budget=4300','--dump-dom',pathToFileURL(fixture).href],{encoding:'utf8',maxBuffer:12_000_000,windowsHide:true});try{fs.rmSync(profile,{recursive:true,force:true,maxRetries:5,retryDelay:100});}catch{}const match=command.stdout.match(/id="self-test-results" data-results="([^"]+)"/);if(!match)throw new Error('No self-test marker');return JSON.parse(decodeURIComponent(match[1]));}
const results=[];try{const desktop=run(1600,992),compact=run(500,936);for(const item of desktop)results.push([`desktop - ${item[0]}`,item[1],item[2]]);const compactOverflow=compact.find(item=>item[0]==='no horizontal overflow');results.push(['compact - no horizontal overflow',compactOverflow?.[1],compactOverflow?.[2]||'']);}catch(error){results.push(['harness',false,error.stack]);}finally{try{fs.rmSync(fixture,{force:true});}catch{}}
for(const [name,pass,detail] of results)console.log(`${pass?'PASS':'FAIL'} - ${name}${detail?`: ${detail}`:''}`);if(results.some(([,pass])=>!pass))process.exitCode=1;
