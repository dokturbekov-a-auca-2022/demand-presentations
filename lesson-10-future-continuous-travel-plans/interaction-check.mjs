import fs from 'node:fs';
import path from 'node:path';

const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]):/, '$1:'));
const source = fs.readFileSync(path.join(here, 'index.html'), 'utf8');
const checks = [
  ['check-in choice', '#moodGrid'],
  ['vocabulary flips', '#vocabFlips'],
  ['luggage sorter', '#sortGrid'],
  ['future camera', 'cameraData'],
  ['sentence builder', '#builder'],
  ['form tabs', '#formTabs'],
  ['time stamps', '#timeGrid'],
  ['pronunciation taps', '#pronounce'],
  ['controlled practice', '#practiceGrid'],
  ['reading highlights', '.article mark'],
  ['reading detail questions', '#readingQuestions'],
  ['speaking roles', '#questionStamps'],
  ['information gap reveal', 'data-reveal'],
  ['production timer', 'productionStart'],
  ['review quiz', 'paintQuiz'],
  ['exit ticket', '#exitStrip']
];
let failed = false;
for (const [name, token] of checks) {
  const pass = source.includes(token);
  failed ||= !pass;
  console.log((pass ? 'PASS' : 'FAIL') + ' — ' + name + ': ' + token);
}
if (failed) process.exitCode = 1;
