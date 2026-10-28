(function(){
'use strict';
const ri=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
const pick=a=>a[ri(0,a.length-1)];
const UNITS=['cm','m','mm'];
// The conversion is a separate Challenge family, never combined with the reverse family.
// Factors are integer ratios so final rounding is exact and never done mid-calculation.
const UNIT_CONVERSIONS=[
 {from:'cm',to:'mm',num:10,den:1},
 {from:'m',to:'cm',num:100,den:1},
 {from:'mm',to:'cm',num:1,den:10}
];
const fmtQ=q=>{let i=Math.floor(q/4),f=q%4;return `${i}${['','.25','.5','.75'][f]}`};
const partLabel=p=>p===1?'quarter':p===2?'semicircle':'three-quarter circle';
const partFraction=p=>p===1?'¼':p===2?'½':'¾';
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

// Same quarter-unit measurement progression as Area of Circle Portions.
// P = arc length + all straight boundary edges. For each supported circle piece,
// straight edges total one diameter (2r): 1/4 = 2r, 1/2 = d, 3/4 = 2r.
// With pi=3.14, arc = (part/4) * 2*pi*r = (157*part*radiusQ)/400.
// Straight = 2r = radiusQ/2; all computations are exact integers /400.
function makeQuestion(level){
 let unit=pick(UNITS);let p,radiusQ,given;
 if(level==='easy'){
  p=2;radiusQ=ri(2,9)*4;given='d';
 }else if(level==='medium'){
  p=pick([1,2]);radiusQ=ri(3,22)*4;given=pick(['r','r','r','d']);
 }else{
  p=pick([1,2,3]);given=pick(['d','r','d','r']);
  if(given==='d'&&Math.random()<.5){
   const odd=ri(5,45)*2-5;
   radiusQ=odd*2;
  }else radiusQ=4*ri(2,19)+pick([1,2,3]);
 }
 const roundDigits=roundDigitsFor(level);
 // Challenge contains ~25% reverse questions and ~25% unit conversions.
 // The remaining half are the established direct perimeter questions.
 const variant=level==='hard'?Math.random():1;
 const reverse=level==='hard'&&variant<.25;
 const conversion=level==='hard'&&variant>=.25&&variant<.50;
 if(reverse)given='c';
 const conversionSpec=conversion?pick(UNIT_CONVERSIONS):null;
 if(conversionSpec)unit=conversionSpec.from;
 const answerUnit=conversionSpec?.to||unit;
 const factorNum=conversionSpec?.num||1, factorDen=conversionSpec?.den||1;
 const fullCNum=157*radiusQ;
 const givenQ=given==='c'?fullCNum:given==='r'?radiusQ:radiusQ*2;
 const arcNum=157*p*radiusQ,straightNum=200*radiusQ,totalNum=arcNum+straightNum;
 const raw=totalNum/400,convertedRaw=(totalNum*factorNum)/(400*factorDen);
 const rounded=roundedRatio(totalNum*factorNum,400*factorDen,roundDigits);
 const givenValue=given==='c'?(fullCNum/100).toFixed(2):fmtQ(givenQ);
 return {level,part:p,unit,answerUnit,conversion,conversionSpec,conversionFactorNum:factorNum,conversionFactorDen:factorDen,
 given,givenQ,givenValue,radiusQ,reverse,roundDigits,fullCNum,
 radius:radiusQ/4,diameter:radiusQ/2,arc:arcNum/400,straight:straightNum/400,
 raw,convertedRaw,rounded,arcNum,straightNum,totalNum,
 signature:`${level}|${p}|${given}|${givenQ}|${unit}|${answerUnit}|${roundDigits}`};
}
function validateQuestion(q){
 if(!q||!['easy','medium','hard'].includes(q.level)||!UNITS.includes(q.unit)||!UNITS.includes(q.answerUnit)||![1,2,3].includes(q.part)||!['r','d','c'].includes(q.given))return false;
 if(!Number.isInteger(q.radiusQ)||q.radiusQ<4||!Number.isInteger(q.roundDigits)||q.roundDigits<0||q.roundDigits>2)return false;
 if(q.level==='easy'&&q.roundDigits!==0||q.level==='medium'&&q.roundDigits>1)return false;
 if(q.reverse!==(q.given==='c')||q.conversion!==(q.unit!==q.answerUnit))return false;
 if(q.conversion&&(q.level!=='hard'||q.reverse))return false;
 const matching=UNIT_CONVERSIONS.find(c=>c.from===q.unit&&c.to===q.answerUnit);
 if(q.conversion&&(!matching||q.conversionFactorNum!==matching.num||q.conversionFactorDen!==matching.den))return false;
 if(!q.conversion&&(q.conversionFactorNum!==1||q.conversionFactorDen!==1))return false;
 if(q.fullCNum!==157*q.radiusQ||q.givenQ!==(q.given==='c'?q.fullCNum:q.given==='r'?q.radiusQ:2*q.radiusQ))return false;
 if(q.givenValue!==(q.given==='c'?(q.fullCNum/100).toFixed(2):fmtQ(q.givenQ)))return false;
 const arc=157*q.part*q.radiusQ,straight=200*q.radiusQ,total=arc+straight;
 if(q.arcNum!==arc||q.straightNum!==straight||q.totalNum!==total||q.rounded!==roundedRatio(total*q.conversionFactorNum,400*q.conversionFactorDen,q.roundDigits))return false;
 if(Math.abs(q.convertedRaw-(total*q.conversionFactorNum/(400*q.conversionFactorDen)))>1e-9)return false;
 if(Math.abs(q.arc-(q.part/4)*2*3.14*q.radius)>1e-9||Math.abs(q.straight-2*q.radius)>1e-9||Math.abs(q.raw-q.arc-q.straight)>1e-9||!Number.isFinite(q.rounded)||q.rounded<=0)return false;
 if(q.level==='easy'&&(q.part!==2||q.given!=='d'||q.radiusQ%4!==0||q.radius<2||q.radius>9||q.conversion))return false;
 if(q.level==='medium'&&(![1,2].includes(q.part)||q.radiusQ%4!==0||q.radius<3||q.radius>22||q.reverse||q.conversion))return false;
 if(q.level==='hard'&&(q.radiusQ%4===0||q.radius<2||q.radius>43))return false;
 return true;
}
const recent={game:{easy:[],medium:[],hard:[]},qa:{easy:[],medium:[],hard:[]},stress:{easy:[],medium:[],hard:[]}};
function generateQuestion(level,channel='game',local=null){
 const history=recent[channel]?.[level];if(!history)throw Error('invalid generator channel/level');
 for(let tries=0;tries<3000;tries++){
  const q=makeQuestion(level);if(!validateQuestion(q))throw Error('Invalid perimeter of circle portions question');
  if(local?.has(q.signature)||(!local&&history.some(x=>x.signature===q.signature)))continue;
  if(tries<100&&history.slice(-4).some(x=>x.radiusQ===q.radiusQ&&x.part===q.part))continue;
  history.push({signature:q.signature,radiusQ:q.radiusQ,part:q.part});if(history.length>85)history.shift();local?.add(q.signature);return q;
 }
 if(!local){history.splice(0,history.length);return generateQuestion(level,channel,null)}
 throw Error('Worksheet requested more unique questions than possible');
}
function parseAnswer(raw){
 const s=String(raw??'').trim().replace(/[\s\u00a0\u202f]/g,'').replace(',','.');
 if(!/^[+]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(s))return null;
 const n=Number(s);return Number.isFinite(n)&&n>=0&&n<1e9?n:null;
}
function labelFor(q){return `${q.part===1?'¼':q.part===2?'½':'¾'} circle`}
// Piece silhouettes intentionally match Area of Circle Portions. The colored
// outline marks the complete perimeter: arc AND straight edges.
function diagram(q,mini=false){
 const cx=160,cy=129,r=77;
 let path,curved;
 if(q.part===1){ // lower-right quarter circle
  path=`M ${cx} ${cy} L ${cx+r} ${cy} A ${r} ${r} 0 0 1 ${cx} ${cy+r} Z`;
  curved=`M ${cx+r} ${cy} A ${r} ${r} 0 0 1 ${cx} ${cy+r}`;
 }else if(q.part===2){ // lower semicircle
  path=`M ${cx-r} ${cy} L ${cx+r} ${cy} A ${r} ${r} 0 0 1 ${cx-r} ${cy} Z`;
  curved=`M ${cx+r} ${cy} A ${r} ${r} 0 0 1 ${cx-r} ${cy}`;
 }else{ // 3/4 circle, upper-right quarter missing
  path=`M ${cx} ${cy} L ${cx+r} ${cy} A ${r} ${r} 0 1 1 ${cx} ${cy-r} L ${cx} ${cy} Z`;
  curved=`M ${cx+r} ${cy} A ${r} ${r} 0 1 1 ${cx} ${cy-r}`;
 }
 // Use a pale-yellow value label and the existing dotted-guide convention.
 // For diameter on 1/4 and 3/4, the dotted guide spans the diameter of
 // the original full circle even though only part of that circle remains.
 const isD=q.given==='d',guideStart=isD?cx-r:cx,guideEnd=cx+r,guideY=cy-10;
 const label=q.reverse?`Full C = ${q.givenValue} ${q.unit}`:`${isD?'d':'r'} = ${q.givenValue} ${q.unit}`;
 const labelWidth=q.reverse?Math.max(175,Math.min(250,24+label.length*8.5)):Math.max(115,Math.min(151,20+label.length*8.5));
 const boxX= (cx-labelWidth/2);
 const arrow=`<path d="${curved}" fill="none" stroke="#b67c20" stroke-width="5.2" stroke-linecap="round"/>`;
 const guide=q.reverse?'':`<line x1="${guideStart}" y1="${guideY}" x2="${guideEnd}" y2="${guideY}" stroke="#fff" stroke-width="6.4"/>`+
   `<line x1="${guideStart}" y1="${guideY}" x2="${guideEnd}" y2="${guideY}" stroke="#465f68" stroke-width="3.1" stroke-dasharray="8 6"/>`;
 const labelBox=`<rect x="${boxX}" y="9" width="${labelWidth}" height="32" rx="8" fill="#fff1b8" stroke="#d7b968" stroke-width="1.2"/><text x="${cx}" y="30.5" fill="#34465d" font-weight="750" font-size="16" text-anchor="middle" font-family="Arial,Helvetica,sans-serif">${label}</text>`;
 return `<svg class="portion-diagram${mini?' portion-mini':''}" viewBox="0 0 320 265" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${partFraction(q.part)} circle-shaped piece. Calculate the entire perimeter, including straight edges. ${q.reverse?'Full circumference':isD?'Diameter':'Radius'} ${q.givenValue} ${q.unit}"><path d="${path}" fill="#c8ead7" stroke="#b67c20" stroke-width="4.5" stroke-linejoin="round"/>${arrow}${guide}${labelBox}<circle cx="${cx}" cy="${cy}" r="3.5" fill="#355d69"/><text x="160" y="244" text-anchor="middle" font-size="16" font-weight="700" font-family="Arial,Helvetica,sans-serif" fill="#48606b">${partFraction(q.part)} of a circle</text></svg>`;
}
function questionHTML(q){
 const prompt=q.conversion?`Calculate the perimeter in ${q.answerUnit}.`:'Calculate the perimeter.';
 const given=q.reverse?`Full-circle circumference = <strong>${q.givenValue} ${q.unit}</strong>`:`${q.given==='r'?'Radius':'Diameter'} = <strong>${q.givenValue} ${q.unit}</strong>`;
 return `<div class="portion-question">${diagram(q)}<div class="portion-prompt">${prompt}</div><div class="portion-given">${given} · <strong>${labelFor(q)}</strong> · <strong>Round to the ${roundText(q)}</strong></div></div>`;
}
function hintFor(q){
 if(q.reverse)return `Find the radius from the full circumference, then add the curved arc and straight edges.`;
 return `${q.given==='d'?'Divide the diameter by 2 first. ':''}Find the curved arc and add the straight edges.${q.conversion?` Then convert ${q.unit} to ${q.answerUnit}.`:''}`;
}
const fmtNum=n=>Number(n.toFixed(6)).toString();
function stepsHTML(q){
 const r=fmtQ(q.radiusQ),d=fmtQ(q.radiusQ*2),full=q.fullCNum/100;
 const intro=q.reverse?`<div class="whole-working-line">Given original full-circle circumference: <strong>${q.givenValue} ${q.unit}</strong>.</div><div class="whole-working-line">Find radius: ${q.givenValue} ÷ (2 × 3.14) = <strong>${r} ${q.unit}</strong>.</div>`:
  q.given==='d'?`<div class="whole-working-line">Given diameter ${q.givenValue} ${q.unit}; radius = ${q.givenValue} ÷ 2 = <strong>${r} ${q.unit}</strong>.</div>`:
  `<div class="whole-working-line">Given radius <strong>${r} ${q.unit}</strong>.</div>`;
 return intro+
 `<div class="whole-working-line">Full circumference: <strong>C = 2 × π × r</strong> = 2 × 3.14 × ${r} = <strong>${fmtNum(full)} ${q.unit}</strong>.</div>`+
 `<div class="whole-working-line">Curved arc (${partFraction(q.part)} of full circumference): ${partFraction(q.part)} × ${fmtNum(full)} = <strong>${fmtNum(q.arc)} ${q.unit}</strong>.</div>`+
 `<div class="whole-working-line">Straight ${q.part===2?'edge (one diameter)':'edges (two radii)'}: ${q.part===2?`${d}`:`2 × ${r}`} = <strong>${fmtNum(q.straight)} ${q.unit}</strong>.</div>`+
 `<div class="whole-working-line">Perimeter = ${fmtNum(q.arc)} + ${fmtNum(q.straight)} = <strong>${fmtNum(q.raw)} ${q.unit}</strong>.</div>`+
 (q.conversion?`<div class="whole-working-line">Convert: ${fmtNum(q.raw)} ${q.unit} ${q.conversionFactorDen===1?'× '+q.conversionFactorNum:'÷ '+q.conversionFactorDen} = <strong>${fmtNum(q.convertedRaw)} ${q.answerUnit}</strong>.</div>`:'')+
 `<div class="whole-working-line">Round to the ${roundText(q)}: <strong>${answerText(q)} ${q.answerUnit}</strong>.</div>`;
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
 w.document.write(`<title>Perimeter of Circle Portions — Results</title><h1>Perimeter of Circle Portions</h1><table border="1" cellspacing="0" cellpadding="8"><tr><th>Level</th><th>Correct</th><th>Incorrect</th><th>Accuracy</th></tr>${rows||'<tr><td colspan="4">No completed sessions yet.</td></tr>'}</table>`);w.document.close();w.print();
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
 el(level+'Body').innerHTML=`<div class="portion-game-question question-fade-in" id="${level}Problem">${questionHTML(q)}</div><div class="whole-answer-row foa-answer-row"><div class="whole-answer-box"><input id="${level}Answer" class="perimeter-portion-answer" type="text" inputmode="decimal" autocomplete="off" spellcheck="false" enterkeyhint="done" aria-label="Perimeter of the circle portion" placeholder="Enter perimeter"></div><button class="primary" id="${level}Check">Check</button></div><p class="portion-note">Use π = 3.14. Enter the number only (no units).</p><div class="actions"><button class="primary hidden" id="${level}Next">Next</button><button class="done" id="${level}Done">Done</button></div><div class="feedback" id="${level}Feedback"></div><div class="live-session hidden" id="${level}LiveStats" aria-live="polite"></div>${s.notice?`<div class="unlock-guidance">${s.notice}</div>`:''}<div class="bubble hidden" id="${level}Bubble"><div class="bubble-title">Step-by-step explanation</div><div id="${level}Hint"></div><div class="whole-working">${stepsHTML(q)}</div></div>`;
 el(level+'Check').onclick=()=>check(level);el(level+'Next').onclick=()=>nextQuestion(level);el(level+'Done').onclick=()=>finishSession(level);
 const input=el(level+'Answer');input.addEventListener('input',()=>input.value=input.value.replace(/[^\d.,\s+]/g,'').slice(0,18));
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
