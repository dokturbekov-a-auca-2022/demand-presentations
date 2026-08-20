(() => {
  const allScenes=[...document.querySelectorAll('.scene')];
  const note=document.querySelector('#note');
  const map=document.querySelector('#map');
  const count=document.querySelector('#count');
  const bar=document.querySelector('#bar');
  const scoreHud=document.querySelector('#scoreHud');
  const oxygenHud=document.querySelector('#oxygenHud');
  const decisionScores={loadout:0,leak:0,route:0};
  let current=0;

  const totalScore=()=>Object.values(decisionScores).reduce((sum,value)=>sum+value,0);
  const paintHud=()=>{scoreHud.textContent=String(totalScore()).padStart(2,'0');};
  map.innerHTML=`<h3>ORBIT 09 · MISSION PATH</h3>${scenes.map((scene,index)=>`<button data-jump="${index}">${String(index+1).padStart(2,'0')} · ${scene.title}</button>`).join('')}`;

  window.show=index=>{
    current=(index+allScenes.length)%allScenes.length;
    allScenes.forEach((scene,sceneIndex)=>{
      scene.classList.toggle('active',sceneIndex===current);
      if(sceneIndex===current)scene.scrollTop=0;
    });
    count.textContent=`${current+1} / ${allScenes.length}`;
    bar.style.width=`${((current+1)/allScenes.length)*100}%`;
    oxygenHud.textContent=`${Math.max(44,72-current)}%`;
    note.classList.remove('open');map.classList.remove('open');
    if(current===26)calculateOutcome();
  };
  window.show(0);
  document.querySelector('#next').onclick=()=>window.show(current+1);
  document.querySelector('#prev').onclick=()=>window.show(current-1);
  document.querySelector('#bootMission').onclick=()=>window.show(1);
  document.querySelector('#mapBtn').onclick=()=>map.classList.toggle('open');
  document.querySelector('#noteBtn').onclick=()=>{
    note.innerHTML=`<b>Teacher note · ${current+1}</b><br>${scenes[current].note}`;
    note.classList.toggle('open');
  };
  map.onclick=event=>{if(event.target.dataset.jump!==undefined)window.show(Number(event.target.dataset.jump));};
  document.addEventListener('keydown',event=>{
    if(['ArrowRight','PageDown',' '].includes(event.key)){event.preventDefault();window.show(current+1);}
    if(['ArrowLeft','PageUp'].includes(event.key)){event.preventDefault();window.show(current-1);}
    if(event.key.toLowerCase()==='m')map.classList.toggle('open');
    if(event.key.toLowerCase()==='n')document.querySelector('#noteBtn').click();
  });
  let touchX=0,touchY=0,browserGesture=false;
  document.addEventListener('touchstart',event=>{
    browserGesture=event.touches.length!==1||(window.visualViewport?.scale||1)>1.01;
    if(!browserGesture){touchX=event.touches[0].screenX;touchY=event.touches[0].screenY;}
  },{passive:true});
  document.addEventListener('touchend',event=>{
    if(browserGesture||event.changedTouches.length!==1)return;
    const dx=event.changedTouches[0].screenX-touchX,dy=event.changedTouches[0].screenY-touchY;
    if(Math.abs(dx)>82&&Math.abs(dx)>Math.abs(dy)*1.55)window.show(current+(dx<0?1:-1));
  },{passive:true});
  document.querySelectorAll('img').forEach(image=>image.draggable=false);

  document.querySelectorAll('[data-strength]').forEach(button=>button.onclick=()=>{
    document.querySelectorAll('[data-strength]').forEach(item=>item.classList.remove('selected'));
    button.classList.add('selected');
    document.querySelector('#strengthOut').textContent=`Crew strength selected: ${button.dataset.strength}. Give one example.`;
  });
  document.querySelectorAll('.crew-role').forEach(button=>button.onclick=()=>button.classList.toggle('selected'));
  document.querySelectorAll('#evidenceStream [data-state]').forEach(button=>button.onclick=()=>{
    button.classList.add(button.dataset.state);
    button.querySelector('em').textContent=button.dataset.state.toUpperCase();
    document.querySelector('#evidenceOut').textContent=button.dataset.state==='fact'?'Fact confirmed: it is observed, measured, or recorded.':'Assumption identified: ask for evidence before using it.';
  });
  document.querySelectorAll('.equipment-wave button').forEach(button=>button.onclick=()=>button.classList.toggle('open'));

  const loadoutButtons=[...document.querySelectorAll('#loadout [data-points]')];
  loadoutButtons.forEach(button=>button.onclick=()=>{
    const selected=loadoutButtons.filter(item=>item.classList.contains('selected'));
    if(button.classList.contains('selected'))button.classList.remove('selected');
    else if(selected.length<3)button.classList.add('selected');
    const active=loadoutButtons.filter(item=>item.classList.contains('selected'));
    decisionScores.loadout=active.reduce((sum,item)=>sum+Number(item.dataset.points),0);
    document.querySelector('#capacityFill').style.width=`${active.length/3*100}%`;
    document.querySelector('#loadoutOut').textContent=active.length===3?`Loadout complete: ${active.map(item=>item.textContent).join(', ')}.`:`${active.length} / 3 selected. Explain what problem each item solves.`;
    paintHud();
  });

  const sequence=(selector,outputId,total)=>{
    let selected=[];
    document.querySelectorAll(selector).forEach(button=>button.onclick=()=>{
      const value=Number(button.dataset.order);if(selected.includes(value))return;
      selected.push(value);button.classList.add('used');
      const correct=selected.every((item,index)=>item===index);const output=document.querySelector(`#${outputId}`);
      if(!correct){output.textContent='Sequence interrupted. Leave the slide and return to reset.';return;}
      output.textContent=selected.length===total?'Sequence confirmed. Retell all seven steps without reading.':`${selected.length} / ${total} actions selected in the correct order.`;
    });
  };
  sequence('#alertOrder [data-order]','alertOrderOut',7);
  document.querySelectorAll('[data-priority]').forEach(button=>button.onclick=()=>{button.classList.toggle('open');button.querySelector('em').textContent=button.dataset.priority;});

  const singleDecision=(selector,scoreKey,outputId,formatter)=>{
    document.querySelectorAll(`${selector} [data-points]`).forEach(button=>button.onclick=()=>{
      document.querySelectorAll(`${selector} [data-points]`).forEach(item=>item.classList.remove('selected'));
      button.classList.add('selected');decisionScores[scoreKey]=Number(button.dataset.points);paintHud();
      document.querySelector(`#${outputId}`).textContent=formatter(button);
    });
  };
  singleDecision('#leakDecision','leak','leakOut',button=>Number(button.dataset.points)>=4?'Evidence-based plan selected. Name the valve, pressure test, and next step.':'Plan recorded. Identify the safety problem and propose an improvement.');
  singleDecision('#routeDecision','route','routeOut',button=>`Route selected: ${button.dataset.route}. Give two reasons and one risk.`);
  document.querySelectorAll('.log-questions [data-answer]').forEach(button=>button.onclick=()=>button.classList.toggle('open'));
  document.querySelectorAll('.reply-spiral button').forEach(button=>button.onclick=()=>{
    document.querySelectorAll('.reply-spiral button').forEach(item=>item.classList.remove('selected'));
    button.classList.add('selected');
  });

  let keyRun;
  document.querySelector('#keyStart').onclick=()=>{
    clearInterval(keyRun);let seconds=12;document.querySelector('#keyTimer').textContent=seconds;document.querySelector('#keyOut').textContent='Search silently.';
    keyRun=setInterval(()=>{seconds-=1;document.querySelector('#keyTimer').textContent=seconds;if(seconds<=0){clearInterval(keyRun);document.querySelector('#keyOut').textContent='Describe the location now. Click the key when everyone agrees.';}},1000);
  };
  document.querySelector('#hiddenKey').onclick=()=>{
    document.querySelector('#hiddenKey').classList.add('found');
    document.querySelector('#keyOut').textContent='Access key found near the lower-left corridor equipment.';
  };
  const code=[];
  document.querySelectorAll('#codeClues [data-code]').forEach(button=>button.onclick=()=>{
    if(button.classList.contains('solved'))return;
    button.classList.add('solved');button.querySelector('em').textContent=button.dataset.code;code.push(button.dataset.code);
    document.querySelector('#codeOut').textContent=`Code: ${code.join(' · ')}${code.length<7?' · _'.repeat(7-code.length):' · ACCESS CONFIRMED'}`;
  });

  let launchRun;
  document.querySelector('#launchStart').onclick=()=>{
    clearInterval(launchRun);let seconds=90;document.querySelector('#launchTimer').textContent=seconds;
    launchRun=setInterval(()=>{seconds-=1;document.querySelector('#launchTimer').textContent=seconds;if(seconds<=0)clearInterval(launchRun);},1000);
  };
  function calculateOutcome(){
    const score=totalScore();document.querySelector('#outcomeScore').textContent=String(score).padStart(2,'0');
    const title=document.querySelector('#outcomeTitle'),text=document.querySelector('#outcomeText');
    if(score>=14){title.textContent='CLEAN ESCAPE';text.textContent='The crew repaired the leak, chose an evidence-based route, and reached the pod with reserve oxygen. Explain which choices created this result.';}
    else if(score>=9){title.textContent='ESCAPE WITH A DELAY';text.textContent='The crew reached the pod, but one weak decision cost time or supplies. Identify that decision and improve it.';}
    else if(score>0){title.textContent='MISSION PAUSED';text.textContent='The plan needs stronger evidence, safer teamwork, or better supplies before launch. Revisit one decision and recalculate.';}
    else{title.textContent='MISSION AWAITING DATA';text.textContent='Complete the loadout, leak, and route decisions to calculate the result.';}
  }
  document.querySelector('#recalculate').onclick=calculateOutcome;
  document.querySelectorAll('#exitChoices button').forEach(button=>button.onclick=()=>{
    document.querySelectorAll('#exitChoices button').forEach(item=>item.classList.remove('selected'));
    button.classList.add('selected');document.querySelector('#exitOut').textContent='Selected. Complete the line with a concrete mission detail.';
  });

  const audioRail=(sceneNumber,source,label,transcript)=>{
    const host=allScenes[sceneNumber-1].querySelector(sceneNumber===11?'.alert-stage>div:last-child':'.log-stage');
    const rail=document.createElement('div');rail.className='audio-rail';
    rail.innerHTML=`<audio preload="metadata" src="${source}"></audio><button class="audio-play">PLAY AUDIO</button><span>${label}</span><button class="audio-text">TRANSCRIPT</button><p class="audio-transcript">${transcript}</p>`;
    host.appendChild(rail);const audio=rail.querySelector('audio');
    rail.querySelector('.audio-play').onclick=()=>{if(audio.paused){audio.play();rail.querySelector('.audio-play').textContent='PAUSE';}else{audio.pause();rail.querySelector('.audio-play').textContent='PLAY AUDIO';}};
    audio.onended=()=>rail.querySelector('.audio-play').textContent='PLAY AUDIO';
    rail.querySelector('.audio-text').onclick=()=>rail.querySelector('.audio-transcript').classList.toggle('open');
  };
  audioRail(11,'assets/audio/station-alert.wav','STATION EMERGENCY ANNOUNCEMENT','Orbit Station Nine has lost main power. Oxygen is falling in the greenhouse ring. The main corridor is blocked, and the escape pod has six minutes of reserve power. Check the evidence, choose essential supplies, agree on one route, stay together, and test a damaged airlock before opening it.');
  audioRail(19,'assets/audio/captain-log.wav','CAPTAIN LOG · 14:30','Smoke was reported near the service ring, but the temperature sensor is normal. A greenhouse pipe is leaking. The exterior arm is shortest but has no cover. Check the greenhouse route first. If the leak is small, close the valve and continue. If pressure falls again, return to the service ring.');
})();
