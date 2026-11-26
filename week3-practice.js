(function(){
'use strict';
const app=window.practiceModel;
function levelName(l){return {easy:'Foundation Mode',medium:'Core Mode',hard:'Challenge Mode'}[l]}
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
  state[level].resolved=false;state[level].transitioning=false;if(app.resetSequence)app.resetSequence(tier[level],'game');state[level].q=generateQuestion(level);renderQuestion(level);startTimer();
}
function startTimer(){
  clearInterval(state.timerId);state.timerId=null;if(state.mode!=='timer'){clearAllOrbTimers();return}
  const level=state.activeLevel,total=Number(el('duration').value);state.timeLeft=total;showOrbTimer(level,total,'ready',1);
  state.timerId=setInterval(()=>{state.timeLeft--;showOrbTimer(level,Math.max(0,state.timeLeft),'running',state.timeLeft/total);if(state.timeLeft>0&&state.timeLeft<=5)playAppSound('timerTick');if(state.timeLeft<=0){clearInterval(state.timerId);state.timerId=null;playAppSound('timerFinished');finishSession(level,{timerExpired:true})}},1000);
}




const tier={easy:'foundation',medium:'core',hard:'challenge'};
const histories=new Map();
function generateQuestion(level,channel='game',used=new Set()){
 const key=level+'|'+channel,history=histories.get(key)||[];
 for(let attempt=0;attempt<2000;attempt++){
  const q=app.make(tier[level],channel),signature=q.key||q.prompt;
  if(used.has(signature)||history.includes(signature))continue;
  used.add(signature);history.push(signature);
  if(history.length>14)history.shift();
  histories.set(key,history);return q;
 }
 throw Error('No distinct question is available');
}
function escapeText(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
function formatAnswer(q){
 if(q.kind==='fractionline')return q.answers[0];
 if(q.kind==='scientific')return q.answers[0]+' × 10^'+q.answers[1];
 if(q.kind==='journey'&&q.options)return q.options[Number(q.answers[0])-1];
 return q.answers.join(' · ')+(q.proof?' · '+q.proof.map((v,i)=>q.proofLabels[i]+' = '+v).join(' · '):'');
}
function journeyGraph(g){
 const left=72,top=40,width=490,height=260;
 const x=t=>left+t/g.xTop*width,y=d=>top+height-d/g.yTop*height;
 let grid='',labels='';
 const xTick=60,yTick=g.yTop<=300?50:100;
 for(let t=0;t<=g.xTop;t+=30)grid+='<path d="M'+x(t)+' '+top+'v'+height+'" stroke="#d2dce3"/>';
 for(let d=0;d<=g.yTop;d+=10)grid+='<path d="M'+left+' '+y(d)+'h'+width+'" stroke="#e0e7eb"/>';
 for(let t=0;t<=g.xTop;t+=xTick)labels+='<text x="'+x(t)+'" y="325" text-anchor="middle">'+t/60+'</text>';
 for(let d=0;d<=g.yTop;d+=yTick)labels+='<path class="y-axis-tick" d="M66 '+y(d)+'H79" stroke="#263d52" stroke-width="2"/><text class="y-axis-label" x="60" y="'+(y(d)+7)+'" text-anchor="end">'+d+'</text>';
 const line=g.times.map((t,i)=>(i?'L':'M')+x(t)+' '+y(g.dist[i])).join(' ');
 return '<svg class="journey-graph" viewBox="0 0 600 365" role="img" aria-label="Distance from start in kilometers against elapsed time in hours"><rect width="600" height="365" rx="12" fill="white"/>'+grid+'<path d="M72 40V300H562" fill="none" stroke="#263d52" stroke-width="2"/><g font-family="Arial" font-size="20" fill="#263d52">'+labels+'<text x="72" y="24">Distance from start (km)</text><text x="315" y="355" text-anchor="middle">Elapsed time (hours)</text></g><path d="'+line+'" fill="none" stroke="#b42318" stroke-width="4" stroke-linejoin="round"/>'+g.times.map((t,i)=>'<circle cx="'+x(t)+'" cy="'+y(g.dist[i])+'" r="4" fill="#b42318"/>').join('')+'</svg>';
}
function problem(q){return (q.kind==='journey'?'<p class="journey-sequence">Journey '+q.sequence.journey+' · Question '+q.sequence.part+' of '+q.sequence.total+'</p>'+journeyGraph(q.raw.graph):'')+q.prompt;}
function numberMatches(value,answer){
 const s=value.trim().replace(/−/g,'-').replace(',','.');
 return /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(s)&&Number(s)===Number(answer);
}
function fractionMatches(values,answer){
 const [whole,num,den]=values.map(v=>v.trim().replace(/−/g,'-'));
 if(!/^[+-]?\d{0,9}$/.test(whole)||!/^[+-]?\d{0,9}$/.test(num)||!/^\d{0,9}$/.test(den))return false;
 if([whole,num].some(v=>v==='-'||v==='+')||(!whole&&!num)||(num==='')!==(den==='')||(den!==''&&Number(den)===0))return false;
 if(whole && Number(whole)!==0 && Number(num)<0)return false;
 const negative=whole.startsWith('-'),d=BigInt(den||1);
 const n=BigInt(whole||0)*d+(negative?-1n:1n)*BigInt(num||0);
 const decimal=String(answer),places=(decimal.split('.')[1]||'').length;
 return n*10n**BigInt(places)===BigInt(decimal.replace('.',''))*d;
}
function field(level,label,index){
 return '<label>'+escapeText(label)+'<input class="weekly-input" id="'+level+'Answer'+(index||'')+'" aria-label="'+escapeText(label)+'" autocomplete="off" inputmode="decimal" maxlength="32"></label>';
}
function renderQuestion(level,proof=false){
 const s=state[level],q=s.q;s.resolved=false;s.transitioning=false;s.proof=proof;
 const labels=proof?q.proofLabels:q.labels;
 let fields=labels.map((label,i)=>field(level,label,i)).join('');
 if(q.kind==='fractionline')fields='<div class="fraction-answer-entry">'+field(level,'Whole number',0)+'<div class="answer-fraction-stack">'+field(level,'Numerator',1)+'<span class="answer-fraction-bar"></span>'+field(level,'Denominator',2)+'</div></div>'; 
 if(s.fraction&&q.fraction){
  fields='<div class="fraction-answer-entry">'+field(level,'Whole number',0)+'<div class="answer-fraction-stack">'+field(level,'Numerator',1)+'<span class="answer-fraction-bar"></span>'+field(level,'Denominator',2)+'</div></div>';
 }
 if(q.fraction)fields='<button type="button" class="fraction-choice">'+(s.fraction?'Use decimal input':'Use fraction input')+'</button>'+fields;
 if(q.kind==='scientific')fields='<div class="scientific-entry">'+field(level,'Coefficient a',0)+'<span>× 10</span><div class="exponent-entry">'+field(level,'Exponent n',1)+'</div></div>';
 const options=q.options&&!proof?'<div class="weekly-options">'+q.options.map((o,i)=>'<button type="button" data-choice="'+escapeText(q.kind==='journey'?i+1:o)+'">'+(q.kind==='journey'?(i+1)+'. ':'')+escapeText(o)+'</button>').join('')+'</div>':'';
 el(level+'Body').innerHTML='<div id="'+level+'Problem" class="whole-question question-fade-in">'+problem(q)+'</div>'+options+(proof?'<p>Enter both unit prices to prove your answer.</p>':'')+'<div class="whole-answer-row batch-fields">'+fields+'<button class="primary" id="'+level+'Check">Check</button></div><div class="actions"><button class="primary hidden" id="'+level+'Next">Next</button><button class="done" id="'+level+'Done">Done</button><button class="hint-button" id="'+level+'HintButton">Hint</button></div><div role="status" class="feedback" id="'+level+'Feedback"></div><div id="'+level+'LiveStats" class="live-session hidden"></div><div id="'+level+'Bubble" class="bubble hidden"><div class="bubble-title">Worked solution</div>'+q.steps+'</div>';
 const inputs=[...el(level+'Body').querySelectorAll('.weekly-input')];
 for(const input of inputs){
  input.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();if(!e.repeat)check(level)}};
  input.oninput=()=>{if(!proof&&q.options&&q.kind!=='journey'){const match=input.value.match(q.kind==='comparison'?/[<=>]$/i:/(Yes|No)$/i);if(match)input.value=match[0];}};
 }
 el(level+'Body').querySelectorAll('[data-choice]').forEach(button=>button.onclick=()=>{inputs[0].value=button.dataset.choice;check(level)});
 const toggle=el(level+'Body').querySelector('.fraction-choice');
 if(toggle)toggle.onclick=()=>{s.fraction=!s.fraction;renderQuestion(level)};
 el(level+'Check').onclick=()=>check(level);el(level+'Next').onclick=()=>nextQuestion(level);el(level+'Done').onclick=()=>finishSession(level);
 el(level+'HintButton').onclick=()=>{el(level+'Feedback').textContent=q.hint||{comparison:'Simplify first, then use a common denominator.',proportionality:'Convert to the same units and divide each price by its amount.',journey:'Read the axes carefully. Horizontal means stopped; a falling line means returning.',scientific:'Move the decimal point to make the coefficient at least 1 and less than 10.',number:'Calculate brackets and powers before multiplying, dividing, adding or subtracting.'}[q.kind]};
 updateLiveStats(level);inputs[0].focus({preventScroll:true});
}
function check(level){
 const s=state[level];if(!s.session||s.resolved||s.transitioning)return;
 const q=s.q,inputs=[...el(level+'Body').querySelectorAll('.weekly-input')],values=inputs.map(i=>i.value.trim()),feedback=el(level+'Feedback');
 if(q.kind==='fractionline'?values.every(v=>!v):(s.fraction&&q.fraction?values.every(v=>!v):values.some(v=>!v))){feedback.textContent='Enter your answer first.';return}
 if(q.kind==='proportionality'&&!s.proof){
  const choice=values[0].toLowerCase();
  if(!['yes','no'].includes(choice)){feedback.textContent='Choose Yes or No.';return}
  if(choice==='no'&&q.answers[0]==='No'){renderQuestion(level,true);return}
 }
 let correct;
 if(s.proof)correct=values.every((v,i)=>numberMatches(v,q.proof[i]));
 else if(s.fraction&&q.fraction)correct=fractionMatches(values,q.answers[0]);
 else if(q.kind==='comparison'||q.kind==='proportionality')correct=values[0].toLowerCase()===q.answers[0].toLowerCase();
 else if(q.match)correct=q.match(values);
 else correct=values.every((v,i)=>numberMatches(v,q.answers[i]));
 s.resolved=true;s.session.total++;
 if(correct){
  s.session.correct++;
  if(s.unlock<3){s.unlock++;el(level+'Progress').textContent=s.unlock+' / 3';if(s.unlock===3){const next=level==='easy'?'medium':level==='medium'?'hard':null;if(next&&!state[next].unlocked)unlock(next)}}
  feedback.textContent='Correct!';feedback.className='feedback correct';playAppSound('correct');
 }else{
  s.session.incorrect++;feedback.textContent='Incorrect. Correct answer: '+formatAnswer(q);feedback.className='feedback incorrect';el(level+'Bubble').classList.remove('hidden');playAppSound('incorrect');
 }
 inputs.forEach(i=>i.disabled=true);
 el(level+'Body').querySelectorAll('[data-choice],.fraction-choice').forEach(b=>b.disabled=true);
 el(level+'Check').classList.add('hidden');el(level+'HintButton').classList.add('hidden');el(level+'Next').classList.remove('hidden');el(level+'Next').focus({preventScroll:true});updateLiveStats(level);
}
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
 histories.clear();clearTimeout(el("banner")._unlockCelebrationTimer);el("banner").classList.remove("show");
 el('studentMode').classList.add('active');el('timerMode').classList.remove('active');el('durationWrap').classList.remove('show');clearAllOrbTimers();refreshLevelCards();closeResetModal();
}
function refreshLevelCards(){
 for(const l of orbLevels){const s=state[l],card=el(l+'Card');card.className=`card ${s.unlocked?'active':'locked'}`;el(l+'Progress').textContent=`${s.unlock} / 3`;el(l+'Progress').classList.toggle('hidden',!s.unlocked);if(s.unlocked)renderStart(l);else el(l+'Body').innerHTML=`<div class="lock" id="${l}Lock"><div class="shackle"></div><div class="lockbody"></div></div>`;}
}
resetProgressButton.addEventListener('click',openResetModal);resetCancelButton.addEventListener('click',closeResetModal);resetConfirmButton.addEventListener('click',resetAllProgress);resetModalBackdrop.addEventListener('click',e=>{if(e.target===resetModalBackdrop)closeResetModal()});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&resetModalBackdrop.classList.contains('show'))closeResetModal()});




el('batchSound').onclick=()=>{const b=el('batchSound'),on=b.getAttribute('aria-pressed')!=='true';b.setAttribute('aria-pressed',on);b.textContent='Sound '+(on?'on':'off')};
renderStart('easy');
})();
