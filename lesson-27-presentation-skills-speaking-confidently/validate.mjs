import fs from 'node:fs';

const html = fs.readFileSync('index.html', 'utf8');
const css = fs.readFileSync('experience-v7.css', 'utf8');
const js = fs.readFileSync('experience-v7.js', 'utf8');
const sceneCount = (html.match(/<section class="scene/g) || []).length;
const noteCount = (html.match(/data-note="/g) || []).length;
const imageSources = [...html.matchAll(/<img[^>]+src="([^"]+)"/g)].map(match => match[1]);
const audioSources = [...html.matchAll(/<audio[^>]+src="([^"]+)"/g)].map(match => match[1]);
const sectionById = id => html.match(new RegExp(`id="${id}"[\\s\\S]*?<\\/div>`))?.[0] || '';
const countButtons = id => (sectionById(id).match(/<button/g) || []).length;

const checks = [
  ['28 scenes', sceneCount === 28],
  ['teacher notes for every scene', noteCount === 28],
  ['eight unique local images', imageSources.length === 8 && new Set(imageSources).size === 8 && imageSources.every(source => fs.existsSync(source))],
  ['three local audio tracks', audioSources.length === 3 && audioSources.every(source => fs.existsSync(source))],
  ['meaningful alt text', (html.match(/alt="/g) || []).length === 8 && !html.includes('alt=""')],
  ['seven speaker strengths', countButtons('strengths') === 7],
  ['seven visual observations', countButtons('observations') === 7],
  ['seven filler repairs', countButtons('fillerLines') === 7],
  ['seven hook types', countButtons('hookLines') === 7],
  ['seven signposts', countButtons('signposts') === 7],
  ['seven question situations', countButtons('questionLines') === 7],
  ['seven listening lenses', countButtons('listeningLenses') === 7],
  ['seven script functions', countButtons('scriptMap') === 7],
  ['seven peer strengths', countButtons('peerTrack') === 7],
  ['exactly seven rehearsal roles', (html.match(/<span><b>[1-7] /g) || []).length === 7],
  ['complete speaking content', ['posture','breath','pace','emphasis','camera','gesture','fillers','opening','signposts','example','closing','visual','questions'].every(term => html.toLowerCase().includes(term))],
  ['five transition families', ['curtainReveal','irisOpen','focusPull','stagePan','lightRise'].every(name => css.includes(name))],
  ['mobile portrait and landscape layouts', css.includes('@media (max-width: 820px)') && css.includes('orientation: landscape')],
  ['scroll and pinch zoom retained', css.includes('overflow-y: auto') && css.includes('pinch-zoom') && html.includes('maximum-scale=5')],
  ['stable guarded swipe', js.includes('visualViewport') && js.includes('touches.length !== 1') && js.includes('Math.abs(dx) < Math.abs(dy) * 1.6')],
  ['map and teacher notes', html.includes('id="map"') && html.includes('id="note"') && js.includes('data-jump')],
  ['no external runtime', !/https?:\/\//.test(html) && !/https?:\/\//.test(css) && !/https?:\/\//.test(js)],
  ['old stagecraft assets removed from markup', !html.includes('stage-speaker') && !html.includes('backstage-table') && !html.includes('spotlight-arcs')]
];

let failed = 0;
for (const [label, passed] of checks) {
  console.log(`${passed ? 'PASS' : 'FAIL'} - ${label}`);
  if (!passed) failed += 1;
}
if (failed) process.exit(1);
