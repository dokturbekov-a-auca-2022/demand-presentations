import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const page = pathToFileURL(path.join(here, "index.html")).href;
const profile = fs.mkdtempSync(path.join(os.tmpdir(), "mishap-check-"));
const chrome = spawn(
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  ["--headless=new", "--disable-gpu", "--remote-debugging-port=0", `--user-data-dir=${profile}`, "about:blank"],
  { stdio: "ignore", windowsHide: true },
);
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const results = [];
const exceptions = [];
let socket;
let loaded = false;

try {
  let port;
  for (let i = 0; i < 80; i += 1) {
    const portFile = path.join(profile, "DevToolsActivePort");
    if (fs.existsSync(portFile)) {
      port = Number(fs.readFileSync(portFile, "utf8").split(/\r?\n/)[0]);
      break;
    }
    await delay(50);
  }
  if (!port) throw new Error("No DevTools port");

  const target = await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: "PUT" }).then((response) => response.json());
  socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });

  let id = 0;
  const pending = new Map();
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.method === "Runtime.exceptionThrown") {
      exceptions.push(message.params.exceptionDetails.text);
      return;
    }
    if (!message.id || !pending.has(message.id)) return;
    const request = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) request.reject(new Error(message.error.message));
    else request.resolve(message.result);
  });

  function call(method, params = {}) {
    return new Promise((resolve, reject) => {
      const requestId = ++id;
      pending.set(requestId, { resolve, reject });
      socket.send(JSON.stringify({ id: requestId, method, params }));
    });
  }

  async function value(expression) {
    const response = await call("Runtime.evaluate", { expression, returnByValue: true });
    return response.result.value;
  }

  async function navigate(scene) {
    if (!loaded) {
      await call("Page.navigate", { url: `${page}#${scene}` });
      loaded = true;
    } else {
      await value(`location.hash=${JSON.stringify(String(scene))}`);
    }
    await delay(750);
  }

  async function tap(selector) {
    await value(`(() => {
      const target = document.querySelector(${JSON.stringify(selector)});
      const active = document.querySelector('.scene.active');
      let rect = target.getBoundingClientRect();
      if (rect.top < 70) active.scrollBy(0, rect.top - 110);
      rect = target.getBoundingClientRect();
      if (rect.bottom > 700) active.scrollBy(0, rect.bottom - 620);
    })()`);
    await delay(100);
    const point = await value(`(() => {
      const target = document.querySelector(${JSON.stringify(selector)});
      const rect = target.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const hit = document.elementFromPoint(x, y);
      return {
        x, y,
        target: target.tagName + (target.id ? '#' + target.id : '') + (target.className ? '.' + String(target.className).replace(/ /g,'.') : ''),
        hit: hit ? hit.tagName + (hit.id ? '#' + hit.id : '') + (hit.className ? '.' + String(hit.className).replace(/ /g,'.') : '') : 'none',
        sceneScroll: document.querySelector('.scene.active').scrollTop,
      };
    })()`);
    await call("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x: point.x, y: point.y, radiusX: 2, radiusY: 2, force: 1 }],
    });
    await call("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await delay(160);
    return point;
  }

  await call("Page.enable");
  await call("Runtime.enable");
  await call("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
    screenWidth: 390,
    screenHeight: 844,
  });
  await call("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });

  await navigate(1);
  const imageState = await value(`(() => {
    const images = [...document.images];
    return {count: images.length, complete: images.every(img => img.complete && img.naturalWidth > 0)};
  })()`);
  results.push(["all embedded images decode", imageState.count >= 14 && imageState.complete, JSON.stringify(imageState)]);

  if (process.env.MISHAP_SCREENSHOT) {
    await navigate(Number(process.env.MISHAP_SCREENSHOT_SCENE || 21));
    const shot = await call("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync(process.env.MISHAP_SCREENSHOT, Buffer.from(shot.data, "base64"));
    await navigate(1);
  }

  await tap("#next");
  results.push(["touch navigation", await value("document.getElementById('counter').textContent==='02 / 24'")]);

  await navigate(3);
  let touch = await tap(".hot");
  results.push(["visual clue", await value("document.querySelector('.hot').classList.contains('open')"), JSON.stringify(touch)]);

  await navigate(6);
  touch = await tap(".choice-bank[data-pair='object'] button:nth-of-type(2)");
  results.push(["collocation builder", await value("document.getElementById('pairOutput').textContent==='spill a backpack'"), JSON.stringify(touch)]);

  await navigate(8);
  touch = await tap(".token-bank[data-build='subject'] button:nth-of-type(2)");
  results.push(["sentence builder", await value("document.getElementById('sentenceOutput').textContent.startsWith('She was')"), JSON.stringify(touch)]);

  await navigate(12);
  await tap("#generateBtn");
  results.push(["interruption generator", await value("document.getElementById('generatorLine').textContent.includes(' when ')")]);

  await navigate(14);
  touch = await tap("#errorReveal");
  results.push(["error repair", await value("document.getElementById('repair').classList.contains('open')"), JSON.stringify(touch)]);

  await navigate(15);
  touch = await tap(".frame-buttons button");
  results.push(["film ordering", await value("document.querySelector('.frame-buttons button').dataset.order==='1'"), JSON.stringify(touch)]);
  touch = await tap("#filmReset");
  results.push([
    "film ordering reset",
    await value("[...document.querySelectorAll('.frame-buttons button')].every(button=>!button.hasAttribute('data-order')) && document.getElementById('filmCaption').textContent==='Tap your starting frame. Justify the sequence aloud.'"),
    JSON.stringify(touch),
  ]);

  await navigate(21);
  touch = await tap("#timerStart");
  await delay(1100);
  results.push(["production timer", await value("document.getElementById('timer').textContent==='04:59'"), JSON.stringify(touch)]);

  for (const scene of [3, 5, 7, 8, 10, 12, 15, 17, 18, 19, 20, 21, 22]) {
    await navigate(scene);
    const dimensions = await value(`(() => {
      const active = document.querySelector('.scene.active');
      return {scroll: active.scrollWidth, client: active.clientWidth, doc: document.documentElement.scrollWidth};
    })()`);
    results.push([
      `scene ${scene} mobile layout`,
      dimensions.scroll <= dimensions.client && dimensions.doc === 390,
      JSON.stringify(dimensions),
    ]);
  }
  results.push(["no JavaScript exceptions", exceptions.length === 0, exceptions.join("; ")]);
} catch (error) {
  results.push(["harness", false, error.stack]);
} finally {
  if (socket) socket.close();
  chrome.kill();
  await Promise.race([new Promise((resolve) => chrome.once("exit", resolve)), delay(3000)]);
  try {
    fs.rmSync(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
  } catch (error) {
    results.push(["temporary profile cleanup", false, error.message]);
  }
}

results.forEach((result) => {
  console.log(`${result[1] ? "PASS" : "FAIL"} — ${result[0]}${result[2] ? `: ${result[2]}` : ""}`);
});
if (results.some((result) => !result[1])) process.exitCode = 1;
