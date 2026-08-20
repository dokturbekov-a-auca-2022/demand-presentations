(() => {
  const allScenes=[...document.querySelectorAll('.scene')];
  const note=document.querySelector('#note');
  const map=document.querySelector('#map');
  const count=document.querySelector('#count');
  const bar=document.querySelector('#bar');
  let current=0;

  map.innerHTML=`<h3>EVERYDAY ACTION STUDIO · CUT LIST</h3>${scenes.map((scene,index)=>`<button data-jump="${index}">${String(index+1).padStart(2,'0')} · ${scene.title}</button>`).join('')}`;

  window.show=(index)=>{
    current=(index+allScenes.length)%allScenes.length;
    allScenes.forEach((scene,sceneIndex)=>{
      scene.classList.toggle('active',sceneIndex===current);
      if(sceneIndex===current){
        scene.scrollTop=0;
        scene.querySelectorAll('[style*="animation"]').forEach(element=>{
          element.style.animationPlayState='running';
        });
      }
    });
    count.textContent=`${current+1} / ${allScenes.length}`;
    bar.style.width=`${((current+1)/allScenes.length)*100}%`;
    note.classList.remove('open');
    map.classList.remove('open');
  };
  window.show(0);

  document.querySelector('#next').onclick=()=>window.show(current+1);
  document.querySelector('#prev').onclick=()=>window.show(current-1);
  document.querySelector('#mapBtn').onclick=()=>map.classList.toggle('open');
  document.querySelector('#noteBtn').onclick=()=>{
    note.innerHTML=`<b>Teacher note · ${current+1}</b><br>${scenes[current].note}`;
    note.classList.toggle('open');
  };
  map.onclick=event=>{
    if(event.target.dataset.jump!==undefined)window.show(Number(event.target.dataset.jump));
  };
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
    const dx=event.changedTouches[0].screenX-touchX;
    const dy=event.changedTouches[0].screenY-touchY;
    if(Math.abs(dx)>78&&Math.abs(dx)>Math.abs(dy)*1.5)window.show(current+(dx<0?1:-1));
  },{passive:true});
  document.querySelectorAll('img').forEach(image=>image.draggable=false);

  document.querySelectorAll('[data-pick]').forEach(button=>button.onclick=()=>{
    document.querySelectorAll('[data-pick]').forEach(item=>item.classList.remove('selected'));
    button.classList.add('selected');
    document.querySelector('#checkinOut').textContent=`I ${button.dataset.pick} ... Add when, where, and the next action.`;
  });

  const particleMeanings={ON:'start a device',OFF:'stop a device',UP:'increase or complete',DOWN:'reduce or move lower'};
  document.querySelectorAll('[data-particle]').forEach(button=>button.onclick=()=>{
    document.querySelectorAll('[data-particle]').forEach(item=>item.classList.remove('selected'));
    button.classList.add('selected');
    document.querySelector('#particleMeaning').textContent=`TURN ${button.dataset.particle} = ${particleMeanings[button.dataset.particle]}`;
  });
  document.querySelectorAll('.river-word').forEach(button=>button.onclick=()=>button.classList.toggle('open'));
  document.querySelectorAll('.meaning-line').forEach(button=>button.onclick=()=>{
    button.classList.add('open');
    button.querySelector('b').textContent=button.dataset.answer;
  });

  const sequence=(selector,outputId,total)=>{
    let selected=[];
    document.querySelectorAll(selector).forEach(button=>button.onclick=()=>{
      const value=Number(button.dataset.order);
      if(selected.includes(value))return;
      selected.push(value);
      button.classList.add('used');
      const correct=selected.every((item,index)=>item===index);
      const output=document.querySelector(`#${outputId}`);
      if(!correct){output.textContent='That order is not logical. Leave the slide and return to reset.';return;}
      output.textContent=selected.length===total?'Correct. Retell the complete sequence without reading.':`${selected.length} / ${total} actions selected in the correct order.`;
    });
  };
  sequence('#morningOrder [data-order]','orderOut',7);
  sequence('#audioOrder [data-order]','audioOrderOut',7);

  let swapped=false;
  document.querySelector('#swapBtn').onclick=()=>{
    swapped=!swapped;
    document.querySelector('#swapObject').textContent=swapped?'YOUR SHOES':'OFF';
    document.querySelector('#swapLine').textContent=swapped?'Take your shoes off.':'Take off your shoes.';
  };
  document.querySelectorAll('#pronouns [data-state]').forEach(button=>button.onclick=()=>{
    button.classList.add(button.dataset.state);
    document.querySelector('#pronounOut').textContent=button.dataset.state==='good'?'Correct. The pronoun sits between the verb and particle.':'Incorrect. Move the pronoun into the middle.';
  });
  document.querySelectorAll('#controlled [data-answer],.reading-questions [data-answer]').forEach(button=>button.onclick=()=>button.classList.toggle('open'));
  document.querySelectorAll('.problem-lines>div').forEach(line=>line.onclick=()=>line.classList.toggle('open'));
  document.querySelectorAll('[data-charade]').forEach(button=>button.onclick=()=>button.classList.toggle('open'));

  let searchRun;
  document.querySelector('#searchStart').onclick=()=>{
    clearInterval(searchRun);
    let seconds=15;
    document.querySelector('#searchTimer').textContent=seconds;
    document.querySelector('#searchAnswer').textContent='Search silently.';
    searchRun=setInterval(()=>{
      seconds-=1;
      document.querySelector('#searchTimer').textContent=seconds;
      if(seconds<=0){
        clearInterval(searchRun);
        document.querySelector('#searchAnswer').textContent='The keys are on the dark rug beside the sneaker.';
      }
    },1000);
  };

  const dropRounds=[
    ['Please turn ___ the light before you leave.','OFF'],
    ['We have run ___ of bread.','OUT'],
    ['Put ___ your jacket. It is cold.','ON'],
    ['Please pick ___ the papers.','UP'],
    ['Carry ___. You are doing well.','ON'],
    ['I found ___ the answer yesterday.','OUT'],
    ['Wake ___! The bus is here.','UP']
  ];
  let dropRound=0;
  const paintDrop=()=>{
    document.querySelector('#dropSentence').textContent=dropRounds[dropRound][0];
    document.querySelector('#dropOut').textContent=`Round ${dropRound+1} / ${dropRounds.length}`;
    document.querySelectorAll('[data-drop]').forEach(button=>button.classList.remove('correct','wrong'));
  };
  document.querySelectorAll('[data-drop]').forEach(button=>button.onclick=()=>{
    if(button.dataset.drop===dropRounds[dropRound][1]){
      button.classList.add('correct');
      setTimeout(()=>{dropRound=(dropRound+1)%dropRounds.length;paintDrop();},550);
    }else button.classList.add('wrong');
  });
  paintDrop();

  let finalRun;
  document.querySelector('#finalStart').onclick=()=>{
    clearInterval(finalRun);
    let seconds=60;
    document.querySelector('#finalTimer').textContent=seconds;
    finalRun=setInterval(()=>{
      seconds-=1;
      document.querySelector('#finalTimer').textContent=seconds;
      if(seconds<=0)clearInterval(finalRun);
    },1000);
  };
  document.querySelectorAll('#exitLines button').forEach(button=>button.onclick=()=>{
    document.querySelectorAll('#exitLines button').forEach(item=>item.classList.remove('selected'));
    button.classList.add('selected');
    document.querySelector('#exitOut').textContent='Selected. Complete the line aloud and give your confidence score.';
  });

  const audioRail=(sceneNumber,source,label,transcript)=>{
    const host=allScenes[sceneNumber-1].querySelector(sceneNumber===15?'.sound-stage':'.final-cut');
    const rail=document.createElement('div');
    rail.className='audio-rail';
    rail.innerHTML=`<audio preload="metadata" src="${source}"></audio><button class="audio-play">PLAY AUDIO</button><span>${label}</span><button class="audio-text">TRANSCRIPT</button><p class="audio-transcript">${transcript}</p>`;
    host.appendChild(rail);
    const audio=rail.querySelector('audio');
    rail.querySelector('.audio-play').onclick=()=>{
      if(audio.paused){audio.play();rail.querySelector('.audio-play').textContent='PAUSE';}
      else{audio.pause();rail.querySelector('.audio-play').textContent='PLAY AUDIO';}
    };
    audio.onended=()=>rail.querySelector('.audio-play').textContent='PLAY AUDIO';
    rail.querySelector('.audio-text').onclick=()=>rail.querySelector('.audio-transcript').classList.toggle('open');
  };
  audioRail(15,'assets/audio/maya-morning.wav','MAYA · MORNING VOICE NOTE','I woke up late and turned off my alarm without getting up. Then I put on my hoodie and looked for my keys. I found them under a jacket and picked them up. I had run out of cereal, so I headed out, got on the bus, and met up with Lina.');
  audioRail(27,'assets/audio/action-shadow.wav','ACTION SHADOWING TRACK','Wake up. Turn it off. Put on your jacket. Pick up your bag. Look for your keys. Head out. Get on the bus. Get off at school. Meet up with your friends. Carry on.');
})();
