import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { createRequire } from 'node:module';

const { chromium } = createRequire(import.meta.url)('playwright');

const root = process.cwd();
const launcher = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const requested = new Set(process.argv.slice(2));
const captureDir = process.env.MOBILE_CAPTURE;
const viewportWidth = Number(process.env.MOBILE_WIDTH || 390);
const viewportHeight = Number(process.env.MOBILE_HEIGHT || 844);
const folders = [...launcher.matchAll(/href="\.\/(lesson-[^"]+)\/"/g)]
  .map((match) => match[1])
  .filter((folder) => requested.size === 0 || requested.has(folder));
const browser = await chromium.launch({
  executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  headless: true,
});

const server = process.env.BASE_URL ? null : http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  let target = path.resolve(root, `.${pathname}`);
  if (!target.startsWith(root)) {
    response.writeHead(403).end();
    return;
  }
  if (fs.existsSync(target) && fs.statSync(target).isDirectory()) target = path.join(target, 'index.html');
  if (!fs.existsSync(target)) {
    response.writeHead(404).end();
    return;
  }
  const extension = path.extname(target).toLowerCase();
  const contentType = extension === '.html' ? 'text/html; charset=utf-8' :
    extension === '.css' ? 'text/css; charset=utf-8' :
    extension === '.js' ? 'text/javascript; charset=utf-8' :
    extension === '.png' ? 'image/png' : extension === '.wav' ? 'audio/wav' : 'application/octet-stream';
  response.writeHead(200, { 'Content-Type': contentType });
  fs.createReadStream(target).pipe(response);
});
if (server) await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const baseUrl = process.env.BASE_URL?.replace(/\/$/, '') || `http://127.0.0.1:${server.address().port}`;

const context = await browser.newContext({
  viewport: { width: viewportWidth, height: viewportHeight },
  deviceScaleFactor: 3,
  hasTouch: true,
  isMobile: true,
  reducedMotion: 'reduce',
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/138.0.0.0 Mobile/15E148 Safari/604.1',
});

const failures = [];
{
  const launcherPage = await context.newPage();
  await launcherPage.goto(`${baseUrl}/`);
  const phoneLinks = await launcherPage.locator('.lesson-row').evaluateAll((links) => links.map((link) => link.href));
  const routed = phoneLinks.length === 30 && phoneLinks.every((href) => href.includes('/viewer.html?lesson='));
  console.log(`${routed ? 'PASS' : 'FAIL'} - launcher routes phone Chrome through the fitted viewer`);
  if (!routed) failures.push('launcher-routing');
  await launcherPage.close();
}

for (const folder of folders) {
  const page = await context.newPage();
  await page.goto(`${baseUrl}/viewer.html?lesson=${encodeURIComponent(folder)}`);
  const deckFrame = page.frames().find((candidate) => candidate !== page.mainFrame());
  if (!deckFrame) throw new Error(`Viewer did not load ${folder}`);
  await deckFrame.waitForLoadState('load');
  await deckFrame.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important}' });
  await page.waitForTimeout(120);

  const result = await deckFrame.evaluate(() => {
    const scenes = [...document.querySelectorAll('.scene')];
    const overflowingScenes = [];

    scenes.forEach((scene, index) => {
      scenes.forEach((item) => item.classList.remove('active'));
      scene.classList.add('active');
      const overflowX = getComputedStyle(scene).overflowX;
      if (scene.scrollWidth > scene.clientWidth + 2 && !['hidden', 'clip'].includes(overflowX)) {
        const offenders = [...scene.querySelectorAll('*')]
          .map((node) => {
            const box = node.getBoundingClientRect();
            return {
              tag: node.tagName.toLowerCase(),
              id: node.id,
              className: typeof node.className === 'string' ? node.className : '',
              left: Math.round(box.left),
              right: Math.round(box.right),
              width: Math.round(box.width),
            };
          })
          .filter((item) => item.width > 0 && (item.left < -2 || item.right > innerWidth + 2))
          .slice(0, 6);
        overflowingScenes.push({ scene: index + 1, scroll: scene.scrollWidth, client: scene.clientWidth, overflowX, offenders });
      }
    });

    return {
      innerWidth,
      documentScrollWidth: document.documentElement.scrollWidth,
      bodyScrollWidth: document.body.scrollWidth,
      documentOverflowX: getComputedStyle(document.documentElement).overflowX,
      bodyOverflowX: getComputedStyle(document.body).overflowX,
      overflowingScenes,
    };
  });

  if (captureDir) {
    fs.mkdirSync(captureDir, { recursive: true });
    await page.screenshot({ path: path.join(captureDir, `${folder}.png`), fullPage: false });
  }

  const documentCanScroll = result.documentScrollWidth > result.innerWidth + 2 &&
    !['hidden', 'clip'].includes(result.documentOverflowX);
  const bodyCanScroll = result.bodyScrollWidth > result.innerWidth + 2 &&
    !['hidden', 'clip'].includes(result.bodyOverflowX);
  const overflow = documentCanScroll || bodyCanScroll || result.overflowingScenes.length > 0;
  console.log(`${overflow ? 'FAIL' : 'PASS'} - ${folder}${overflow ? `: ${JSON.stringify(result)}` : ''}`);
  if (overflow) failures.push(folder);

  if (folder === 'lesson-04-past-continuous-accidents-funny-stories') {
    await deckFrame.locator('#full').click();
    const phoneHelp = page.locator('#phoneHelp.open');
    const browserNeutral = await phoneHelp.isVisible() && (await phoneHelp.textContent()).includes('Chrome on iPhone');
    console.log(`${browserNeutral ? 'PASS' : 'FAIL'} - iPhone Chrome fullscreen guidance`);
    if (!browserNeutral) failures.push('iphone-fullscreen-guidance');
  }
  await page.close();
}

await browser.close();
if (server) await new Promise((resolve) => server.close(resolve));
console.log(`Checked ${folders.length} lessons at ${viewportWidth}px in iPhone Chrome mode.`);
if (failures.length) process.exitCode = 1;
