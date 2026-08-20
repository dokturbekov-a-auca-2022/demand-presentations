(() => {
  const config = {
    label: 'OPEN JURY ROOM',
    labScene: 24,
    lab: {
      title: 'Choose the festival winner',
      prompt: 'Discuss The Silent Observatory, Kitchen Number Seven, and City Above the Tide. Choose one audience winner using only the supplied plot ideas, visuals, and your own clearly stated criteria.',
      roles: [
        'Chair: invite every member, keep turns balanced, and call the final vote.',
        'Plot analyst: compare which story idea creates the clearest goal and problem.',
        'Character analyst: explain which story offers the strongest character potential.',
        'Visual analyst: compare setting, atmosphere, and memorable visual details.',
        'Audience analyst: identify who would enjoy each story and why.',
        'Counter-critic: challenge one weak reason with a polite disagreement.',
        'Recorder: write the decision, two reasons, evidence, and audience.'
      ],
      steps: [
        '1. Share one point per role',
        '2. Compare all three titles',
        '3. Challenge one weak reason',
        '4. Vote and prepare the announcement'
      ],
      check: 'Every student speaks. The final announcement names one winner, gives two supported reasons, identifies an audience, and includes one respectful response to another view.'
    },
    audio: [
      { scene: 12, file: 'polite-disagreement.wav', label: 'POLITE DISAGREEMENT - PHRASE, VIEW, EVIDENCE', text: 'I see why you enjoyed the ending, but I found it too sudden. The final choice was interesting, although I wanted one more scene. That is fair. We noticed different details.' },
      { scene: 14, file: 'micro-review.wav', label: 'MICRO-REVIEW - LISTEN FOR FIVE MOVES', text: 'The Paper Moon is a quiet adventure about a shy student who builds a radio. I found it hopeful because the friendships felt honest. I would recommend it to viewers who enjoy gentle stories.' },
      { scene: 25, file: 'critic-speed.wav', label: '45-SECOND REVIEW CUE', text: 'Title. Spoiler-free plot. Reaction. Specific reason. Recommendation. Keep your review clear, respectful, and under forty-five seconds.' }
    ]
  };
  const scenes=[...document.querySelectorAll('.scene')];if(!scenes.length)return;const root=document.querySelector('#deck')||document.body;
  const ambient=document.createElement('div');ambient.className='v3-ambient';ambient.innerHTML='<div class="v3-beam"></div><div class="v3-grain"></div><div class="v3-perfs"></div>';root.prepend(ambient);
  const rail=document.createElement('aside');rail.className='v3-audio';rail.setAttribute('aria-live','polite');rail.innerHTML='<span class="v3-audio__label"></span><div class="v3-audio__row"><button class="v3-play" type="button">PLAY</button><div class="v3-audio__track"><div class="v3-audio__progress"></div></div><button class="v3-text" type="button">SHOW TEXT</button></div><p class="v3-transcript"></p>';root.append(rail);
  const trigger=document.createElement('button');trigger.type='button';trigger.className='v3-lab-trigger';trigger.textContent=config.label;root.append(trigger);
  const modal=document.createElement('section');modal.className='v3-lab';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-label',config.lab.title);modal.innerHTML='<div class="v3-lab__sheet"><button type="button" class="v3-close" aria-label="Close jury task">CLOSE</button><span class="v3-lab__eyebrow">SEVEN-PERSON ONLINE JURY</span><h2>'+config.lab.title+'</h2><p class="v3-lab__prompt">'+config.lab.prompt+'</p><div class="v3-role-grid">'+config.lab.roles.map((x,i)=>'<div class="v3-role"><strong>JURY '+(i+1)+'</strong>'+x+'</div>').join('')+'</div><div class="v3-lab__bottom"><div class="v3-steps"><strong>DISCUSSION ORDER</strong>'+config.lab.steps.join('<br>')+'</div><div class="v3-check"><strong>FINISH WHEN</strong>'+config.lab.check+'</div></div></div>';root.append(modal);
  const play=rail.querySelector('.v3-play'),textButton=rail.querySelector('.v3-text'),transcript=rail.querySelector('.v3-transcript'),progress=rail.querySelector('.v3-audio__progress'),label=rail.querySelector('.v3-audio__label');let audio=null,currentClip=null;
  const stop=()=>{if(audio){audio.pause();audio.currentTime=0}play.textContent='PLAY';progress.style.width='0%'};const activeIndex=()=>Math.max(0,scenes.findIndex(s=>s.classList.contains('active')))+1;
  const sync=()=>{const index=activeIndex(),clip=config.audio.find(x=>x.scene===index);if(!clip){stop();currentClip=null;rail.classList.remove('is-visible');transcript.classList.remove('is-open')}else if(clip!==currentClip){stop();currentClip=clip;scenes[index-1].append(rail);label.textContent=clip.label;transcript.textContent=clip.text;transcript.classList.remove('is-open');textButton.textContent='SHOW TEXT';rail.classList.add('is-visible')}if(index===config.labScene)scenes[index-1].append(trigger);trigger.classList.toggle('is-visible',index===config.labScene)};
  play.addEventListener('click',e=>{e.stopPropagation();if(!currentClip)return;if(!audio||!audio.src.endsWith(currentClip.file)){if(audio)audio.pause();audio=new Audio('assets/audio/'+currentClip.file);audio.addEventListener('timeupdate',()=>{progress.style.width=((audio.currentTime/audio.duration)||0)*100+'%'});audio.addEventListener('ended',()=>{play.textContent='REPLAY'})}if(audio.paused){audio.play();play.textContent='PAUSE'}else{audio.pause();play.textContent='PLAY'}});textButton.addEventListener('click',e=>{e.stopPropagation();transcript.classList.toggle('is-open');textButton.textContent=transcript.classList.contains('is-open')?'HIDE TEXT':'SHOW TEXT'});
  trigger.addEventListener('click',e=>{e.stopPropagation();modal.classList.add('is-open');modal.querySelector('.v3-close').focus()});modal.querySelector('.v3-close').addEventListener('click',()=>modal.classList.remove('is-open'));modal.addEventListener('click',e=>{if(e.target===modal)modal.classList.remove('is-open')});document.addEventListener('keydown',e=>{if(e.key==='Escape')modal.classList.remove('is-open');if((e.key==='l'||e.key==='L')&&activeIndex()===config.labScene)modal.classList.add('is-open')});
  const observer=new MutationObserver(sync);scenes.forEach(s=>observer.observe(s,{attributes:true,attributeFilter:['class']}));sync();let browserGesture=false;const guard=e=>{const zoomed=(window.visualViewport?.scale||1)>1.01;if(e.touches?.length>1||e.changedTouches?.length>1)browserGesture=true;if(!browserGesture&&!zoomed)return;e.stopImmediatePropagation();if((e.type==='touchend'||e.type==='touchcancel')&&e.touches?.length===0)setTimeout(()=>{browserGesture=false},0)};['touchstart','touchmove','touchend','touchcancel'].forEach(type=>document.addEventListener(type,guard,{capture:true,passive:true}));
})();
