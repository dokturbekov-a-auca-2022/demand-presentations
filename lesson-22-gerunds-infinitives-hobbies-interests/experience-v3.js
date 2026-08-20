
(() => {
  const config = {"dir":"lesson-22-gerunds-infinitives-hobbies-interests","mode":"garden","label":"HOBBY GREENHOUSE","colors":["#79b58c","#f4a16c","#183d35","#fff7e8"],"labScene":20,"lab":{"title":"Hobby matchmaking greenhouse","prompt":"Interview classmates in rotating rooms, then plant a three-person club whose interests and goals genuinely fit.","roles":["Host: ask enjoy/avoid questions.","Scout: ask want/hope/plan questions.","Matcher: connect people by evidence.","Pitcher: invite the class to the new club."],"rounds":["90 sec · interview one","90 sec · interview two","2 min · design and pitch the club"],"success":"The pitch includes two gerunds, two infinitives, and real information from every member."},"taskScenes":[2,4,6,7,8,9,10,12,13,14,16,17,19,20,21,22,24,26,28],"audio":[{"scene":8,"file":"pattern-models.wav","label":"PATTERN BED · SORT WHAT FOLLOWS","text":"I enjoy drawing. I avoid buying expensive materials. I want to learn photography. I hope to visit an art show. I plan to make a small zine."},{"scene":21,"file":"hobby-interview.wav","label":"INTERVIEW MODEL · GROW THE ANSWER","text":"What do you enjoy doing after school? I enjoy collecting postcards and making travel pages. What do you want to learn next? I want to learn to take better photographs."},{"scene":16,"file":"garden-story.wav","label":"STORY TRACK · FIND FIVE PATTERNS","text":"Mina enjoys collecting old postcards, but she wants to design her own travel book. She plans to photograph local places and hopes to finish the first page this weekend."}]};
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
    else if (clip !== currentClip) { stop(); currentClip=clip; label.textContent=clip.label; transcript.textContent=clip.text; transcript.classList.remove('is-open'); rail.classList.add('is-visible'); }
    trigger.classList.toggle('is-visible', index===config.labScene);
  };
  play.addEventListener('click', e => { e.stopPropagation(); if(!currentClip)return; if(!audio || !audio.src.endsWith(currentClip.file)){ if(audio)audio.pause(); audio=new Audio('assets/audio/'+currentClip.file); audio.addEventListener('timeupdate',()=>{progress.style.width=((audio.currentTime/audio.duration)||0)*100+'%'}); audio.addEventListener('ended',()=>{play.textContent='REPLAY'}); } if(audio.paused){audio.play();play.textContent='PAUSE'}else{audio.pause();play.textContent='PLAY'} });
  textButton.addEventListener('click', e => {e.stopPropagation(); transcript.classList.toggle('is-open'); textButton.textContent=transcript.classList.contains('is-open')?'HIDE':'TEXT'});
  trigger.addEventListener('click', e => {e.stopPropagation(); modal.classList.add('is-open'); modal.querySelector('.v3-close').focus()});
  modal.querySelector('.v3-close').addEventListener('click',()=>modal.classList.remove('is-open'));
  modal.addEventListener('click',e=>{if(e.target===modal)modal.classList.remove('is-open')});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')modal.classList.remove('is-open'); if((e.key==='l'||e.key==='L')&&activeIndex()===config.labScene)modal.classList.add('is-open')});
  config.taskScenes.forEach(i=>{const s=scenes[i-1];if(!s)return;const badge=document.createElement('span');badge.className='v3-task-beacon';badge.textContent='DO · SAY · SHOW';s.append(badge)});
  (config.art||[]).forEach(item=>{const s=scenes[item.scene-1];if(!s)return;const img=document.createElement('img');img.className='v3-scene-art';img.src='assets/'+item.file;img.alt=item.alt;s.classList.add('v3-has-art');s.append(img)});
  const observer = new MutationObserver(sync); scenes.forEach(s=>observer.observe(s,{attributes:true,attributeFilter:['class']})); sync();
  let browserGesture=false;
  const guard=e=>{const zoomed=(window.visualViewport?.scale||1)>1.01;if(e.touches?.length>1||e.changedTouches?.length>1)browserGesture=true;if(!browserGesture&&!zoomed)return;e.stopImmediatePropagation();if((e.type==='touchend'||e.type==='touchcancel')&&e.touches?.length===0)setTimeout(()=>browserGesture=false,0)};
  ['touchstart','touchmove','touchend','touchcancel'].forEach(type=>document.addEventListener(type,guard,{capture:true,passive:true}));
})();
