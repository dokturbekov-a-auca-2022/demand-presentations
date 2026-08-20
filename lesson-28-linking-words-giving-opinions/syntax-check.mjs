import fs from 'node:fs';
import vm from 'node:vm';

const script = fs.readFileSync('experience-v8.js','utf8');
new vm.Script(script,{ filename: 'experience-v8.js' });
console.log('PASS - JavaScript syntax (external experience-v8.js)');
