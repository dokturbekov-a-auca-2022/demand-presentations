import fs from 'node:fs';

const html = fs.readFileSync('index.html','utf8');
const css = fs.readFileSync('experience-v8.css','utf8');
const js = fs.readFileSync('experience-v8.js','utf8');
const scenes = (html.match(/<section class="scene/g) || []).length;
const notes = (html.match(/data-note="/g) || []).length;
const images = [...html.matchAll(/<img[^>]+src="([^"]+)"/g)].map(match => match[1]);
const audio = [...html.matchAll(/<audio[^>]+src="([^"]+)"/g)].map(match => match[1]);
const sectionById = id => html.match(new RegExp(`id="${id}"[\\s\\S]*?<\\/div>`))?.[0] || '';
const buttonCount = id => (sectionById(id).match(/<button/g) || []).length;
const between = (start,end) => {
  const startIndex = html.indexOf(start);
  const endIndex = html.indexOf(end,startIndex);
  return startIndex >= 0 && endIndex > startIndex ? html.slice(startIndex,endIndex) : '';
};

const checks = [
  ['28 scenes', scenes === 28],
  ['teacher notes for every scene', notes === 28],
  ['eight unique local images', images.length === 8 && new Set(images).size === 8 && images.every(file => fs.existsSync(file))],
  ['three local audio tracks', audio.length === 3 && audio.every(file => fs.existsSync(file))],
  ['meaningful image alt text', (html.match(/alt="/g) || []).length === 8 && !html.includes('alt=""')],
  ['seven warm-up prompts', buttonCount('hotTakes') === 7],
  ['seven repair lines', buttonCount('repairLines') === 7],
  ['seven speed questions', (between('id="speedQuiz"','id="speedOut"').match(/data-answer=/g) || []).length === 7],
  ['seven phone prompts', buttonCount('phonePrompts') === 7],
  ['seven listening jobs', buttonCount('listenJobs') === 7],
  ['seven improved comments', buttonCount('commentLines') === 7],
  ['seven reading jobs', buttonCount('readingJobs') === 7],
  ['seven relay turns', (between('class="relay-track"','id="newRelay"').match(/<span><b>[1-7]<\/b>/g) || []).length === 7],
  ['seven snack-court roles', (between('class="court-roles"','Each speaker gets 30 seconds').match(/<span><b>[1-7] /g) || []).length === 7],
  ['seven final-show roles', (between('class="final-roles"','id="topicWheel"').match(/<span><b>[1-7] /g) || []).length === 7],
  ['seven peer lights', buttonCount('peerLights') === 7],
  ['complete connector content', ['because','since','but','however','although','so','therefore','as a result','for example','such as','in addition','also'].every(term => html.toLowerCase().includes(term))],
  ['five transition families', ['channelPop','zigWipe','colorBurst','stickerPeel','channelSlide'].every(name => css.includes(name))],
  ['playful decorative motion', ['floatWord','tickerEnter','wheelShake','timerBounce','speechBounce'].every(name => css.includes(name))],
  ['mobile portrait and landscape layouts', css.includes('@media (max-width: 820px)') && css.includes('orientation: landscape')],
  ['scroll and pinch zoom retained', css.includes('overflow-y: auto') && css.includes('pinch-zoom') && html.includes('maximum-scale=5')],
  ['stable guarded swipe', js.includes('visualViewport') && js.includes('touches.length !== 1') && js.includes('Math.abs(dx) < Math.abs(dy) * 1.6')],
  ['map and teacher notes', html.includes('id="map"') && html.includes('id="note"') && js.includes('data-jump')],
  ['no external runtime', !/https?:\/\//.test(html) && !/https?:\/\//.test(css) && !/https?:\/\//.test(js)],
  ['old loom assets removed from markup', !html.includes('loom-team') && !html.includes('patchwork-table') && !html.includes('opinion-tapestry')]
];

let failed = 0;
for (const [label,passed] of checks) {
  console.log(`${passed ? 'PASS' : 'FAIL'} - ${label}`);
  if (!passed) failed += 1;
}
if (failed) process.exit(1);
