import fs from 'node:fs';
import vm from 'node:vm';

const html = fs.readFileSync('index.html', 'utf8');
const inline = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match => match[1]);
const external = [...html.matchAll(/<script[^>]+src="([^"]+)"[^>]*><\/script>/g)].map(match => match[1]);

for (const source of inline) new vm.Script(source);
for (const path of external) new vm.Script(fs.readFileSync(path, 'utf8'), { filename: path });

console.log(`PASS - JavaScript syntax (${inline.length + external.length} scripts)`);
