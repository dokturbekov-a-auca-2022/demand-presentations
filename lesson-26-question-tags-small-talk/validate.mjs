import fs from 'node:fs';

const html = fs.readFileSync('index.html', 'utf8');
const css = fs.readFileSync('experience-v6.css', 'utf8');
const js = fs.readFileSync('experience-v6.js', 'utf8');
const sceneCount = (html.match(/class="scene/g) || []).length;
const notes = (html.match(/data-note="/g) || []).length;
const imageRefs = [...html.matchAll(/<img[^>]+src="([^"]+)"/g)].map(match => match[1]);
const audioRefs = [...html.matchAll(/<audio[^>]+src="([^"]+)"/g)].map(match => match[1]);
const allFilesExist = refs => refs.every(path => fs.existsSync(path));
const sectionById = id => {
  const start = html.indexOf(`id="${id}"`);
  if (start < 0) return '';
  return html.slice(start, html.indexOf('</section>', start));
};

const checks = [
  ['28 complete scenes', sceneCount === 28],
  ['teacher note for every scene', notes === 28],
  ['eight unique local images', imageRefs.length === 8 && new Set(imageRefs).size === 8 && allFilesExist(imageRefs)],
  ['three local audio tracks', audioRefs.length === 3 && new Set(audioRefs).size === 3 && allFilesExist(audioRefs)],
  ['seven-person check-in', (sectionById('checkIn').match(/<button/g) || []).length === 7],
  ['seven visual small-talk topics', (sectionById('topicStrip').match(/<button/g) || []).length === 7],
  ['seven controlled helper prompts', (sectionById('helperReveal').match(/<button/g) || []).length === 7],
  ['seven intonation contexts', (sectionById('intonationQuiz').match(/data-answer=/g) || []).length === 7],
  ['seven listening questions', (sectionById('listeningQuestions').match(/<button/g) || []).length === 7],
  ['seven review questions', (sectionById('rapidQuiz').match(/data-answer=/g) || []).length === 7],
  ['seven private role prompts', (sectionById('roleGrooves').match(/<button/g) || []).length === 7],
  ['seven final broadcast roles', (html.match(/<span><b>[1-7] /g) || []).length === 7],
  ['meaning, form, and use taught', html.includes('CHECK A FACT') && html.includes('POSITIVE STATEMENT') && html.includes('THE TAG USES')],
  ['be, do, did, have, can, and will families', ['IF THE MAIN VERB IS', 'CALL DO', 'HAVE', 'CAN', 'WILL'].every(text => html.includes(text))],
  ['special patterns included', html.includes("AREN'T I?") && html.includes('SHALL WE?') && html.includes('WILL YOU?')],
  ['falling and rising intonation explained', html.includes('FALLING') && html.includes('RISING') && html.includes('certainty versus uncertainty')],
  ['worked conversation model', html.includes('conversation-ladder') && html.includes('NOTICE') && html.includes('FOLLOW UP') && html.includes('RETURN')],
  ['listening transcript and evidence', html.includes('TRANSCRIPT DETECTIVE') && html.includes('five tags and two follow-up')],
  ['at least twenty task instructions', (html.match(/class="instruction"/g) || []).length + notes >= 20],
  ['six distinct transitions', [0, 1, 2, 3, 4, 5].every(number => html.includes(`transition-${number}`) && css.includes(`.transition-${number}`))],
  ['animated visual atmosphere', ['needleMove', 'liveBlink', 'slowSpin', 'waveBounce', 'micFloat'].every(name => css.includes(`@keyframes ${name}`))],
  ['scored interactivity and timer', js.includes('refreshScore') && js.includes('rapidItems') && js.includes('liveTimer')],
  ['stable swipe and pinch zoom', js.includes('visualViewport') && js.includes('Math.abs(dx) > 88') && js.includes('event.touches.length > 1') && css.includes('pinch-zoom')],
  ['mobile scrolling and landscape mode', css.includes('overflow-y: auto') && css.includes('orientation: landscape') && css.includes('env(safe-area-inset-bottom)')],
  ['meaningful alt text', (html.match(/alt="/g) || []).length === 8 && !html.includes('alt="image"')],
  ['no old cafe artwork or template', !/cafe-chat|table-cards|park-chat|Tag Caf/.test(html)],
  ['no external runtime', !/https?:\/\//.test(html) && !/<script[^>]+src="https?:/.test(html)]
];

const failures = checks.filter(([, pass]) => !pass);
checks.forEach(([label, pass]) => console.log(`${pass ? 'PASS' : 'FAIL'} - ${label}`));
if (failures.length) process.exit(1);
