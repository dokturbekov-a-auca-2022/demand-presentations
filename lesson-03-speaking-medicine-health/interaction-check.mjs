import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const here=path.dirname(fileURLToPath(import.meta.url));
const page=pathToFileURL(path.join(here,"index.html")).href;
const profile=fs.mkdtempSync(path.join(os.tmpdir(),"broadcast-check-"));
const chrome=spawn("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",["--headless=new","--disable-gpu","--remote-debugging-port=0",`--user-data-dir=${profile}`,"about:blank"],{stdio:"ignore",windowsHide:true});
const delay=ms=>new Promise(r=>setTimeout(r,ms));
let socket;const results=[];const exceptions=[];
try{
  let port;for(let i=0;i<80;i++){const f=path.join(profile,"DevToolsActivePort");if(fs.existsSync(f)){port=Number(fs.readFileSync(f,"utf8").split(/\r?\n/)[0]);break}await delay(50)}if(!port)throw Error("No DevTools port");
  const target=await fetch(`http://127.0.0.1:${port}/json/new?about:blank`,{method:"PUT"}).then(r=>r.json());socket=new WebSocket(target.webSocketDebuggerUrl);await new Promise((res,rej)=>{socket.addEventListener("open",res,{once:true});socket.addEventListener("error",rej,{once:true})});
  let id=0;const pending=new Map();socket.addEventListener("message",e=>{const m=JSON.parse(e.data);if(m.method==="Runtime.exceptionThrown"){exceptions.push(m.params.exceptionDetails.text);return}if(!m.id||!pending.has(m.id))return;const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(Error(m.error.message)):p.resolve(m.result)});function call(method,params={}){return new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});socket.send(JSON.stringify({id:n,method,params}))})}async function val(expression){const r=await call("Runtime.evaluate",{expression,returnByValue:true});return r.result.value}async function tap(selector){await val(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center'})`);await delay(120);const p=await val(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});const r=e.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2}})()`);await call("Input.dispatchTouchEvent",{type:"touchStart",touchPoints:[{x:p.x,y:p.y,radiusX:2,radiusY:2,force:1}]});await call("Input.dispatchTouchEvent",{type:"touchEnd",touchPoints:[]});await delay(180)}
  await call("Page.enable");await call("Runtime.enable");await call("Emulation.setDeviceMetricsOverride",{width:390,height:844,deviceScaleFactor:1,mobile:true,screenWidth:390,screenHeight:844});await call("Emulation.setTouchEmulationEnabled",{enabled:true,maxTouchPoints:5});
  await call("Page.navigate",{url:`${page}?check=1#1`});await delay(600);await tap("#next");results.push(["touch navigation",await val("document.getElementById('counter').textContent==='02 / 23'")]);
  await call("Page.navigate",{url:`${page}?check=5#5`});await delay(450);await tap(".signal-word:nth-child(2)");results.push(["vocabulary relay",await val("document.getElementById('relayWord').textContent==='a sore throat'")]);
  await call("Page.navigate",{url:`${page}?check=8#8`});await delay(450);await tap("#remixRandom");results.push(["symptom remix",await val("document.getElementById('remixOutput').textContent.split(' · ').length===3")]);
  await call("Page.navigate",{url:`${page}?check=11#11`});await delay(450);await tap(".case-btn");await tap("#caseReveal");results.push(["case reveal",await val("document.getElementById('caseFile').classList.contains('open')")]);
  const dimensions=await val(`(()=>{const s=document.querySelector('.scene.active');return{innerWidth,documentWidth:document.documentElement.scrollWidth,sceneWidth:s.scrollWidth,client:s.clientWidth,controlsRight:Math.round(document.querySelector('.controls').getBoundingClientRect().right)}})()`);results.push(["390px no document overflow",dimensions.documentWidth===390]);results.push(["controls fit phone",dimensions.controlsRight<=390]);console.log(JSON.stringify(dimensions));
  await call("Page.navigate",{url:`${page}?check=12#12`});await delay(450);await tap(".queue-chip:nth-child(2)");await tap("#callFollowBtn");results.push(["live caller queue",await val("document.getElementById('callScreen').classList.contains('open')")]);
  await call("Page.navigate",{url:`${page}?check=13#13`});await delay(450);await tap("[data-fact-vote='myth']");results.push(["spoken fact-check",await val("document.getElementById('factAnswer').textContent.startsWith('Myth.')")]);
  await call("Page.navigate",{url:`${page}?check=16#16`});await delay(450);await tap("[data-priority='self']");results.push(["priority newsroom",await val("document.querySelector('[data-priority=\"self\"]').classList.contains('good')")]);
  await call("Page.navigate",{url:`${page}?check=17#17`});await delay(450);await tap("#spinBtn");results.push(["consultation spinner",await val("document.getElementById('spinner').style.transform.includes('rotate')")]);
  await call("Page.navigate",{url:`${page}?check=19#19`});await delay(450);await tap("#timerStart");await delay(1100);results.push(["production timer",await val("document.getElementById('timer').textContent==='03:59'")]);
  await call("Page.navigate",{url:`${page}?check=20#20`});await delay(450);await tap(".tape-chip:nth-child(2)");await tap("#repairReveal");results.push(["spoken repair studio",await val("document.getElementById('repairScreen').classList.contains('open')")]);
  for(const sceneNo of [5,8,10,12,13,14,16,20,21]){await call("Page.navigate",{url:`${page}?layout=${sceneNo}#${sceneNo}`});await delay(180);const layout=await val(`(()=>{const s=document.querySelector('.scene.active');return{scene:${sceneNo},scroll:s.scrollWidth,client:s.clientWidth}})()`);results.push([`scene ${sceneNo} mobile layout`,layout.scroll<=layout.client,JSON.stringify(layout)])}
  results.push(["no JavaScript exceptions",exceptions.length===0,exceptions.join("; ")]);
}catch(e){results.push(["harness",false,e.stack])}finally{if(socket)socket.close();chrome.kill();await Promise.race([new Promise(resolve=>chrome.once("exit",resolve)),delay(3000)]);try{fs.rmSync(profile,{recursive:true,force:true,maxRetries:10,retryDelay:200})}catch(e){results.push(["temporary profile cleanup",false,e.message])}}
results.forEach(r=>console.log(`${r[1]?"PASS":"FAIL"} — ${r[0]}${r[2]?": "+r[2]:""}`));if(results.some(r=>!r[1]))process.exitCode=1;
