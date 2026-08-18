import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const chrome = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const source = fs.readFileSync(path.join(here, "index.html"), "utf8");
const fixture = path.join(here, ".interaction-fixture.html");
const results = [];

const injected = String.raw`
<script>
(() => {
  const out=[],$=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
  const check=(name,pass,detail='')=>out.push([name,!!pass,detail]);
  const click=s=>{const n=$(s);if(!n)throw new Error('Missing '+s);n.click()};
  try {
    check('26 scenes load',$$('.scene').length===26,$$('.scene').length);
    check('all illustrations decode',document.images.length===4&&[...document.images].every(i=>i.complete&&i.naturalWidth>0),document.images.length);
    check('initial counter',$('#counter').textContent==='01 / 26',$('#counter').textContent);
    click('#next');check('next navigation',$('#counter').textContent==='02 / 26',$('#counter').textContent);
    click('#moodGrid .mood');check('check-in response',$('#moodResult').textContent.includes('because'));
    click('.hot');check('picture clue',$('.hot').classList.contains('open'));
    click('.vocab');check('vocabulary flip',$('.vocab').classList.contains('open'));
    click('[data-kind="term"][data-match="a"]');click('[data-kind="definition"][data-match="a"]');check('vocabulary matching',$$('.match-btn.matched').length===2,$$('.match-btn.matched').length);
    click('.sort-item');check('category cycle',$('.sort-item').dataset.bucket==='benefit',$('.sort-item').dataset.bucket);
    click('.prediction');check('prediction selection',$('.prediction').classList.contains('selected'));
    click('[data-correct="true"]');check('gist feedback',$('[data-correct="true"]').classList.contains('good'));
    click('#evidenceGrid [data-answer="benefit"] .tagger');check('evidence tagging',$('#evidenceGrid [data-answer="benefit"] .tagger').classList.contains('good'));
    click('.question');check('answer reveal',$('.question').classList.contains('open'));
    for(const n of [1,2,3,4,5])click('[data-order="'+n+'"]');click('#sequenceCheck');check('sequence activity',$('#sequenceFeedback').textContent.startsWith('Sequence restored'),$('#sequenceFeedback').textContent);
    click('#contextGrid [data-answer="make stronger"] .option:nth-child(2)');check('context choice',$('#contextGrid [data-answer="make stronger"] .option:nth-child(2)').classList.contains('good'));
    click('#foiGrid [data-answer="fact"] .tagger');check('fact/opinion/inference',$('#foiGrid [data-answer="fact"] .tagger').classList.contains('good'));
    const old=$('#discussionPrompt').textContent;click('#newPrompt');check('discussion carousel',$('#discussionPrompt').textContent!==old);
    click('[data-profile="2"]');check('profile switch',$('#profileLabel').textContent.includes('Profile C'));
    for(const n of [2,3,5,6])click('#habitGrid .habit:nth-child('+n+')');click('#assessHabits');check('feed design',$('#habitFeedback').textContent.startsWith('Strong design'),$('#habitFeedback').textContent);
    click('#verdictButtons .action');click('#timerStart');click('#timerStart');check('verdict timer controls',$('#timer').textContent==='01:30',$('#timer').textContent);
    click('#quizOptions .option:nth-child(2)');check('review quiz',$('#quizScore').textContent==='1',$('#quizScore').textContent);
    for(const n of [1,2,3])click('#exitTicket button:nth-child('+n+')');check('exit ticket',$('#exitFeedback').textContent.includes('3 / 3'),$('#exitFeedback').textContent);
    const overflow=[];
    $$('.scene').forEach((s,i)=>{
      $$('.scene').forEach(x=>x.classList.remove('active','past'));s.classList.add('active');
      if(s.scrollWidth>s.clientWidth+1||document.documentElement.scrollWidth>window.innerWidth+1)overflow.push({scene:i+1,sceneScroll:s.scrollWidth,sceneClient:s.clientWidth,doc:document.documentElement.scrollWidth,width:window.innerWidth});
    });
    check('no horizontal overflow',overflow.length===0,JSON.stringify(overflow));
  } catch(error) { check('self-test harness',false,error.stack); }
  const marker=document.createElement('div');marker.id='self-test-results';marker.setAttribute('data-results',encodeURIComponent(JSON.stringify(out)));document.body.appendChild(marker);document.title='SELFTEST_DONE';
})();
</script>`;

new Function(injected.match(/<script>([\s\S]*?)<\/script>/)[1]);
fs.writeFileSync(fixture, source.replace("</body>", () => `${injected}\n</body>`));

function run(width, height) {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "lesson-05-dom-"));
  const command = spawnSync(chrome, [
    "--headless=new", "--disable-gpu", "--disable-software-rasterizer", "--hide-scrollbars", "--no-first-run", `--user-data-dir=${profile}`,
    `--window-size=${width},${height}`, "--force-device-scale-factor=1",
    "--virtual-time-budget=3500", "--dump-dom", pathToFileURL(fixture).href,
  ], { encoding: "utf8", maxBuffer: 5_000_000, windowsHide: true });
  try { fs.rmSync(profile, { recursive:true, force:true, maxRetries:5, retryDelay:100 }); } catch {}
  if (command.error) throw command.error;
  const match = command.stdout.match(/id="self-test-results" data-results="([^"]+)"/);
  if (!match) throw new Error(`No self-test marker at ${width}x${height}. Chrome exit ${command.status}. DOM tail: ${command.stdout.slice(-900)}. Errors: ${command.stderr.slice(-500)}`);
  return JSON.parse(decodeURIComponent(match[1]));
}

try {
  const desktop = run(1600, 900);
  const phone = run(390, 844);
  for (const item of desktop) results.push([`desktop — ${item[0]}`, item[1], item[2]]);
  const phoneOverflow = phone.find((item) => item[0] === "no horizontal overflow");
  results.push(["phone — no horizontal overflow", phoneOverflow?.[1], phoneOverflow?.[2] || ""]);

  const captures = [
    [1600,900,1,"render-title.png"],
    [1600,900,11,"render-reading.png"],
    [390,844,20,"render-mobile-discussion.png"],
  ];
  for (const [width,height,scene,name] of captures) {
    const shotProfile=fs.mkdtempSync(path.join(os.tmpdir(),"lesson-05-shot-"));
    const shot = spawnSync(chrome,["--headless=new","--disable-gpu","--disable-software-rasterizer","--hide-scrollbars","--no-first-run","--force-prefers-reduced-motion","--run-all-compositor-stages-before-draw",`--user-data-dir=${shotProfile}`,`--window-size=${width},${height}`,"--force-device-scale-factor=1","--virtual-time-budget=1200",`--screenshot=${path.join(here,name)}`,`${pathToFileURL(path.join(here,"index.html")).href}#${scene}`],{encoding:"utf8",windowsHide:true});
    try { fs.rmSync(shotProfile,{recursive:true,force:true,maxRetries:5,retryDelay:100}); } catch {}
    results.push([`capture ${name}`,shot.status===0&&fs.existsSync(path.join(here,name)),shot.stderr.slice(-200)]);
  }
} catch (error) {
  results.push(["harness", false, error.stack]);
} finally {
  try { fs.rmSync(fixture, { force: true }); } catch {}
}

for (const [name, pass, detail] of results) console.log(`${pass ? "PASS" : "FAIL"} — ${name}${detail ? `: ${detail}` : ""}`);
if (results.some(([, pass]) => !pass)) process.exitCode = 1;
