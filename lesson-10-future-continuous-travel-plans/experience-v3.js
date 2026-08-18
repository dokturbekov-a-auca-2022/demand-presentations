(() => {
  // Build the signature "flight route" strip: a dashed path with a paper
  // plane that advances across it as the learner moves through the deck.
  const bar = document.createElement('div');
  bar.className = 'flight-route';
  bar.innerHTML = '<svg viewBox="0 0 1000 30" preserveAspectRatio="none">' +
    '<path class="route-path" d="M0,15 Q250,2 500,15 T1000,15"></path>' +
    '<text class="route-plane" x="0" y="21">\u2708</text>' +
    '</svg>';
  document.body.appendChild(bar);

  const scenes = [...document.querySelectorAll('.scene')];
  const plane = bar.querySelector('.route-plane');
  const path = bar.querySelector('.route-path');
  const pathLen = path.getTotalLength ? path.getTotalLength() : 1000;

  const placePlane = () => {
    const counter = document.querySelector('#counter');
    const match = counter && counter.textContent.match(/(\d+)\s*\/\s*(\d+)/);
    const n = match ? parseInt(match[1], 10) : 1;
    const total = match ? parseInt(match[2], 10) : scenes.length;
    const ratio = total > 1 ? (n - 1) / (total - 1) : 0;
    const pt = path.getPointAtLength ? path.getPointAtLength(ratio * pathLen) : { x: ratio * 1000, y: 15 };
    plane.setAttribute('x', Math.max(0, pt.x - 10));
    plane.setAttribute('y', pt.y + 6);
  };

  const counterEl = document.querySelector('#counter');
  if (counterEl) {
    new MutationObserver(placePlane).observe(counterEl, { childList: true, subtree: true, characterData: true });
  }
  window.addEventListener('resize', placePlane);
  requestAnimationFrame(placePlane);
  setTimeout(placePlane, 200);
})();
