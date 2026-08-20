import fs from 'node:fs';

const p=fs.readFileSync('index.html','utf8');
const experience=fs.readFileSync('experience-v3.js','utf8');
const css=fs.readFileSync('experience-v3.css','utf8');
const scenes=(p.match(/S\('/g)||[]).length;
const taskNotes=(p.match(/\$\{info\(/g)||[]).length;
const visuals=['hobby-channel-hero-v2.png','hobby-lineup-v2.png','grammar-split-v2.png','hobby-interview-v2.png','live-finale-v2.png','hobby-swap-prediction-v2.png','hobby-swap-story-v2.png'];
const checks=[
  ['27 scenes',scenes===27],
  ['teacher note per scene',scenes===27&&((p.match(/min\./g)||[]).length>=27)],
  ['seven new local illustrations',visuals.every(file=>fs.existsSync(`assets/${file}`)&&p.includes(file))],
  ['three local audio files',['pattern-models.wav','hobby-interview.wav','garden-story.wav'].every(file=>fs.existsSync(`assets/audio/${file}`)&&experience.includes(file))],
  ['gerund verb group',['enjoy','avoid','finish','keep','mind','suggest','practise'].every(word=>p.includes(word))],
  ['infinitive verb group',['want','hope','plan','decide','need','learn','agree'].every(word=>p.includes(word))],
  ['both-form verbs',['like','love','prefer','start','continue'].every(word=>p.includes(word))],
  ['meaning, form and contrast',p.includes('verb + verb-ing')&&p.includes('verb + to + base verb')&&p.includes('would like + to + verb')],
  ['seven-student activity banks',['hobbyStrip','captionChoices','repairRoll','questionRun','profileRail','rundown','reviewWall'].every(marker=>p.includes(marker))],
  ['seven production roles',['Host:','Guest 1:','Guest 2:','Guest 3:','Interviewer:','Coach:','Closer:'].every(role=>experience.includes(role))],
  ['task instruction markers',taskNotes>=20],
  ['varied visual layouts',['discoveryFrame','meaningRail','formulaStage','verbWave','rhythmStage','readingStage','listenStage','contrastLine','finalHero'].every(name=>p.includes(name))],
  ['four transition families',['wipeIn','pushIn','zoomIn','splitIn'].every(name=>p.includes(name))],
  ['staged motion and ambient animation',(p.match(/motion/g)||[]).length>=18&&css.includes('v3-scan')&&p.includes('prefers-reduced-motion')],
  ['clear exclusive answer states',p.includes('choicePair')&&p.includes("classList.remove('correct','incorrect')")],
  ['reading and listening sequence',p.includes('The seven-day hobby swap')&&p.includes('Complete the guest profile')&&p.includes('Sort the phrases you hear')],
  ['navigation, map and notes',p.includes('ArrowRight')&&p.includes('PageDown')&&p.includes('touchstart')&&p.includes('data-jump')&&p.includes('noteBtn')],
  ['stable swipe and pinch zoom',p.includes('pinch-zoom')&&p.includes('Math.abs(dx)>Math.abs(dy)*1.4')&&experience.includes('browserGesture')],
  ['mobile internal scrolling',p.includes('height:100vh')&&p.includes('overflow-y:auto')&&p.includes('overscroll-behavior:contain')&&p.includes('@media(max-width:700px)')],
  ['meaningful alt text',(p.match(/alt=\"/g)||[]).length>=8],
  ['no external runtime',!/<script[^>]+src=[\"\']https?:\/\//.test(p)]
];

const bad=checks.filter(([,pass])=>!pass);
checks.forEach(([label,pass])=>console.log(`${pass?'PASS':'FAIL'} - ${label}`));
if(bad.length)process.exit(1);
