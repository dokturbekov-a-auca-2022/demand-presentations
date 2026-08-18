import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.join(here, "index.html");
const html = fs.readFileSync(htmlPath, "utf8");
const inlineScript = html.match(/<script>([\s\S]*?)<\/script>/)?.[1] || "";
const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const profilePath = fs.mkdtempSync(path.join(os.tmpdir(), "ppc-iphone-test-"));
const results = [];
let chrome;
let lessonServer;
let socket;

function check(name, passed, detail = "") {
  results.push({ name, passed, detail });
}

function delay(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

async function waitForDevToolsPort() {
  const portFile = path.join(profilePath, "DevToolsActivePort");
  for (let attempt = 0; attempt < 80; attempt++) {
    if (fs.existsSync(portFile)) return Number(fs.readFileSync(portFile, "utf8").split(/\r?\n/)[0]);
    await delay(50);
  }
  throw new Error("Chrome did not publish a DevTools port");
}

try {
  check(
    "legacy iOS-safe JavaScript syntax",
    !/\?\.\s*(?:\(|[A-Za-z_$])/.test(inlineScript) && !inlineScript.includes("??"),
    "Optional chaining/nullish coalescing can prevent the entire deck script from parsing on older iOS Safari."
  );

  const lessonPort = 18765;
  lessonServer = spawn(process.execPath, [path.join(here, "serve.mjs")], {
    env: { ...process.env, HOST: "127.0.0.1", PORT: String(lessonPort) },
    stdio: "ignore",
    windowsHide: true,
  });
  let serverReady = false;
  for (let attempt = 0; attempt < 40; attempt++) {
    try {
      const response = await fetch(`http://127.0.0.1:${lessonPort}/index.html`);
      if (response.ok) { serverReady = true; break; }
    } catch (serverNotReady) {}
    await delay(50);
  }
  if (!serverReady) throw new Error("Lesson phone server did not start");

  chrome = spawn(chromePath, [
    "--headless=new",
    "--disable-gpu",
    "--remote-debugging-port=0",
    `--user-data-dir=${profilePath}`,
    "about:blank",
  ], { stdio: "ignore", windowsHide: true });

  const port = await waitForDevToolsPort();
  const target = await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: "PUT" }).then(response => response.json());
  socket = new WebSocket(target.webSocketDebuggerUrl);
  const pending = new Map();
  let requestId = 0;

  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });

  socket.addEventListener("message", event => {
    const message = JSON.parse(event.data);
    if (!message.id || !pending.has(message.id)) return;
    const pendingRequest = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) pendingRequest.reject(new Error(message.error.message));
    else pendingRequest.resolve(message.result);
  });

  function call(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++requestId;
      pending.set(id, { resolve, reject });
      socket.send(JSON.stringify({ id, method, params }));
    });
  }

  async function evaluate(expression) {
    const response = await call("Runtime.evaluate", { expression, returnByValue: true });
    return response.result.value;
  }

  async function tap(selector) {
    const point = await evaluate(`(() => {
      const element = document.querySelector(${JSON.stringify(selector)});
      if (!element) return null;
      const rect = element.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    })()`);
    if (!point) throw new Error(`Tap target not found: ${selector}`);
    await call("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: point.x, y: point.y, radiusX: 2, radiusY: 2, force: 1 }] });
    await call("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await delay(220);
  }

  await call("Page.enable");
  await call("Runtime.enable");
  await call("Network.enable");
  await call("Network.setUserAgentOverride", {
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 12_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1 Mobile/15E148 Safari/604.1",
  });
  await call("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
    screenWidth: 390,
    screenHeight: 844,
  });
  await call("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
  await call("Page.addScriptToEvaluateOnNewDocument", {
    source: `
      try { Object.defineProperty(Element.prototype, 'requestFullscreen', { value: undefined, configurable: true }); } catch (error) {}
      try { Object.defineProperty(Element.prototype, 'webkitRequestFullscreen', { value: undefined, configurable: true }); } catch (error) {}
      try { Object.defineProperty(Document.prototype, 'exitFullscreen', { value: undefined, configurable: true }); } catch (error) {}
      try { Object.defineProperty(Document.prototype, 'webkitExitFullscreen', { value: undefined, configurable: true }); } catch (error) {}
      try { Object.defineProperty(navigator, 'standalone', { get: function () { return false; }, configurable: true }); } catch (error) {}
    `,
  });

  const servedPageUrl = `http://127.0.0.1:${lessonPort}/index.html`;
  const pageUrl = `${servedPageUrl}?iphoneTest=1#1`;
  await call("Page.navigate", { url: pageUrl });
  await delay(700);

  await tap("#nextBtn");
  check("touch navigation button", (await evaluate("document.getElementById('counter').textContent")) === "02 / 25", "A real touch tap must advance the deck.");

  await call("Page.navigate", { url: `${servedPageUrl}?iphoneTest=5#5` });
  await delay(500);
  await tap(".vocab-card");
  check("touch vocabulary flip card", await evaluate("document.querySelector('.vocab-card').classList.contains('flipped')"), "A touch tap must flip the card.");

  await tap("#fullscreenBtn");
  check(
    "fullscreen fallback when Safari has no API",
    await evaluate("Boolean(document.getElementById('iosFullscreenHelp') && document.getElementById('iosFullscreenHelp').classList.contains('show'))"),
    "The button must show iPhone-specific full-screen instructions instead of silently doing nothing."
  );
} catch (error) {
  check("test harness", false, error.stack || error.message);
} finally {
  if (socket) socket.close();
  if (chrome) chrome.kill();
  if (lessonServer) lessonServer.kill();
  await delay(200);
  fs.rmSync(profilePath, { recursive: true, force: true });
}

for (const result of results) {
  console.log(`${result.passed ? "PASS" : "FAIL"} — ${result.name}${result.detail ? `: ${result.detail}` : ""}`);
}

if (results.some(result => !result.passed)) process.exitCode = 1;
