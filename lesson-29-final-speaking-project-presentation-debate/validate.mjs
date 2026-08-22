import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'experience-v2.css'), 'utf8');
const js = fs.readFileSync(path.join(root, 'experience-v2.js'), 'utf8');
const sceneCount = (html.match(/<section class="scene/g) || []).length;
const notes = [...html.matchAll(/data-note="([^"]+)"/g)].map(match => match[1]);
const titles = [...html.matchAll(/data-title="([^"]+)"/g)].map(match => match[1]);
const localSources = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(match => match[1]);
const mediaSources = localSources.filter(source => !source.startsWith('#'));
const images = [...html.matchAll(/<img\b[^>]*>/g)].map(match => match[0]);
const duplicateIds = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]).filter((id, index, all) => all.indexOf(id) !== index);
const htmlIds = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]));
const referencedIds = [...js.matchAll(/byId\('([^']+)'\)/g)].map(match => match[1]);
const missingIds = [...new Set(referencedIds.filter(id => !htmlIds.has(id)))];
const braceBalance = source => [...source].reduce((balance, character) => balance + (character === '{' ? 1 : character === '}' ? -1 : 0), 0);

const checks = [
  ['28 scenes', sceneCount === 28],
  ['one title and teacher note per scene', titles.length === 28 && notes.length === 28 && notes.every(note => note.length >= 45)],
  ['all three artwork files exist', ['forum-circle.png', 'argument-table.png', 'mosaic-wall.png'].every(file => fs.existsSync(path.join(root, 'assets', file)))],
  ['all local sources exist', mediaSources.every(source => !source.includes('://') && fs.existsSync(path.join(root, source)))],
  ['every image has meaningful alt text', images.length === 3 && images.every(tag => /alt="[^"?]{18,}"/.test(tag))],
  ['no duplicate element IDs', duplicateIds.length === 0],
  ['all scripted element IDs exist', missingIds.length === 0],
  ['balanced stylesheet blocks', braceBalance(css) === 0],
  ['balanced major HTML elements', (html.match(/<section\b/g) || []).length === (html.match(/<\/section>/g) || []).length && (html.match(/<button\b/g) || []).length === (html.match(/<\/button>/g) || []).length],
  ['keyboard, map, notes and guarded swipe navigation', ['ArrowRight', 'PageDown', "event.code === 'Space'", 'touchstart', 'viewportScale', 'gestureActive', 'mapBtn', 'noteBtn'].every(token => js.includes(token))],
  ['interactive learning tools', ['topicSpin', 'evidenceCourt', 'claimOutput', 'playModel', 'responseDuel', 'trapLines', 'projectCanvas', 'directorConsole', 'timerStart', 'feedbackMosaic'].every(token => html.includes(token))],
  ['accessible interactive controls', !/<div[^>]+onclick=/.test(html) && !/<span[^>]+onclick=/.test(html) && html.includes('aria-live="polite"')],
  ['project text saves locally', js.includes('localStorage.setItem') && js.includes('localStorage.getItem')],
  ['speech and sound include fallbacks', js.includes("'speechSynthesis' in window") && js.includes('All activities keep visual feedback')],
  ['phone portrait and landscape layouts', css.includes('@media (max-width: 680px)') && css.includes('@media (max-height: 620px) and (orientation: landscape)')],
  ['reduced-motion support', css.includes('@media (prefers-reduced-motion: reduce)')],
  ['no external runtime URLs', !/https?:\/\//.test(html + css + js)],
  ['documentation', fs.existsSync(path.join(root, 'README.md')) && fs.existsSync(path.join(root, 'ARTWORK.md')) && fs.existsSync(path.join(root, 'MEDIA.md'))]
];

checks.forEach(([label, pass]) => console.log(`${pass ? 'PASS' : 'FAIL'} — ${label}`));
const failed = checks.filter(([, pass]) => !pass);
if (failed.length) {
  if (duplicateIds.length) console.error(`Duplicate IDs: ${duplicateIds.join(', ')}`);
  if (missingIds.length) console.error(`Missing scripted IDs: ${missingIds.join(', ')}`);
  process.exit(1);
}
