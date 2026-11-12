(function(){
'use strict';
const app=window.practiceModel;
function levelName(l){return {easy:'Foundation Mode',medium:'Core Mode',hard:'Challenge Mode'}[l]}
function graph(q,showAnswer=false){
 const {min,max,mode,x,y}=q.raw;
 const margin=30, span=240, step=q.raw.step;
 const px=v=>margin+(v-min)*span/(max-min),py=v=>margin+(max-v)*span/(max-min);
 let lines='',ticks='';
 for(let n=min;n<=max;n+=step){
  const color=n===0?'#274157':'#d5e0e8';
  lines+='<path stroke="'+color+'" stroke-width="'+(n===0?2.4:1)+'" d="M'+px(n)+' 30v240 M30 '+py(n)+'h240"/>';
  if(max-min<=8||n%(2*step)===0){
   ticks+='<text x="'+px(n)+'" y="'+(py(0)+15)+'">'+n+'</text>';
   if(n!==0)ticks+='<text x="'+(px(0)-12)+'" y="'+(py(n)+4)+'">'+n+'</text>';
  }
 }
 const dot=mode==='Read'||showAnswer?'<circle cx="'+px(x)+'" cy="'+py(y)+'" r="5.4" fill="#c84232"/><text x="'+(px(x)+8)+'" y="'+(py(y)-8)+'">P</text>':'';
 return '<svg class="coordinate-grid" viewBox="0 0 300 300" aria-label="Coordinate grid" role="img"><rect width="300" height="300" rx="10" fill="#fff"/>'+lines+'<g font-size="10" text-anchor="middle" fill="#253c50">'+ticks+'<text x="282" y="'+py(0)+'">x</text><text x="'+px(0)+'" y="18">y</text></g>'+dot+'<circle class="chosen" r="5" fill="#126cc3" visibility="hidden"/></svg>';
}
function bindGraph(level,q,inputs){
 if(q.raw.mode!=='Plot')return;
 const svg=el(level+'Problem').querySelector('svg'),{min,max}=q.raw;
 function mark(){
  const dot=svg.querySelector('.chosen'),x=Number(inputs[0].value),y=Number(inputs[1].value);
  const valid=inputs.every(i=>i.value.trim()!=='')&&[x,y].every(v=>v>=min&&v<=max);
  dot.setAttribute('visibility',valid?'visible':'hidden');dot.setAttribute('cx',30+240*(x-min)/(max-min));dot.setAttribute('cy',30+240*(max-y)/(max-min));
 }
 inputs.forEach(i=>i.addEventListener('input',mark));
 svg.addEventListener('click',e=>{
  if(inputs[0].disabled)return;
  const p=new DOMPoint(e.clientX,e.clientY).matrixTransform(svg.getScreenCTM().inverse());
  if(p.x<24||p.x>276||p.y<24||p.y>276)return;
  const step=q.raw.step,snap=v=>Math.max(min,Math.min(max,Math.round(v/step)*step));
  inputs[0].value=snap(min+(p.x-30)*(max-min)/240);inputs[1].value=snap(max-(p.y-30)*(max-min)/240);mark();
 });
}

const appSoundFiles={correct:'sounds/correct.wav',incorrect:'sounds/incorrect.wav',lock:'sounds/unlock-click.wav',unlock:'sounds/achievement.wav',timerTick:'sounds/timer-tick.wav',timerFinished:'sounds/timer-finished.wav'};
const appSoundVolumes={correct:1,incorrect:.48,lock:.44,unlock:.35,timerTick:.38,timerFinished:.72};
const appSounds={};Object.entries(appSoundFiles).forEach(([k,v])=>{const a=new Audio(v);a.preload='auto';a.volume=appSoundVolumes[k]??1;appSounds[k]=a});
function playAppSound(type){if(el("batchSound").getAttribute("aria-pressed")==="false")return;try{const a=appSounds[type];if(!a)return;a.pause();a.currentTime=0;const p=a.play();if(p&&p.catch)p.catch(()=>{})}catch(_){}}
const el=id=>document.getElementById(id);
const orbLevels=['easy','medium','hard'];
function initialLevels(){return {easy:{unlock:0,unlocked:true,session:null,q:null,resolved:false,transitioning:false,notice:''},medium:{unlock:0,unlocked:false,session:null,q:null,resolved:false,transitioning:false,notice:''},hard:{unlock:0,unlocked:false,session:null,q:null,resolved:false,transitioning:false,notice:''}}}
const state={mode:'student',activeLevel:'easy',timerId:null,timeLeft:0,...initialLevels()};
const completedResults={easy:null,medium:null,hard:null};
function clearOrbTimer(level){const orb=document.querySelector(`.level-orb[data-level="${level}"]`);if(!orb)return;orb.classList.remove('timer-ready','timer-running','timer-finished');orb.style.removeProperty('--timer-progress');orb.style.removeProperty('--progress');const v=orb.querySelector('.orb-timer-value');if(v)v.textContent=''}
function clearAllOrbTimers(){orbLevels.forEach(clearOrbTimer)}
function showOrbTimer(level,value,status='ready',progress=1){clearAllOrbTimers();const orb=document.querySelector(`.level-orb[data-level="${level}"]`);if(!orb)return;orb.classList.add(`timer-${status}`);orb.style.setProperty('--progress',Math.max(0,Math.min(1,progress)));const v=orb.querySelector('.orb-timer-value');if(v)v.textContent=value}
function formatSessionTime(s){const n=Math.max(0,Math.round(Number(s)||0));return n<60?`${n} sec`:`${Math.floor(n/60)}m ${n%60}s`}
function sessionReportNote(level,u){return u>=3?`${levelName(level)} is unlocked for continued practice.`:`Keep practicing — ${3-u} more correct ${3-u===1?'answer':'answers'} to complete this level.`}
function recordCompletedResult(level,session,accuracy){completedResults[level]={correct:session.correct,incorrect:session.incorrect,total:session.total,accuracy,mode:session.mode,timeLimit:session.timeLimit}}
function clearCompletedResults(){orbLevels.forEach(l=>completedResults[l]=null)}
function printCombinedResults(){
 const rows=orbLevels.filter(l=>completedResults[l]).map(l=>{const r=completedResults[l];return `<tr><td>${levelName(l)}</td><td>${r.correct}</td><td>${r.incorrect}</td><td>${r.accuracy}%</td></tr>`}).join('');
 const w=window.open('','_blank','width=820,height=700');if(!w)return;
 w.document.write(`<title>${app.title} — Results</title><h1>${app.title}</h1><table border="1" cellspacing="0" cellpadding="8"><tr><th>Level</th><th>Correct</th><th>Incorrect</th><th>Accuracy</th></tr>${rows||'<tr><td colspan="4">No completed sessions yet.</td></tr>'}</table>`);w.document.close();w.print();
}
function updateLiveStats(level){const box=el(level+'LiveStats'),s=state[level].session;if(!box||!s)return;if(state[level].unlock>=3){box.textContent=`This session: ${s.correct} correct · ${s.incorrect} incorrect`;box.classList.remove('hidden')}else box.classList.add('hidden')}
function renderStart(level){el(level+'Body').innerHTML=`<button class="start" data-level="${level}">Start</button>`;el(level+'Body').querySelector('button').onclick=()=>newSession(level)}
function newSession(level){
  if(!state[level].unlocked)return;
  if(state.activeLevel&&state.activeLevel!==level&&state[state.activeLevel].session)finishSession(state.activeLevel);
  clearAllOrbTimers();state.activeLevel=level;
  state[level].session={correct:0,incorrect:0,total:0,mode:state.mode,timeLimit:state.mode==='timer'?Number(el('duration').value):0,startedAt:Date.now()};
  state[level].resolved=false;state[level].transitioning=false;state[level].q=generateQuestion(level);renderQuestion(level);startTimer();
}
function startTimer(){
  clearInterval(state.timerId);state.timerId=null;if(state.mode!=='timer'){clearAllOrbTimers();return}
  const level=state.activeLevel,total=Number(el('duration').value);state.timeLeft=total;showOrbTimer(level,total,'ready',1);
  state.timerId=setInterval(()=>{state.timeLeft--;showOrbTimer(level,Math.max(0,state.timeLeft),'running',state.timeLeft/total);if(state.timeLeft>0&&state.timeLeft<=5)playAppSound('timerTick');if(state.timeLeft<=0){clearInterval(state.timerId);state.timerId=null;playAppSound('timerFinished');finishSession(level,{timerExpired:true})}},1000);
}
const tier={easy:'foundation',medium:'core',hard:'challenge'};
const histories=new Map();
function generateQuestion(level,type=el('practiceType').value){
 const key=[level,type].join('|'),history=histories.get(key)||[];
 for(let i=0;i<1500;i++){
  const q=app.make(tier[level],type),signature=q.key||q.prompt;
  if(history.includes(signature))continue;
  history.push(signature);if(history.length>14)history.shift();
  histories.set(key,history);return q;
 }
 throw Error('Unable to find a distinct question');
}
function formatAnswer(q){return q.answers.map((a,i)=>q.labels.length===1?a:q.labels[i]+': '+a).join(' · ')}
function problem(q){return q.prompt+(app.id==='coordinates'?graph(q):'')}
function fractionMatches(values,answer){
 const [whole,num,den]=values;
 if(!values.every(v=>v===''||/^\d{1,9}$/.test(v)))return false;
 if((num==='')!==(den==='')||den==='0'||(den!==''&&Number(den)===0))return false;
 if(!whole&&!num)return false;
 const d=BigInt(den||1),n=BigInt(whole||0)*d+BigInt(num||0);
 return 100n*n===BigInt(Math.round(Number(answer)*100))*d;
}
function renderQuestion(level){
 const s=state[level],q=s.q;s.resolved=false;s.transitioning=false;
 const allowFraction=app.id==='unitary'&&!q.raw.money&&!q.raw.reverse;
 const labels=allowFraction&&s.fraction?['Whole number','Numerator','Denominator']:q.labels;
 const switcher=allowFraction?'<button class="fraction-choice" type="button">'+(s.fraction?'Use number input':'Use fraction input')+'</button>':'';
 const boxes=labels.map((label,i)=>`<label>${label}<input class="batch-input" id="${level}Answer${i||''}" inputmode="${app.id==='brackets'?'text':s.fraction?'numeric':'decimal'}" autocomplete="off" maxlength="80"></label>`);
 const fields=switcher+(labels.length===3&&allowFraction?'<div class="fraction-answer-entry">'+boxes[0]+'<div class="answer-fraction-stack">'+boxes[1]+'<span class="answer-fraction-bar"></span>'+boxes[2]+'</div></div>':boxes.join(''));
 el(level+'Body').innerHTML=`<div id="${level}Problem" class="whole-question question-fade-in">${problem(q)}</div><div class="whole-answer-row batch-fields">${fields}<button class="primary" id="${level}Check">Check</button></div><div class="actions"><button class="primary hidden" id="${level}Next">Next</button><button class="done" id="${level}Done">Done</button></div><div class="feedback" role="status" id="${level}Feedback"></div><div class="live-session hidden" id="${level}LiveStats"></div><div class="bubble hidden" id="${level}Bubble"><div class="bubble-title">Worked solution</div>${q.steps}</div>`;
 const inputs=[...el(level+'Body').querySelectorAll('.batch-input')];
 const toggle=el(level+'Body').querySelector('.fraction-choice');
 if(toggle)toggle.onclick=()=>{s.fraction=!s.fraction;renderQuestion(level)};
 if(app.id==='coordinates')bindGraph(level,q,inputs);
 el(level+'Check').onclick=()=>check(level);el(level+'Next').onclick=()=>nextQuestion(level);el(level+'Done').onclick=()=>finishSession(level);
 for(const input of inputs)input.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();if(!e.repeat)check(level)}};
 updateLiveStats(level);inputs[0].focus({preventScroll:true});
}
function check(level){
 const s=state[level];if(!s.session||s.resolved||s.transitioning)return;
 const q=s.q,inputs=[...el(level+'Body').querySelectorAll('.batch-input')],feedback=el(level+'Feedback');
 const values=inputs.map(i=>i.value.trim().replace(/−/g,'-').replace(',','.'));
 const fraction=app.id==='unitary'&&inputs.length===3;
 if(fraction?values.every(v=>!v):values.some(v=>!v)){feedback.textContent=fraction?'Enter a whole number, a fraction, or both.':'Complete each answer field.';return}
 const correct=fraction?fractionMatches(values,q.answers[0]):app.equivalent?app.equivalent(values[0],q):values.every((v,i)=>/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(v)&&Number(v)===Number(q.answers[i]));
 s.resolved=true;s.session.total++;
 if(correct){
  s.session.correct++;
  if(s.unlock<3){s.unlock++;el(level+'Progress').textContent=s.unlock+' / 3';if(s.unlock===3){const next=level==='easy'?'medium':level==='medium'?'hard':null;if(next&&!state[next].unlocked)unlock(next)}}
  feedback.textContent='Correct!';feedback.className='feedback correct';playAppSound('correct');
 }else{
  s.session.incorrect++;feedback.textContent='Incorrect. Correct answer: '+formatAnswer(q);feedback.className='feedback incorrect';el(level+'Bubble').classList.remove('hidden');playAppSound('incorrect');
 }
 inputs.forEach(i=>i.disabled=true);const toggle=el(level+'Body').querySelector('.fraction-choice');if(toggle)toggle.disabled=true;
 el(level+'Check').classList.add('hidden');el(level+'Next').classList.remove('hidden');el(level+'Next').focus({preventScroll:true});updateLiveStats(level);
}
el('practiceType').onchange=()=>{const l=state.activeLevel;if(state[l]?.session){state[l].q=generateQuestion(l);renderQuestion(l)}};

function nextQuestion(level){
  const s=state[level];if(!s.session||!s.resolved||s.transitioning)return;s.transitioning=true;
  const p=el(level+'Problem');if(p)p.classList.add('question-fade-out');
  setTimeout(()=>{if(!s.session||state[level]!==s)return;s.q=generateQuestion(level);renderQuestion(level)},170);
}
function finishSession(level,{timerExpired=false}={}){
  const s=state[level];if(!s.session)return;clearInterval(state.timerId);state.timerId=null;
  const session=s.session,acc=session.total?Math.round(session.correct/session.total*100):0;recordCompletedResult(level,session,acc);
  const elapsed=Math.round((Date.now()-session.startedAt)/1000);
  el(level+'Body').innerHTML=`<div class="report"><div class="report-title">Session Report</div><div class="report-grid${session.mode==='timer'?' has-time':''}"><div class="stat"><strong>${session.correct}</strong><span>Correct</span></div><div class="stat"><strong>${session.incorrect}</strong><span>Incorrect</span></div><div class="stat"><strong>${acc}%</strong><span>Accuracy</span></div>${session.mode==='timer'?`<div class="stat"><strong>${formatSessionTime(Math.min(elapsed,session.timeLimit||elapsed))}</strong><span>Time Used</span></div>`:''}</div><div class="report-note">${timerExpired?'Time is up. ':''}${sessionReportNote(level,s.unlock)}</div><div class="report-actions"><button class="restart" id="${level}Restart">Start Again</button><button class="print-results-button" id="${level}PrintResults" type="button">Print Results</button></div></div>`;
  el(level+'Restart').onclick=()=>newSession(level);el(level+'PrintResults').onclick=printCombinedResults;s.session=null;s.resolved=false;s.transitioning=false;clearAllOrbTimers();
}
function positionUnlockCelebration(anchorLevel){
  const banner=document.getElementById('banner');
  if(!banner)return;
  if(window.innerWidth<=900){
    banner.style.left='';
    banner.style.top='';
    return;
  }
  const card=document.getElementById(anchorLevel+'Card');
  const column=document.querySelector('.practice-main-column');
  if(!card||!column)return;
  if(banner.parentElement!==column)column.appendChild(banner);
  const cardRect=card.getBoundingClientRect();
  const columnRect=column.getBoundingClientRect();
  const bannerWidth=banner.offsetWidth||330;
  const bannerHeight=banner.offsetHeight||92;
  const inset=14;
  const gap=10;
  const left=Math.max(inset,Math.min(cardRect.right-columnRect.left-bannerWidth-inset,columnRect.width-bannerWidth-inset));
  const top=Math.max(8,cardRect.top-columnRect.top-bannerHeight-gap);
  banner.style.left=`${Math.round(left)}px`;
  banner.style.top=`${Math.round(top)}px`;
}

function showUnlockCelebration(modeName,anchorLevel){
  const banner=document.getElementById('banner');
  if(!banner)return;
  banner.innerHTML=`<span class="unlock-celebration-icon" aria-hidden="true">✦</span><span class="unlock-celebration-kicker">Level unlocked</span><strong class="unlock-celebration-title">${modeName} Unlocked</strong><span class="unlock-celebration-sub">You can now practice this mode whenever you’re ready.</span>`;
  banner.classList.remove('show');
  positionUnlockCelebration(anchorLevel);
  void banner.offsetWidth;
  banner.classList.add('show');
  playAppSound('unlock');
  clearTimeout(banner._unlockCelebrationTimer);
  banner._unlockCelebrationTimer=setTimeout(()=>banner.classList.remove('show'),4900);
}

function unlock(level){
  const card=el(level+'Card'),lock=el(level+'Lock');if(!card||state[level].unlocked)return;
  if(lock){lock.classList.add('shake');setTimeout(()=>{lock.classList.remove('shake');lock.classList.add('open');playAppSound('lock')},350)}
  const pending=state[level];setTimeout(()=>{if(state[level]!==pending)return;state[level].unlocked=true;card.classList.remove('locked');card.classList.add('active');el(level+'Progress').classList.remove('hidden');renderStart(level);const prev=level==='medium'?'easy':'medium';state[prev].notice=`${levelName(level)} is now available. You can continue practicing in ${levelName(prev)} until you feel ready to move on.`;showUnlockCelebration(levelName(level),prev)},900);
}
function setMode(mode){
  if(state.activeLevel&&state[state.activeLevel].session)finishSession(state.activeLevel);
  state.mode=mode;el('studentMode').classList.toggle('active',mode==='student');el('timerMode').classList.toggle('active',mode==='timer');el('durationWrap').classList.toggle('show',mode==='timer');
  el('modeTip').textContent=mode==='student'?'Student Mode lets you work without a countdown. Incorrect answers reveal the correct answer and a teaching hint. Press Enter or Next to continue.':'Timer Mode is a speed challenge. The colored circle for the level you are practicing becomes the countdown timer.';
  if(mode==='timer')showOrbTimer(state.activeLevel||'easy',el('duration').value,'ready',1);else clearAllOrbTimers();
}
el('studentMode').onclick=()=>setMode('student');el('timerMode').onclick=()=>setMode('timer');el('duration').onchange=()=>{if(state.mode==='timer'&&!state[state.activeLevel]?.session)showOrbTimer(state.activeLevel||'easy',el('duration').value,'ready',1)};
const resetModalBackdrop=el('resetModalBackdrop'),resetProgressButton=el('resetProgressButton'),resetCancelButton=el('resetCancelButton'),resetConfirmButton=el('resetConfirmButton');
function closeResetModal(){resetModalBackdrop.classList.remove('show');resetProgressButton.focus()}
function openResetModal(){resetModalBackdrop.classList.add('show');resetCancelButton.focus()}
function resetAllProgress(){
 clearCompletedResults();clearInterval(state.timerId);state.timerId=null;state.mode='student';state.activeLevel='easy';
 const initial=initialLevels();orbLevels.forEach(l=>state[l]=initial[l]);
 histories.clear();
 el('studentMode').classList.add('active');el('timerMode').classList.remove('active');el('durationWrap').classList.remove('show');clearAllOrbTimers();refreshLevelCards();closeResetModal();
}
function refreshLevelCards(){
 for(const l of orbLevels){const s=state[l],card=el(l+'Card');card.className=`card ${s.unlocked?'active':'locked'}`;el(l+'Progress').textContent=`${s.unlock} / 3`;el(l+'Progress').classList.toggle('hidden',!s.unlocked);if(s.unlocked)renderStart(l);else el(l+'Body').innerHTML=`<div class="lock" id="${l}Lock"><div class="shackle"></div><div class="lockbody"></div></div>`;}
}
resetProgressButton.addEventListener('click',openResetModal);resetCancelButton.addEventListener('click',closeResetModal);resetConfirmButton.addEventListener('click',resetAllProgress);resetModalBackdrop.addEventListener('click',e=>{if(e.target===resetModalBackdrop)closeResetModal()});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&resetModalBackdrop.classList.contains('show'))closeResetModal()});



el('batchSound').onclick=()=>{const b=el('batchSound'),on=b.getAttribute('aria-pressed')!=='true';b.setAttribute('aria-pressed',on);b.textContent='Sound '+(on?'on':'off')};
renderStart('easy');
})();
