(() => {
  const scenes = [...document.querySelectorAll('.scene')];
  const count = document.querySelector('#count');
  const bar = document.querySelector('#bar');
  const map = document.querySelector('#map');
  const note = document.querySelector('#note');
  const tagScore = document.querySelector('#tagScore');
  const scored = new Set();
  let current = 0;

  const refreshScore = () => {
    tagScore.textContent = String(scored.size).padStart(2, '0');
  };

  map.innerHTML = `<h3>FREQUENCY 26 · TRACK LIST</h3>${scenes.map((scene, index) =>
    `<button type="button" data-jump="${index}">${String(index + 1).padStart(2, '0')} · ${scene.dataset.title}</button>`
  ).join('')}`;

  const pauseAudio = () => {
    document.querySelectorAll('audio').forEach(audio => {
      audio.pause();
      audio.closest('.audio-rail')?.classList.remove('playing');
      const button = audio.closest('.audio-rail')?.querySelector('.audio-play');
      if (button) button.textContent = button.dataset.label || button.textContent.replace('PAUSE', 'PLAY');
    });
  };

  window.show = index => {
    pauseAudio();
    current = (index + scenes.length) % scenes.length;
    scenes.forEach((scene, sceneIndex) => {
      scene.classList.toggle('active', sceneIndex === current);
      if (sceneIndex === current) scene.scrollTop = 0;
    });
    count.textContent = `${current + 1} / ${scenes.length}`;
    bar.style.width = `${((current + 1) / scenes.length) * 100}%`;
    note.classList.remove('open');
    map.classList.remove('open');
  };

  document.querySelector('#next').onclick = () => window.show(current + 1);
  document.querySelector('#prev').onclick = () => window.show(current - 1);
  document.querySelector('#startLesson').onclick = () => window.show(1);
  document.querySelector('#mapBtn').onclick = () => map.classList.toggle('open');
  document.querySelector('#noteBtn').onclick = () => {
    note.innerHTML = `<b>TEACHER NOTE · ${current + 1}</b><br><br>${scenes[current].dataset.note}`;
    note.classList.toggle('open');
  };
  map.onclick = event => {
    if (event.target.dataset.jump !== undefined) window.show(Number(event.target.dataset.jump));
  };

  document.addEventListener('keydown', event => {
    const onButton = document.activeElement?.tagName === 'BUTTON';
    if (['ArrowRight', 'PageDown'].includes(event.key) || (event.key === ' ' && !onButton)) {
      event.preventDefault();
      window.show(current + 1);
    }
    if (['ArrowLeft', 'PageUp'].includes(event.key)) {
      event.preventDefault();
      window.show(current - 1);
    }
    if (event.key.toLowerCase() === 'm') map.classList.toggle('open');
    if (event.key.toLowerCase() === 'n') document.querySelector('#noteBtn').click();
  });

  let touchX = 0;
  let touchY = 0;
  let browserGesture = false;
  document.addEventListener('gesturestart', () => { browserGesture = true; }, { passive: true });
  document.addEventListener('gestureend', () => { setTimeout(() => { browserGesture = false; }, 250); }, { passive: true });
  document.addEventListener('touchstart', event => {
    browserGesture = event.touches.length !== 1 || (window.visualViewport?.scale || 1) > 1.01;
    if (!browserGesture) {
      touchX = event.touches[0].screenX;
      touchY = event.touches[0].screenY;
    }
  }, { passive: true });
  document.addEventListener('touchmove', event => {
    if (event.touches.length > 1) browserGesture = true;
  }, { passive: true });
  document.addEventListener('touchend', event => {
    if (browserGesture || event.changedTouches.length !== 1 || (window.visualViewport?.scale || 1) > 1.01) return;
    const dx = event.changedTouches[0].screenX - touchX;
    const dy = event.changedTouches[0].screenY - touchY;
    if (Math.abs(dx) > 88 && Math.abs(dx) > Math.abs(dy) * 1.6) window.show(current + (dx < 0 ? 1 : -1));
  }, { passive: true });
  document.querySelectorAll('img').forEach(image => { image.draggable = false; });

  const singleSelect = (selector, handler) => {
    document.querySelectorAll(selector).forEach(button => {
      button.onclick = () => {
        button.parentElement.querySelectorAll('button').forEach(item => item.classList.remove('selected', 'good', 'weak'));
        button.classList.add('selected');
        handler(button);
      };
    });
  };

  singleSelect('#checkIn button', button => {
    document.querySelector('#checkInOut').textContent = `Selected: ${button.dataset.word}. Add one concrete example.`;
  });
  singleSelect('#busOpeners button', button => {
    button.classList.add(button.dataset.quality);
    document.querySelector('#busOut').textContent = button.dataset.quality === 'good'
      ? 'Natural choice: it uses visible or shared information and invites a short answer.'
      : 'Weak choice: it asks for private information before trust exists.';
  });
  singleSelect('#topicStrip button', button => {
    document.querySelector('#topicModel').textContent = button.dataset.model;
  });

  let grooveStep = 1;
  document.querySelectorAll('#groove button').forEach(button => {
    button.onclick = () => {
      const step = Number(button.dataset.step);
      if (step !== grooveStep) {
        document.querySelector('#grooveOut').textContent = `Start with move ${grooveStep}: ${['NOTICE', 'TAG', 'LISTEN', 'FOLLOW UP'][grooveStep - 1]}.`;
        return;
      }
      button.classList.add('open');
      grooveStep += 1;
      document.querySelector('#grooveOut').textContent = grooveStep === 5
        ? 'Complete groove: the response creates the next question.'
        : `${step} / 4 moves open. Continue in order.`;
    };
  });

  document.querySelectorAll('[data-answer]').forEach(button => {
    if (button.closest('.intonation-quiz') || button.closest('.rapid-quiz')) return;
    if (button.matches('[data-question]')) return;
    if (button.closest('.listening-questions')) return;
    if (!button.matches('button')) return;
    button.onclick = () => {
      button.classList.toggle('open');
      const answer = button.querySelector('em');
      if (answer) answer.textContent = button.classList.contains('open') ? button.dataset.answer : '_____';
    };
  });

  const builderQuestions = [...document.querySelectorAll('#tagBuilder [data-question]')];
  builderQuestions.forEach((question, questionIndex) => {
    question.querySelectorAll('button').forEach(button => {
      button.onclick = () => {
        question.querySelectorAll('button').forEach(item => item.classList.remove('correct', 'wrong'));
        const correct = button.dataset.correct === 'true';
        button.classList.add(correct ? 'correct' : 'wrong');
        if (correct) scored.add(`builder-${questionIndex}`);
        else scored.delete(`builder-${questionIndex}`);
        const correctCount = builderQuestions.filter(item => item.querySelector('.correct')).length;
        document.querySelector('#builderOut').textContent = `${correctCount} / 4 correct. ${correct ? 'Explain the helper and pronoun.' : 'Check the verb family and polarity.'}`;
        refreshScore();
      };
    });
  });

  document.querySelectorAll('#repairList button').forEach(button => {
    button.dataset.original = button.textContent;
    button.onclick = () => {
      button.classList.toggle('open');
      button.textContent = button.classList.contains('open') ? button.dataset.fix : button.dataset.original;
    };
  });

  const intonationItems = [...document.querySelectorAll('#intonationQuiz>div')];
  intonationItems.forEach((item, index) => {
    item.querySelectorAll('button').forEach(button => {
      button.onclick = () => {
        item.querySelectorAll('button').forEach(choice => choice.classList.remove('correct', 'wrong'));
        const correct = button.dataset.choice === item.dataset.answer;
        button.classList.add(correct ? 'correct' : 'wrong');
        if (correct) scored.add(`intonation-${index}`);
        else scored.delete(`intonation-${index}`);
        const total = intonationItems.filter(row => row.querySelector('.correct')).length;
        document.querySelector('#intonationOut').textContent = `${total} / 7 contexts matched. Explain certainty before choosing.`;
        refreshScore();
      };
    });
  });

  document.querySelectorAll('.audio-rail').forEach(rail => {
    const audio = rail.querySelector('audio');
    const button = rail.querySelector('.audio-play');
    button.dataset.label = button.textContent;
    button.onclick = () => {
      if (audio.paused) {
        document.querySelectorAll('audio').forEach(other => {
          if (other !== audio) other.pause();
        });
        audio.play();
        rail.classList.add('playing');
        button.textContent = 'PAUSE';
      } else {
        audio.pause();
        rail.classList.remove('playing');
        button.textContent = button.dataset.label;
      }
    };
    audio.onended = () => {
      rail.classList.remove('playing');
      button.textContent = button.dataset.label;
    };
  });

  document.querySelectorAll('#listeningQuestions button').forEach(button => {
    const question = button.querySelector('span').textContent;
    button.onclick = () => {
      button.classList.toggle('open');
      button.querySelector('span').textContent = button.classList.contains('open') ? button.dataset.answer : question;
      button.querySelector('em').textContent = button.classList.contains('open') ? 'ANSWER' : 'REVEAL';
    };
  });

  const transcriptFound = new Set();
  document.querySelectorAll('.transcript button').forEach((button, index) => {
    button.onclick = () => {
      const className = button.dataset.kind === 'tag' ? 'found-tag' : 'found-follow';
      button.classList.toggle(className);
      if (button.classList.contains(className)) transcriptFound.add(index);
      else transcriptFound.delete(index);
      const tags = [...transcriptFound].filter(item => document.querySelectorAll('.transcript button')[item].dataset.kind === 'tag').length;
      const follows = transcriptFound.size - tags;
      document.querySelector('#transcriptOut').textContent = `${tags} / 5 tags · ${follows} / 2 follow-ups found.`;
    };
  });

  const rapidItems = [...document.querySelectorAll('#rapidQuiz>div')];
  rapidItems.forEach((item, index) => {
    item.querySelectorAll('button').forEach(button => {
      button.onclick = () => {
        item.querySelectorAll('button').forEach(choice => choice.classList.remove('correct', 'wrong'));
        const correct = button.dataset.choice === item.dataset.answer;
        button.classList.add(correct ? 'correct' : 'wrong');
        if (correct) scored.add(`rapid-${index}`);
        else scored.delete(`rapid-${index}`);
        const total = rapidItems.filter(row => row.querySelector('.correct')).length;
        document.querySelector('#rapidOut').textContent = `SCORE ${total} / 7${total === 7 ? ' · CLEAN SIGNAL' : ' · explain and repair'}`;
        refreshScore();
      };
    });
  });

  document.querySelectorAll('#roleGrooves button').forEach(button => {
    button.onclick = () => button.classList.toggle('open');
  });

  let timerRun;
  document.querySelector('#liveStart').onclick = () => {
    clearInterval(timerRun);
    let seconds = 90;
    document.querySelector('#liveTimer').textContent = seconds;
    timerRun = setInterval(() => {
      seconds -= 1;
      document.querySelector('#liveTimer').textContent = seconds;
      if (seconds <= 0) clearInterval(timerRun);
    }, 1000);
  };
  const liveCounts = { tag: 0, follow: 0 };
  document.querySelectorAll('[data-count]').forEach(button => {
    button.onclick = () => {
      liveCounts[button.dataset.count] += 1;
      document.querySelector(button.dataset.count === 'tag' ? '#tagCount' : '#followCount').textContent = liveCounts[button.dataset.count];
    };
  });

  singleSelect('#exitLines button', button => {
    document.querySelector('#exitOut').textContent = `Selected: “${button.textContent}” Complete it with a real example.`;
  });

  window.show(0);
  refreshScore();
})();
