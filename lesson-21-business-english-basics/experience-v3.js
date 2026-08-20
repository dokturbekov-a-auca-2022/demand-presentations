(() => {
  const config = {
    mode: 'studio',
    label: 'OPEN GROUP TASK',
    labScene: 21,
    lab: {
      title: 'Seven-role delivery meeting',
      prompt: 'The supplier can deliver only 120 of 200 bottles by Friday. The remaining 80 will arrive on Sunday, and the budget cannot increase. Agree on a response and prepare a polite client update.',
      roles: [
        'Facilitator: invite every person to speak and close the meeting.',
        'Project manager: state the problem in two clear sentences.',
        'Budget lead: reject any option that increases the $600 budget.',
        'Designer: suggest how 120 bottles could still work at the event.',
        'Supplier: explain the delivery limits and answer questions.',
        'Client representative: ask what the school needs to know today.',
        'Note-taker: record the decision, owner, deadline, and message.'
      ],
      steps: [
        '1. Share the facts',
        '2. Suggest two options',
        '3. Ask questions and decide',
        '4. Confirm owner, deadline, and client message'
      ],
      check: 'Every student speaks. The final answer includes one action, one owner, one deadline, and one polite message to the client.'
    },
    audio: [
      {
        scene: 11,
        file: 'polite-email.wav',
        label: 'EMAIL MODEL - ATTACHMENT, DEADLINE, REQUEST',
        text: 'Subject: Updated project plan. Hello Ms Khan. Please find the revised plan attached. Could you check the new deadline and let me know if Friday works for you? Best wishes, Alex.'
      },
      {
        scene: 16,
        file: 'phone-call.wav',
        label: 'PHONE CALL - PURPOSE, DAY, TIME',
        text: 'Good morning, Bright Ideas. This is Lina speaking. How can I help? Hello, I am calling about the project deadline. Could you confirm the date? Yes. The final file is due on Friday at three.'
      },
      {
        scene: 18,
        file: 'mini-meeting.wav',
        label: 'MINI-MEETING - UPDATE, PROBLEM, DECISION',
        text: 'Could we start? First, let us share updates. The design is ready, but the budget needs checking. I agree. Could we decide who will contact the customer? I will do it and send an update by tomorrow.'
      }
    ]
  };

  const scenes = [...document.querySelectorAll('.scene')];
  if (!scenes.length) return;
  document.body.dataset.v3 = config.mode;
  const root = document.querySelector('#deck') || document.body;
  const ambient = document.createElement('div');
  ambient.className = 'v3-ambient';
  root.prepend(ambient);

  const rail = document.createElement('aside');
  rail.className = 'v3-audio';
  rail.setAttribute('aria-live', 'polite');
  rail.innerHTML = '<span class="v3-audio__label"></span><div class="v3-audio__row"><button class="v3-play" type="button">PLAY</button><div class="v3-audio__track"><div class="v3-audio__progress"></div></div><button class="v3-text" type="button">SHOW TEXT</button></div><p class="v3-transcript"></p>';
  root.append(rail);

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'v3-lab-trigger';
  trigger.textContent = config.label;
  root.append(trigger);

  const modal = document.createElement('section');
  modal.className = 'v3-lab';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-label', config.lab.title);
  modal.innerHTML = '<div class="v3-lab__sheet"><button type="button" class="v3-close" aria-label="Close group task">CLOSE</button><span class="v3-lab__eyebrow">ONLINE GROUP TASK</span><h2>'+config.lab.title+'</h2><p class="v3-lab__prompt">'+config.lab.prompt+'</p><div class="v3-role-grid">'+config.lab.roles.map((x,i)=>'<div class="v3-role"><strong>ROLE '+(i+1)+'</strong>'+x+'</div>').join('')+'</div><div class="v3-lab__bottom"><div class="v3-steps"><strong>MEETING STEPS</strong>'+config.lab.steps.join('<br>')+'</div><div class="v3-check"><strong>FINISH WHEN</strong>'+config.lab.check+'</div></div></div>';
  root.append(modal);

  const play = rail.querySelector('.v3-play');
  const textButton = rail.querySelector('.v3-text');
  const transcript = rail.querySelector('.v3-transcript');
  const progress = rail.querySelector('.v3-audio__progress');
  const label = rail.querySelector('.v3-audio__label');
  let audio = null;
  let currentClip = null;

  const stop = () => {
    if (audio) { audio.pause(); audio.currentTime = 0; }
    play.textContent = 'PLAY';
    progress.style.width = '0%';
  };
  const activeIndex = () => Math.max(0, scenes.findIndex(scene => scene.classList.contains('active'))) + 1;
  const sync = () => {
    const index = activeIndex();
    const clip = config.audio.find(item => item.scene === index);
    if (!clip) {
      stop(); currentClip = null; rail.classList.remove('is-visible'); transcript.classList.remove('is-open');
    } else if (clip !== currentClip) {
      stop(); currentClip = clip; scenes[index - 1].append(rail); label.textContent = clip.label; transcript.textContent = clip.text; transcript.classList.remove('is-open'); rail.classList.add('is-visible');
    }
    if (index === config.labScene) scenes[index - 1].append(trigger);
    trigger.classList.toggle('is-visible', index === config.labScene);
  };

  play.addEventListener('click', event => {
    event.stopPropagation();
    if (!currentClip) return;
    if (!audio || !audio.src.endsWith(currentClip.file)) {
      if (audio) audio.pause();
      audio = new Audio('assets/audio/' + currentClip.file);
      audio.addEventListener('timeupdate', () => { progress.style.width = ((audio.currentTime / audio.duration) || 0) * 100 + '%'; });
      audio.addEventListener('ended', () => { play.textContent = 'REPLAY'; });
    }
    if (audio.paused) { audio.play(); play.textContent = 'PAUSE'; }
    else { audio.pause(); play.textContent = 'PLAY'; }
  });
  textButton.addEventListener('click', event => {
    event.stopPropagation();
    transcript.classList.toggle('is-open');
    textButton.textContent = transcript.classList.contains('is-open') ? 'HIDE TEXT' : 'SHOW TEXT';
  });
  trigger.addEventListener('click', event => { event.stopPropagation(); modal.classList.add('is-open'); modal.querySelector('.v3-close').focus(); });
  modal.querySelector('.v3-close').addEventListener('click', () => modal.classList.remove('is-open'));
  modal.addEventListener('click', event => { if (event.target === modal) modal.classList.remove('is-open'); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') modal.classList.remove('is-open'); if ((event.key === 'l' || event.key === 'L') && activeIndex() === config.labScene) modal.classList.add('is-open'); });

  const observer = new MutationObserver(sync);
  scenes.forEach(scene => observer.observe(scene, { attributes: true, attributeFilter: ['class'] }));
  sync();

  let browserGesture = false;
  const guard = event => {
    const zoomed = (window.visualViewport?.scale || 1) > 1.01;
    if (event.touches?.length > 1 || event.changedTouches?.length > 1) browserGesture = true;
    if (!browserGesture && !zoomed) return;
    event.stopImmediatePropagation();
    if ((event.type === 'touchend' || event.type === 'touchcancel') && event.touches?.length === 0) setTimeout(() => { browserGesture = false; }, 0);
  };
  ['touchstart','touchmove','touchend','touchcancel'].forEach(type => document.addEventListener(type, guard, { capture: true, passive: true }));
})();
