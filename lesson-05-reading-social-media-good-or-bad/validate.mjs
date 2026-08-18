import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const html = fs.readFileSync(path.join(here, "index.html"), "utf8");
const scenes = [...html.matchAll(/<section class="scene[^>]*data-title="([^"]+)"/g)];
const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
const assetRefs = [...html.matchAll(/(?:src|href)="(assets\/[^"]+)"/g)].map((match) => match[1]);
const missingAssets = [...new Set(assetRefs)].filter((asset) => !fs.existsSync(path.join(here, asset)));

const checks = [
  ["26 scenes", scenes.length === 26, scenes.length],
  ["unique IDs", duplicateIds.length === 0, duplicateIds.join(", ") || ids.length],
  ["three visual assets referenced", new Set(assetRefs).size === 3, [...new Set(assetRefs)].join(", ")],
  ["all assets exist", missingAssets.length === 0, missingAssets.join(", ") || "yes"],
  ["teacher notes on every scene", (html.match(/<aside class="teacher">/g) || []).length === 26, (html.match(/<aside class="teacher">/g) || []).length],
  ["no external runtime URLs", !/(?:src|href)="https?:\/\//.test(html), "checked"],
];

for (const [name, pass, detail] of checks) console.log(`${pass ? "PASS" : "FAIL"} — ${name}: ${detail}`);
if (checks.some(([, pass]) => !pass)) process.exitCode = 1;
