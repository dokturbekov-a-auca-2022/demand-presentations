
(() => {
  const config = {"dir":"lesson-15-pronunciation-fluency-sound-natural","mode":"sound","label":"ECHO BOOTH","colors":["#39d9d1","#c7f34e","#071a38","#f8fbff"],"labScene":17,"lab":{"title":"Three-take challenge","prompt":"Record one message three ways: clear beats, smooth links, then expressive intonation. The room chooses the easiest version to follow.","roles":["Speaker: perform all three takes.","Beat coach: tap only the stressed words.","Link coach: mark words that should connect.","Producer: choose one precise improvement."],"rounds":["20 sec · silent mark-up","3 takes · camera or voice note","30 sec · producer feedback"],"success":"Meaning stays clear, important words stand out, and the final take sounds connected."},"taskScenes":[2,3,5,6,7,8,9,11,12,13,15,17,18,19,20],"art":[{"scene":5,"file":"mouth-rhythm-map.png","alt":"Editorial illustration of mouth shape, speech waveform, and stressed beats"},{"scene":15,"file":"shadowing-booth.png","alt":"Learner practising shadowing in a home podcast studio"}],"audio":[{"scene":5,"file":"word-stress.wav","label":"STRESS LAB · TAP THE STRONG BEAT","text":"PHOtograph. PhoTOGraphy. PREsent. PreSENT. COMfortable. OpporTUnity."},{"scene":7,"file":"sentence-stress.wav","label":"BEAT TRACK · CLAP THE MESSAGE WORDS","text":"I NEED the BLUE notebook. She SENT the FILE yesterday. We are MEETing at FIVE."},{"scene":9,"file":"connected-speech.wav","label":"LINK TRACK · SHADOW THE CHUNKS","text":"What do you want to do? I want to go to the cinema. Did you see it? Not yet."},{"scene":11,"file":"intonation-dialogue.wav","label":"ARROW TRACK · TRACE THE VOICE","text":"Are you ready? Yes, I am. Where should we start? Let us start with the first line. Really? Yes. Try it again."},{"scene":15,"file":"shadowing.wav","label":"SHADOWING · LISTEN, COPY, PERSONALISE","text":"At first, speaking clearly felt slow. Then I learned to stress the important words, connect small words, and let my voice move. Now my English sounds calmer and easier to follow."}]};
  const scenes = [...document.querySelectorAll('.scene')];
  if (!scenes.length) return;
  document.body.dataset.v3 = config.mode;
  const root = document.querySelector('.deck,.presentation,.slides,.app') || document.body;
  const ambient = document.createElement('div'); ambient.className = 'v3-ambient'; root.prepend(ambient);
  const rail = document.createElement('aside'); rail.className = 'v3-audio'; rail.setAttribute('aria-live','polite');
  rail.innerHTML = '<span class="v3-audio__label"></span><div class="v3-audio__row"><button class="v3-play" type="button">PLAY</button><div class="v3-audio__track"><div class="v3-audio__progress"></div></div><button class="v3-text" type="button">TEXT</button></div><p class="v3-transcript"></p>';
  root.append(rail);
  const trigger = document.createElement('button'); trigger.type='button'; trigger.className='v3-lab-trigger'; trigger.textContent=config.label; root.append(trigger);
  const modal = document.createElement('section'); modal.className='v3-lab'; modal.setAttribute('role','dialog'); modal.setAttribute('aria-modal','true'); modal.setAttribute('aria-label',config.lab.title);
  modal.innerHTML = '<div class="v3-lab__sheet"><button type="button" class="v3-close" aria-label="Close live task">CLOSE</button><span class="v3-lab__eyebrow">'+config.label+' · ONLINE CLASS SIGNATURE TASK</span><h2>'+config.lab.title+'</h2><p class="v3-lab__prompt">'+config.lab.prompt+'</p><div class="v3-lab__grid"><div class="v3-role-grid">'+config.lab.roles.map((x,i)=>'<div class="v3-role"><strong>ROLE 0'+(i+1)+'</strong>'+x+'</div>').join('')+'</div><div><div class="v3-rounds"><strong>RUN OF SHOW</strong>'+config.lab.rounds.join('<br>')+'</div><div class="v3-success"><strong>SUCCESS SIGNAL</strong>'+config.lab.success+'</div></div></div></div>';
  root.append(modal);
  const play = rail.querySelector('.v3-play'), textButton = rail.querySelector('.v3-text'), transcript = rail.querySelector('.v3-transcript'), progress = rail.querySelector('.v3-audio__progress'), label = rail.querySelector('.v3-audio__label');
  let audio = null, currentClip = null;
  const stop = () => { if(audio){audio.pause();audio.currentTime=0;} play.textContent='PLAY'; progress.style.width='0%'; };
  const activeIndex = () => Math.max(0, scenes.findIndex(s => s.classList.contains('active'))) + 1;
  const sync = () => {
    const index = activeIndex(); const clip = config.audio.find(x=>x.scene===index);
    if (!clip) { stop(); currentClip=null; rail.classList.remove('is-visible'); transcript.classList.remove('is-open'); }
    else if (clip !== currentClip) { stop(); currentClip=clip; scenes[index-1].append(rail); label.textContent=clip.label; transcript.textContent=clip.text; transcript.classList.remove('is-open'); rail.classList.add('is-visible'); }
    if (index===config.labScene) scenes[index-1].append(trigger);
    trigger.classList.toggle('is-visible', index===config.labScene);
  };
  play.addEventListener('click', e => { e.stopPropagation(); if(!currentClip)return; if(!audio || !audio.src.endsWith(currentClip.file)){ if(audio)audio.pause(); audio=new Audio('assets/audio/'+currentClip.file); audio.addEventListener('timeupdate',()=>{progress.style.width=((audio.currentTime/audio.duration)||0)*100+'%'}); audio.addEventListener('ended',()=>{play.textContent='REPLAY'}); } if(audio.paused){audio.play();play.textContent='PAUSE'}else{audio.pause();play.textContent='PLAY'} });
  textButton.addEventListener('click', e => {e.stopPropagation(); transcript.classList.toggle('is-open'); textButton.textContent=transcript.classList.contains('is-open')?'HIDE':'TEXT'});
  trigger.addEventListener('click', e => {e.stopPropagation(); modal.classList.add('is-open'); modal.querySelector('.v3-close').focus()});
  modal.querySelector('.v3-close').addEventListener('click',()=>modal.classList.remove('is-open'));
  modal.addEventListener('click',e=>{if(e.target===modal)modal.classList.remove('is-open')});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')modal.classList.remove('is-open'); if((e.key==='l'||e.key==='L')&&activeIndex()===config.labScene)modal.classList.add('is-open')});
  (config.art||[]).forEach(item=>{const s=scenes[item.scene-1];if(!s)return;const img=document.createElement('img');img.className='v3-scene-art';img.src='assets/'+item.file;img.alt=item.alt;s.classList.add('v3-has-art');s.append(img)});
  const observer = new MutationObserver(sync); scenes.forEach(s=>observer.observe(s,{attributes:true,attributeFilter:['class']})); sync();
  let browserGesture=false;
  const guard=e=>{const zoomed=(window.visualViewport?.scale||1)>1.01;if(e.touches?.length>1||e.changedTouches?.length>1)browserGesture=true;if(!browserGesture&&!zoomed)return;e.stopImmediatePropagation();if((e.type==='touchend'||e.type==='touchcancel')&&e.touches?.length===0)setTimeout(()=>browserGesture=false,0)};
  ['touchstart','touchmove','touchend','touchcancel'].forEach(type=>document.addEventListener(type,guard,{capture:true,passive:true}));
})();
