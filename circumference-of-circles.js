(function(){
'use strict';
// All distances are stored in exact quarter-centimetre/etc units, so area
// rounding with pi=3.14 is done via exact integer arithmetic (no float ties).
const ri=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
const pick=a=>a[ri(0,a.length-1)];
const UNITS=['cm','m','mm'];
// Whole-number conversion factors in millimetres. All unit-converted answers
// are rounded from an exact rational value (never from a rounded circumference).
const UNIT_MM={cm:10,m:1000,mm:1};
const CORE_CONVERSIONS=[['cm','mm'],['m','cm'],['mm','cm']];
const CHALLENGE_CONVERSIONS=[...CORE_CONVERSIONS,['cm','m']];
const fmtLengthQ=q=>{const k=Math.floor(q/4),fraction=q%4;return String(k)+(fraction===0?'':fraction===1?'.25':fraction===2?'.5':'.75')};
function fmtAreaInteger(n){return n.toLocaleString('en-US')}
function levelName(level){return level==='easy'?'Foundation Mode':level==='medium'?'Core Mode':'Challenge Mode'}
const ROUND_TEXT={0:'nearest whole number',1:'nearest tenth',2:'nearest hundredth'};
const roundDigitsFor=level=>level==='easy'?0:level==='medium'?pick([0,1]):pick([0,1,2]);
// Round exact rational lengths using integer arithmetic, never premature intermediate rounding.
function roundedRatio(numerator,denominator,digits){
 const scale=10**digits;
 return Math.floor((2*numerator*scale+denominator)/(2*denominator))/scale;
}
const roundText=q=>ROUND_TEXT[q.roundDigits];
const answerText=q=>Number(q.rounded).toFixed(q.roundDigits);

// Derived from the Area of Circles generator: exact quarter-unit lengths and pi = 3.14.
// Unlike area, circumference is a linear measurement. Use integer arithmetic for exact rounding.
function makeQuestion(level){
 let unit=pick(UNITS);let radiusQ,given;
 if(level==='easy'){
  radiusQ=ri(2,9)*4;given='d';
 }else if(level==='medium'){
  radiusQ=ri(3,24)*4;given=pick(['r','d']);
 }else{
  const flavor=pick(['odd-diameter','odd-diameter','decimal-radius','decimal-diameter']);
  if(flavor==='odd-diameter'){
   radiusQ=2*pick(Array.from({length:18},(_,i)=>2*i+5));given='d';
  }else{
   radiusQ=4*ri(2,18)+pick([1,2,3]);given=flavor==='decimal-radius'?'r':'d';
  }
 }
 const roundDigits=roundDigitsFor(level);
 // Core has about 20% unit conversions. Challenge has approximately 25%
 // reverse questions, 25% conversions, and 50% direct circumferences.
 const flavor=Math.random();
 const reverse=level==='hard'&&flavor<.25;
 const conversion=level==='medium'?flavor<.20:level==='hard'&&flavor>=.25&&flavor<.50;
 if(reverse)given='c';
 const pair=conversion?pick(level==='medium'?CORE_CONVERSIONS:CHALLENGE_CONVERSIONS):null;
 if(pair)unit=pair[0];
 const answerUnit=pair?pair[1]:unit;
 const factorNum=UNIT_MM[unit],factorDen=UNIT_MM[answerUnit];
 const solveFor=reverse?pick(['r','d']):'c';
 const givenQ=given==='c'?157*radiusQ:given==='r'?radiusQ:2*radiusQ;
 const numerator=157*radiusQ;
 const circumference=numerator/100;
 const raw=solveFor==='r'?radiusQ/4:solveFor==='d'?radiusQ/2:circumference;
 const answerNumerator=(solveFor==='r'?radiusQ:solveFor==='d'?2*radiusQ:numerator)*(conversion?factorNum:1);
 const answerDenominator=(solveFor==='c'?100:4)*(conversion?factorDen:1);
 const rounded=roundedRatio(answerNumerator,answerDenominator,roundDigits);
 const givenValue=given==='c'?circumference.toFixed(2):fmtLengthQ(givenQ);
 // Re-select when rounding would erase a small converted length to zero.
 if(rounded<=0)return makeQuestion(level);
 return {level,unit,answerUnit,conversion,factorNum:conversion?factorNum:1,factorDen:conversion?factorDen:1,
  radiusQ,radius:radiusQ/4,diameter:radiusQ/2,given,givenQ,
  givenValue,raw,rounded,rawNumerator:numerator,circumference,roundDigits,
  reverse,solveFor,answerNumerator,answerDenominator,
  signature:`${level}|${unit}|${answerUnit}|${given}|${givenQ}|${solveFor}|${roundDigits}`};
}
function validateQuestion(q){
 if(!q||!['easy','medium','hard'].includes(q.level)||!UNITS.includes(q.unit)||!UNITS.includes(q.answerUnit)||!['r','d','c'].includes(q.given))return false;
 if(!Number.isInteger(q.radiusQ)||q.radiusQ<4||!Number.isInteger(q.roundDigits)||q.roundDigits<0||q.roundDigits>2)return false;
 if(!['c','r','d'].includes(q.solveFor)||q.reverse!==(q.solveFor!=='c')||q.reverse!==(q.given==='c'))return false;
 if(q.conversion!==(q.answerUnit!==q.unit)||q.reverse&&q.conversion||q.conversion&&q.level==='easy')return false;
 if(q.conversion&&!((q.level==='medium'?CORE_CONVERSIONS:CHALLENGE_CONVERSIONS).some(([from,to])=>from===q.unit&&to===q.answerUnit)))return false;
 if(q.factorNum!==(q.conversion?UNIT_MM[q.unit]:1)||q.factorDen!==(q.conversion?UNIT_MM[q.answerUnit]:1))return false;
 if(q.level==='easy'&&q.roundDigits!==0||q.level==='medium'&&q.roundDigits>1)return false;
 if(q.givenQ!==(q.given==='c'?157*q.radiusQ:q.given==='r'?q.radiusQ:2*q.radiusQ))return false;
 if(q.givenValue!==(q.given==='c'?q.circumference.toFixed(2):fmtLengthQ(q.givenQ)))return false;
 if(q.radius!==q.radiusQ/4||q.diameter!==q.radiusQ/2||q.rawNumerator!==157*q.radiusQ||q.circumference!==q.rawNumerator/100)return false;
 const numerator=(q.solveFor==='r'?q.radiusQ:q.solveFor==='d'?2*q.radiusQ:157*q.radiusQ)*q.factorNum;
 const denominator=(q.solveFor==='c'?100:4)*q.factorDen;
 if(q.answerNumerator!==numerator||q.answerDenominator!==denominator||q.raw!==(q.solveFor==='r'?q.radiusQ/4:q.solveFor==='d'?q.radiusQ/2:q.rawNumerator/100))return false;
 if(q.rounded!==roundedRatio(numerator,denominator,q.roundDigits)||!Number.isFinite(q.rounded)||q.rounded<=0)return false;
 if(q.level==='easy'&&(q.given!=='d'||q.conversion||q.reverse||q.radiusQ%4!==0||q.radius<2||q.radius>9))return false;
 if(q.level==='medium'&&(q.radiusQ%4!==0||q.radius<3||q.radius>24||q.reverse))return false;
 if(q.level==='hard'&&(q.radiusQ%4===0||q.radius<2||q.radius>21))return false;
 return true;
}
const recent={game:{easy:[],medium:[],hard:[]},qa:{easy:[],medium:[],hard:[]},stress:{easy:[],medium:[],hard:[]}};
function generateQuestion(level,channel='game',local=null){
 const history=recent[channel]?.[level];if(!history)throw Error('Invalid level');
 for(let trial=0;trial<3000;trial++){
  const q=makeQuestion(level);if(q.rounded===0)continue;
  if(!validateQuestion(q))throw Error('Invalid circumference question');
  if(local?.has(q.signature)||(!local&&history.some(x=>x.key===q.signature)))continue;
  if(trial<150&&history.slice(-4).some(x=>x.radiusQ===q.radiusQ))continue;
  if(trial<70&&history.length>=4&&history.slice(-4).every(x=>x.given===q.given))continue;
  history.push({key:q.signature,radiusQ:q.radiusQ,given:q.given});if(history.length>80)history.shift();local?.add(q.signature);
  return q;
 }
 if(history.length){history.splice(0,history.length);return generateQuestion(level,channel,local)}
 throw Error('Not enough unique circumference questions');
}
function parseAnswer(raw){
 const s=String(raw??'').trim().replace(/[\s\u00a0\u202f]/g,'').replace(',','.');
 if(!/^[+]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(s))return null;
 const n=Number(s);return Number.isFinite(n)&&n>=0&&n<1e9?n:null;
}
function circleSVG(q,mini=false){
 const r=80,cx=160,cy=116,fr=q.given==='r',rev=q.reverse,ax=fr?cx:cx-r,bx=cx+r;
 const label=rev?`C = ${q.givenValue} ${q.unit}`:`${fr?'r':'d'} = ${q.givenValue} ${q.unit}`;
 const x=rev?87:fr?164:99,w=rev?146:fr?132:122,tx=rev?160:fr?230:160;
 const guide=rev?'':`<line x1="${ax}" y1="116" x2="${bx}" y2="116" stroke="#304a57" stroke-width="3" stroke-dasharray="5 5"/>`;
 return `<svg class="circle-area-diagram${mini?' circle-mini':''}" viewBox="0 0 320 233" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${rev?`Circle with circumference ${q.givenValue} ${q.unit}; find ${q.solveFor==='r'?'radius':'diameter'}`:`Circle with ${fr?'radius':'diameter'} ${q.givenValue} ${q.unit}; calculate circumference`}"><circle cx="160" cy="116" r="80" fill="#dff1e0" stroke="#344e56" stroke-width="3.2"/>${guide}<circle cx="160" cy="116" r="3.8" fill="#304a57"/><rect x="${x}" y="76" width="${w}" height="30" rx="8" fill="#fff3ba" stroke="#ddce85" stroke-width=".8"/><text x="${tx}" y="96" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="750" font-size="16" fill="#24323c">${label}</text></svg>`;
}
function questionHTML(q){
 const request=q.reverse?`The circumference of this circle is ${q.givenValue} ${q.unit}. Calculate its ${q.solveFor==='r'?'radius':'diameter'}.`:q.conversion?`Calculate the circumference in ${q.answerUnit}.`:'Calculate the circumference of the circle.';
 const given=q.reverse?`Circumference = <strong>${q.givenValue} ${q.unit}</strong>`:`${q.given==='r'?'Radius':'Diameter'} = <strong>${q.givenValue} ${q.unit}</strong>`;
 return `<div class="circle-area-question">${circleSVG(q)}<div class="circle-area-prompt">${request}</div><div class="circle-area-given">${given} · <strong>Round to the ${roundText(q)}</strong></div></div>`;
}
function hintFor(q){
 if(q.reverse)return q.solveFor==='r'?'Divide the given circumference by 2 × 3.14 to find the radius.':'Divide the given circumference by 3.14 to find the diameter.';
 const how=q.given==='r'?'Use C = 2 × π × r. Multiply the radius by 2, then by 3.14.':`Use C = π × d. Multiply the diameter ${q.givenValue} ${q.unit} by 3.14.`;
 return how+(q.conversion?` Then convert the result from ${q.unit} to ${q.answerUnit}.`:'');
}
function cleanNum(n){return Number(n.toFixed(6)).toString()}
function stepsHTML(q){
 const r=fmtLengthQ(q.radiusQ),d=fmtLengthQ(q.radiusQ*2);
 let content;
 if(q.reverse){
  const divisor=q.solveFor==='r'?'2 × 3.14':'3.14';
  content=`<div class="whole-working-line">Given full circumference: <strong>${q.givenValue} ${q.unit}</strong>.</div>`+
   `<div class="whole-working-line">Use <strong>${q.solveFor==='r'?'r = C ÷ (2 × π)':'d = C ÷ π'}</strong>.</div>`+
   `<div class="whole-working-line">${q.solveFor==='r'?'Radius':'Diameter'} = ${q.givenValue} ÷ (${divisor}) = <strong>${cleanNum(q.raw)} ${q.unit}</strong>.</div>`;
 }else{
  content=`<div class="whole-working-line">Given ${q.given==='r'?'radius':'diameter'}: <strong>${q.givenValue} ${q.unit}</strong>.</div>`+
   `<div class="whole-working-line">Formula: <strong>C = π × d = 2 × π × r</strong>.</div>`+
   (q.given==='r'?`<div class="whole-working-line">Diameter = 2 × ${r} = ${d} ${q.unit}.</div>`:'')+
   `<div class="whole-working-line">C = 3.14 × ${d} = <strong>${cleanNum(q.raw)} ${q.unit}</strong>.</div>`+
   (q.conversion?`<div class="whole-working-line">Convert: ${cleanNum(q.raw)} ${q.unit} ${q.factorDen===1?'× '+q.factorNum:q.factorNum===1?'÷ '+q.factorDen:'× '+q.factorNum+' ÷ '+q.factorDen} = <strong>${cleanNum(q.answerNumerator/q.answerDenominator)} ${q.answerUnit}</strong>.</div>`:'');
 }
 return content+`<div class="whole-working-line">Round to the ${roundText(q)}: <strong>${answerText(q)} ${q.answerUnit}</strong>.</div>`;
}
const appSoundFiles={correct:'sounds/correct.wav',incorrect:'sounds/incorrect.wav',lock:'sounds/unlock-click.wav',unlock:'sounds/achievement.wav',timerTick:'sounds/timer-tick.wav',timerFinished:'sounds/timer-finished.wav'};
const appSoundVolumes={correct:1,incorrect:.48,lock:.44,unlock:.35,timerTick:.38,timerFinished:.72};
const appSounds={};Object.entries(appSoundFiles).forEach(([k,v])=>{const a=new Audio(v);a.preload='auto';a.volume=appSoundVolumes[k]??1;appSounds[k]=a});
function playAppSound(type){try{const a=appSounds[type];if(!a)return;a.pause();a.currentTime=0;const p=a.play();if(p&&p.catch)p.catch(()=>{})}catch(_){}}
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
 w.document.write(`<title>Circumference of Circles — Results</title><h1>Circumference of Circles</h1><table border="1" cellspacing="0" cellpadding="8"><tr><th>Level</th><th>Correct</th><th>Incorrect</th><th>Accuracy</th></tr>${rows||'<tr><td colspan="4">No completed sessions yet.</td></tr>'}</table>`);w.document.close();w.print();
}
function updateLiveStats(level){const box=el(level+'LiveStats'),s=state[level].session;if(!box||!s)return;if(state[level].unlock>=3){box.textContent=`This session: ${s.correct} correct · ${s.incorrect} incorrect`;box.classList.remove('hidden')}else box.classList.add('hidden')}
function renderStart(level){el(level+'Body').innerHTML=`<button class="start" data-level="${level}">Start</button>`;el(level+'Body').querySelector('button').onclick=()=>newSession(level)}
function newSession(level){
  if(!state[level].unlocked)return;
  if(state.activeLevel&&state.activeLevel!==level&&state[state.activeLevel].session)finishSession(state.activeLevel);
  clearAllOrbTimers();state.activeLevel=level;
  state[level].session={correct:0,incorrect:0,total:0,mode:state.mode,timeLimit:state.mode==='timer'?Number(el('duration').value):0,startedAt:Date.now()};
  state[level].resolved=false;state[level].transitioning=false;state[level].q=generateQuestion(level,'game');renderQuestion(level);startTimer();
}
function startTimer(){
  clearInterval(state.timerId);state.timerId=null;if(state.mode!=='timer'){clearAllOrbTimers();return}
  const level=state.activeLevel,total=Number(el('duration').value);state.timeLeft=total;showOrbTimer(level,total,'ready',1);
  state.timerId=setInterval(()=>{state.timeLeft--;showOrbTimer(level,Math.max(0,state.timeLeft),'running',state.timeLeft/total);if(state.timeLeft>0&&state.timeLeft<=5)playAppSound('timerTick');if(state.timeLeft<=0){clearInterval(state.timerId);state.timerId=null;playAppSound('timerFinished');finishSession(level,{timerExpired:true})}},1000);
}
function renderQuestion(level){
 const s=state[level],q=s.q;s.resolved=false;s.transitioning=false;
 el(level+'Body').innerHTML=`<div class="area-game-question question-fade-in" id="${level}Problem">${questionHTML(q)}</div><div class="whole-answer-row foa-answer-row"><div class="whole-answer-box"><input id="${level}Answer" class="circumference-answer" type="text" inputmode="decimal" autocomplete="off" spellcheck="false" enterkeyhint="done" aria-label="Requested circle measurement" placeholder="Enter answer"></div><button class="primary" id="${level}Check">Check</button></div><p class="circle-area-note">Use π = 3.14. Round to the ${roundText(q)}. Enter the number only (no units).</p><div class="actions"><button class="primary hidden" id="${level}Next">Next</button><button class="done" id="${level}Done">Done</button></div><div class="feedback" id="${level}Feedback"></div><div class="live-session hidden" id="${level}LiveStats" aria-live="polite"></div>${s.notice?`<div class="unlock-guidance">${s.notice}</div>`:''}<div class="bubble hidden" id="${level}Bubble"><div class="bubble-title">Step-by-step explanation</div><div id="${level}Hint"></div><div class="whole-working">${stepsHTML(q)}</div></div>`;
 el(level+'Check').onclick=()=>check(level);el(level+'Next').onclick=()=>nextQuestion(level);el(level+'Done').onclick=()=>finishSession(level);
 const input=el(level+'Answer');
 input.addEventListener('input',()=>{input.value=input.value.replace(/[^\d.,\s+]/g,'').slice(0,16)});
 input.addEventListener('keydown',e=>{if(e.key!=='Enter')return;e.preventDefault();if(e.repeat)return;s.resolved?nextQuestion(level):check(level)});
 updateLiveStats(level);input.focus();
}
function check(level){
 const s=state[level];if(!s.session||s.resolved||s.transitioning)return;
 const q=s.q,input=el(level+'Answer'),feedback=el(level+'Feedback');
 const val=parseAnswer(input.value);
 if(val===null){feedback.textContent='Enter a valid non-negative number, without units.';feedback.className='feedback incorrect';input.focus();return}
 s.resolved=true;s.session.total++;const correct=val===q.rounded;
 if(correct){
  s.session.correct++;
  if(s.unlock<3){s.unlock++;el(level+'Progress').textContent=`${s.unlock} / 3`;if(s.unlock===3){const next=level==='easy'?'medium':level==='medium'?'hard':null;if(next&&!state[next].unlocked)unlock(next)}}
  feedback.innerHTML='<span class="correct-callout">Correct!</span>';feedback.className='feedback correct';playAppSound('correct');
 }else{
  s.session.incorrect++;feedback.innerHTML=`Incorrect. The correct answer is <strong>${answerText(q)} ${q.answerUnit}</strong>.`;
  feedback.className='feedback incorrect';el(level+'Hint').textContent=hintFor(q);el(level+'Bubble').classList.remove('hidden');playAppSound('incorrect');
 }
 input.disabled=true;el(level+'Check').disabled=true;el(level+'Check').classList.add('hidden');el(level+'Next').classList.remove('hidden');el(level+'Next').focus({preventScroll:true});updateLiveStats(level);
}
function nextQuestion(level){
 const s=state[level];if(!s.session||!s.resolved||s.transitioning)return;s.transitioning=true;
 const p=el(level+'Problem');if(p)p.classList.add('question-fade-out');
 setTimeout(()=>{s.q=generateQuestion(level,'game');renderQuestion(level)},170);
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
  setTimeout(()=>{state[level].unlocked=true;card.classList.remove('locked');card.classList.add('active');el(level+'Progress').classList.remove('hidden');renderStart(level);const prev=level==='medium'?'easy':'medium';state[prev].notice=`${levelName(level)} is now available. You can continue practicing in ${levelName(prev)} until you feel ready to move on.`;showUnlockCelebration(levelName(level),prev)},900);
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
 for(const channel of Object.values(recent))for(const l of orbLevels)channel[l]=[];
 el('studentMode').classList.add('active');el('timerMode').classList.remove('active');el('durationWrap').classList.remove('show');clearAllOrbTimers();refreshLevelCards();closeResetModal();
}
function refreshLevelCards(){
 for(const l of orbLevels){const s=state[l],card=el(l+'Card');card.className=`card ${s.unlocked?'active':'locked'}`;el(l+'Progress').textContent=`${s.unlock} / 3`;el(l+'Progress').classList.toggle('hidden',!s.unlocked);if(s.unlocked)renderStart(l);else el(l+'Body').innerHTML=`<div class="lock" id="${l}Lock"><div class="shackle"></div><div class="lockbody"></div></div>`;}
}
resetProgressButton.addEventListener('click',openResetModal);resetCancelButton.addEventListener('click',closeResetModal);resetConfirmButton.addEventListener('click',resetAllProgress);resetModalBackdrop.addEventListener('click',e=>{if(e.target===resetModalBackdrop)closeResetModal()});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&resetModalBackdrop.classList.contains('show'))closeResetModal()});
renderStart('easy');
})();
