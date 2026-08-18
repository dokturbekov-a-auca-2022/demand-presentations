import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const page = pathToFileURL(path.join(here, "index.html")).href;
const profile = fs.mkdtempSync(path.join(os.tmpdir(), "slide-05-align-"));
const chrome = spawn(
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  ["--headless=new", "--disable-gpu", "--remote-debugging-port=0", `--user-data-dir=${profile}`, "about:blank"],
  { stdio: "ignore", windowsHide: true },
);
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const results = [];
let socket;

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
  async function navigate(scene, viewport) {
    await call("Page.navigate", { url: `${page}?viewport=${viewport}#${scene}` });
    await delay(1000);
  }
  async function clickAtCenter(selector) {
    const point = await value(`(() => {
      const target = document.querySelector(${JSON.stringify(selector)});
      target.scrollIntoView({block:'center'});
      const rect = target.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const hit = document.elementFromPoint(x, y);
      return {x, y, hit: hit ? hit.tagName + (hit.id ? '#' + hit.id : '') + (hit.className ? '.' + String(hit.className).replace(/ /g,'.') : '') : 'none'};
    })()`);
    await call("Input.dispatchMouseEvent", { type: "mousePressed", x: point.x, y: point.y, button: "left", clickCount: 1 });
    await call("Input.dispatchMouseEvent", { type: "mouseReleased", x: point.x, y: point.y, button: "left", clickCount: 1 });
    await delay(150);
    return point;
  }
  await call("Page.enable");
  await call("Runtime.enable");

  for (const viewport of [{ name: "desktop", width: 1600, height: 900 }, { name: "phone", width: 390, height: 844 }]) {
    await call("Emulation.setDeviceMetricsOverride", {
      width: viewport.width,
      height: viewport.height,
      deviceScaleFactor: 1,
      mobile: viewport.name === "phone",
      screenWidth: viewport.width,
      screenHeight: viewport.height,
    });
    await navigate(5, viewport.name);
    const measurement = await value(`(() => {
      const image = document.querySelector('.scene.active .action-board .art');
      const overlay = document.querySelector('.scene.active .action-map');
      const ir = image.getBoundingClientRect();
      const or = overlay.getBoundingClientRect();
      const delta = {
        left: Math.abs(ir.left - or.left), top: Math.abs(ir.top - or.top),
        right: Math.abs(ir.right - or.right), bottom: Math.abs(ir.bottom - or.bottom)
      };
      return {image:{x:ir.x,y:ir.y,w:ir.width,h:ir.height},overlay:{x:or.x,y:or.y,w:or.width,h:or.height},delta};
    })()`);
    const aligned = Object.values(measurement.delta).every((number) => number <= 1);
    results.push([`${viewport.name} slide 5 overlay matches photo`, aligned, JSON.stringify(measurement)]);

    await navigate(15, viewport.name);
    const filmMeasurement = await value(`(() => {
      const image = document.querySelector('.scene.active .film-board .art');
      const overlay = document.querySelector('.scene.active .frame-buttons');
      const reset = document.getElementById('filmReset');
      const ir = image.getBoundingClientRect();
      const or = overlay.getBoundingClientRect();
      const rr = reset.getBoundingClientRect();
      const delta = {
        left: Math.abs(ir.left - or.left), top: Math.abs(ir.top - or.top),
        right: Math.abs(ir.right - or.right), bottom: Math.abs(ir.bottom - or.bottom)
      };
      return {
        image:{x:ir.x,y:ir.y,w:ir.width,h:ir.height},
        overlay:{x:or.x,y:or.y,w:or.width,h:or.height},
        reset:{x:rr.x,y:rr.y,w:rr.width,h:rr.height},
        resetClearance:rr.top-or.bottom,
        delta
      };
    })()`);
    const filmAligned = Object.values(filmMeasurement.delta).every((number) => number <= 1);
    results.push([`${viewport.name} slide 15 overlay matches photo`, filmAligned, JSON.stringify(filmMeasurement)]);
    results.push([`${viewport.name} slide 15 overlay clears Reset order`, filmMeasurement.resetClearance >= 0, JSON.stringify(filmMeasurement)]);

    await clickAtCenter('.frame-buttons button');
    const resetTouch = await clickAtCenter('#filmReset');
    const resetState = await value(`(() => ({
      cleared: [...document.querySelectorAll('.frame-buttons button')].every(button => !button.hasAttribute('data-order')),
      caption: document.getElementById('filmCaption').textContent
    }))()`);
    results.push([
      `${viewport.name} slide 15 Reset order`,
      resetState.cleared && resetState.caption === 'Tap your starting frame. Justify the sequence aloud.',
      JSON.stringify({resetTouch, resetState}),
    ]);

    await navigate(20, viewport.name);
    const slide20Layout = await value(`(() => {
      const die = document.getElementById('storyDie');
      const dieRect = die.getBoundingClientRect();
      const range = document.createRange();
      range.selectNodeContents(die);
      const textRect = range.getBoundingClientRect();
      const textFits = textRect.left >= dieRect.left && textRect.right <= dieRect.right && textRect.top >= dieRect.top && textRect.bottom <= dieRect.bottom;
      const promptsCentered = [...document.querySelectorAll('.fluency-track > div')].every(box => getComputedStyle(box).alignContent === 'center');
      return {die:{x:dieRect.x,y:dieRect.y,w:dieRect.width,h:dieRect.height},text:{x:textRect.x,y:textRect.y,w:textRect.width,h:textRect.height},textFits,promptsCentered};
    })()`);
    results.push([`${viewport.name} slide 20 box text fits and centers`, slide20Layout.textFits && slide20Layout.promptsCentered, JSON.stringify(slide20Layout)]);

    await navigate(21, viewport.name);
    const slide21Layout = await value(`(() => ({
      promptsCentered: [...document.querySelectorAll('.shot-list > div')].every(box => getComputedStyle(box).alignContent === 'center')
    }))()`);
    results.push([`${viewport.name} slide 21 box text centers`, slide21Layout.promptsCentered, JSON.stringify(slide21Layout)]);
  }
} catch (error) {
  results.push(["harness", false, error.stack]);
} finally {
  if (socket) socket.close();
  chrome.kill();
  await Promise.race([new Promise((resolve) => chrome.once("exit", resolve)), delay(3000)]);
  try { fs.rmSync(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 }); } catch {}
}

results.forEach((result) => console.log(`${result[1] ? "PASS" : "FAIL"} - ${result[0]}: ${result[2] || ""}`));
if (results.some((result) => !result[1])) process.exitCode = 1;
