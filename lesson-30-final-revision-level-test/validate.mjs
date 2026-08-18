import fs from 'node:fs';
const html=fs.readFileSync('index.html','utf8');
const checks=[
  ['28 scenes', html.includes('const topics=[') && html.includes('topics.forEach')],
  ['teacher notes', html.includes('scenes[cur].n') && html.includes('n:`${i+2} min.')],
  ['local artwork', ['assets/observatory.png','assets/constellation.png','assets/test-kit.png'].every(x=>fs.existsSync(x))],
  ['keyboard navigation', html.includes('ArrowRight')&&html.includes('PageDown')],
  ['touch navigation', html.includes('touchstart')&&html.includes('touchend')],
  ['star map + notes', html.includes('data-jump')&&html.includes('noteBtn')],
  ['review/test content', /Grammar test|Vocabulary test|Reading test|Listening test|Speaking test/.test(html)],
  ['interactive choices', html.includes('querySelectorAll(\'.choice\')')],
  ['responsive + reduced motion', html.includes('@media(max-width:700px)')&&html.includes('prefers-reduced-motion')],
  ['alt text', (html.match(/alt="/g)||[]).length>=3],
  ['no external runtime URLs', !/https?:\/\//.test(html)
]];
for(const [name,ok] of checks) if(!ok) throw new Error(`FAIL — ${name}`);
console.log('PASS — Lesson 30 validation');
