import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 8080);
const host = process.env.HOST || "0.0.0.0";
const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".md": "text/markdown; charset=utf-8",
};

function localAddresses() {
  const addresses = [];
  const interfaces = os.networkInterfaces();
  Object.keys(interfaces).forEach(name => {
    interfaces[name].forEach(address => {
      if (address.family === "IPv4" && !address.internal) addresses.push(address.address);
    });
  });
  return addresses;
}

const server = http.createServer((request, response) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname); }
  catch (urlError) { response.writeHead(400).end("Bad request"); return; }

  if (pathname === "/") pathname = "/index.html";
  const requestedPath = path.resolve(root, `.${pathname}`);
  const insideRoot = requestedPath === root || requestedPath.startsWith(`${root}${path.sep}`);
  if (!insideRoot) { response.writeHead(403).end("Forbidden"); return; }

  fs.stat(requestedPath, (statError, stats) => {
    if (statError || !stats.isFile()) { response.writeHead(404).end("Not found"); return; }
    const contentType = mimeTypes[path.extname(requestedPath).toLowerCase()] || "application/octet-stream";
    response.writeHead(200, { "Content-Type": contentType, "Cache-Control": "no-store" });
    if (request.method === "HEAD") { response.end(); return; }
    fs.createReadStream(requestedPath).pipe(response);
  });
});

server.listen(port, host, () => {
  console.log("\nThe Guild of Unfinished Things is ready.\n");
  console.log(`Computer: http://127.0.0.1:${port}`);
  if (host === "0.0.0.0") localAddresses().forEach(address => console.log(`iPhone:   http://${address}:${port}`));
  console.log("\nKeep this window open. Connect the iPhone to the same Wi-Fi and open an iPhone address in Safari.\nPress Ctrl+C to stop.\n");
});
