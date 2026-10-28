(function(){
'use strict';
// Original teacher app preserved: number-input and unit-selection answers;
// Mixed metric length, mass and capacity conversions.
// Powers of 10 give exact decimal shifts; no floating-point conversion chains.
const ri=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
const pick=a=>a[ri(0,a.length-1)];
const SPECS={
 length:{label:'Length',dimension:1,exponents:{mil:4,km:3,hm:2,dam:1,m:0,dm:-1,cm:-2,mm:-3}},
 mass:{label:'Mass',dimension:1,exponents:{ton:6,kg:3,hg:2,dag:1,g:0,dg:-1,cg:-2,mg:-3}},
 capacity:{label:'Capacity',dimension:1,exponents:{L:0,dL:-1,cL:-2,mL:-3}},
 area:{label:'Area',dimension:2,exponents:{km2:6,hm2:4,dam2:2,m2:0,dm2:-2,cm2:-4,mm2:-6}},
 cubic:{label:'Cubic',dimension:3,exponents:{km3:9,hm3:6,dam3:3,m3:0,dm3:-3,cm3:-6,mm3:-9}}
};
const LABEL={mil:'mil',km:'km',hm:'hm',dam:'dam',m:'m',dm:'dm',cm:'cm',mm:'mm',ton:'ton',kg:'kg',hg:'hg',dag:'dag',g:'g',dg:'dg',cg:'cg',mg:'mg',L:'L',dL:'dL',cL:'cL',mL:'mL',km2:'km²',hm2:'hm²',dam2:'dam²',m2:'m²',dm2:'dm²',cm2:'cm²',mm2:'mm²',km3:'km³',hm3:'hm³',dam3:'dam³',m3:'m³',dm3:'dm³',cm3:'cm³',mm3:'mm³'};
const FOUNDATION={length:['km','m','cm','mm'],mass:['kg','g','mg'],capacity:['L','mL'],area:['m2','cm2','mm2'],cubic:['m3','cm3','mm3']};
const FULL=Object.fromEntries(Object.entries(SPECS).map(([k,v])=>[k,Object.keys(v.exponents)]));
const levelName=l=>l==='easy'?'Foundation Mode':l==='medium'?'Core Mode':'Challenge Mode';
const formatUnit=u=>LABEL[u]||u;
const trimZeros=s=>s.includes('.')?s.replace(/0+$/,'').replace(/\.$/,''):s;
const fmt=s=>{let [a,b]=String(s).split('.');return a.replace(/\B(?=(\d{3})+(?!\d))/g,' ')+(b?'.'+b:'')};
function shiftDecimalString(value,shift){
 const s=String(value).trim().replace(/\s+/g,'').replace(',','.');
 if(!/^\d+(?:\.\d+)?$/.test(s))return null;
 let [whole,frac='']=s.split('.');let digits=(whole+frac).replace(/^0+(?=\d)/,'');
 if(!digits)digits='0';const fp=frac.length-shift;let out;
 if(fp<=0)out=digits+'0'.repeat(-fp);
 else if(fp>=digits.length)out='0.'+'0'.repeat(fp-digits.length)+digits;
 else out=digits.slice(0,digits.length-fp)+'.'+digits.slice(digits.length-fp);
 out=out.replace(/^0+(?=\d)/,'');if(out.startsWith('.'))out='0'+out;
 return trimZeros(out)||'0';
}
function parseAnswer(s){
 const t=String(s??'').trim().replace(/[\s\u00a0\u202f]/g,'').replace(',','.');
 if(!/^[+]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(t))return null;
 const n=Number(t);return Number.isFinite(n)&&n>=0&&n<=1e9?n:null;
}
const control={type:'linear',style:'number'};
const VALID_TYPES=['linear'];
function candidateCategories(type){return type==='linear'?['length','mass','capacity']:[]}
function makeQuestion(level,type=control.type,style=control.style){
 if(!['easy','medium','hard'].includes(level)||!VALID_TYPES.includes(type)||!['number','unit'].includes(style))throw Error('Bad settings');
 // Use constrained retry rather than a fallback that would violate the selected level.
 for(let attempt=0;attempt<9000;attempt++){
  const cat=pick(candidateCategories(type)),spec=SPECS[cat],pool=level==='easy'?FOUNDATION[cat]:FULL[cat];
  let from=pick(pool),to=pick(pool);
  if(level==='easy'&&cat==='length'&&Math.random()<.045)from='mil';
  if(from===to)continue;
  const shift=spec.exponents[from]-spec.exponents[to];
  const prefixSteps=Math.abs(shift)/spec.dimension;
  const ceiling=level==='easy'?(cat==='area'||cat==='cubic'?2:3):level==='medium'?4:12;
  const floor=level==='hard'?2:1;
  if(prefixSteps<floor||prefixSteps>ceiling)continue;
  let value;
  if(level==='easy'){
   // Both sides must be whole numbers; a three-step conversion can still be simple.
   if(shift<0){const m=10**(-shift);if(m>1e6)continue;value=String(ri(1,Math.max(1,Math.min(160,Math.floor(1e6/m))))*m)}
   else value=String(ri(1,Math.min(160,Math.max(1,Math.floor(2e6/10**shift)))));
  }else{
   const places=level==='medium'?pick([0,0,1]):pick([0,1,2,2]);
   const denom=10**places;
   const n=ri(1,level==='medium'?3000:5000);
   value=trimZeros(String(Math.floor(n/denom))+(places?'.'+String(n%denom).padStart(places,'0'):''));
  }
  const answer=shiftDecimalString(value,shift);
  if(!answer)continue;
  const numeric=Number(answer);
  if(!Number.isFinite(numeric)||numeric<.000001||numeric>1e7||Number(value)>1e7||(answer.split('.')[1]||'').length>6)continue;
  if(level==='easy'&&(value.includes('.')||answer.includes('.')))continue;
  if(level==='medium'&&(!VALID_TYPES.includes(type)||prefixSteps>4))continue;
  const q={level,type,style,cat,from,to,value,answer,numeric,shift,prefixSteps,dimension:spec.dimension,
   signature:[type,style,cat,from,to,value].join('|')};
  if(validateQuestion(q))return q;
  throw Error('Invalid candidate: '+JSON.stringify(q));
 }
 throw Error('Unable to generate a '+level+'/'+type+' unit conversion');
}
function validateQuestion(q){
 if(!q||!['easy','medium','hard'].includes(q.level)||!candidateCategories(q.type).includes(q.cat)||!['number','unit'].includes(q.style))return false;
 const spec=SPECS[q.cat];if(!(q.from in spec.exponents)||!(q.to in spec.exponents)||q.from===q.to)return false;
 if(q.shift!==spec.exponents[q.from]-spec.exponents[q.to]||q.dimension!==spec.dimension||q.prefixSteps!==Math.abs(q.shift)/spec.dimension)return false;
 if(shiftDecimalString(q.value,q.shift)!==q.answer||Number(q.answer)!==q.numeric||q.numeric<.000001||q.numeric>1e7||(q.answer.split('.')[1]||'').length>6)return false;
 if(q.level==='easy'){
  if((q.cat==='length'&&q.from!=='mil'&&!FOUNDATION[q.cat].includes(q.from))||!FOUNDATION[q.cat].includes(q.to))return false;
  if(q.cat!=='length'&&!FOUNDATION[q.cat].includes(q.from))return false;
  if(q.prefixSteps>(q.cat==='area'||q.cat==='cubic'?2:3)||q.value.includes('.')||q.answer.includes('.'))return false;
 }
 if(q.level==='medium'&&q.prefixSteps>4||q.level==='hard'&&q.prefixSteps<2)return false;
 return true;
}
const recent={game:{easy:[],medium:[],hard:[]},qa:{easy:[],medium:[],hard:[]},stress:{easy:[],medium:[],hard:[]}};
function generateQuestion(level,channel='game',local=null,type=control.type,style=control.style){
 const history=recent[channel]?.[level];if(!history)throw Error('Invalid level/channel');
 for(let n=0;n<1500;n++){
  const q=makeQuestion(level,type,style);
  if(local?.has(q.signature)||(!local&&history.some(h=>h.signature===q.signature)))continue;
  if(n<100&&history.slice(-3).some(h=>h.from===q.from&&h.to===q.to))continue;
  history.push({signature:q.signature,from:q.from,to:q.to});if(history.length>80)history.shift();local?.add(q.signature);return q;
 }
 history.length=0;throw Error('Insufficient unique questions');
}
function choicesFor(q){
 const pool=FULL[q.cat].filter(u=>u!==q.to&&(q.level!=='easy'||u!=='ton'));
 const choices=[q.to];while(choices.length<4&&pool.length){const i=ri(0,pool.length-1);choices.push(pool.splice(i,1)[0])}
 for(let i=choices.length-1;i>0;i--){const j=ri(0,i);[choices[i],choices[j]]=[choices[j],choices[i]]}return choices;
}
function problemText(q){return q.style==='number'?`${fmt(q.value)} ${formatUnit(q.from)} = ? ${formatUnit(q.to)}`:`${fmt(q.value)} ${formatUnit(q.from)} = ${fmt(q.answer)} ?`}
function questionHTML(q){
 const task=q.style==='number'?'Calculate the missing number.':'Select the correct missing unit.';
 return `<div class="metric-game-question"><div class="metric-category">${SPECS[q.cat].label} conversion</div><div class="metric-equation" aria-label="${task} ${problemText(q)}"><span>${fmt(q.value)} <b>${formatUnit(q.from)}</b></span><span class="metric-equals">=</span><span>${q.style==='number'?'<em>?</em> '+formatUnit(q.to):fmt(q.answer)+' <em>?</em>'}</span></div><div class="metric-task">${task}</div>${q.from==='mil'||q.to==='mil'?'<div class="metric-mil-hint">A Swedish mil equals 10 km.</div>':''}</div>`;
}
function hintFor(q){const factor=q.dimension===1?'10':q.dimension===2?'100':'1 000';return `From ${formatUnit(q.from)} to ${formatUnit(q.to)}, move ${q.prefixSteps} metric prefix step${q.prefixSteps===1?'':'s'}. Each step changes a measurement by a factor of ${factor}.`}
function stepsHTML(q){
 const factor='1'+'0'.repeat(Math.abs(q.shift));const direction=q.shift>0?'Multiply':'Divide';
 const exp=q.dimension===1?'10':q.dimension===2?'100':'1 000';
 const operation=q.shift>0?'×':'÷';
 return `<div class="whole-working-line">${SPECS[q.cat].label}: <strong>1 prefix step = ${exp} times</strong> ${q.dimension===1?'(length/mass/capacity)':q.dimension===2?'(square units)':'(cubic units)'}.</div>`+
  `<div class="whole-working-line">There ${q.prefixSteps===1?'is':'are'} <strong>${q.prefixSteps}</strong> prefix step${q.prefixSteps===1?'':'s'} from ${formatUnit(q.from)} to ${formatUnit(q.to)}.</div>`+
  `<div class="whole-working-line">${direction} by ${fmt(factor)}: <strong>${fmt(q.value)} ${operation} ${fmt(factor)} = ${fmt(q.answer)}</strong>.</div>`+
  `<div class="whole-working-line">Answer: <strong>${fmt(q.value)} ${formatUnit(q.from)} = ${fmt(q.answer)} ${formatUnit(q.to)}</strong>.</div>`;
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
 w.document.write(`<title>Metric Unit Conversions — Results</title><h1>Metric Unit Conversions</h1><table border="1" cellspacing="0" cellpadding="8"><tr><th>Level</th><th>Correct</th><th>Incorrect</th><th>Accuracy</th></tr>${rows||'<tr><td colspan="4">No completed sessions yet.</td></tr>'}</table>`);w.document.close();w.print();
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
 const isNumber=q.style==='number';
 const answerArea=isNumber?`<div class="whole-answer-row foa-answer-row"><div class="whole-answer-box"><input id="${level}Answer" class="metric-answer" type="text" inputmode="decimal" autocomplete="off" spellcheck="false" enterkeyhint="done" aria-label="Missing conversion number" placeholder="Enter number"></div><button class="primary" id="${level}Check">Check</button></div>`:
 `<div class="metric-option-grid" id="${level}UnitChoices" role="group" aria-label="Choose the missing unit">${choicesFor(q).map(u=>`<button type="button" class="metric-option" data-unit="${u}" aria-pressed="false">${formatUnit(u)}</button>`).join('')}</div><div class="metric-option-check"><button class="primary" id="${level}Check">Check</button></div>`;
 el(level+'Body').innerHTML=`<div class="area-game-question question-fade-in" id="${level}Problem">${questionHTML(q)}</div>${answerArea}<p class="circle-area-note">${isNumber?'Enter the number only, without units.':'Choose the correct unit, then check.'} No rounding — give the exact conversion.</p><div class="actions"><button class="primary hidden" id="${level}Next">Next</button><button class="done" id="${level}Done">Done</button></div><div class="feedback" id="${level}Feedback"></div><div class="live-session hidden" id="${level}LiveStats" aria-live="polite"></div>${s.notice?`<div class="unlock-guidance">${s.notice}</div>`:''}<div class="bubble hidden" id="${level}Bubble"><div class="bubble-title">Step-by-step explanation</div><div id="${level}Hint"></div><div class="whole-working">${stepsHTML(q)}</div></div>`;
 el(level+'Check').onclick=()=>check(level);el(level+'Next').onclick=()=>nextQuestion(level);el(level+'Done').onclick=()=>finishSession(level);
 if(isNumber){
  const input=el(level+'Answer');input.addEventListener('input',()=>{input.value=input.value.replace(/[^\d.,\s+]/g,'').slice(0,22)});
  input.addEventListener('keydown',e=>{if(e.key!=='Enter')return;e.preventDefault();if(e.repeat)return;s.resolved?nextQuestion(level):check(level)});input.focus();
 }else{
  el(level+'UnitChoices').querySelectorAll('button').forEach(b=>{
   b.onclick=()=>{if(s.resolved)return;el(level+'UnitChoices').querySelectorAll('button').forEach(x=>{x.classList.toggle('is-picked',x===b);x.setAttribute('aria-pressed',String(x===b))})};
   b.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();e.stopPropagation();check(level)}});
  });
  el(level+'Check').addEventListener('keydown',e=>{if(e.key==='Enter'&&s.resolved){e.preventDefault();nextQuestion(level)}});
 }
 updateLiveStats(level);
}
function check(level){
 const s=state[level];if(!s.session||s.resolved||s.transitioning)return;
 const q=s.q,feedback=el(level+'Feedback');let correct=false;
 if(q.style==='number'){
  const val=parseAnswer(el(level+'Answer').value);
  if(val===null){feedback.textContent='Enter a valid number, without units.';feedback.className='feedback incorrect';el(level+'Answer').focus();return}
  correct=val===q.numeric;
 }else{
  const selected=el(level+'UnitChoices').querySelector('.metric-option.is-picked');
  if(!selected){feedback.textContent='Select a unit first.';feedback.className='feedback incorrect';return}
  correct=selected.dataset.unit===q.to;
 }
 s.resolved=true;s.session.total++;
 if(correct){
  s.session.correct++;
  if(s.unlock<3){s.unlock++;el(level+'Progress').textContent=`${s.unlock} / 3`;if(s.unlock===3){const next=level==='easy'?'medium':level==='medium'?'hard':null;if(next&&!state[next].unlocked)unlock(next)}}
  feedback.innerHTML='<span class="correct-callout">Correct!</span>';feedback.className='feedback correct';playAppSound('correct');
 }else{
  s.session.incorrect++;feedback.innerHTML=`Incorrect. The correct answer is <strong>${q.style==='number'?fmt(q.answer):formatUnit(q.to)}</strong>.`;
  feedback.className='feedback incorrect';el(level+'Hint').textContent=hintFor(q);el(level+'Bubble').classList.remove('hidden');playAppSound('incorrect');
 }
 if(q.style==='number')el(level+'Answer').disabled=true;
 else el(level+'UnitChoices').querySelectorAll('button').forEach(b=>b.disabled=true);
 el(level+'Check').disabled=true;el(level+'Check').classList.add('hidden');el(level+'Next').classList.remove('hidden');el(level+'Next').focus({preventScroll:true});updateLiveStats(level);
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
function onChangeControl(){
 const nextType='linear',nextStyle=el('answerStyle').value;
 if(control.type===nextType&&control.style===nextStyle)return;
 if(state.activeLevel&&state[state.activeLevel].session)finishSession(state.activeLevel);
 control.type=nextType;control.style=nextStyle;
 for(const channel of Object.values(recent))for(const l of orbLevels)channel[l]=[];
 for(const l of orbLevels)if(state[l].unlocked)renderStart(l);
 
}
el('answerStyle').addEventListener('change',onChangeControl);
renderStart('easy');
})();
