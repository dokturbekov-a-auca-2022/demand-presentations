(() => {
  'use strict';

  const scenes = [...document.querySelectorAll('.scene')];
  const prevBtn = document.querySelector('#prevBtn');
  const nextBtn = document.querySelector('#nextBtn');
  const sceneCount = document.querySelector('#sceneCount');
  const sceneLabel = document.querySelector('#sceneLabel');
  const navProgress = document.querySelector('#navProgress');
  const mapBtn = document.querySelector('#mapBtn');
  const mapDialog = document.querySelector('#starMap');
  const mapClose = document.querySelector('#mapClose');
  const mapZones = document.querySelector('#mapZones');
  const focusBtn = document.querySelector('#focusBtn');
  const soundBtn = document.querySelector('#soundBtn');
  const achievement = document.querySelector('#achievement');
  const STORE = 'lesson30-language-observatory-v3';
  let current = 0;
  let soundOn = true;
  let audioContext;
  let achievementTimer;
  const earned = new Set();

  function readStore() {
    try { return JSON.parse(localStorage.getItem(STORE) || '{}'); }
    catch { return {}; }
  }

  function writeStore(partial) {
    try { localStorage.setItem(STORE, JSON.stringify({ ...readStore(), ...partial })); }
    catch { /* Private browsing can disable storage; the lesson remains usable. */ }
  }

  function tone(frequency = 620, duration = .08) {
    if (!soundOn) return;
    try {
      audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(.035, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(.001, audioContext.currentTime + duration);
      oscillator.connect(gain).connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + duration);
    } catch { /* Visual feedback always remains available. */ }
  }

  function toast(message, key = message) {
    if (earned.has(key)) return;
    earned.add(key);
    achievement.querySelector('p').textContent = message;
    achievement.classList.add('show');
    clearTimeout(achievementTimer);
    achievementTimer = setTimeout(() => achievement.classList.remove('show'), 2200);
    tone(760, .12);
  }

  function showScene(index, direction = 1) {
    const next = Math.max(0, Math.min(scenes.length - 1, index));
    if (next === current && scenes[next].classList.contains('active')) return;
    window.speechSynthesis?.cancel?.();
    scenes[current]?.classList.remove('active');
    current = next;
    const scene = scenes[current];
    scene.classList.add('active');
    scene.dataset.direction = direction > 0 ? 'forward' : 'back';
    scene.scrollTop = 0;
    sceneCount.textContent = `${current + 1} / ${scenes.length}`;
    sceneLabel.textContent = scene.dataset.zone || 'Mission';
    navProgress.style.width = `${((current + 1) / scenes.length) * 100}%`;
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === scenes.length - 1;
    document.querySelectorAll('.map-zone button').forEach((button) => button.classList.toggle('current', Number(button.dataset.jump) === current));
    tone(direction > 0 ? 420 : 330, .045);
  }

  function buildMap() {
    const zones = new Map();
    scenes.forEach((scene, index) => {
      const zone = scene.dataset.zone || 'Mission';
      if (!zones.has(zone)) zones.set(zone, []);
      zones.get(zone).push({ title: scene.dataset.title, index });
    });
    mapZones.innerHTML = [...zones.entries()].map(([zone, entries]) => `
      <section class="map-zone">
        <h3>${zone}</h3>
        ${entries.map(({ title, index }) => `<button type="button" data-jump="${index}">${String(index + 1).padStart(2, '0')} · ${title}</button>`).join('')}
      </section>`).join('');
    mapZones.addEventListener('click', (event) => {
      const button = event.target.closest('[data-jump]');
      if (!button) return;
      const target = Number(button.dataset.jump);
      mapDialog.close();
      showScene(target, target >= current ? 1 : -1);
    });
  }

  prevBtn.addEventListener('click', () => showScene(current - 1, -1));
  nextBtn.addEventListener('click', () => showScene(current + 1, 1));
  document.querySelectorAll('[data-go]').forEach((button) => button.addEventListener('click', () => showScene(Number(button.dataset.go), 1)));
  mapBtn.addEventListener('click', () => mapDialog.showModal());
  mapClose.addEventListener('click', () => mapDialog.close());
  mapDialog.addEventListener('click', (event) => {
    if (event.target === mapDialog) mapDialog.close();
  });

  focusBtn.addEventListener('click', () => {
    const active = document.body.classList.toggle('focus-mode');
    focusBtn.setAttribute('aria-pressed', String(active));
    focusBtn.textContent = active ? 'Exit focus' : 'Focus';
  });

  soundBtn.addEventListener('click', () => {
    soundOn = !soundOn;
    soundBtn.setAttribute('aria-pressed', String(soundOn));
    soundBtn.textContent = soundOn ? 'Sound on' : 'Sound off';
    if (!soundOn) window.speechSynthesis?.cancel?.();
    else tone(680, .1);
  });

  document.addEventListener('keydown', (event) => {
    const tag = document.activeElement?.tagName;
    const editing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(tag);
    if (editing) return;
    if (event.key === 'ArrowRight' || event.key === 'PageDown') { event.preventDefault(); showScene(current + 1, 1); }
    if (event.key === 'ArrowLeft' || event.key === 'PageUp') { event.preventDefault(); showScene(current - 1, -1); }
    if (event.key.toLowerCase() === 'm' && !mapDialog.open) mapDialog.showModal();
    if (event.key.toLowerCase() === 'f') focusBtn.click();
    if (event.key === 'Escape' && mapDialog.open) mapDialog.close();
  });

  let touchStart = null;
  document.addEventListener('touchstart', (event) => {
    if (event.touches.length !== 1) { touchStart = null; return; }
    const touch = event.touches[0];
    touchStart = { x: touch.clientX, y: touch.clientY, target: event.target };
  }, { passive: true });
  document.addEventListener('touchend', (event) => {
    if (!touchStart || event.changedTouches.length !== 1) return;
    if (touchStart.target.closest('button, input, label, dialog, .case-file, .test-card, .orbit-planner')) { touchStart = null; return; }
    const touch = event.changedTouches[0];
    const dx = touch.clientX - touchStart.x;
    const dy = touch.clientY - touchStart.y;
    if (Math.abs(dx) > 58 && Math.abs(dx) > Math.abs(dy) * 1.25) showScene(current + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
    touchStart = null;
  }, { passive: true });

  document.querySelectorAll('[data-confidence]').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-confidence]').forEach((item) => item.classList.remove('selected'));
      button.classList.add('selected');
      const label = button.querySelector('b').textContent;
      document.querySelector('#confidenceStatus').textContent = `${label} recorded. Compare it with your final signal later.`;
      writeStore({ confidence: Number(button.dataset.confidence) });
      toast('Starting signal recorded', 'confidence');
    });
  });

  document.querySelectorAll('[data-reveal]').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-reveal]').forEach((item) => item.classList.remove('selected'));
      document.querySelectorAll('.reveal-note').forEach((note) => note.classList.remove('open'));
      button.classList.add('selected');
      document.querySelector(`#${button.dataset.reveal}`).classList.add('open');
      tone(540, .07);
    });
  });

  const meteorField = document.querySelector('#meteorField');
  document.querySelector('#meteorShuffle').addEventListener('click', () => {
    [...meteorField.children].sort(() => Math.random() - .5).forEach((node) => meteorField.append(node));
    meteorField.querySelectorAll('button').forEach((button) => button.classList.remove('selected'));
    toast('Meteor field reshuffled', 'meteor-shuffle');
  });
  meteorField.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;
    button.classList.toggle('selected');
    tone(590, .05);
  });

  document.querySelectorAll('[data-quiz]').forEach((quiz) => {
    quiz.querySelectorAll('.choice-stack button').forEach((button) => {
      button.addEventListener('click', () => {
        quiz.querySelectorAll('button').forEach((item) => item.classList.remove('correct', 'wrong'));
        const correct = button.dataset.correct === 'true';
        button.classList.add(correct ? 'correct' : 'wrong');
        quiz.querySelector('.answer-explain').style.opacity = '1';
        tone(correct ? 720 : 220, .08);
        if (correct) toast('Grammar signal locked', quiz.dataset.quiz);
      });
    });
  });

  document.querySelectorAll('[data-select-one]').forEach((group) => {
    const status = group.parentElement.querySelector('[data-selection-status]');
    group.querySelectorAll('button').forEach((button) => button.addEventListener('click', () => {
      group.querySelectorAll('button').forEach((item) => item.classList.remove('selected'));
      button.classList.add('selected');
      status.textContent = button.dataset.message;
      tone(560, .07);
    }));
  });

  document.querySelectorAll('[data-balance] button').forEach((button) => button.addEventListener('click', () => {
    const scale = button.closest('[data-balance]');
    scale.querySelectorAll('button').forEach((item) => item.classList.remove('selected'));
    button.classList.add('selected');
    document.querySelector('.balance-feedback').textContent = button.dataset.side === 'result'
      ? 'Result is in focus: three pages are complete.'
      : 'Duration is in focus: the activity continued for two hours.';
    tone(610, .07);
  }));

  document.querySelectorAll('[data-gate-answer]').forEach((button) => button.addEventListener('click', () => {
    document.querySelectorAll('[data-gate-answer]').forEach((item) => item.classList.remove('open'));
    button.classList.add('open');
    document.querySelector('#gatePrompt').textContent = button.dataset.gateAnswer === 'real'
      ? 'First conditional: a real or likely future result.'
      : 'Second conditional: an unlikely or imaginary present/future.';
    tone(580, .08);
  }));

  document.querySelector('#spotlightSwitch').addEventListener('click', () => {
    const articles = document.querySelectorAll('.spotlight-console article');
    articles.forEach((article) => article.classList.remove('active'));
    articles[1].classList.add('active');
    document.querySelector('#passiveOutput').textContent = 'The robot was designed by researchers.';
    toast('Focus shifted to the robot', 'passive');
  });

  document.querySelectorAll('.relay-choices button').forEach((button) => button.addEventListener('click', () => {
    document.querySelectorAll('.relay-choices button').forEach((item) => item.classList.remove('correct', 'wrong'));
    const correct = button.dataset.correct === 'true';
    button.classList.add(correct ? 'correct' : 'wrong');
    document.querySelector('.relay-track .answer-explain').innerHTML = correct
      ? '<b>Correct relay:</b> I → she, am finishing → was finishing, now → then.'
      : '<b>Signal lost:</b> check the pronoun, backshift and time word.';
    tone(correct ? 720 : 220, .08);
    if (correct) toast('Message relayed accurately', 'reported');
  }));

  let selectedCapsule = null;
  document.querySelector('#dockGame').addEventListener('click', (event) => {
    const capsule = event.target.closest('.capsules button');
    const station = event.target.closest('[data-station]');
    if (capsule && !capsule.classList.contains('docked')) {
      document.querySelectorAll('.capsules button').forEach((item) => item.classList.remove('selected'));
      selectedCapsule = capsule;
      capsule.classList.add('selected');
      tone(420, .05);
      return;
    }
    if (!station || !selectedCapsule) return;
    if (selectedCapsule.dataset.dock === station.dataset.station) {
      const token = document.createElement('i');
      token.textContent = selectedCapsule.textContent;
      station.querySelector('span').append(token);
      selectedCapsule.classList.add('docked');
      selectedCapsule.classList.remove('selected');
      selectedCapsule = null;
      tone(720, .08);
      if (document.querySelectorAll('.capsules button.docked').length === 6) toast('All verb capsules docked', 'docking');
    } else {
      station.animate([{ transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'none' }], { duration: 260 });
      tone(190, .08);
    }
  });

  let fixedErrors = 0;
  document.querySelectorAll('#errorMessage [data-fix]').forEach((button) => button.addEventListener('click', () => {
    if (button.classList.contains('fixed')) return;
    button.textContent = button.dataset.fix;
    button.classList.add('fixed');
    fixedErrors += 1;
    document.querySelector('#scannerCount').textContent = `${fixedErrors} / 4 glitches repaired`;
    tone(650, .06);
    if (fixedErrors === 4) toast('Transmission fully repaired', 'scanner');
  }));

  const sortWords = [
    ['reliable', 'personality'], ['boarding pass', 'travel'], ['deadline', 'business'], ['relieved', 'emotion'],
    ['stubborn', 'personality'], ['platform', 'travel'], ['profit', 'business'], ['anxious', 'emotion']
  ];
  let sortIndex = 0;
  let sortScore = 0;
  function renderSortWord() {
    const entry = sortWords[sortIndex];
    document.querySelector('#sortWord').textContent = entry ? entry[0] : 'complete';
  }
  document.querySelectorAll('.sort-options button').forEach((button) => button.addEventListener('click', () => {
    if (sortIndex >= sortWords.length) return;
    const correct = button.dataset.category === sortWords[sortIndex][1];
    if (correct) {
      sortScore += 1;
      document.querySelector('#sortScore').textContent = sortScore;
      document.querySelector('#sortFeedback').textContent = `Correct: ${sortWords[sortIndex][0]} belongs to ${sortWords[sortIndex][1]}.`;
      sortIndex += 1;
      tone(720, .07);
      setTimeout(renderSortWord, 340);
      if (sortIndex === sortWords.length) toast('Vocabulary clusters mapped', 'sorter');
    } else {
      document.querySelector('#sortFeedback').textContent = 'Try another galaxy. Use meaning and context.';
      tone(190, .07);
    }
  }));

  const collocations = { make: 'decision', take: 'risk', do: 'research', pay: 'attention' };
  let selectedVerb = null;
  const matchedVerbs = new Set();
  document.querySelectorAll('[data-verb]').forEach((button) => button.addEventListener('click', () => {
    if (matchedVerbs.has(button.dataset.verb)) return;
    document.querySelectorAll('[data-verb]').forEach((item) => item.classList.remove('selected'));
    selectedVerb = button.dataset.verb;
    button.classList.add('selected');
    document.querySelector('#magnetOutput').textContent = `${selectedVerb} + …`;
  }));
  document.querySelectorAll('[data-noun]').forEach((button) => button.addEventListener('click', () => {
    if (!selectedVerb || button.classList.contains('matched')) return;
    if (collocations[selectedVerb] === button.dataset.noun) {
      const verbButton = document.querySelector(`[data-verb="${selectedVerb}"]`);
      verbButton.classList.remove('selected');
      verbButton.classList.add('matched');
      button.classList.add('matched');
      matchedVerbs.add(selectedVerb);
      document.querySelector('#magnetOutput').textContent = `${selectedVerb} ${button.textContent} — natural pair locked.`;
      selectedVerb = null;
      tone(720, .08);
      if (matchedVerbs.size === 4) toast('Four collocations magnetised', 'collocations');
    } else {
      document.querySelector('#magnetOutput').textContent = `“${selectedVerb} ${button.textContent}” is not the target pair. Try again.`;
      tone(180, .08);
    }
  }));

  document.querySelectorAll('.particle-ring button').forEach((button) => button.addEventListener('click', () => {
    document.querySelectorAll('.particle-ring button').forEach((item) => item.classList.remove('selected'));
    button.classList.add('selected');
    document.querySelector('#airlockMeaning').innerHTML = `<b>look ${button.textContent}</b> = ${button.dataset.definition}`;
    tone(590, .06);
  }));

  document.querySelectorAll('[data-case-answer]').forEach((button) => button.addEventListener('click', () => {
    document.querySelectorAll('[data-case-answer]').forEach((item) => item.classList.remove('correct', 'wrong'));
    const correct = button.dataset.caseAnswer === 'true';
    button.classList.add(correct ? 'correct' : 'wrong');
    document.querySelector('#caseFeedback').textContent = correct
      ? 'Correct. It covers the origin, several benefits and wider influence.'
      : 'Too narrow or too absolute. Look for an idea that covers the whole paragraph.';
    tone(correct ? 720 : 190, .08);
    if (correct) toast('Main message located', 'reading-main');
  }));

  const evidence = {
    cause: '“After local businesses donated soil and tools, other buildings copied the idea.”',
    benefit: '“They cool the buildings, create spaces where neighbours meet, and give insects a place to live.”',
    tone: 'Yes. The writer says the gardens “cannot solve every environmental problem,” then explains their practical influence.'
  };
  document.querySelectorAll('[data-evidence]').forEach((button) => button.addEventListener('click', () => {
    document.querySelectorAll('[data-evidence]').forEach((item) => item.classList.remove('selected'));
    button.classList.add('selected');
    document.querySelector('#evidenceQuote').textContent = evidence[button.dataset.evidence];
    tone(610, .06);
  }));

  const transcriptText = document.querySelector('#transcript').textContent.trim();
  const waveform = document.querySelector('.waveform');
  document.querySelector('#playTransmission').addEventListener('click', () => {
    if (!soundOn) {
      document.querySelector('#speechFallback').textContent = 'Sound is off. Turn it on or use the transcript.';
      return;
    }
    if (!('speechSynthesis' in window)) {
      document.querySelector('#speechFallback').textContent = 'System voice is unavailable. Use Show transcript.';
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(transcriptText);
    utterance.lang = 'en-US';
    utterance.rate = .9;
    utterance.pitch = 1;
    utterance.onstart = () => waveform.classList.add('playing');
    utterance.onend = () => waveform.classList.remove('playing');
    utterance.onerror = () => {
      waveform.classList.remove('playing');
      document.querySelector('#speechFallback').textContent = 'System voice could not play. Use Show transcript.';
    };
    window.speechSynthesis.speak(utterance);
  });
  document.querySelector('#transcriptToggle').addEventListener('click', (event) => {
    const transcript = document.querySelector('#transcript');
    const open = transcript.classList.toggle('open');
    event.currentTarget.textContent = open ? 'Hide transcript' : 'Show transcript';
    event.currentTarget.setAttribute('aria-expanded', String(open));
  });
  const transmissionAnswers = {
    gate: 'The flight moved from Gate 6 to Gate 9, and boarding is twenty minutes later.',
    reason: 'A technical check caused the change.',
    priority: 'Passengers with small children may board first.'
  };
  document.querySelectorAll('[data-answer]').forEach((button) => button.addEventListener('click', () => {
    document.querySelectorAll('[data-answer]').forEach((item) => item.classList.remove('selected'));
    button.classList.add('selected');
    document.querySelector('#transmissionAnswer').textContent = transmissionAnswers[button.dataset.answer];
    tone(620, .06);
  }));

  const stressMeanings = {
    I: 'I did not say it; someone else did.',
    "didn't": 'I deny saying it.',
    say: 'I may have suggested or implied it, but I did not say it.',
    she: 'I said someone else stole it.',
    stole: 'She may have borrowed or moved it, but did not steal it.',
    the: 'It was that specific map.',
    map: 'She stole something else, not the map.'
  };
  document.querySelectorAll('[data-stress]').forEach((button) => button.addEventListener('click', () => {
    document.querySelectorAll('[data-stress]').forEach((item) => item.classList.remove('selected'));
    button.classList.add('selected');
    document.querySelector('#stressMeaning').textContent = stressMeanings[button.dataset.stress];
    tone(520 + Math.random() * 180, .06);
  }));

  const speakingPrompts = [
    'Should schools start later in the morning?',
    'Which invention has changed daily life the most?',
    'Can social media make friendships stronger?',
    'Would you rather work from home or in a team office?',
    'What habit would you like to change, and why?',
    'Is travelling more valuable than buying things?',
    'Describe a film or book that changed your opinion.',
    'If you could improve one thing in your city, what would it be?'
  ];
  let promptIndex = -1;
  document.querySelector('#rouletteBtn').addEventListener('click', () => {
    let next;
    do { next = Math.floor(Math.random() * speakingPrompts.length); } while (next === promptIndex && speakingPrompts.length > 1);
    promptIndex = next;
    const target = document.querySelector('#speakingPrompt');
    target.animate([{ opacity: 0, transform: 'scale(.75) rotate(-4deg)' }, { opacity: 1, transform: 'none' }], { duration: 420 });
    target.textContent = speakingPrompts[promptIndex];
    tone(680, .1);
  });

  let timerValue = 60;
  let timerRun;
  const timerDisplay = document.querySelector('#speakingTimer');
  function updateTimer(value) {
    timerValue = Math.max(30, Math.min(120, value));
    timerDisplay.textContent = timerValue;
    timerDisplay.classList.toggle('urgent', timerValue <= 10);
  }
  document.querySelector('#timerMinus').addEventListener('click', () => { clearInterval(timerRun); updateTimer(timerValue - 15); });
  document.querySelector('#timerPlus').addEventListener('click', () => { clearInterval(timerRun); updateTimer(timerValue + 15); });
  document.querySelector('#timerStart').addEventListener('click', (event) => {
    clearInterval(timerRun);
    const initial = timerValue;
    event.currentTarget.textContent = 'Running';
    timerRun = setInterval(() => {
      updateTimer(timerValue - 1);
      if (timerValue <= 0) {
        clearInterval(timerRun);
        event.currentTarget.textContent = 'Restart';
        tone(880, .25);
        toast('Orbit complete—pass the question', `timer-${Date.now()}`);
        setTimeout(() => updateTimer(initial), 1000);
      }
    }, 1000);
  });

  const testQuestions = [
    { category: 'Present forms', q: 'Nura usually ___ coffee, but today she ___ tea.', choices: ['drinks · is having', 'is drinking · has', 'has drunk · had'], answer: 0 },
    { category: 'Past forms', q: 'I ___ home when I ___ the accident.', choices: ['walked · was seeing', 'was walking · saw', 'had walked · see'], answer: 1 },
    { category: 'Present perfect continuous', q: 'They ___ for the bus for forty minutes.', choices: ['have been waiting', 'are waiting yesterday', 'waited since'], answer: 0 },
    { category: 'Past perfect', q: 'By the time we arrived, the film ___.', choices: ['already started', 'had already started', 'was already starting tomorrow'], answer: 1 },
    { category: 'Future continuous', q: 'At this time tomorrow, I ___ to Almaty.', choices: ['will travel yesterday', 'will be travelling', 'am travelled'], answer: 1 },
    { category: 'Second conditional', q: 'If I ___ more confident, I would join the debate.', choices: ['am', 'were', 'will be'], answer: 1 },
    { category: 'Passive voice', q: 'The first smartphone ___ in the 1990s.', choices: ['developed people', 'was developed', 'has develop'], answer: 1 },
    { category: 'Reported speech', q: '“I can help,” Dani said. → Dani said that he ___.', choices: ['could help', 'can helps', 'helped can'], answer: 0 },
    { category: 'Relative clauses', q: 'A paramedic is a person ___ gives emergency medical help.', choices: ['which', 'who', 'where'], answer: 1 },
    { category: 'Used to', q: 'I ___ be afraid of dogs, but now I love them.', choices: ['used to', 'am used', 'use for'], answer: 0 },
    { category: 'Gerunds & infinitives', q: 'She suggested ___ the earlier train.', choices: ['to take', 'taking', 'take to'], answer: 1 },
    { category: 'Question tags', q: 'You have finished the task, ___?', choices: ['haven’t you', 'don’t you', 'have you'], answer: 0 },
    { category: 'Linking words', q: 'The plan is expensive; ___, it could save time later.', choices: ['because', 'however', 'for example of'], answer: 1 },
    { category: 'Collocations', q: 'Before making a decision, we should ___ research.', choices: ['make', 'do', 'pay'], answer: 1 },
    { category: 'Reading meaning', q: 'If a writer gives three examples after a claim, the examples usually ___ the claim.', choices: ['support', 'cancel', 'hide'], answer: 0 }
  ];
  let testIndex = 0;
  let testAnswers = Array(testQuestions.length).fill(null);
  let testSubmitted = false;

  function renderTest() {
    const item = testQuestions[testIndex];
    document.querySelector('#testNumber').textContent = `Question ${testIndex + 1} / ${testQuestions.length}`;
    document.querySelector('#testCategory').textContent = item.category;
    document.querySelector('#testQuestion').textContent = item.q;
    document.querySelector('#testChoices').innerHTML = item.choices.map((choice, index) => `<button type="button" data-test-choice="${index}" class="${testAnswers[testIndex] === index ? 'selected' : ''}">${String.fromCharCode(65 + index)} · ${choice}</button>`).join('');
    document.querySelector('#testProgressBar').style.width = `${((testIndex + 1) / testQuestions.length) * 100}%`;
    document.querySelector('#testPrev').disabled = testIndex === 0;
    document.querySelector('#testNext').style.display = testIndex === testQuestions.length - 1 ? 'none' : '';
    document.querySelector('#testSubmit').style.display = testIndex === testQuestions.length - 1 ? 'inline-block' : 'none';
    document.querySelector('#testNext').disabled = false;
  }
  document.querySelector('#testChoices').addEventListener('click', (event) => {
    const button = event.target.closest('[data-test-choice]');
    if (!button || testSubmitted) return;
    testAnswers[testIndex] = Number(button.dataset.testChoice);
    document.querySelectorAll('[data-test-choice]').forEach((item) => item.classList.remove('selected'));
    button.classList.add('selected');
    tone(540, .05);
  });
  document.querySelector('#testPrev').addEventListener('click', () => { testIndex = Math.max(0, testIndex - 1); renderTest(); });
  document.querySelector('#testNext').addEventListener('click', () => { testIndex = Math.min(testQuestions.length - 1, testIndex + 1); renderTest(); });
  document.querySelector('#testSubmit').addEventListener('click', () => {
    const missing = testAnswers.filter((answer) => answer === null).length;
    if (missing) {
      document.querySelector('#testQuestion').textContent = `${missing} question${missing === 1 ? ' is' : 's are'} unanswered. Use Previous to complete them, or submit again to finish now.`;
      if (document.querySelector('#testSubmit').dataset.confirm === 'true') finishTest();
      else document.querySelector('#testSubmit').dataset.confirm = 'true';
      tone(210, .1);
      return;
    }
    finishTest();
  });

  function finishTest() {
    testSubmitted = true;
    const score = testQuestions.reduce((total, item, index) => total + (testAnswers[index] === item.answer ? 1 : 0), 0);
    writeStore({ testScore: score, testAnswers });
    renderResult(score);
    document.querySelector('#testSubmit').textContent = `Saved · ${score}/${testQuestions.length}`;
    document.querySelector('#testSubmit').disabled = true;
    toast(`Test constellation mapped: ${score}/${testQuestions.length}`, 'test-complete');
    setTimeout(() => showScene(29, 1), 650);
  }

  function renderResult(score) {
    const finalScore = document.querySelector('#finalScore');
    const title = document.querySelector('#resultTitle');
    const message = document.querySelector('#resultMessage');
    const marker = document.querySelector('#bandMarker');
    finalScore.textContent = score;
    marker.style.left = `${Math.max(2, Math.min(98, (score / testQuestions.length) * 100))}%`;
    if (score <= 6) {
      title.textContent = 'A2 bridge · rebuild core signals';
      message.textContent = 'You recognise useful English, but some grammar systems need deliberate repair. Use examples, short daily practice and feedback. This is a classroom estimate, not an official level certificate.';
    } else if (score <= 11) {
      title.textContent = 'Strong A2 · preparing for B1';
      message.textContent = 'Your core systems are working. Focus next on flexible vocabulary, longer listening and explaining ideas with less preparation. This is a classroom estimate, not an official level certificate.';
    } else {
      title.textContent = 'B1 orbit · strengthen independence';
      message.textContent = 'You can manage connected language across many course topics. Build speed, precision and confidence in unfamiliar situations. This is a classroom estimate, not an official level certificate.';
    }
  }

  const planner = document.querySelector('#orbitPlanner');
  planner.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(planner);
    const target = data.get('target');
    const method = data.get('method');
    if (!target || !method) {
      document.querySelector('#planOutput').textContent = 'Choose both a target and a daily mission.';
      tone(190, .07);
      return;
    }
    const plan = `For 7 days: ${method} to improve ${target}.`;
    document.querySelector('#planOutput').textContent = plan;
    writeStore({ plan: { target, method } });
    toast('Seven-day orbit saved', 'planner');
  });

  document.querySelectorAll('#exitBuilder button').forEach((button) => button.addEventListener('click', () => {
    document.querySelectorAll('#exitBuilder button').forEach((item) => item.classList.remove('selected'));
    button.classList.add('selected');
    document.querySelector('#finalLine').textContent = `Next, I will ${button.textContent}.`;
    writeStore({ exit: button.textContent });
    toast('Final transmission complete', 'exit');
  }));

  function restoreState() {
    const state = readStore();
    if (state.confidence) document.querySelector(`[data-confidence="${state.confidence}"]`)?.click();
    if (Number.isInteger(state.testScore)) {
      if (Array.isArray(state.testAnswers) && state.testAnswers.length === testQuestions.length) testAnswers = state.testAnswers;
      testSubmitted = true;
      renderResult(state.testScore);
      document.querySelector('#testSubmit').textContent = `Saved · ${state.testScore}/${testQuestions.length}`;
    }
    if (state.plan) {
      planner.querySelector(`[name="target"][value="${state.plan.target}"]`)?.setAttribute('checked', 'checked');
      planner.querySelector(`[name="method"][value="${state.plan.method}"]`)?.setAttribute('checked', 'checked');
      document.querySelector('#planOutput').textContent = `For 7 days: ${state.plan.method} to improve ${state.plan.target}.`;
    }
    if (state.exit) document.querySelector('#finalLine').textContent = `Next, I will ${state.exit}.`;
  }

  buildMap();
  renderSortWord();
  renderTest();
  restoreState();
  showScene(0, 1);
})();
