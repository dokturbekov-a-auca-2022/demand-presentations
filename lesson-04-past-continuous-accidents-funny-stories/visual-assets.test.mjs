import fs from "node:fs";

const html = fs.readFileSync(new URL("./index.html", import.meta.url), "utf8");
const sources = [
  ...html.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["']/gi),
  ...html.matchAll(/url\(["']?([^"')]+)["']?\)/gi),
].map((match) => match[1]).filter((source) => !source.startsWith("#"));
const unique = [...new Set(sources)];
const embedded = unique.filter((source) => source.startsWith("data:image/"));
const external = unique.filter((source) => !source.startsWith("data:image/"));

console.log(`Unique visual sources: ${unique.length}`);
console.log(`External runtime image references: ${external.length}`);

if (unique.length < 6) {
  throw new Error(`Expected at least 6 distinct visual sources, found ${unique.length}`);
}
if (embedded.some((source) => source.length < 100_000)) {
  throw new Error("At least one embedded image is unexpectedly small or truncated");
}
if (external.length) {
  throw new Error(`Presentation is not a single offline file: ${external.join(", ")}`);
}
