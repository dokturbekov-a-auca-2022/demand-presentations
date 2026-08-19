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
    check('28 scenes load',all('.scene').length===28,all('.scene').length);
    check('five unique images',all('img').length===5,all('img').length);
    check('initial counter',one('#counter').textContent==='01 / 28',one('#counter').textContent);
    click('#nextBtn');check('next navigation',one('#counter').textContent==='02 / 28',one('#counter').textContent);
    click('#joyChoices .choice');check('opening bid',one('#joyOutput').textContent.includes('Opening bid'));
    click('#thousandChoices .bid-card');check('conditional bridge',one('#thousandSlot').textContent!=='...');
    click('#openingVote button');check('opening vote',one('#openingVote .selected')!==null);
    click('#visualLots button');check('visual inquiry',one('#visualOutput').textContent.includes('Money'));
    click('#vocabFlips .flip');check('vocabulary flip',one('#vocabFlips .flip').classList.contains('open'));
    check('pronunciation audio model',one('#pronounceRow .pronounce').dataset.audio.endsWith('.wav'));
    click('#sortBoard .sort-item');check('value sort',one('#sortBoard .sort-item').dataset.state==='need');
    click('#languageTabs [data-panel="agreePanel"]');click('#agreePanel .phrase');check('language catalog',one('#agreePanel').classList.contains('active')&&one('#languageOutput').textContent.includes('Complete'));
    click('#evidenceCategories [data-type="fact"]');click('#evidenceStatements [data-type="fact"]');check('evidence classification',one('#evidenceStatements [data-type="fact"]').dataset.matched==='true');
    click('#claimLadder [data-good="true"]');check('claim ladder',one('#claimLadder [data-good="true"]').classList.contains('good'));
    click('#listeningPredictions .choice');click('#listeningPredictions .choice:nth-child(2)');click('#listeningPredictions .choice:nth-child(3)');check('prediction limit',all('#listeningPredictions .selected').length===2);
    click('#storyTranscriptBtn');check('listening transcript',one('#storyTranscript').classList.contains('open'));
    click('#listeningCheck [data-good="true"]');check('listening check',one('#listeningCheck [data-good="true"]').classList.contains('good'));
    click('#evidenceHotspots .evidence-hot');check('evidence desk',one('#deskOutput').textContent.includes('Inspected'));
    click('#forBuilder .bid-card');click('#forBuilder .bid-card:nth-child(2)');click('#forBuilder .bid-card:nth-child(3)');check('FOR selection limit',all('#forBuilder .selected').length===2);
    click('#againstBuilder .bid-card');check('AGAINST preparation',all('#againstBuilder .selected').length===1);
    click('#speedStart');click('#speedStart');check('speed timer',one('#speedTimer').textContent==='00:45',one('#speedTimer').textContent);
    click('#debateStart');click('#debateStart');click('#newMotion');check('main debate',one('#motionBox').textContent.includes('Experiences'));
    click('#roleBoard .role');check('roles',one('#roleOutput').textContent.includes('1 / 4'));
    click('#switchPrompts .choice');check('perspective switch',one('#switchOutput').textContent.includes('challenge'));
    click('#feedbackStamps .stamp-btn');click('#feedbackStamps .stamp-btn:nth-child(2)');click('#feedbackStamps .stamp-btn:nth-child(3)');check('feedback limit',all('#feedbackStamps .selected').length===2);
    click('#finalVote button');check('final vote',one('#finalVote .selected')!==null);
    click('#reflectionChoices .choice');check('reflection',one('#finalVoteOutput').textContent.includes('Complete'));
    click('#quizGrid [data-correct="true"]');check('review quiz',one('#quizScore').textContent==='1');
    click('#exitGrid .exit-ticket');check('exit ticket',one('#exitOutput').textContent.includes('Complete'));
    click('#menuBtn');check('scene map',one('#mapOverlay').classList.contains('open'));click('[data-close="mapOverlay"]');
    click('#notesBtn');check('teacher notes',one('#notesOverlay').classList.contains('open'));
    const horizontal=[];all('.scene').forEach((scene,index)=>{all('.scene').forEach(item=>item.classList.remove('active'));scene.classList.add('active');scene.scrollTop=0;if(scene.scrollWidth>scene.clientWidth+2||document.documentElement.scrollWidth>innerWidth+2)horizontal.push({scene:index+1,scroll:scene.scrollWidth,client:scene.clientWidth,doc:document.documentElement.scrollWidth,width:innerWidth});});check('no horizontal overflow',horizontal.length===0,JSON.stringify(horizontal));
    if(innerWidth>=1000){const vertical=[];all('.scene').forEach((scene,index)=>{all('.scene').forEach(item=>item.classList.remove('active'));scene.classList.add('active');const frame=scene.getBoundingClientRect();const bad=all('*',scene).filter(node=>{if(node.classList.contains('teacher')||node.closest('.arena'))return false;const b=node.getBoundingClientRect();return b.height>0&&b.bottom>frame.bottom+2;}).slice(0,4);if(bad.length)vertical.push({scene:index+1,tags:bad.map(n=>n.className)});});check('no desktop vertical clipping',vertical.length===0,JSON.stringify(vertical));}
  }catch(error){check('self-test harness',false,error.stack);}
  const marker=document.createElement('div');marker.id='self-test-results';marker.setAttribute('data-results',encodeURIComponent(JSON.stringify(out)));document.body.appendChild(marker);
})();
</script>`;
fs.writeFileSync(fixture,source.replace('</body>',`${injected}\n</body>`));
function run(width,height){const profile=fs.mkdtempSync(path.join(os.tmpdir(),'lesson13-auction-dom-'));const command=spawnSync(browser,['--headless=new','--disable-gpu','--hide-scrollbars','--no-first-run',`--user-data-dir=${profile}`,`--window-size=${width},${height}`,'--force-device-scale-factor=1','--virtual-time-budget=4500','--dump-dom',pathToFileURL(fixture).href],{encoding:'utf8',maxBuffer:14_000_000,windowsHide:true});try{fs.rmSync(profile,{recursive:true,force:true,maxRetries:5,retryDelay:100});}catch{}const match=command.stdout.match(/id="self-test-results" data-results="([^"]+)"/);if(!match)throw new Error('No self-test marker');return JSON.parse(decodeURIComponent(match[1]));}
const results=[];try{const desktop=run(1600,992),compact=run(500,936);for(const item of desktop)results.push([`desktop - ${item[0]}`,item[1],item[2]]);const compactOverflow=compact.find(item=>item[0]==='no horizontal overflow');results.push(['compact - no horizontal overflow',compactOverflow?.[1],compactOverflow?.[2]||'']);}catch(error){results.push(['harness',false,error.stack]);}finally{try{fs.rmSync(fixture,{force:true});}catch{}}
for(const [name,pass,detail] of results)console.log(`${pass?'PASS':'FAIL'} - ${name}${detail?`: ${detail}`:''}`);if(results.some(([,pass])=>!pass))process.exitCode=1;
