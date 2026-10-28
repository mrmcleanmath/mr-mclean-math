(function(){
'use strict';
// Calculating Interest. Exact integer cents and annual rates in basis points.
// One year maximum in standard problems. Rare Challenge extension: one full year
// followed by 1–11 months after credited interest becomes the new principal.
const randInt=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
const choose=a=>a[randInt(0,a.length-1)];
const gcd=(a,b)=>b?gcd(b,a%b):a;
const rates={easy:[200,300,400,500,600,800,1000,1200],medium:[150,200,250,300,350,400,450,500,600,650,700,750,800,900,1000,1200],hard:[125,150,175,200,225,250,275,300,325,350,375,400,425,450,475,500,550,600,650,700,750,800,850,900,950,1000,1050,1100,1150,1200,1250,1350]};
const monthsAllowed={easy:[3,6,9],medium:[1,2,3,4,6,8,9,10,12],hard:[1,2,3,4,5,6,7,8,9,10,11,12]};
const types={easy:['interest','principal','rate'],medium:['interest','interest','principal','rate','time','repayment'],hard:['interest','interest','principal','principal','rate','rate','time','time','repayment','twoPeriod']};
const recent={game:{easy:[],medium:[],hard:[]},qa:{easy:[],medium:[],hard:[]},stress:{easy:[],medium:[],hard:[]}};
// For Foundation, each block of three generated questions finds interest, principal, and rate exactly once.
// Independent queues keep worksheet testing from disturbing the student's rotation.
const foundationQueues={game:[],qa:[],stress:[]};
function shuffleList(a){const arr=[...a];for(let i=arr.length-1;i>0;i--){const j=randInt(0,i);[arr[i],arr[j]]=[arr[j],arr[i]]}return arr;}
function nextFoundationType(channel){if(!foundationQueues[channel].length)foundationQueues[channel]=shuffleList(types.easy);return foundationQueues[channel].shift();}
const shortNum=n=>Number(n).toLocaleString('en-US',{maximumFractionDigits:2}).replace(/,/g,' ');
const money=c=>'$'+(c/100).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}).replace(/,/g,' ');
const percent=bp=>String(Number((bp/100).toFixed(2)))+'%';
const monthText=n=>n===1?'1 month':n+' months';
const toAnswer=c=>String(Number((c/100).toFixed(2)));
function makeQuestion(level,forced=null){
 const type=forced||choose(types[level]);
 if(!types[level].includes(type))throw Error('Unknown type for level');
 const bp=choose(rates[level]);
 let months,principal,interest,newPrincipal=null,firstInterest=null;
 if(type==='twoPeriod'){
   // Generate from mathematically exact cent amounts, never from rounded balances.
   for(let tries=0;tries<5000;tries++){
     const r=choose([200,250,300,350,400,450,500,600,700,750,800,900]);
     const p=randInt(10,250)*100;
     const m=randInt(1,11);
     const annualNumerator=p*r; // principal dollars × basis points, /100 gives cents
     if(annualNumerator%100!==0)continue;
     const credit=annualNumerator/100;
     const balance=p*100+credit;
     const numerator=balance*r*m;
     if(numerator%120000!==0)continue;
     const later=numerator/120000;
     if(balance*r%10000!==0)continue; // explain annual interest without hidden cent rounding
     if(!later||later>1000000)continue;
     return complete({type,level,P:p,bp:r,months:m,firstInterest:credit,newPrincipal:balance,interest:later,finalBalance:balance+later});
   }
   throw Error('Unable to produce exact two-period interest question');
 }
 months=(level!=='easy'&&(type==='principal'||type==='rate'))?12:choose(monthsAllowed[level]);
 // Construct principal as a multiple that yields exact interest cents.
 // dollars × basis points × months /1200 = cents.
 const monthlyFactor=1200/gcd(bp*months,1200);
 const yearlyFactor=100/gcd(bp,100);
 const factor=monthlyFactor*yearlyFactor/gcd(monthlyFactor,yearlyFactor);
 const min=level==='easy'?400:level==='medium'?750:1200;
 const max=level==='easy'?12000:level==='medium'?45000:90000;
 const lo=Math.ceil(min/factor),hi=Math.floor(max/factor);
 principal=randInt(lo,hi)*factor;
 if(level==='easy' && principal%100!==0){
   // Foundation: cleaner amounts, without forcing only a few numbers.
   const simpleFactor=(factor*100)/gcd(factor,100);
   principal=randInt(Math.ceil(min/simpleFactor),Math.floor(max/simpleFactor))*simpleFactor;
 }
 interest=principal*bp*months/1200;
 if(!Number.isSafeInteger(interest))throw Error('Noninteger cents');
 return complete({type,level,P:principal,bp,months,interest});
}
function complete(q){
 const P=q.P*100, annual=P*q.bp/10000, interest=q.interest;
 const answerCents=q.type==='principal'?P:q.type==='interest'?interest:q.type==='repayment'?P+interest:null;
 const answer=q.type==='rate'?String(Number((q.bp/100).toFixed(2))):q.type==='time'||q.type==='twoPeriod'?String(q.months):toAnswer(answerCents);
 const unit=q.type==='rate'?'%':q.type==='time'||q.type==='twoPeriod'?'months':'USD';
 const signature=[q.type,q.P,q.bp,q.months,q.interest].join('|');
 return {...q,annualCents:annual,answer,unit,signature};
}
function levelMissingTwelveMonths(q){return q.level!=='easy'&&(q.type==='principal'||q.type==='rate')&&q.months!==12;}
function validateQuestion(q){
 if(!q||!rates[q.level]||!types[q.level].includes(q.type)||q.P<=0||q.bp<=0)return false;
 if(q.type==='twoPeriod'){
   if(q.level!=='hard'||q.months<1||q.months>11)return false;
   if(!Number.isInteger(q.firstInterest)||!Number.isInteger(q.interest))return false;
   if(q.firstInterest!==q.P*q.bp/100||q.newPrincipal!==q.P*100+q.firstInterest)return false;
   if(q.newPrincipal*q.bp%10000!==0||q.newPrincipal*q.bp*q.months!==q.interest*120000)return false;
   return q.finalBalance===q.newPrincipal+q.interest&&q.answer===String(q.months);
 }
 if(q.months<1||q.months>12||!monthsAllowed[q.level].includes(q.months)&&q.type!=='principal'&&q.type!=='rate')return false;
 if(levelMissingTwelveMonths(q))return false;
 if(!Number.isInteger(q.interest)||q.interest<=0||q.P*q.bp*q.months!==q.interest*1200)return false;
 if(q.P*q.bp%100!==0)return false;
 if(q.type==='interest'&&q.answer!==toAnswer(q.interest))return false;
 if(q.type==='repayment'&&q.answer!==toAnswer(q.P*100+q.interest))return false;
 if(q.type==='principal'&&q.answer!==toAnswer(q.P*100))return false;
 if(q.type==='rate'&&q.answer!==String(Number((q.bp/100).toFixed(2))))return false;
 if(q.type==='time'&&q.answer!==String(q.months))return false;
 return Number.isFinite(Number(q.answer));
}
function generateQuestion(level,channel='game',local=null,forced=null){
 const h=recent[channel][level];
 const selected=forced||((level==='easy')?nextFoundationType(channel):null);
 for(let tries=0;tries<4000;tries++){
   const q=makeQuestion(level,selected);
   if(!validateQuestion(q)||h.includes(q.signature)||local?.has(q.signature))continue;
   if(!selected&&tries<60&&h.length>=3&&h.slice(-3).every(x=>x.split('|')[0]===q.type))continue;
   h.push(q.signature);if(h.length>90)h.shift();local?.add(q.signature);return q;
 }
 h.splice(0,h.length);return generateQuestion(level,channel,local,selected);
}
function canonicalDecimal(raw){
 const s=String(raw??'').trim().replace(/[$%\u00a0\u202f\s]/g,'').replace(',','.');
 if(!/^\d+(?:\.\d+)?$/.test(s))return null;
 let [whole,fraction='']=s.split('.');whole=whole.replace(/^0+(?=\d)/,'');fraction=fraction.replace(/0+$/,'');
 return fraction?whole+'.'+fraction:whole;
}
function parseAnswer(raw,q){
 const v=canonicalDecimal(raw);
 if(v===null)return {valid:false,message:'Enter a valid positive number.'};
 if(q.unit==='months'&&!Number.isInteger(Number(v)))return {valid:false,message:'Enter a whole number of months.'};
 if(q.unit==='USD'&&Number(v)>1000000)return {valid:false,message:'Please check the amount you entered.'};
 return {valid:true,answer:v};
}
function formatAnswer(q){return q.unit==='USD'?money(Math.round(Number(q.answer)*100)):q.unit==='%'?q.answer+'%':monthText(Number(q.answer))}
function levelName(l){return l==='easy'?'Foundation Mode':l==='medium'?'Core Mode':'Challenge Mode'}
function foundationTable(q,{interactive=false,level='easy'}={}){
 // The time period is part of the interest label, never a separate field.
 // Foundation asks only for interest, principal, or annual rate.
 const names={principal:'Principal (starting amount)',rate:'Annual interest rate',interest:`Interest for ${monthText(q.months)}`};
 const rows=[
  ['principal',money(q.P*100)],
  ['rate',percent(q.bp)],
  ['interest',money(q.interest)]
 ].map(([field,value])=>{
   const missing=(field===q.type);
   const v=missing&&interactive?`<input id="${level}Answer" class="interest-foundation-input" type="text" inputmode="decimal" autocomplete="off" enterkeyhint="done" aria-label="${names[field]} — missing value" placeholder="?">`:missing?'<strong class="interest-missing">?</strong>':`<strong>${value}</strong>`;
   return `<div class="interest-foundation-row${missing?' interest-foundation-missing':''}"><label class="interest-foundation-label"${missing&&interactive?` for="${level}Answer"`:''}>${names[field]}</label><div class="interest-foundation-value">${v}</div></div>`;
 }).join('');
 return `<div class="interest-foundation-prompt">Calculate the missing value.</div><div class="interest-foundation-grid" role="group" aria-label="Interest calculations: find ${names[q.type].toLowerCase()}">${rows}</div>`;
}
function questionHTML(q){
 if(q.level==='easy')return foundationTable(q);
 const P=money(q.P*100),r=percent(q.bp),I=money(q.interest),months=monthText(q.months);
 const context=['You deposit money in a savings account','You borrow money with simple interest'];
 const opener=choose(context);
 switch(q.type){
  case 'interest':return `${opener.replace('money',P)} at an annual interest rate of <strong>${r}</strong>. How much interest ${opener.startsWith('You deposit')?'do you earn':'do you pay'} after <strong>${months}</strong>?`;
  case 'repayment':return `You borrow <strong>${P}</strong> at an annual interest rate of <strong>${r}</strong>. You repay the loan after <strong>${months}</strong>. What is your <strong>total repayment</strong>, including interest?`;
  case 'principal':return `After <strong>12 months</strong>, you earn <strong>${I}</strong> in simple interest on your savings. The annual interest rate is <strong>${r}</strong>. How much money did you originally deposit?`;
  case 'rate':return `You deposit <strong>${P}</strong> into a savings account. After <strong>12 months</strong>, you earn <strong>${I}</strong> in interest. What was the <strong>annual interest rate</strong>?`;
  case 'time':return `You borrow <strong>${P}</strong> at an annual interest rate of <strong>${r}</strong>. You pay <strong>${I}</strong> in simple interest. For how many <strong>months</strong> did you borrow the money?`;
  case 'twoPeriod':return `You deposit <strong>${P}</strong> into a savings account at an annual interest rate of <strong>${r}</strong>. After <strong>one year</strong>, the bank adds the earned interest to your account balance. Several months later, your balance is <strong>${money(q.finalBalance)}</strong>. <strong>How many months into the second year</strong> have passed?`;
 }
}
function hintFor(q){
 if(q.level==='easy'){
   if(q.type==='principal')return 'Find the interest rate for the given number of months: annual rate × months ÷ 12. Then divide the interest by that decimal.';
   if(q.type==='rate')return 'Divide the interest by the original amount, multiply by 12 ÷ months, then multiply by 100 to get the annual percentage.';
 }
 switch(q.type){
  case 'interest':return 'First calculate one full year of interest, then take the fraction of the year represented by the months.';
  case 'principal':return 'For one year: original amount = interest ÷ annual rate as a decimal.';
  case 'rate':return 'For one year: annual rate = interest ÷ principal. Multiply by 100 to express it as a percentage.';
  case 'repayment':return 'Find the interest for the given number of months, then add it to the original loan.';
  case 'time':return 'Compare the interest paid with the interest that would be paid in 12 months. Multiply the fraction by 12.';
  case 'twoPeriod':return 'The second year starts with a NEW principal: the original deposit plus the first year’s interest.';
 }
}
function stepsHTML(q){
 const yearly=q.P*q.bp/10000*100; // exact annual interest in cents
 const yearDisplay=money(yearly);
 const fraction=q.months===12?'12/12':`${q.months}/12`;
 const intro=`<div class="whole-working-line">One year’s interest: ${money(q.P*100)} × ${percent(q.bp)} = <strong>${yearDisplay}</strong>.</div>`;
 switch(q.type){
 case 'interest':return intro+`<div class="whole-working-line">Interest for ${monthText(q.months)}: ${yearDisplay} × ${fraction} = <strong>${money(q.interest)}</strong>.</div>`;
 case 'repayment':return intro+`<div class="whole-working-line">Interest for ${monthText(q.months)}: ${yearDisplay} × ${fraction} = ${money(q.interest)}.</div><div class="whole-working-line">Total repayment: ${money(q.P*100)} + ${money(q.interest)} = <strong>${money(q.P*100+q.interest)}</strong>.</div>`;
 case 'principal':return `<div class="whole-working-line">Annual rate: ${percent(q.bp)} = ${q.bp/10000}.</div><div class="whole-working-line">Interest rate for ${monthText(q.months)}: ${q.bp/10000} × ${q.months}/12 = ${Number((q.bp/10000*q.months/12).toFixed(8))}.</div><div class="whole-working-line">Principal = ${money(q.interest)} ÷ (${q.bp/10000} × ${q.months}/12) = <strong>${money(q.P*100)}</strong>.</div>`;
 case 'rate':return `<div class="whole-working-line">Interest for ${monthText(q.months)} ÷ principal: ${money(q.interest)} ÷ ${money(q.P*100)} = ${Number((q.bp/10000*q.months/12).toFixed(8))}.</div><div class="whole-working-line">Annual interest rate: (${money(q.interest)} ÷ ${money(q.P*100)}) × (12 ÷ ${q.months}) × 100 = <strong>${percent(q.bp)}</strong>.</div>`;
 case 'time':return intro+`<div class="whole-working-line">Fraction of a year: ${money(q.interest)} ÷ ${yearDisplay} = ${Number((q.months/12).toFixed(6))}.</div><div class="whole-working-line">Months = (${money(q.interest)} ÷ ${yearDisplay}) × 12 = <strong>${monthText(q.months)}</strong>.</div>`;
 case 'twoPeriod':return `<div class="whole-working-line">First year’s interest: ${money(q.P*100)} × ${percent(q.bp)} = ${money(q.firstInterest)}.</div><div class="whole-working-line">New principal: ${money(q.P*100)} + ${money(q.firstInterest)} = <strong>${money(q.newPrincipal)}</strong>.</div><div class="whole-working-line">Second-period interest: ${money(q.finalBalance)} − ${money(q.newPrincipal)} = ${money(q.interest)}.</div><div class="whole-working-line">One year of interest on the new principal: ${money(q.newPrincipal)} × ${percent(q.bp)} = ${money(q.newPrincipal*q.bp/10000)}.</div><div class="whole-working-line">Months into the second year: ${money(q.interest)} ÷ (${money(q.newPrincipal*q.bp/10000)}) × 12 = <strong>${monthText(q.months)}</strong>.</div>`;
 }
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
 w.document.write(`<title>Calculating Interest — Results</title><h1>Calculating Interest</h1><table border="1" cellspacing="0" cellpadding="8"><tr><th>Level</th><th>Correct</th><th>Incorrect</th><th>Accuracy</th></tr>${rows||'<tr><td colspan="4">No completed sessions yet.</td></tr>'}</table>`);w.document.close();w.print();
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
 const s=state[level],q=s.q;s.resolved=false;s.transitioning=false;q.hint=hintFor(q);
 const note=q.unit==='%'?'Enter the annual rate as a percentage: 3.5 means 3.5%.':q.unit==='months'?'Enter your answer in whole months.':'Enter the dollar amount (cents may be included).';
 const foundation=level==='easy';
 const content=foundation?`<div class="whole-question foa-question question-fade-in" id="${level}Problem"><div class="whole-answer-row interest-foundation-answer-area">${foundationTable(q,{interactive:true,level})}</div></div><div class="interest-foundation-toolbar"><button class="primary" id="${level}Check">Check</button></div>`:`<div class="whole-question foa-question question-fade-in" id="${level}Problem"><div class="whole-instruction interest-task">${questionHTML(q)}</div></div><div class="whole-answer-row foa-answer-row"><div class="whole-answer-box"><input id="${level}Answer" inputmode="decimal" autocomplete="off" enterkeyhint="done" aria-label="${q.unit==='%'?'Interest rate in percent':q.unit==='months'?'Number of months':'Answer in US dollars'}" placeholder="Your answer"></div><button class="primary" id="${level}Check">Check</button></div>`;
 el(level+'Body').innerHTML=`${content}<div class="whole-answer-note interest-note">${note}</div><div class="actions"><button class="primary hidden" id="${level}Next">Next</button><button class="done" id="${level}Done">Done</button></div><div class="feedback" id="${level}Feedback"></div><div class="live-session hidden" id="${level}LiveStats" aria-live="polite"></div>${s.notice?`<div class="unlock-guidance">${s.notice}</div>`:''}<div class="bubble hidden" id="${level}Bubble"><div class="bubble-title">Let’s think about it</div><div id="${level}Hint"></div><div class="whole-working">${stepsHTML(q)}</div></div>`;
 el(level+'Check').onclick=()=>check(level);el(level+'Next').onclick=()=>nextQuestion(level);el(level+'Done').onclick=()=>finishSession(level);
 const input=el(level+'Answer');input.addEventListener('input',()=>input.value=input.value.replace(/[^0-9.,$%\s]/g,'').slice(0,24));
 input.addEventListener('keydown',e=>{if(e.key!=='Enter')return;e.preventDefault();if(e.repeat)return;if(!el(level+'Next').classList.contains('hidden'))nextQuestion(level);else check(level)});
 updateLiveStats(level);input.focus();
}
function check(level){
 const s=state[level];if(!s.session||s.resolved||s.transitioning)return;
 const q=s.q,input=el(level+'Answer'),feedback=el(level+'Feedback');
 const parsed=parseAnswer(input.value,q);
 if(!parsed.valid){feedback.textContent=parsed.message;feedback.className='feedback incorrect';input.focus();return}
 s.resolved=true;s.session.total++;const correct=parsed.answer===canonicalDecimal(q.answer);
 if(correct){
  s.session.correct++;
  if(s.unlock<3){s.unlock++;el(level+'Progress').textContent=`${s.unlock} / 3`;if(s.unlock===3){const next=level==='easy'?'medium':level==='medium'?'hard':null;if(next&&!state[next].unlocked)unlock(next)}}
  feedback.innerHTML='<span class="correct-callout">Correct!</span>';feedback.className='feedback correct';playAppSound('correct');
 }else{
  s.session.incorrect++;feedback.innerHTML=`Incorrect. The correct answer is <strong>${formatAnswer(q)}</strong>.`;feedback.className='feedback incorrect';el(level+'Hint').textContent=q.hint;el(level+'Bubble').classList.remove('hidden');playAppSound('incorrect');
 }
 input.disabled=true;el(level+'Check').disabled=true;el(level+'Check').classList.add('hidden');el(level+'Next').classList.remove('hidden');el(level+'Next').focus();updateLiveStats(level);
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
 Object.keys(foundationQueues).forEach(channel=>foundationQueues[channel]=[]);
 el('studentMode').classList.add('active');el('timerMode').classList.remove('active');el('durationWrap').classList.remove('show');clearAllOrbTimers();refreshLevelCards();closeResetModal();
}
function refreshLevelCards(){
 for(const l of orbLevels){const s=state[l],card=el(l+'Card');card.className=`card ${s.unlocked?'active':'locked'}`;el(l+'Progress').textContent=`${s.unlock} / 3`;el(l+'Progress').classList.toggle('hidden',!s.unlocked);if(s.unlocked)renderStart(l);else el(l+'Body').innerHTML=`<div class="lock" id="${l}Lock"><div class="shackle"></div><div class="lockbody"></div></div>`;}
}
resetProgressButton.addEventListener('click',openResetModal);resetCancelButton.addEventListener('click',closeResetModal);resetConfirmButton.addEventListener('click',resetAllProgress);resetModalBackdrop.addEventListener('click',e=>{if(e.target===resetModalBackdrop)closeResetModal()});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&resetModalBackdrop.classList.contains('show'))closeResetModal()});



renderStart('easy');
})();
