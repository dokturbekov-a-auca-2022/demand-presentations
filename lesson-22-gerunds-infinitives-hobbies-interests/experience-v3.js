(() => {
  const config = {
    mode: 'broadcast',
    label: 'OPEN 7-PERSON TASK',
    labScene: 23,
    lab: {
      title: 'Produce a 90-second hobby show',
      prompt: 'Your online class is recording one short episode called "A hobby worth trying". Use real or imaginary information, but every sentence must be clear and natural.',
      roles: [
        'Host: welcome the audience, introduce the topic, and connect the segments.',
        'Guest 1: explain a hobby you enjoy doing and give one reason.',
        'Guest 2: explain something beginners should avoid doing.',
        'Guest 3: explain a skill you want or hope to learn next.',
        'Interviewer: ask two follow-up questions and respond to each answer.',
        'Coach: recommend one hobby and explain who it suits.',
        'Closer: summarise three ideas and invite the audience to try one hobby.'
      ],
      steps: [
        '1. Assign all seven parts',
        '2. Prepare two or three sentences each',
        '3. Rehearse once in order',
        '4. Present for 90 seconds'
      ],
      check: 'Every student speaks. The show includes at least four gerunds, four infinitives, one natural question, and one clear recommendation.'
    },
    audio: [
      {
        scene: 13,
        file: 'pattern-models.wav',
        label: 'PATTERN MODELS - LISTEN AND SHADOW',
        text: 'I enjoy drawing. I avoid buying expensive materials. I want to learn photography. I hope to visit an art show. I plan to make a small zine.'
      },
      {
        scene: 18,
        file: 'hobby-interview.wav',
        label: 'HOBBY INTERVIEW - COMPLETE THE PROFILE',
        text: 'What do you enjoy doing after school? I enjoy collecting postcards and making travel pages. What do you want to learn next? I want to learn to take better photographs.'
      },
      {
        scene: 19,
        file: 'garden-story.wav',
        label: 'SHORT STORY - SORT THE VERB FORMS',
        text: 'Mina enjoys collecting old postcards, but she wants to design her own travel book. She plans to photograph local places and hopes to finish the first page this weekend.'
      }
    ]
  };

  const scenes = [...document.querySelectorAll('.scene')];
  if (!scenes.length) return;
  document.body.dataset.v3 = config.mode;
  const root = document.querySelector('#deck') || document.body;

  const ambient = document.createElement('div');
  ambient.className = 'v3-ambient';
  ambient.innerHTML = '<i></i><i></i><i></i><span>22</span>';
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
  modal.innerHTML = '<div class="v3-lab__sheet"><button type="button" class="v3-close" aria-label="Close group task">CLOSE</button><span class="v3-lab__eyebrow">LIVE ONLINE PRODUCTION</span><h2>'+config.lab.title+'</h2><p class="v3-lab__prompt">'+config.lab.prompt+'</p><div class="v3-role-grid">'+config.lab.roles.map((x,i)=>'<div class="v3-role"><strong>PART '+(i+1)+'</strong>'+x+'</div>').join('')+'</div><div class="v3-lab__bottom"><div class="v3-steps"><strong>RUN OF SHOW</strong>'+config.lab.steps.join('<br>')+'</div><div class="v3-check"><strong>SUCCESS CHECK</strong>'+config.lab.check+'</div></div></div>';
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
      stop(); currentClip = clip; scenes[index - 1].append(rail); label.textContent = clip.label; transcript.textContent = clip.text; transcript.classList.remove('is-open'); textButton.textContent = 'SHOW TEXT'; rail.classList.add('is-visible');
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
    event.stopPropagation(); transcript.classList.toggle('is-open'); textButton.textContent = transcript.classList.contains('is-open') ? 'HIDE TEXT' : 'SHOW TEXT';
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
