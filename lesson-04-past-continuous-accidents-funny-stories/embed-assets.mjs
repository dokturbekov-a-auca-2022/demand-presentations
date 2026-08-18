import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.join(here, "index.html");
const assets = {
  title: "oops-title-v2.webp",
  cafeteria: "cafeteria-clue-v2.webp",
  vocabulary: "mishap-actions-v2.webp",
  timeline: "timeline-interruption-v2.webp",
  incident: "incident-six-frames-v2.webp",
  witnesses: "witness-cards-v2.webp",
};

let html = fs.readFileSync(htmlPath, "utf8");
for (const [name, filename] of Object.entries(assets)) {
  const data = fs.readFileSync(path.join(here, "assets", filename)).toString("base64");
  const pattern = new RegExp(`(<img id="asset-${name}" src=")[^"]*(")`);
  if (!pattern.test(html)) throw new Error(`Missing asset slot ${name}`);
  html = html.replace(pattern, `$1data:image/webp;base64,${data}$2`);
}
fs.writeFileSync(htmlPath, html);
console.log(`Embedded ${Object.keys(assets).length} images into index.html`);
