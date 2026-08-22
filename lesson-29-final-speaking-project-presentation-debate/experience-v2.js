(() => {
  'use strict';

  const byId = id => document.getElementById(id);
  const scenes = [...document.querySelectorAll('.scene')];
  const total = scenes.length;
  const deck = byId('deck');
  const prev = byId('prev');
  const next = byId('next');
  const count = byId('count');
  const bar = byId('bar');
  const map = byId('map');
  const note = byId('note');
  const mapBtn = byId('mapBtn');
  const noteBtn = byId('noteBtn');
  const chapterNumber = byId('chapterNumber');
  const chapterName = byId('chapterName');
  let current = 0;
  let timerInterval = null;
  let timerLimit = 90;
  let timerSeconds = 90;
  let audioContext = null;

  const tone = type => {
    try {
      audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const now = audioContext.currentTime;
      const settings = {
        pop: [420, 640, .1],
        correct: [620, 980, .15],
        wrong: [220, 145, .15],
        spin: [310, 760, .23],
        done: [760, 1080, .32]
      }[type] || [440, 620, .1];
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.frequency.setValueAtTime(settings[0], now);
      oscillator.frequency.exponentialRampToValueAtTime(settings[1], now + settings[2]);
      gain.gain.setValueAtTime(.0001, now);
      gain.gain.exponentialRampToValueAtTime(.075, now + .015);
      gain.gain.exponentialRampToValueAtTime(.0001, now + settings[2]);
      oscillator.start(now);
      oscillator.stop(now + settings[2] + .03);
    } catch {
      /* All activities keep visual feedback when Web Audio is unavailable. */
    }
  };

  const stopSpeech = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    byId('voicePlayer')?.classList.remove('playing');
    const button = byId('playModel');
    if (button) button.textContent = '▶ PLAY MODEL';
  };

  const stopTimer = () => {
    if (timerInterval) window.clearInterval(timerInterval);
    timerInterval = null;
  };

  const closePanels = () => {
    map.classList.remove('open');
    note.classList.remove('open');
    mapBtn.setAttribute('aria-expanded', 'false');
    noteBtn.setAttribute('aria-expanded', 'false');
  };

  map.innerHTML = scenes.map((scene, index) => `
    <button type="button" data-jump="${index}">
      <b>${String(index + 1).padStart(2, '0')}</b>
      <span>${scene.dataset.title}</span>
    </button>`).join('');

  const updateNote = () => {
    const scene = scenes[current];
    note.innerHTML = `<h3>${scene.dataset.title}</h3><p>${scene.dataset.note}</p>`;
  };

  const show = (index, direction = 1) => {
    const target = Math.max(0, Math.min(total - 1, index));
    stopTimer();
    stopSpeech();
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
    const [number, name] = scene.dataset.chapter.split('|');
    chapterNumber.textContent = number;
    chapterName.textContent = name;
    document.querySelectorAll('[data-jump]').forEach((button, buttonIndex) => button.classList.toggle('active', buttonIndex === current));
    updateNote();
    closePanels();
    history.replaceState(null, '', `#scene-${current + 1}`);
  };

  window.showScene = show;
  const hashScene = Number(location.hash.replace('#scene-', ''));
  current = Number.isFinite(hashScene) && hashScene > 0 ? Math.min(total - 1, hashScene - 1) : 0;
  scenes.forEach(scene => scene.classList.remove('active'));
  show(current);

  prev.addEventListener('click', () => show(current - 1, -1));
  next.addEventListener('click', () => show(current + 1, 1));
  byId('begin').addEventListener('click', () => { tone('pop'); show(1, 1); });

  mapBtn.addEventListener('click', () => {
    note.classList.remove('open');
    noteBtn.setAttribute('aria-expanded', 'false');
    map.classList.toggle('open');
    mapBtn.setAttribute('aria-expanded', String(map.classList.contains('open')));
  });

  noteBtn.addEventListener('click', () => {
    map.classList.remove('open');
    mapBtn.setAttribute('aria-expanded', 'false');
    note.classList.toggle('open');
    noteBtn.setAttribute('aria-expanded', String(note.classList.contains('open')));
  });

  map.addEventListener('click', event => {
    const button = event.target.closest('[data-jump]');
    if (button) show(Number(button.dataset.jump), Number(button.dataset.jump) > current ? 1 : -1);
  });

  document.addEventListener('keydown', event => {
    if (event.target.closest('button,input,textarea,select,a')) return;
    if (event.key === 'ArrowRight' || event.key === 'PageDown' || event.code === 'Space') {
      event.preventDefault();
      show(current + 1, 1);
    }
    if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
      event.preventDefault();
      show(current - 1, -1);
    }
    if (event.key.toLowerCase() === 'm') mapBtn.click();
    if (event.key.toLowerCase() === 'n') noteBtn.click();
    if (event.key === 'Escape') closePanels();
  });

  let touch = null;
  let gestureActive = false;
  const viewportScale = () => window.visualViewport?.scale || 1;
  document.addEventListener('gesturestart', () => { gestureActive = true; }, { passive: true });
  document.addEventListener('gestureend', () => { window.setTimeout(() => { gestureActive = false; }, 250); }, { passive: true });
  deck.addEventListener('touchstart', event => {
    if (event.touches.length !== 1 || viewportScale() > 1.02 || event.target.closest('button,input,textarea,.nav,.tools,.panel')) {
      touch = null;
      return;
    }
    const point = event.touches[0];
    touch = { x: point.clientX, y: point.clientY, time: performance.now() };
  }, { passive: true });
  deck.addEventListener('touchmove', event => { if (event.touches.length !== 1) touch = null; }, { passive: true });
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
    if (elapsed > 900 || Math.abs(dx) < 90 || Math.abs(dx) < Math.abs(dy) * 1.65) return;
    show(current + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
  }, { passive: true });

  const selectOne = (container, callback) => {
    container.addEventListener('click', event => {
      const button = event.target.closest('button');
      if (!button) return;
      container.querySelectorAll('button').forEach(item => item.classList.remove('selected', 'correct', 'wrong'));
      button.classList.add('selected');
      callback(button);
    });
  };

  selectOne(byId('confidencePulse'), button => {
    const level = Number(button.dataset.level);
    byId('pulseFill').style.width = `${level}%`;
    const messages = {
      25: 'Start small: deliver one clear sentence and build from there.',
      50: 'Use your plan and pause. Nervous energy can become focus.',
      75: 'You are ready to test your structure and respond to questions.',
      100: 'Use that energy to support the room, not only your own performance.'
    };
    byId('pulseOut').textContent = messages[level];
    tone('pop');
  });

  byId('bridgeReveal').addEventListener('click', () => {
    byId('bridgeModel').classList.toggle('open');
    byId('bridgeReveal').textContent = byId('bridgeModel').classList.contains('open') ? 'HIDE MODEL' : 'REVEAL A MODEL';
    tone('pop');
  });

  selectOne(byId('routeGates'), button => {
    const presentation = button.dataset.route === 'presentation';
    byId('routeOut').textContent = presentation
      ? 'Presentation route: write one claim, two supports and one final recommendation.'
      : 'Debate route: prepare your position, predict the other side and build one respectful rebuttal.';
    try { localStorage.setItem('lesson29-route', button.dataset.route); } catch { /* Storage is optional. */ }
    tone('correct');
  });

  const savedRoute = (() => { try { return localStorage.getItem('lesson29-route'); } catch { return null; } })();
  if (savedRoute) byId('routeGates').querySelector(`[data-route="${savedRoute}"]`)?.classList.add('selected');

  const topics = [
    'Should schools create one phone-free break?',
    'Should homework have a weekly time limit?',
    'Should students help design school rules?',
    'Should every teenager learn basic first aid?',
    'Should public transport be free for students?',
    'Should AI tools be allowed for brainstorming?',
    'Should schools offer one outdoor lesson each week?',
    'Should group projects include individual grades?',
    'Should school cafeterias show sugar information?',
    'Should students have a quiet room during breaks?'
  ];
  let topicIndex = 0;
  byId('topicSpin').addEventListener('click', () => {
    const windowEl = byId('topicWindow');
    windowEl.classList.add('spinning');
    tone('spin');
    window.setTimeout(() => {
      topicIndex = (topicIndex + 1 + Math.floor(Math.random() * (topics.length - 1))) % topics.length;
      windowEl.textContent = topics[topicIndex];
      windowEl.classList.remove('spinning');
    }, 230);
  });

  selectOne(byId('focusScale'), button => {
    const quality = button.dataset.quality;
    button.classList.add(quality === 'strong' ? 'correct' : 'wrong');
    const messages = {
      weak: 'A topic names the room, but it does not show your position.',
      almost: 'A question opens discussion, but your project still needs an answer.',
      strong: 'Yes. It names who, the action and a clear situation.'
    };
    byId('focusOut').textContent = messages[quality];
    tone(quality === 'strong' ? 'correct' : 'wrong');
  });

  let evidenceScore = 0;
  byId('evidenceCourt').addEventListener('click', event => {
    const button = event.target.closest('button');
    const card = event.target.closest('article');
    if (!button || !card || card.dataset.complete === 'true') return;
    const correct = button.dataset.judge === card.dataset.answer;
    button.classList.add(correct ? 'correct' : 'wrong');
    tone(correct ? 'correct' : 'wrong');
    if (correct) {
      card.dataset.complete = 'true';
      evidenceScore += 1;
    }
    const reason = {
      strong: 'The number includes a clear group and result.',
      careful: 'One personal example can illustrate an idea, but it cannot represent everyone.',
      weak: '“Everyone knows” gives no source, group or specific example.'
    }[card.dataset.answer];
    byId('evidenceOut').textContent = `Score: ${evidenceScore} / 3 · ${correct ? reason : 'Look for how specific and checkable the support is.'}`;
  });

  const updateClaim = () => {
    const parts = [byId('claimWho').value.trim(), byId('claimAction').value.trim(), byId('claimWhat').value.trim()].filter(Boolean);
    let sentence = parts.join(' ').replace(/\s+/g, ' ');
    if (sentence && !/[.!?]$/.test(sentence)) sentence += '.';
    byId('claimOutput').textContent = sentence || 'Build a complete claim: who + action + what.';
  };
  ['claimWho', 'claimAction', 'claimWhat'].forEach(id => byId(id).addEventListener('input', updateClaim));

  const audienceModels = {
    classmates: '“Have you ever wanted one break without checking a notification?” Start from shared experience.',
    teachers: '“A short phone-free break could help students return to class more focused.” Connect to learning.',
    'school leaders': '“Our class poll suggests a two-week phone-free-break trial is worth testing.” Offer a practical next step.',
    parents: '“Students still need safe family contact, so our plan keeps urgent messages available.” Address the concern early.'
  };
  selectOne(byId('audienceLens'), button => {
    byId('audienceModel').textContent = audienceModels[button.dataset.audience];
    tone('pop');
  });

  const modelText = byId('modelTranscript').textContent.trim();
  byId('playModel').addEventListener('click', () => {
    if (!('speechSynthesis' in window)) {
      byId('playModel').textContent = 'VOICE UNAVAILABLE · READ THE TRANSCRIPT';
      return;
    }
    if (speechSynthesis.speaking) {
      stopSpeech();
      return;
    }
    const utterance = new SpeechSynthesisUtterance(modelText);
    utterance.lang = 'en-US';
    utterance.rate = .88;
    utterance.pitch = 1;
    const voices = speechSynthesis.getVoices();
    utterance.voice = voices.find(voice => voice.lang.startsWith('en') && /natural|online|premium/i.test(voice.name)) || voices.find(voice => voice.lang.startsWith('en')) || null;
    utterance.onend = stopSpeech;
    utterance.onerror = stopSpeech;
    byId('voicePlayer').classList.add('playing');
    byId('playModel').textContent = '■ STOP MODEL';
    speechSynthesis.speak(utterance);
  });

  let xrayCount = 0;
  byId('pitchXray').addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button || button.classList.contains('revealed')) return;
    button.classList.add('revealed');
    button.querySelector('span').textContent = button.dataset.job;
    xrayCount += 1;
    byId('xrayOut').textContent = `${xrayCount} / 4 jobs revealed.${xrayCount === 4 ? ' Now retell the whole shape without reading.' : ''}`;
    tone('correct');
  });

  selectOne(byId('phraseWardrobe'), button => {
    byId('wardrobeLine').textContent = button.dataset.line;
    tone('pop');
  });

  let ladderStep = 1;
  byId('rebuttalLadder').addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    const step = Number(button.dataset.step);
    if (step !== ladderStep) {
      byId('ladderOut').textContent = `Open step ${ladderStep} first. A good rebuttal begins by listening.`;
      tone('wrong');
      return;
    }
    button.classList.add('open');
    ladderStep += 1;
    byId('ladderOut').textContent = ladderStep > 3 ? 'Complete. Now change the final support for your own topic.' : `Good. Now open step ${ladderStep}.`;
    tone('correct');
  });

  selectOne(byId('responseDuel'), button => {
    const correct = button.dataset.correct === 'true';
    button.classList.add(correct ? 'correct' : 'wrong');
    byId('duelOut').textContent = correct
      ? 'Strong reply: it recognizes the concern, then offers a realistic solution.'
      : 'This closes the conversation or attacks the idea without answering the concern.';
    tone(correct ? 'correct' : 'wrong');
  });

  let repairCount = 0;
  byId('trapLines').addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button || button.classList.contains('repaired')) return;
    button.classList.add('repaired');
    button.innerHTML = `<b>${button.dataset.fixed}</b><span>REPAIRED</span>`;
    repairCount += 1;
    byId('trapOut').textContent = `${repairCount} / 4 traps repaired · Accurate language sounds more trustworthy.`;
    tone('correct');
  });

  selectOne(byId('visualTest'), button => {
    const correct = button.dataset.correct === 'true';
    button.classList.add(correct ? 'correct' : 'wrong');
    byId('visualOut').textContent = correct
      ? 'Yes. The audience sees the number and message before the speaker finishes one sentence.'
      : 'This visual competes with the speaker. Remove paragraphs and choose one useful message.';
    tone(correct ? 'correct' : 'wrong');
  });

  byId('rescueDeck').addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    button.classList.toggle('flipped');
    if (!button.dataset.front) button.dataset.front = button.innerHTML;
    button.innerHTML = button.classList.contains('flipped') ? `<b>TRY THIS</b><span>${button.dataset.back}</span>` : button.dataset.front;
    byId('rescueOut').textContent = button.classList.contains('flipped') ? 'Say the phrase calmly, then adapt it to your topic.' : 'Choose another situation.';
    tone('pop');
  });

  const roleSets = [
    ['Speaker 1 · hook + claim', 'Speaker 2 · evidence', 'Speaker 3 · response + close', 'Moderator · time + questions'],
    ['Speaker 1 · problem', 'Speaker 2 · example + visual', 'Speaker 3 · recommendation', 'Question host · audience bridge'],
    ['Opening speaker · position', 'Evidence speaker · proof', 'Rebuttal speaker · reply', 'Moderator · fair turns'],
    ['Story opener · hook', 'Claim keeper · main message', 'Proof guide · evidence', 'Closer · action + Q&A']
  ];
  let roleSetIndex = 0;
  byId('assignRoles').addEventListener('click', () => {
    roleSetIndex = (roleSetIndex + 1 + Math.floor(Math.random() * (roleSets.length - 1))) % roleSets.length;
    const display = byId('roleDisplay');
    display.classList.remove('shuffling');
    void display.offsetWidth;
    display.innerHTML = roleSets[roleSetIndex].map(role => `<span>${role}</span>`).join('');
    display.classList.add('shuffling');
    tone('spin');
  });

  const storagePrefix = 'lesson29-canvas-';
  document.querySelectorAll('[data-save]').forEach(field => {
    try { field.value = localStorage.getItem(storagePrefix + field.dataset.save) || ''; } catch { /* Storage is optional. */ }
    field.addEventListener('input', () => {
      try {
        localStorage.setItem(storagePrefix + field.dataset.save, field.value);
        byId('canvasStatus').textContent = 'Saved on this device.';
      } catch {
        byId('canvasStatus').textContent = 'Local saving is unavailable. Copy your notes before closing.';
      }
    });
  });
  byId('clearCanvas').addEventListener('click', () => {
    document.querySelectorAll('[data-save]').forEach(field => {
      field.value = '';
      try { localStorage.removeItem(storagePrefix + field.dataset.save); } catch { /* Storage is optional. */ }
    });
    byId('canvasStatus').textContent = 'Canvas cleared. Start with one focused claim.';
    tone('pop');
  });

  selectOne(byId('directorConsole'), button => {
    byId('directorTask').textContent = button.dataset.task;
    tone('pop');
  });

  const timerDisplay = () => {
    const minutes = Math.floor(timerSeconds / 60);
    const seconds = timerSeconds % 60;
    byId('timer').textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    byId('timer').classList.toggle('warning', timerSeconds > 0 && timerSeconds <= 15);
    byId('timer').classList.toggle('done', timerSeconds === 0);
  };
  selectOne(byId('timePicks'), button => {
    stopTimer();
    timerLimit = Number(button.dataset.seconds);
    timerSeconds = timerLimit;
    timerDisplay();
    tone('pop');
  });
  byId('timerStart').addEventListener('click', () => {
    if (timerSeconds <= 0) timerSeconds = timerLimit;
    if (timerInterval) return;
    tone('pop');
    timerInterval = window.setInterval(() => {
      timerSeconds -= 1;
      timerDisplay();
      if (timerSeconds <= 0) {
        stopTimer();
        tone('done');
      }
    }, 1000);
  });
  byId('timerPause').addEventListener('click', () => { stopTimer(); tone('pop'); });
  byId('timerReset').addEventListener('click', () => { stopTimer(); timerSeconds = timerLimit; timerDisplay(); tone('pop'); });

  const missions = [
    'Write the claim in eight words or fewer.',
    'Capture one specific piece of evidence.',
    'Notice one strong pause or stressed word.',
    'Prepare one respectful follow-up question.',
    'Name the other viewpoint the speaker recognized.',
    'Write the final action the speaker requested.'
  ];
  let missionIndex = 0;
  byId('missionSpin').addEventListener('click', () => {
    missionIndex = (missionIndex + 1 + Math.floor(Math.random() * (missions.length - 1))) % missions.length;
    byId('audienceMission').textContent = missions[missionIndex];
    tone('spin');
  });

  byId('feedbackMosaic').addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    button.classList.toggle('selected');
    const chosen = [...byId('feedbackMosaic').querySelectorAll('.selected')];
    const strengths = chosen.filter(item => item.dataset.kind === 'strength').length;
    const nextSteps = chosen.filter(item => item.dataset.kind === 'next').length;
    byId('feedbackOut').textContent = `${chosen.length} tiles added · ${strengths} strengths + ${nextSteps} next steps. Name the exact moment for each tile.`;
    tone('pop');
  });

  selectOne(byId('exitPrompts'), button => {
    byId('exitLine').textContent = button.dataset.prompt;
    document.querySelector('.finale').classList.remove('celebrate');
    void document.querySelector('.finale').offsetWidth;
    document.querySelector('.finale').classList.add('celebrate');
    tone('done');
  });
})();
