import fs from "node:fs";

const html = fs.readFileSync(new URL("./index.html", import.meta.url), "utf8");
const script = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
if (!script) throw new Error("Inline script missing");
new Function(script);

const sceneCount = (html.match(/<section class="scene/g) || []).length;
const imageRefs = [...html.matchAll(/src="([^"]+)/g)].map(match => match[1]);
const ids = [...html.matchAll(/id="([^"]+)"/g)].map(match => match[1]);
const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);

if (sceneCount !== 25) throw new Error(`Expected 25 scenes, found ${sceneCount}`);
if (duplicateIds.length) throw new Error(`Duplicate IDs: ${[...new Set(duplicateIds)].join(", ")}`);
for (const ref of imageRefs) {
  if (!fs.existsSync(new URL(ref, new URL("./index.html", import.meta.url)))) {
    throw new Error(`Missing image: ${ref}`);
  }
}

console.log("JavaScript syntax: OK");
console.log(`Scenes: ${sceneCount}`);
console.log(`Unique HTML IDs: ${ids.length}`);
console.log(`Image assets: ${imageRefs.join(", ")}`);
