import fs from 'node:fs';

const html=fs.readFileSync('index.html','utf8');
const css=fs.readFileSync('experience-v4.css','utf8');
const js=fs.readFileSync('experience-v4.js','utf8');
const scenes=(html.match(/\bS\('/g)||[]).length;
const images=[...html.matchAll(/\$\{A\}([^"']+\.png)/g)].map(match=>match[1]);
const uniqueImages=new Set(images);
const imageFiles=['action-studio-hero-v2.png','morning-triptych-v2.png','kitchen-chaos-v2.png','city-motion-v2.png','lost-keys-v2.png','seven-actions-v2.png','alarm-cutout-v2.png','sneaker-cutout-v2.png','keys-cutout-v2.png'];
const banks={
  checkin:['wake up','get up','turn off an alarm','put on clothes','pick up a phone','look for something','head out'],
  vocabulary:['stop sleeping','dress yourself in','lift or collect','try to find','have none left','leave a place','continue'],
  meanings:['pick up','pick out','turn on','turn off','find out','head out','eat out'],
  pronouns:['Turn it off.','Turn off it.','Pick them up.','Pick up them.','Put it on.','Put on it.','Take them off.'],
  controlled:['I ___ at 6:45.','Please ___ the light.','She ___ her red jacket.','Can you ___ my notebook?','We ___ milk this morning.','They ___ at the bus stop.','Do not stop. ___.'],
  routes:['home → school','home → sports centre','school → café','home → library','park → cinema','shop → friend’s house','station → home'],
  questions:['Why did Maya wake up late?','What did she put on?','What food had run out?','Who helped her look for the keys?','Where were the keys?','What transport did she get on?','Who did she meet up with?'],
  charades:['Student 1','Student 2','Student 3','Student 4','Student 5','Student 6','Student 7'],
  beats:['wake-up problem','clothing problem','missing object','food problem','transport problem','meeting problem','solution and ending']
};
const checks=[
  ['28 scenes',scenes===28],
  ['teacher note for every scene',(html.match(/S\('/g)||[]).length===(html.match(/',`/g)||[]).length],
  ['nine unique generated images',images.length===9&&uniqueImages.size===9&&imageFiles.every(file=>fs.existsSync(`assets/${file}`))],
  ['two local audio tracks',fs.existsSync('assets/audio/maya-morning.wav')&&fs.existsSync('assets/audio/action-shadow.wav')],
  ['nine complete seven-student banks',Object.values(banks).every(items=>items.length===7&&items.every(item=>html.includes(item)))],
  ['phrasal verb meaning and use',['wake up','put on','pick up','look for','run out of','head out','carry on'].every(term=>html.includes(term))],
  ['separable object rule',html.includes('take off the shoes = take the shoes off')&&html.includes('verb + pronoun + particle')],
  ['reading and listening',html.includes('A MORNING THAT FELL APART')&&js.includes('maya-morning.wav')&&js.includes('audioRail(15')],
  ['production and homework',html.includes('THE<br>WORST')&&html.includes('START ONE TAKE')&&html.includes('DRAW 6 ACTIONS')],
  ['at least twenty task markers',(html.match(/\$\{info\(/g)||[]).length>=20],
  ['five distinct scene transitions',['tearIn','slamIn','zoomCut','shutterSlice','spinPage'].every(name=>css.includes(`@keyframes ${name}`))],
  ['animated objects and atmosphere',(css.match(/@keyframes /g)||[]).length>=15&&css.includes('.float-object')&&css.includes('.falling-words')],
  ['non-box editorial compositions',['card','panel','room','memo','pill','token','grid2'].every(name=>!new RegExp(`class=["'][^"']*\\b${name}\\b`).test(html))],
  ['clear correctness feedback',js.includes("classList.add('correct')")&&js.includes("classList.add('wrong')")&&js.includes('not logical')],
  ['stable swipe and pinch zoom',html.includes('maximum-scale=5')&&html.includes('user-scalable=yes')&&js.includes('Math.abs(dx)>78')&&js.includes('visualViewport')],
  ['mobile scroll and landscape adaptation',css.includes('overflow-y:auto')&&css.includes('overscroll-behavior:contain')&&css.includes('orientation:landscape')],
  ['meaningful alt text',(html.match(/alt="/g)||[]).length===9],
  ['no external runtime',!html.includes('https://')&&!css.includes('@import')]
];

let failures=0;
for(const [label,pass] of checks){console.log(`${pass?'PASS':'FAIL'} - ${label}`);if(!pass)failures+=1;}
if(failures)process.exit(1);
