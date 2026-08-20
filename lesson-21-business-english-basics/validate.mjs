import fs from 'node:fs';

const p=fs.readFileSync('index.html','utf8');
const experience=fs.readFileSync('experience-v3.js','utf8');
const scenes=(p.match(/S\('/g)||[]).length;
const taskNotes=(p.match(/class="taskNote"/g)||[]).length;
const sevenRoleBlocks=['class="roleOrbit"','id="roleMatch"','id="collocations"','id="politeChoices"','id="callCheck"','class="teamRoles"','class="pitchParts"','id="reviewDeck"'];
const visuals=['studio-hero-v2.png','client-brief-v2.png','communications-desk-v2.png','final-pitch-v2.png'];
const checks=[
  ['27 scenes',scenes===27],
  ['teacher note per scene',scenes===27&&((p.match(/min\./g)||[]).length>=27)],
  ['four new local illustrations',visuals.every(file=>fs.existsSync(`assets/${file}`)&&p.includes(file))],
  ['three local audio files',['polite-email.wav','phone-call.wav','mini-meeting.wav'].every(file=>fs.existsSync(`assets/audio/${file}`)&&experience.includes(file))],
  ['business vocabulary',['client','customer','supplier','budget','deadline','schedule','attachment','feedback'].every(word=>p.includes(word))],
  ['seven collocations',['meet a...','set a...','place an...','send an...','give...','make a...','solve a...'].every(text=>p.includes(text))],
  ['polite request language',p.includes('Could you')&&p.includes('Would Friday work')&&p.includes('base verb')],
  ['seven-student task banks',sevenRoleBlocks.every(marker=>p.includes(marker))&&['Facilitator:','Project manager:','Budget lead:','Designer:','Supplier:','Client representative:','Note-taker:'].every(role=>experience.includes(role))],
  ['task instruction markers',taskNotes>=20],
  ['varied visual layouts',['roleOrbit','wordWall','collocationTrack','emailCanvas','meetingArc','pitchHero','reviewDeck'].every(name=>p.includes(name))],
  ['navigation, map and notes',p.includes('ArrowRight')&&p.includes('PageDown')&&p.includes('touchstart')&&p.includes('data-jump')&&p.includes('noteBtn')],
  ['interactive states',['data-bank','data-good','repair','data-order','reviewCard','data-level'].every(name=>p.includes(name))],
  ['mobile scrolling and zoom',p.includes('height:100vh')&&p.includes('overflow-y:auto')&&p.includes('pinch-zoom')&&p.includes('@media(max-width:700px)')],
  ['reduced-motion support',p.includes('prefers-reduced-motion')],
  ['meaningful alt text',(p.match(/alt="/g)||[]).length>=5],
  ['no external runtime',!/<script[^>]+src=["\']https?:\/\//.test(p)]
];

const bad=checks.filter(([,pass])=>!pass);
checks.forEach(([label,pass])=>console.log(`${pass?'PASS':'FAIL'} - ${label}`));
if(bad.length)process.exit(1);
