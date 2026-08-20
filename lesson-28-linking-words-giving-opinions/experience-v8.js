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
  const roundNumber = document.getElementById('roundNumber');
  const roundName = document.getElementById('roundName');
  let current = 0;
  let activeTimer = null;
  let audioContext = null;

  const sound = type => {
    try {
      audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      const now = audioContext.currentTime;
      const settings = {
        pop: [520, 760, .11],
        correct: [660, 990, .16],
        wrong: [180, 120, .16],
        spin: [280, 520, .22]
      }[type] || [440, 660, .1];
      oscillator.frequency.setValueAtTime(settings[0], now);
      oscillator.frequency.exponentialRampToValueAtTime(settings[1], now + settings[2]);
      gain.gain.setValueAtTime(.0001, now);
      gain.gain.exponentialRampToValueAtTime(.08, now + .015);
      gain.gain.exponentialRampToValueAtTime(.0001, now + settings[2]);
      oscillator.start(now);
      oscillator.stop(now + settings[2] + .02);
    } catch { /* Visual feedback remains available when Web Audio is blocked. */ }
  };

  const closePanels = () => {
    map.classList.remove('open');
    note.classList.remove('open');
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
      const button = audio.closest('.audio-strip')?.querySelector('.audio-play');
      button?.classList.remove('playing');
      if (button?.dataset.label) button.textContent = button.dataset.label;
    });
  };

  map.innerHTML = scenes.map((scene,index) => `<button type="button" data-jump="${index}"><b>${String(index + 1).padStart(2,'0')}</b><span>${scene.dataset.title}</span></button>`).join('');

  const updateNote = () => {
    const scene = scenes[current];
    note.innerHTML = `<h3>${scene.dataset.title}</h3><p>${scene.dataset.note}</p>`;
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
    const [number,name] = scene.dataset.round.split('|');
    roundNumber.textContent = number;
    roundName.textContent = name;
    document.querySelectorAll('[data-jump]').forEach((button,indexValue) => button.classList.toggle('active',indexValue === current));
    updateNote();
    closePanels();
    history.replaceState(null,'',`#scene-${current + 1}`);
  };

  window.show = show;
  current = Math.max(0, Math.min(total - 1, Number(location.hash.replace('#scene-','')) - 1 || 0));
  scenes.forEach(scene => scene.classList.remove('active'));
  show(current);

  prev.addEventListener('click', () => show(current - 1,-1));
  next.addEventListener('click', () => show(current + 1,1));
  document.getElementById('begin').addEventListener('click', () => { sound('pop'); show(1,1); });

  map.addEventListener('click', event => {
    const button = event.target.closest('[data-jump]');
    if (button) show(Number(button.dataset.jump), Number(button.dataset.jump) > current ? 1 : -1);
  });
  document.getElementById('mapBtn').addEventListener('click', () => { note.classList.remove('open'); map.classList.toggle('open'); });
  document.getElementById('noteBtn').addEventListener('click', () => { map.classList.remove('open'); note.classList.toggle('open'); });
  document.addEventListener('keydown', event => {
    if (event.target.matches('button,input,textarea,select')) return;
    if (event.key === 'ArrowRight' || event.key === 'PageDown') show(current + 1,1);
    if (event.key === 'ArrowLeft' || event.key === 'PageUp') show(current - 1,-1);
    if (event.key === 'Escape') closePanels();
  });

  let touch = null;
  let gestureActive = false;
  const viewportScale = () => window.visualViewport?.scale || 1;
  document.addEventListener('gesturestart', () => { gestureActive = true; }, { passive: true });
  document.addEventListener('gestureend', () => { window.setTimeout(() => { gestureActive = false; },250); }, { passive: true });
  deck.addEventListener('touchstart', event => {
    if (event.touches.length !== 1 || viewportScale() > 1.02 || event.target.closest('button,audio,.nav,.tools')) {
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
    if (elapsed > 900 || Math.abs(dx) < 88 || Math.abs(dx) < Math.abs(dy) * 1.6) return;
    show(current + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
  }, { passive: true });

  const selectOne = (container, callback) => {
    container.addEventListener('click', event => {
      const button = event.target.closest('button');
      if (!button) return;
      container.querySelectorAll('button').forEach(item => item.classList.remove('selected','correct','wrong'));
      button.classList.add('selected');
      callback(button);
    });
  };

  selectOne(document.getElementById('hotTakes'), button => {
    sound('pop');
    document.getElementById('hotTakeOut').textContent = `Your opinion: "I think ${button.dataset.topic}."`;
  });

  selectOne(document.getElementById('pizzaVote'), button => {
    sound('pop');
    document.getElementById('pizzaOut').textContent = `${button.dataset.vote}. Now explain why with because.`;
  });

  selectOne(document.getElementById('opinionStarters'), button => {
    sound('pop');
    const models = {
      direct: '"I think school should start later."',
      clear: '"In my opinion, school should start later."',
      personal: '"From my point of view, school should start later."'
    };
    document.getElementById('starterOut').textContent = models[button.dataset.tone];
  });

  selectOne(document.getElementById('reasonOptions'), button => {
    const correct = button.dataset.correct === 'true';
    button.classList.add(correct ? 'correct' : 'wrong');
    sound(correct ? 'correct' : 'wrong');
    document.getElementById('reasonFinish').textContent = button.textContent;
    document.getElementById('reasonOut').textContent = correct ? 'Correct: this detail explains why online notes are useful.' : 'This detail does not explain the opinion. Try the option that answers "Why?"';
  });

  selectOne(document.getElementById('contrastStage'), button => {
    sound('pop');
    document.getElementById('contrastOut').textContent = button.dataset.model;
  });

  let resultOrder = 1;
  document.getElementById('resultChain').addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    const order = Number(button.dataset.order);
    if (order !== resultOrder) {
      sound('wrong');
      document.getElementById('resultOut').textContent = `Open part ${resultOrder} first.`;
      return;
    }
    button.classList.add('open');
    sound('correct');
    resultOrder += 1;
    document.getElementById('resultOut').textContent = resultOrder > 3 ? 'Complete: cause + so + result.' : `Now open part ${resultOrder}.`;
  });

  selectOne(document.getElementById('exampleChoice'), button => {
    const correct = button.dataset.correct === 'true';
    button.classList.add(correct ? 'correct' : 'wrong');
    sound(correct ? 'correct' : 'wrong');
    document.getElementById('exampleOut').textContent = correct ? 'Correct: planning and communication are useful skills.' : 'A controller colour does not prove that games teach useful skills.';
  });

  document.getElementById('additionReveal').addEventListener('click', () => {
    document.getElementById('additionLine').classList.toggle('open');
    sound('pop');
  });

  let punctuationScore = 0;
  document.getElementById('punctuationQuiz').addEventListener('click', event => {
    const button = event.target.closest('button');
    const row = event.target.closest('[data-answer]');
    if (!button || !row || row.dataset.complete === 'true') return;
    const correct = button.dataset.choice === row.dataset.answer;
    button.classList.add(correct ? 'correct' : 'wrong');
    sound(correct ? 'correct' : 'wrong');
    if (correct) {
      row.dataset.complete = 'true';
      punctuationScore += 1;
    }
    document.getElementById('punctuationOut').textContent = `${punctuationScore} / 4 patterns correct.`;
  });

  document.getElementById('repairLines').addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    button.classList.add('repaired');
    const number = button.querySelector('b').outerHTML;
    button.innerHTML = `${number}${button.dataset.clean}`;
    sound('correct');
  });

  let speedScore = 0;
  document.getElementById('speedQuiz').addEventListener('click', event => {
    const button = event.target.closest('button');
    const row = event.target.closest('[data-answer]');
    if (!button || !row || row.dataset.complete === 'true') return;
    const choice = button.textContent.trim().toLowerCase();
    const correct = choice === row.dataset.answer.toLowerCase();
    button.classList.add(correct ? 'correct' : 'wrong');
    sound(correct ? 'correct' : 'wrong');
    if (correct) {
      row.dataset.complete = 'true';
      speedScore += 1;
    }
    document.getElementById('speedOut').textContent = `Score: ${speedScore} / 7`;
  });

  selectOne(document.getElementById('phonePrompts'), button => {
    sound('pop');
    document.getElementById('phoneModel').textContent = button.dataset.model;
  });

  document.querySelectorAll('.audio-play').forEach(button => {
    const audio = button.closest('.audio-strip').querySelector('audio');
    button.dataset.label = button.textContent;
    button.addEventListener('click', () => {
      if (audio.paused) {
        pauseAudio();
        audio.play().then(() => {
          button.classList.add('playing');
          button.textContent = 'PAUSE';
        }).catch(() => { button.textContent = 'TAP AGAIN TO PLAY'; });
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

  document.getElementById('listenJobs').addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    button.classList.toggle('revealed');
    sound('pop');
    document.getElementById('listenOut').textContent = button.classList.contains('revealed') ? `Line ${button.textContent}: ${button.dataset.answer}.` : 'Answer hidden again.';
  });

  selectOne(document.getElementById('dialogueVote'), button => {
    const correct = button.dataset.answer === 'partial';
    button.classList.add(correct ? 'correct' : 'wrong');
    sound(correct ? 'correct' : 'wrong');
    document.getElementById('dialogueOut').textContent = correct ? 'Correct. They agree that rest matters, but they disagree about removing all homework.' : 'Listen again for "I agree that... However..."';
  });

  selectOne(document.getElementById('replyLadder'), button => {
    sound('pop');
    const prompts = {
      agree: 'Complete: "I agree because..."',
      partial: 'Complete: "I agree that rest matters, but..."',
      different: 'Complete: "I see your point. However,..."',
      clarify: 'Ask: "What makes you think homework should disappear?"'
    };
    document.getElementById('replyOut').textContent = prompts[button.dataset.start];
  });

  document.getElementById('commentLines').addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    if (!button.dataset.original) button.dataset.original = button.textContent;
    button.classList.toggle('revealed');
    button.textContent = button.classList.contains('revealed') ? button.dataset.better : button.dataset.original;
    sound('pop');
  });

  document.getElementById('readingJobs').addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    const span = button.querySelector('span');
    if (!button.dataset.question) button.dataset.question = span.textContent;
    button.classList.toggle('revealed');
    span.textContent = button.classList.contains('revealed') ? button.dataset.answer : button.dataset.question;
    sound('pop');
  });

  let balanceOrder = 1;
  document.getElementById('balanceSteps').addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    const order = Number(button.dataset.order);
    if (order !== balanceOrder) {
      sound('wrong');
      document.getElementById('balanceOut').textContent = `Open part ${balanceOrder} first.`;
      return;
    }
    button.classList.add('open');
    sound('correct');
    balanceOrder += 1;
    document.getElementById('balanceOut').textContent = balanceOrder > 3 ? 'Balanced: one side + other side + your final view.' : `Now open part ${balanceOrder}.`;
  });

  const relayTopics = [
    'School should start later.',
    'Every student should join one club.',
    'Films are better at home than at the cinema.',
    'Homework should take no more than thirty minutes.',
    'Students should help design school rules.',
    'Video games can be a useful hobby.',
    'School lunches should include more choices.'
  ];
  let relayIndex = 0;
  document.getElementById('newRelay').addEventListener('click', () => {
    relayIndex = (relayIndex + 1) % relayTopics.length;
    document.getElementById('relayTopic').textContent = relayTopics[relayIndex];
    sound('spin');
  });

  document.getElementById('transcriptToggle').addEventListener('click', event => {
    const transcript = document.getElementById('modelTranscript');
    transcript.classList.toggle('open');
    event.currentTarget.textContent = transcript.classList.contains('open') ? 'HIDE TRANSCRIPT' : 'REVEAL TRANSCRIPT';
    sound('pop');
  });

  const finalTopics = [
    'School should start later',
    'Students need a three-day weekend',
    'Phones can support classroom learning',
    'Everyone should try one creative hobby',
    'Homework should be shorter',
    'Online lessons should remain an option',
    'School clubs are as important as lessons'
  ];
  let wheelIndex = 0;
  document.getElementById('topicWheel').addEventListener('click', event => {
    const button = event.currentTarget;
    button.classList.add('spinning');
    button.disabled = true;
    sound('spin');
    window.setTimeout(() => {
      wheelIndex = (wheelIndex + 3) % finalTopics.length;
      document.getElementById('wheelResult').textContent = finalTopics[wheelIndex];
      button.classList.remove('spinning');
      button.disabled = false;
      sound('correct');
    },900);
  });

  const runCountdown = (display,seconds,button,finishedText) => {
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
        sound('correct');
      }
    },1000);
  };
  document.getElementById('showStart').addEventListener('click', () => runCountdown(document.getElementById('showTimer'),75,document.getElementById('showStart'),'TIME'));

  document.getElementById('peerLights').addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    button.classList.toggle('on');
    sound('pop');
    const complete = document.querySelectorAll('#peerLights button.on').length;
    document.getElementById('peerOut').textContent = `${complete} / 7 language lights switched on.`;
  });

  selectOne(document.getElementById('exitLines'), button => {
    sound('pop');
    document.getElementById('exitOut').textContent = `Complete aloud: "${button.textContent}" Then give a full example.`;
  });
})();
