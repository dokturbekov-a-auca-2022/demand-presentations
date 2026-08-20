import fs from 'node:fs';

const p=fs.readFileSync('index.html','utf8');
const experience=fs.readFileSync('experience-v3.js','utf8');
const css=fs.readFileSync('experience-v3.css','utf8');
const scenes=(p.match(/S\('/g)||[]).length;
const tasks=(p.match(/\$\{info\(/g)||[]).length;
const visuals=['festival-entrance-v2.png','genre-gallery-v2.png','critic-desk-v2.png','last-stop-orion-v2.png','adaptation-compare-v2.png','festival-shortlist-v2.png','jury-discussion-v2.png','festival-awards-v2.png'];
const checks=[
  ['28 scenes',scenes===28],
  ['teacher note per scene',scenes===28&&((p.match(/min\./g)||[]).length>=28)],
  ['eight unique local illustrations',visuals.every(file=>fs.existsSync(`assets/${file}`)&&(p.match(new RegExp(file.replaceAll('.','\\.'),'g'))||[]).length===1)],
  ['three local audio files',['polite-disagreement.wav','micro-review.wav','critic-speed.wav'].every(file=>fs.existsSync(`assets/audio/${file}`)&&experience.includes(file))],
  ['review vocabulary',['plot','character','setting','pace','performance','ending','theme'].every(word=>p.includes(word))],
  ['precise reactions',['moving','hilarious','tense','original','confusing','predictable','disappointing'].every(word=>p.includes(word))],
  ['review structure',['Title','Plot','Reaction','Evidence','Audience'].every(word=>p.includes(word))],
  ['spoiler-free instruction',p.includes('character, goal, and problem')&&p.includes('Do not reveal the ending')],
  ['polite disagreement',p.includes('I see your point, but')&&p.includes('Maybe, although I felt')],
  ['comparison language',p.includes('Both versions show')&&p.includes('while in the film')&&p.includes('I prefer ___ because')],
  ['nine seven-student banks',['passLine','storyParts','reactionSpectrum','classifyGrid','opinionRun','questionRun','comparePrompts','juryRoles','reviewWall'].every(marker=>p.includes(marker))],
  ['seven jury roles',['Chair:','Plot analyst:','Character analyst:','Visual analyst:','Audience analyst:','Counter-critic:','Recorder:'].every(role=>experience.includes(role))],
  ['task instruction markers',tasks>=22],
  ['varied compositions',['deskFrame','evidenceFormula','reviewSequence','spoilerStage','audioModel','storyHero','shortlistFrame','juryStage','awardHero'].every(name=>p.includes(name))],
  ['four cinematic transitions',['irisIn','shutterIn','focusIn','lightIn'].every(name=>p.includes(name))],
  ['motion atmosphere',(p.match(/motion/g)||[]).length>=14&&css.includes('v3-sweep')&&css.includes('v3-film')&&p.includes('prefers-reduced-motion')],
  ['clear interaction states',p.includes('data-good')&&p.includes('data-order')&&p.includes('reviewScore')&&p.includes('shortlistOut')],
  ['stable navigation',p.includes('ArrowRight')&&p.includes('PageDown')&&p.includes('Math.abs(dx)>Math.abs(dy)*1.4')&&experience.includes('browserGesture')],
  ['mobile scrolling and zoom',p.includes('overflow-y:auto')&&p.includes('pinch-zoom')&&p.includes('overscroll-behavior:contain')&&p.includes('@media(max-width:700px)')],
  ['meaningful alt text',(p.match(/alt=\"/g)||[]).length>=8],
  ['no external runtime',!/<script[^>]+src=[\"\']https?:\/\//.test(p)]
];
const bad=checks.filter(([,pass])=>!pass);checks.forEach(([label,pass])=>console.log(`${pass?'PASS':'FAIL'} - ${label}`));if(bad.length)process.exit(1);
