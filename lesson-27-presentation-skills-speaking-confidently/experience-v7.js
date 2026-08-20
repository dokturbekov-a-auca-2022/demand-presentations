(() => {
  const scenes = [...document.querySelectorAll('.scene')];
  const total = scenes.length;
  const deck = document.getElementById('deck');
  const prev = document.getElementById('prev');
  const next = document.getElementById('next');
  const count = document.getElementById('count');
  const bar = document.getElementById('bar');
  const map = document.getElementById('map');
  const note = document.getElementById('note');
  const actNumber = document.getElementById('actNumber');
  const actName = document.getElementById('actName');
  let current = 0;
  let activeTimer = null;

  const closePanels = () => {
    map.classList.remove('open');
    note.classList.remove('open');
  };

  const buildMap = () => {
    map.innerHTML = scenes.map((scene, index) =>
      `<button type="button" data-jump="${index}"><b>${String(index + 1).padStart(2, '0')}</b><span>${scene.dataset.title}</span></button>`
    ).join('');
  };

  const updateNote = () => {
    const scene = scenes[current];
    note.innerHTML = `<h3>${scene.dataset.title}</h3><p>${scene.dataset.note}</p>`;
  };

  const stopTimer = () => {
    if (activeTimer) {
      window.clearInterval(activeTimer);
      activeTimer = null;
    }
  };

  const pauseAudio = () => {
    document.querySelectorAll('audio').forEach(audio => {
      audio.pause();
      const button = audio.closest('.audio-line')?.querySelector('.audio-play');
      button?.classList.remove('playing');
      if (button?.dataset.label) button.textContent = button.dataset.label;
    });
  };

  const show = (index, direction = 1) => {
    const target = Math.max(0, Math.min(total - 1, index));
    if (target === current && scenes[target].classList.contains('active')) return;
    stopTimer();
    pauseAudio();
    scenes[current]?.classList.remove('active');
    current = target;
    const scene = scenes[current];
    scene.style.setProperty('--direction', direction);
    scene.classList.add('active');
    scene.scrollTop = 0;
    count.textContent = `${current + 1} / ${total}`;
    bar.style.width = `${((current + 1) / total) * 100}%`;
    prev.disabled = current === 0;
    next.disabled = current === total - 1;
    const [number, name] = scene.dataset.act.split('|');
    actNumber.textContent = number;
    actName.textContent = name;
    document.querySelectorAll('[data-jump]').forEach((button, buttonIndex) => {
      button.classList.toggle('active', buttonIndex === current);
    });
    updateNote();
    closePanels();
    history.replaceState(null, '', `#scene-${current + 1}`);
  };

  window.show = show;

  buildMap();
  current = Math.max(0, Math.min(total - 1, Number(location.hash.replace('#scene-', '')) - 1 || 0));
  scenes.forEach(scene => scene.classList.remove('active'));
  show(current);

  prev.addEventListener('click', () => show(current - 1, -1));
  next.addEventListener('click', () => show(current + 1, 1));
  document.getElementById('begin').addEventListener('click', () => show(1, 1));

  map.addEventListener('click', event => {
    const button = event.target.closest('[data-jump]');
    if (button) show(Number(button.dataset.jump), Number(button.dataset.jump) > current ? 1 : -1);
  });

  document.getElementById('mapBtn').addEventListener('click', () => {
    note.classList.remove('open');
    map.classList.toggle('open');
  });

  document.getElementById('noteBtn').addEventListener('click', () => {
    map.classList.remove('open');
    note.classList.toggle('open');
  });

  document.addEventListener('keydown', event => {
    if (event.target.matches('button, input, textarea, select')) return;
    if (event.key === 'ArrowRight' || event.key === 'PageDown') show(current + 1, 1);
    if (event.key === 'ArrowLeft' || event.key === 'PageUp') show(current - 1, -1);
    if (event.key === 'Escape') closePanels();
  });

  // A deliberate swipe must be horizontal, single-touch, unzoomed, and start away from controls.
  let touch = null;
  let gestureActive = false;
  const viewportScale = () => window.visualViewport?.scale || 1;

  document.addEventListener('gesturestart', () => { gestureActive = true; }, { passive: true });
  document.addEventListener('gestureend', () => {
    window.setTimeout(() => { gestureActive = false; }, 250);
  }, { passive: true });

  deck.addEventListener('touchstart', event => {
    if (event.touches.length !== 1 || viewportScale() > 1.02 || event.target.closest('button, audio, .nav, .tools')) {
      touch = null;
      return;
    }
    const point = event.touches[0];
    touch = { x: point.clientX, y: point.clientY, time: performance.now() };
  }, { passive: true });

  deck.addEventListener('touchmove', event => {
    if (event.touches.length !== 1) touch = null;
  }, { passive: true });

  deck.addEventListener('touchend', event => {
    if (!touch || gestureActive || viewportScale() > 1.02 || event.changedTouches.length !== 1) {
      touch = null;
      return;
    }
    const point = event.changedTouches[0];
    const dx = point.clientX - touch.x;
    const dy = point.clientY - touch.y;
    const elapsed = performance.now() - touch.time;
    touch = null;
    if (elapsed > 900 || Math.abs(dx) < 88 || Math.abs(dx) < Math.abs(dy) * 1.6) return;
    show(current + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
  }, { passive: true });

  const selectOne = (container, callback) => {
    container.addEventListener('click', event => {
      const button = event.target.closest('button');
      if (!button) return;
      container.querySelectorAll('button').forEach(item => item.classList.remove('selected', 'correct'));
      button.classList.add('selected');
      callback(button);
    });
  };

  selectOne(document.getElementById('strengths'), button => {
    document.getElementById('strengthOut').textContent = `Your starting strength is ${button.dataset.strength}. Give one real example.`;
  });

  const observationText = {
    eyes: 'The eyes move from the notes toward the audience.',
    shoulders: 'The shoulders look lower and less tense after rehearsal.',
    hands: 'The hands become visible and ready for purposeful gestures.',
    breath: 'The calmer posture creates more room for an easy breath.',
    notes: 'The notes become a quick guide instead of the centre of attention.',
    camera: 'The camera is close to eye level, so the audience feels included.',
    expression: 'The face looks more connected to the message.'
  };
  document.getElementById('observations').addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    button.classList.toggle('selected');
    document.getElementById('observationOut').textContent = observationText[button.textContent.trim()];
  });

  let expectedLoopStep = 1;
  document.getElementById('confidenceLoop').addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    const step = Number(button.dataset.step);
    const output = document.getElementById('loopOut');
    if (step !== expectedLoopStep) {
      output.textContent = `Find step ${expectedLoopStep}. Confidence grows through the sequence.`;
      return;
    }
    button.classList.add('open');
    expectedLoopStep += 1;
    output.textContent = expectedLoopStep > 5
      ? 'The loop is complete. Repeat with one specific improvement.'
      : `Good. Now open step ${expectedLoopStep}.`;
  });

  selectOne(document.getElementById('poseChoice'), button => {
    const correct = button.dataset.correct === 'true';
    if (correct) button.classList.add('correct');
    document.getElementById('poseOut').textContent = correct
      ? 'Balanced is the useful choice: steady feet, free shoulders, visible hands.'
      : `${button.dataset.pose[0].toUpperCase() + button.dataset.pose.slice(1)} creates extra effort. Compare it with balanced posture.`;
  });

  const runCountdown = (display, seconds, button, finishedText) => {
    stopTimer();
    let remaining = seconds;
    display.textContent = remaining;
    display.classList.add('running');
    button.disabled = true;
    activeTimer = window.setInterval(() => {
      remaining -= 1;
      display.textContent = remaining;
      if (remaining <= 0) {
        stopTimer();
        display.classList.remove('running');
        display.textContent = finishedText;
        button.disabled = false;
      }
    }, 1000);
  };

  document.getElementById('resetStart').addEventListener('click', () => {
    runCountdown(document.getElementById('resetTimer'), 20, document.getElementById('resetStart'), 'READY');
  });

  const breathButton = document.getElementById('breathStart');
  const breathOrbit = document.getElementById('breathOrbit');
  breathButton.addEventListener('click', () => {
    stopTimer();
    let elapsed = 0;
    const label = breathOrbit.querySelector('span');
    const number = breathOrbit.querySelector('b');
    breathButton.disabled = true;
    breathOrbit.classList.add('running');
    const updateBreath = () => {
      if (elapsed < 4) {
        label.textContent = 'BREATHE IN';
        number.textContent = 4 - elapsed;
      } else if (elapsed < 6) {
        label.textContent = 'PAUSE';
        number.textContent = 6 - elapsed;
      } else if (elapsed < 12) {
        label.textContent = 'BREATHE OUT';
        number.textContent = 12 - elapsed;
      } else {
        stopTimer();
        breathOrbit.classList.remove('running');
        label.textContent = 'SAY FIRST LINE';
        number.textContent = '✓';
        breathButton.disabled = false;
      }
      elapsed += 1;
    };
    updateBreath();
    activeTimer = window.setInterval(updateBreath, 1000);
  });

  document.querySelectorAll('.audio-play').forEach(button => {
    const audio = button.closest('.audio-line').querySelector('audio');
    button.dataset.label = button.textContent;
    button.addEventListener('click', () => {
      if (audio.paused) {
        pauseAudio();
        audio.play().then(() => {
          button.classList.add('playing');
          button.textContent = 'PAUSE';
        }).catch(() => {
          button.textContent = 'TAP AGAIN TO PLAY';
        });
      } else {
        audio.pause();
        button.classList.remove('playing');
        button.textContent = button.dataset.label;
      }
    });
    audio.addEventListener('ended', () => {
      button.classList.remove('playing');
      button.textContent = button.dataset.label;
    });
  });

  selectOne(document.getElementById('emphasisLines'), button => {
    const meanings = {
      clubs: 'Contrast: clubs, not only lessons, can create belonging.',
      new: 'Focus: the support is especially important for new students.',
      belong: 'Result: the key outcome is feeling included.'
    };
    document.getElementById('emphasisOut').textContent = meanings[button.dataset.word];
  });

  document.getElementById('fillerLines').addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    button.classList.add('repaired');
    const number = button.querySelector('b').outerHTML;
    button.innerHTML = `${number}${button.dataset.clean}`;
  });

  selectOne(document.getElementById('openingVote'), button => {
    const strong = button.dataset.quality === 'strong';
    if (strong) button.classList.add('correct');
    document.getElementById('openingOut').textContent = strong
      ? 'B works: it creates a picture, names the topic, and promises a clear purpose.'
      : 'A names the topic, but it gives no picture, purpose, or reason to listen.';
  });

  selectOne(document.getElementById('hookLines'), button => {
    document.getElementById('hookModel').textContent = button.dataset.model;
  });

  selectOne(document.getElementById('signposts'), button => {
    document.getElementById('signpostOut').textContent = button.dataset.phrase;
  });

  let evidenceOrder = 1;
  document.getElementById('evidenceLens').addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    const order = Number(button.dataset.order);
    const output = document.getElementById('evidenceOut');
    if (order !== evidenceOrder) {
      output.textContent = `Open layer ${evidenceOrder} first.`;
      return;
    }
    button.classList.add('open');
    evidenceOrder += 1;
    output.textContent = evidenceOrder > 3
      ? 'Complete support: point → example → why it matters.'
      : `Now open layer ${evidenceOrder}.`;
  });

  selectOne(document.getElementById('closingChoice'), button => {
    const strong = button.dataset.quality === 'strong';
    if (strong) button.classList.add('correct');
    document.getElementById('closingOut').textContent = strong
      ? 'This ending signals the close, summarizes the message, and lands on one final idea.'
      : 'This ending drifts because it apologizes and begins adding new information.';
  });

  document.getElementById('setupChecks').addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    button.classList.toggle('checked');
    const complete = document.querySelectorAll('#setupChecks button.checked').length;
    document.getElementById('setupOut').textContent = `${complete} / 6 checks complete.`;
  });

  document.getElementById('questionLines').addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    if (!button.dataset.situation) button.dataset.situation = button.childNodes[button.childNodes.length - 1].textContent.trim();
    button.classList.toggle('revealed');
    const number = button.querySelector('b').outerHTML;
    button.innerHTML = button.classList.contains('revealed')
      ? `${number}${button.dataset.answer}`
      : `${number}${button.dataset.situation}`;
  });

  document.getElementById('transcriptToggle').addEventListener('click', event => {
    const transcript = document.getElementById('modelTranscript');
    transcript.classList.toggle('open');
    event.currentTarget.textContent = transcript.classList.contains('open') ? 'HIDE TRANSCRIPT' : 'REVEAL TRANSCRIPT AFTER LISTENING';
  });

  document.getElementById('listeningLenses').addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    if (!button.dataset.question) button.dataset.question = button.querySelector('span').textContent;
    button.classList.toggle('revealed');
    button.querySelector('span').textContent = button.classList.contains('revealed') ? button.dataset.answer : button.dataset.question;
  });

  document.getElementById('scriptMap').addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    button.classList.toggle('revealed');
    document.getElementById('scriptOut').textContent = button.classList.contains('revealed')
      ? `${button.dataset.role}: explain what this line does for the listener.`
      : 'Click each line to reveal its job.';
  });

  document.getElementById('performanceStart').addEventListener('click', () => {
    runCountdown(document.getElementById('performanceTimer'), 60, document.getElementById('performanceStart'), 'TIME');
  });

  document.getElementById('peerTrack').addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    button.classList.toggle('checked');
    const complete = document.querySelectorAll('#peerTrack button.checked').length;
    document.getElementById('peerOut').textContent = `${complete} / 7 strengths observed. Choose one next improvement after the talk.`;
  });

  selectOne(document.getElementById('exitPrompts'), button => {
    document.getElementById('exitOut').textContent = `Complete aloud: “${button.textContent}” Add one concrete example.`;
  });
})();
