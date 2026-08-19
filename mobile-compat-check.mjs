import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { createRequire } from 'node:module';

const { chromium } = createRequire(import.meta.url)('playwright');

const root = process.cwd();
const launcher = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const requested = new Set(process.argv.slice(2));
const captureDir = process.env.MOBILE_CAPTURE;
const captureScene = Number(process.env.MOBILE_SCENE || 0);
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
    extension === '.webmanifest' ? 'application/manifest+json; charset=utf-8' :
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

{
  const viewerPage = await context.newPage();
  await viewerPage.goto(`${baseUrl}/viewer.html?lesson=${encodeURIComponent(folders[0])}`);
  const viewport = await viewerPage.locator('meta[name="viewport"]').getAttribute('content');
  const zoomable = /user-scalable\s*=\s*yes/i.test(viewport || '') &&
    !/maximum-scale\s*=\s*1(?:\D|$)/i.test(viewport || '');
  console.log(`${zoomable ? 'PASS' : 'FAIL'} - mobile viewer allows pinch zoom`);
  if (!zoomable) failures.push('pinch-zoom');

  if (viewportWidth > viewportHeight) {
    const frame = viewerPage.locator('#presentation');
    const transformBeforeZoom = await frame.evaluate((iframe) => iframe.style.transform);
    const cdp = await context.newCDPSession(viewerPage);
    await cdp.send('Emulation.setPageScaleFactor', { pageScaleFactor: 2 });
    await viewerPage.waitForTimeout(120);
    const transformDuringZoom = await frame.evaluate((iframe) => iframe.style.transform);
    const landscapeZoomStable = transformDuringZoom === transformBeforeZoom;
    console.log(`${landscapeZoomStable ? 'PASS' : 'FAIL'} - landscape fit does not cancel pinch zoom`);
    if (!landscapeZoomStable) failures.push('landscape-pinch-zoom');
    await cdp.send('Emulation.setPageScaleFactor', { pageScaleFactor: 1 });
  }
  await viewerPage.close();
}

for (const folder of folders) {
  const testLessonSwipe = folder === 'lesson-13-debate-money-happiness';
  const page = await context.newPage();
  await page.goto(`${baseUrl}/viewer.html?lesson=${encodeURIComponent(folder)}`);
  const deckFrame = page.frames().find((candidate) => candidate !== page.mainFrame());
  if (!deckFrame) throw new Error(`Viewer did not load ${folder}`);
  await deckFrame.waitForLoadState('load');
  await deckFrame.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important}' });
  await page.waitForTimeout(120);

  const pinchResult = await deckFrame.evaluate(async (testSingleSwipe) => {
    const counter = document.querySelector('#counter, .counter');
    const target = document.querySelector('.scene.active') || document.body;
    if (!counter || typeof Touch !== 'function' || typeof TouchEvent !== 'function') {
      return { supported: false, stable: true };
    }
    const before = counter.textContent;
    const hrefBefore = location.href;
    const point = (identifier, clientX) => new Touch({
      identifier,
      target,
      clientX,
      clientY: 220,
      pageX: clientX,
      pageY: 220,
      screenX: clientX,
      screenY: 220,
      radiusX: 8,
      radiusY: 8,
      force: 1,
    });
    const dispatch = (type, touches, changedTouches) => target.dispatchEvent(new TouchEvent(type, {
      bubbles: true,
      cancelable: true,
      composed: true,
      touches,
      targetTouches: touches,
      changedTouches,
    }));
    const start = [point(1, 310), point(2, 530)];
    const moved = [point(1, 190), point(2, 650)];
    dispatch('touchstart', start, start);
    dispatch('touchmove', moved, moved);
    dispatch('touchend', [], moved);
    const pinchStable = counter.textContent === before && location.href === hrefBefore;
    if (!testSingleSwipe) {
      return { supported: true, stable: pinchStable, singleSwipeWorks: null, before, after: counter.textContent };
    }
    await new Promise((resolve) => setTimeout(resolve, 0));
    const swipeStart = [point(3, 430)];
    const swipeEnd = [point(3, 300)];
    dispatch('touchstart', swipeStart, swipeStart);
    dispatch('touchmove', swipeEnd, swipeEnd);
    dispatch('touchend', [], swipeEnd);
    return {
      supported: true,
      stable: pinchStable,
      singleSwipeWorks: counter.textContent !== before,
      before,
      after: counter.textContent,
      hrefBefore,
      hrefAfter: location.href,
    };
  }, testLessonSwipe);
  console.log(`${pinchResult.stable ? 'PASS' : 'FAIL'} - ${folder} two-finger pinch does not navigate${pinchResult.stable ? '' : `: ${JSON.stringify(pinchResult)}`}`);
  if (!pinchResult.stable) failures.push(`${folder}-pinch-navigation`);
  if (testLessonSwipe) {
    console.log(`${pinchResult.singleSwipeWorks ? 'PASS' : 'FAIL'} - ${folder} one-finger swipe still navigates`);
    if (!pinchResult.singleSwipeWorks) failures.push(`${folder}-single-swipe-navigation`);
  }

  if (testLessonSwipe && viewportWidth > viewportHeight) {
    const cdp = await context.newCDPSession(page);
    await cdp.send('Emulation.setPageScaleFactor', { pageScaleFactor: 2 });
    await page.waitForTimeout(80);
    const zoomedPanStable = await deckFrame.evaluate(() => {
      const counter = document.querySelector('#counter, .counter');
      const target = document.querySelector('.scene.active') || document.body;
      const before = counter?.textContent;
      const hrefBefore = location.href;
      if (!counter || typeof Touch !== 'function' || typeof TouchEvent !== 'function') return true;
      const point = (clientX) => new Touch({ identifier: 9, target, clientX, clientY: 220, pageX: clientX, pageY: 220, screenX: clientX, screenY: 220 });
      const dispatch = (type, touches, changedTouches) => target.dispatchEvent(new TouchEvent(type, {
        bubbles: true,
        cancelable: true,
        composed: true,
        touches,
        targetTouches: touches,
        changedTouches,
      }));
      const start = [point(430)];
      const moved = [point(290)];
      dispatch('touchstart', start, start);
      dispatch('touchmove', moved, moved);
      dispatch('touchend', [], moved);
      return counter.textContent === before && location.href === hrefBefore;
    });
    await cdp.send('Emulation.setPageScaleFactor', { pageScaleFactor: 1 });
    console.log(`${zoomedPanStable ? 'PASS' : 'FAIL'} - ${folder} zoomed one-finger pan does not navigate`);
    if (!zoomedPanStable) failures.push(`${folder}-zoomed-pan-navigation`);
  }

  const result = await deckFrame.evaluate(() => {
    const scenes = [...document.querySelectorAll('.scene')];
    const overflowingScenes = [];
    const clippedScenes = [];
    const controlOverlaps = [];
    let reportedSlideCollision = false;
    const controls = document.querySelector('.controls');
    const controlsBox = controls?.getBoundingClientRect();
    const isLandscape = innerWidth > innerHeight;

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
        if (offenders.length) {
          overflowingScenes.push({ scene: index + 1, scroll: scene.scrollWidth, client: scene.clientWidth, overflowX, offenders });
        }
      }

      if (isLandscape && (scene.scrollWidth > scene.clientWidth + 2 || scene.scrollHeight > scene.clientHeight + 2)) {
        clippedScenes.push({
          scene: index + 1,
          scrollWidth: scene.scrollWidth,
          clientWidth: scene.clientWidth,
          scrollHeight: scene.scrollHeight,
          clientHeight: scene.clientHeight,
        });
      }

      if (isLandscape && controlsBox) {
        const overlaps = [...scene.querySelectorAll('button, input, textarea, h1, h2, h3, p')]
          .filter((node) => {
            const box = node.getBoundingClientRect();
            return box.width > 0 && box.height > 0 &&
              box.right > controlsBox.left + 2 && box.left < controlsBox.right - 2 &&
              box.bottom > controlsBox.top + 2 && box.top < controlsBox.bottom - 2;
          })
          .map((node) => {
            const box = node.getBoundingClientRect();
            return {
              tag: node.tagName.toLowerCase(),
              id: node.id,
              text: node.textContent.trim().slice(0, 60),
              top: Math.round(box.top),
              bottom: Math.round(box.bottom),
            };
          });
        if (overlaps.length) {
          controlOverlaps.push({
            scene: index + 1,
            controlsTop: Math.round(controlsBox.top),
            controlsBottom: Math.round(controlsBox.bottom),
            overlaps: overlaps.slice(0, 5),
          });
        }
      }

      if (index === 13) {
        const headerBox = scene.querySelector('.scene-head')?.getBoundingClientRect();
        const bodyBox = scene.querySelector('.scene-body')?.getBoundingClientRect();
        reportedSlideCollision = Boolean(headerBox && bodyBox && headerBox.bottom > bodyBox.top + 2);
      }
    });

    return {
      innerWidth,
      documentScrollWidth: document.documentElement.scrollWidth,
      bodyScrollWidth: document.body.scrollWidth,
      documentOverflowX: getComputedStyle(document.documentElement).overflowX,
      bodyOverflowX: getComputedStyle(document.body).overflowX,
      overflowingScenes,
      clippedScenes,
      controlOverlaps,
      reportedSlideCollision,
    };
  });

  const frameFit = await page.locator('#presentation').evaluate((iframe) => {
    const box = iframe.getBoundingClientRect();
    const viewport = window.visualViewport;
    const width = viewport?.width || innerWidth;
    const height = viewport?.height || innerHeight;
    return {
      contained: box.left >= -1 && box.top >= -1 && box.right <= width + 1 && box.bottom <= height + 1,
      fillsLandscape: width <= height || (box.width >= width - 2 && box.height >= height - 2),
      frameWidth: Math.round(box.width),
      frameHeight: Math.round(box.height),
      viewportWidth: Math.round(width),
      viewportHeight: Math.round(height),
    };
  });

  if (captureDir) {
    if (captureScene > 0) {
      await deckFrame.evaluate((sceneNumber) => {
        const scenes = [...document.querySelectorAll('.scene')];
        scenes.forEach((scene, index) => scene.classList.toggle('active', index === sceneNumber - 1));
        const counter = document.querySelector('#counter, .counter');
        if (counter) counter.textContent = `${sceneNumber} / ${scenes.length}`;
      }, captureScene);
    }
    fs.mkdirSync(captureDir, { recursive: true });
    await page.screenshot({ path: path.join(captureDir, `${folder}.png`), fullPage: false });
  }

  const documentCanScroll = result.documentScrollWidth > result.innerWidth + 2 &&
    !['hidden', 'clip'].includes(result.documentOverflowX);
  const bodyCanScroll = result.bodyScrollWidth > result.innerWidth + 2 &&
    !['hidden', 'clip'].includes(result.bodyOverflowX);
  const reportedSlideCollision = folder === 'lesson-04-past-continuous-accidents-funny-stories' &&
    result.reportedSlideCollision;
  const overflow = !frameFit.contained || !frameFit.fillsLandscape || documentCanScroll || bodyCanScroll || result.overflowingScenes.length > 0 ||
    result.controlOverlaps.length > 0 || reportedSlideCollision;
  console.log(`${overflow ? 'FAIL' : 'PASS'} - ${folder}${overflow ? `: ${JSON.stringify({ ...result, frameFit })}` : ''}`);
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
