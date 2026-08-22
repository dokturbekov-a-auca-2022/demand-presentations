import fs from 'node:fs';
import vm from 'node:vm';

const js = fs.readFileSync(new URL('./observatory.js', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('./observatory.css', import.meta.url), 'utf8');
const html = fs.readFileSync(new URL('./index.html', import.meta.url), 'utf8');

new vm.Script(js, { filename: 'observatory.js' });

function balanced(source, open, close) {
  let depth = 0;
  for (const char of source) {
    if (char === open) depth += 1;
    if (char === close) depth -= 1;
    if (depth < 0) return false;
  }
  return depth === 0;
}

if (!balanced(css, '{', '}')) throw new Error('CSS braces are not balanced.');
if (!balanced(html, '<', '>')) throw new Error('HTML angle brackets are not balanced.');
if (!html.includes('<!doctype html>') || !html.includes('</html>')) throw new Error('HTML document shell is incomplete.');

console.log('Syntax check passed: JavaScript parses; CSS and HTML delimiters are balanced.');
