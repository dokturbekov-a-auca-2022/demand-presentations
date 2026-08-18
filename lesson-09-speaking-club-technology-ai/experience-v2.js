(()=>{
  const scenes=[...document.querySelectorAll('.scene')];
  const layouts=['hero','radar','echo','picture','cloud','mission','words','match','sort','pronounce','flow','remix','questions','predict','listen','quiz','pair','garden','advisory','speed','roles','build','gallery','review','homework','exit'];
  const figures={
    1:['radar',3],4:['orbit',0],8:['dial',0],18:['balance',0],19:['bolt',0],23:['scanner',0],25:['tower',3]
  };
  scenes.forEach((scene,i)=>{
    scene.classList.add(`layout-${layouts[i]}`);
    if(i>0){
      const mission=document.createElement('button');mission.className='mission-note';mission.type='button';mission.innerHTML=`<i>i</i><span>${taskText(scene)}</span>`;
      const lead=scene.querySelector('.lead');(lead||scene.querySelector('h2'))?.insertAdjacentElement('afterend',mission);
      mission.addEventListener('click',openPanel);
    }
    if(figures[i]){
      const [name,count]=figures[i],figure=document.createElement('div');figure.className=`kinetic-figure figure-${name}`;figure.setAttribute('aria-hidden','true');
      figure.innerHTML='<span></span>'.repeat(count);scene.prepend(figure);
    }
  });

  const tools=document.querySelector('.tools');
  const info=document.createElement('button');info.id='v2Info';info.className='v2-control';info.textContent='i · TASK INFO';info.setAttribute('aria-label','Open task instructions');
  const full=document.createElement('button');full.id='v2Full';full.className='v2-control';full.textContent='⛶ · FULL';full.setAttribute('aria-label','Toggle fullscreen');
  tools?.insertBefore(info,document.querySelector('#next'));tools?.insertBefore(full,document.querySelector('#next'));

  const panel=document.createElement('section');panel.className='v2-panel';panel.id='v2Panel';panel.innerHTML='<div class="v2-panel-card"><button class="v2-close" aria-label="Close task panel">×</button><h3 id="v2PanelTitle">How this task works</h3><p id="v2PanelNote"></p><ol><li>Notice the visual clue or language pattern.</li><li>Choose, connect, classify, or discuss as directed.</li><li>Say a complete answer and add a reason or follow-up.</li></ol></div>';document.body.append(panel);
  function openPanel(){const scene=document.querySelector('.scene.active');panel.querySelector('h3').textContent=scene?.dataset.title||'How this task works';panel.querySelector('p').textContent=scene?.querySelector('.teacher')?.textContent.trim()||taskText(scene);panel.classList.add('open')}
  info.onclick=openPanel;panel.querySelector('.v2-close').onclick=()=>panel.classList.remove('open');panel.onclick=e=>{if(e.target===panel)panel.classList.remove('open')};
  full.onclick=()=>document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen?.();
  document.addEventListener('keydown',e=>{if(e.key.toLowerCase()==='i')openPanel();if(e.key==='Escape')panel.classList.remove('open')});

  function taskText(scene){
    if(!scene)return'';
    if(scene.querySelector('[data-timer],.timer'))return'Choose a prompt, speak for the set time, then invite one follow-up question.';
    if(scene.querySelector('.match'))return'Connect a word to its meaning, then say the complete pair aloud.';
    if(scene.querySelector('.listen-card'))return'Listen twice: first for each opinion, then for the reason behind it.';
    if(scene.querySelector('#sorter'))return'Discuss one technology, decide whether it is helpful, risky, or both, and justify the choice.';
    if(scene.querySelector('.choice,button.card'))return'Tap one response, explain why it fits, and compare your reasoning with a partner.';
    return'Read the prompt, create one clear idea, and support it with a reason or example.';
  }
})();
