import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(dir, 'observatory.css'), 'utf8');
const js = fs.readFileSync(path.join(dir, 'observatory.js'), 'utf8');
const readme = fs.readFileSync(path.join(dir, 'README.md'), 'utf8');
const artwork = fs.readFileSync(path.join(dir, 'ARTWORK.md'), 'utf8');
const failures = [];
const passes = [];

function check(condition, label) {
  (condition ? passes : failures).push(label);
}

const scenes = [...html.matchAll(/<section class="scene\b/g)];
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
const jsIdSelectors = [...js.matchAll(/querySelector\(['"]#([^'"]+)['"]\)/g)].map((match) => match[1]);
const images = [...html.matchAll(/<img\b[^>]*src="([^"]+)"[^>]*alt="([^"]*)"[^>]*>/g)].map((match) => ({ src: match[1], alt: match[2] }));
const localSources = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map((match) => match[1]).filter((src) => !src.startsWith('#'));
const transitions = new Set([...html.matchAll(/data-transition="([^"]+)"/g)].map((match) => match[1]));

check(scenes.length === 32, `32 scenes (${scenes.length} found)`);
check((html.match(/data-title="/g) || []).length === 32, 'Every scene has a navigation title');
check((html.match(/data-zone="/g) || []).length === 32, 'Every scene belongs to a learning zone');
check(transitions.size >= 20, `Varied scene transitions (${transitions.size} unique)`);
check(duplicateIds.length === 0, `No duplicate IDs${duplicateIds.length ? `: ${duplicateIds.join(', ')}` : ''}`);
check(jsIdSelectors.every((id) => ids.includes(id)), 'All JavaScript ID selectors exist in HTML');
check(images.length === 9, `Nine illustration scenes (${images.length} found)`);
check(new Set(images.map((image) => image.src)).size === images.length, 'Every illustration is used once');
check(images.every((image) => image.alt.trim().length >= 28), 'Every illustration has meaningful alt text');
check(images.every((image) => fs.existsSync(path.join(dir, image.src))), 'All illustration assets exist');
check((html.match(/loading="lazy"/g) || []).length === 8 && html.includes('fetchpriority="high"'), 'Hero is prioritised and later illustrations are lazy-loaded');
check(localSources.every((source) => /^(https?:|data:)/.test(source) || fs.existsSync(path.join(dir, source))), 'All local runtime sources exist');
check(!/(?:src|href)="https?:/i.test(html), 'No external runtime URLs');
check(!html.includes('user-scalable=no'), 'Phone zoom is not disabled');
check(css.includes('@media (max-width: 720px)'), 'Phone portrait layout rules');
check(css.includes('orientation: landscape') && css.includes('max-height: 610px'), 'Phone landscape layout rules');
check(css.includes('prefers-reduced-motion'), 'Reduced-motion support');
check(css.includes('prefers-contrast: more'), 'High-contrast support');
check(js.includes("touchstart") && js.includes("touches.length !== 1"), 'Pinch-safe swipe navigation');
check(js.includes("ArrowRight") && js.includes("PageDown") && js.includes("ArrowLeft"), 'Keyboard navigation');
check(js.includes('showModal') && html.includes('id="starMap"'), 'Scene map navigation');
check(js.includes('speechSynthesis') && html.includes('id="transcriptToggle"'), 'System-voice listening with transcript fallback');
check(js.includes('localStorage') && html.includes('id="orbitPlanner"'), 'Saved learner plan and results');
check(js.includes('const testQuestions = [') && (js.match(/category:/g) || []).length >= 15, 'Fifteen-question mixed level test');
check(html.includes('classroom estimate, not an official level certificate') || js.includes('classroom estimate, not an official level certificate'), 'Level result is framed as a classroom estimate');
check(html.includes('data-quiz="present-lens"') && html.includes('data-quiz="past-lens"'), 'Present and past contrast labs');
check(html.includes('Conditional gate') && html.includes('Spotlight controls') && html.includes('Message relay'), 'Core grammar transformation labs');
check(html.includes('Cluster sorter') && html.includes('Collocation magnets') && html.includes('Phrasal verb airlock'), 'Vocabulary retrieval games');
check(html.includes('Reading case file') && html.includes('Incoming transmission') && html.includes('One-minute orbit'), 'Reading, listening and speaking production');
check(readme.includes('32 scenes') && readme.includes('15-question'), 'README documents scope and test');
check((artwork.match(/`assets\//g) || []).length === 9, 'Artwork record documents all nine illustrations');

for (const label of passes) console.log(`✓ ${label}`);
if (failures.length) {
  for (const label of failures) console.error(`✗ ${label}`);
  process.exit(1);
}

console.log(`\nLesson 30 validation passed: ${passes.length} checks.`);
