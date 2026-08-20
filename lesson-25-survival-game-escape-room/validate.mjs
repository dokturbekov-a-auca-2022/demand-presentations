import fs from 'node:fs';

const html=fs.readFileSync('index.html','utf8');
const css=fs.readFileSync('experience-v5.css','utf8');
const js=fs.readFileSync('experience-v5.js','utf8');
const scenes=(html.match(/\bS\('/g)||[]).length;
const images=[...html.matchAll(/\$\{A\}([^"']+\.png)/g)].map(match=>match[1]);
const imageFiles=['orbit-crew-v2.png','damaged-corridor-v2.png','survival-supplies-v2.png','station-routes-v2.png','greenhouse-leak-v2.png','escape-pod-v2.png','key-search-bay-v2.png','oxygen-canister-v2.png','signal-beacon-v2.png','access-key-v2.png'];
const sevenBanks={
  strengths:['calm thinking','careful listening','clear speaking','quick ideas','good memory','fair decisions','encouragement'],
  roles:['Commander','Evidence officer','Route analyst','Supply officer','Safety officer','Timekeeper','Reporter'],
  evidence:['The oxygen meter reads 72%.','The greenhouse pipe is leaking.','The service ring is probably safe.','The exterior route is the shortest.','The alarm will stop soon.','The keycard is beside the airlock.','The crew can repair everything.'],
  equipment:['oxygen canister','water pouch','first-aid kit','magnetic rope','flashlight','repair tool','signal beacon'],
  priorities:['close the leaking valve','check everyone can breathe','take a team photo','collect the keycard','charge every tablet','choose a safe route','argue about who caused it'],
  analysts:['Distance analyst','Damage analyst','Oxygen analyst','Equipment analyst','Time analyst','Team analyst','Risk analyst'],
  questions:['Where was smoke reported?','What did the temperature sensor show?','What was leaking?','Which route was shortest?','Which route did the captain recommend first?','What should the crew close?','When should the crew return?'],
  replies:['I see your point, but...','That could work. However...','What evidence supports that?','Could we compare another option?','I agree about ___, but...','If we do that, we will...','My concern is...'],
  code:['First letter of oxygen','Number of selected supplies','First letter of the safest route','Opposite of guess','Modal for advice','Result clause after if','Number of crew members']
};
const checks=[
  ['28 scenes',scenes===28],
  ['teacher note for every scene',(html.match(/S\('/g)||[]).length===(html.match(/',`/g)||[]).length],
  ['ten unique local images',images.length===10&&new Set(images).size===10&&imageFiles.every(file=>fs.existsSync(`assets/${file}`))],
  ['two local audio tracks',fs.existsSync('assets/audio/station-alert.wav')&&fs.existsSync('assets/audio/captain-log.wav')],
  ['nine complete seven-student banks',Object.values(sevenBanks).every(bank=>bank.length===7&&bank.every(item=>html.includes(item)))],
  ['exact seven crew roles',html.includes('Seven people.<br>One decision.')&&html.includes('All seven students speak.')],
  ['decision language',html.includes('WE <i>SHOULD</i>')&&html.includes('WE <i>COULD</i>')&&html.includes('IF WE ..., <i>WE WILL</i>')],
  ['evidence and route comparison',html.includes('FACT<br><i>or</i><br>GUESS?')&&html.includes('safer, shorter, more useful, or less risky')],
  ['persistent mission scoring',js.includes('decisionScores')&&js.includes('totalScore')&&js.includes('CLEAN ESCAPE')&&js.includes('MISSION PAUSED')],
  ['interactive limits and correctness',js.includes('selected.length<3')&&js.includes('Sequence interrupted')&&js.includes("classList.add('fact')")===false&&js.includes("button.classList.add(button.dataset.state)")],
  ['reading and listening evidence',js.includes('station-alert.wav')&&js.includes('captain-log.wav')&&html.includes('CAPTAIN LOG 14:30')],
  ['visual search and code lock',html.includes('hiddenKey')&&html.includes('codeClues')&&js.includes('ACCESS CONFIRMED')],
  ['at least twenty task instructions',(html.match(/\$\{info\(/g)||[]).length>=20],
  ['five distinct cinematic transitions',['airlockIn','glitchIn','hyperspaceIn','diagnosticIn','radarIn'].every(name=>css.includes(`@keyframes ${name}`))],
  ['animated mission atmosphere',(css.match(/@keyframes /g)||[]).length>=12&&css.includes('.scanlines')&&css.includes('.radar')&&css.includes('.mission-hud')],
  ['no legacy worksheet components',['blueprint','zone','clue','grid2','token','lock'].every(name=>!new RegExp(`class=["'][^"']*\\b${name}\\b`).test(html))],
  ['stable swipe and pinch zoom',html.includes('maximum-scale=5')&&html.includes('user-scalable=yes')&&js.includes('Math.abs(dx)>82')&&js.includes('visualViewport')],
  ['mobile scrolling and landscape mode',css.includes('overflow-y:auto')&&css.includes('overscroll-behavior:contain')&&css.includes('orientation:landscape')],
  ['meaningful alt text',(html.match(/alt="/g)||[]).length===10],
  ['no external runtime',!html.includes('https://')&&!css.includes('@import')]
];

let failures=0;
for(const [label,pass] of checks){console.log(`${pass?'PASS':'FAIL'} - ${label}`);if(!pass)failures+=1;}
if(failures)process.exit(1);
