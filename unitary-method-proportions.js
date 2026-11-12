'use strict';
window.practiceModel=(()=>{
function rndInt(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }
function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function round2(n){ return Math.round((n + Number.EPSILON)*100)/100; }
function strip2(n){ return round2(n).toFixed(2).replace(/\.?0+$/,''); }
function formatNumber(n){
  const s=strip2(n), parts=s.split('.');
  const neg=parts[0].startsWith('-'), digits=neg?parts[0].slice(1):parts[0];
  const grouped=digits.replace(/\B(?=(\d{3})+(?!\d))/g,' ');
  return (neg?'-':'')+grouped+(parts[1]?'.'+parts[1]:'');
}
function parseUserNumber(text){
  let s=(text||'').trim();
  if(!s) return NaN;
  s=s.replace(/\s+/g,'');
  const hasDot=s.includes('.'), hasComma=s.includes(',');
  if(hasDot && hasComma) s=s.replace(/,/g,'');
  else if(hasComma) s=s.replace(/,/g,'.');
  if(!/^[-+]?\d*\.?\d+$/.test(s)) return NaN;
  const n=Number(s); return Number.isFinite(n)?n:NaN;
}
function nearlyEqual(a,b){ return Math.abs(a-b)<1e-9; }

const moneyItems=["rulers","pens","notebooks","erasers","markers","stickers","tickets","sweets","bottles of water","chocolate bars","slices of pizza","apples","bananas","movie tickets"];
const nonMoneyTemplates=[
  {name:"distance-time",make:(a,T,b)=>({textA:`${a} kilometers take ${formatNumber(T)} minutes.`,textQ:`How many minutes would ${b} kilometers take?`,unitLabel:"minutes"})},
  {name:"recipe-flour",make:(a,T,b)=>({textA:`A recipe uses ${formatNumber(T)} grams of flour for ${a} cookies.`,textQ:`How many grams of flour are needed for ${b} cookies?`,unitLabel:"grams"})},
  {name:"printing",make:(a,T,b)=>({textA:`A print shop uses ${formatNumber(T)} ml of ink for ${a} posters.`,textQ:`How many ml of ink are needed for ${b} posters?`,unitLabel:"ml"})},
  {name:"fuel",make:(a,T,b)=>({textA:`A crew uses ${formatNumber(T)} liters of paint for ${a} walls.`,textQ:`How many liters of paint are needed for ${b} walls?`,unitLabel:"liters"})},
  {name:"training",make:(a,T,b)=>({textA:`A workout burns ${formatNumber(T)} calories in ${a} minutes.`,textQ:`How many calories would be burned in ${b} minutes?`,unitLabel:"calories"})},
  {name:"packaging",make:(a,T,b)=>({textA:`A factory packs ${formatNumber(T)} kg of rice into ${a} bags.`,textQ:`How many kg of rice are in ${b} bags?`,unitLabel:"kg"})},
  {name:"sports",make:(a,T,b)=>({textA:`A team scores ${formatNumber(T)} points in ${a} games.`,textQ:`How many points would they score in ${b} games?`,unitLabel:"points"})}
];
function makeMoneyText(a,T,b,currency){
  const item=pick(moneyItems), price=formatNumber(T), money=currency==='USD'?`$${price}`:`${price} kr`;
  return {textA:`${a} ${item} cost ${money}.`,textQ:`How much would ${b} ${item} cost?`,unitLabel:currency,currency};
}
function shouldMakeMoney(){ return Math.random()<0.5; }
function pickCurrency(stats){
  if(stats.usd===stats.sek) return Math.random()<0.5?'USD':'SEK';
  return stats.usd<stats.sek?'USD':'SEK';
}
function chooseUnitPriceEasy(){ return rndInt(2,30); }
function chooseUnitPriceDecimal(max){
  const steps=[5,10,15,20,25,30,35,40,45,50,60,75,80,90,95];
  const whole=rndInt(0,Math.max(0,Math.floor(max)-1));
  return round2(Math.min(max, whole+pick(steps)/100));
}
function easyPickB(unit){ return unit>=10?rndInt(2,9):rndInt(2,20); }
function buildProblem(diff,currencyStats){
  for(let attempt=0;attempt<900;attempt++){
    const money=shouldMakeMoney(), currency=money?pickCurrency(currencyStats):null;
    let a,b,unit,T,answer,templateName,textA,textQ,unitLabel;

    if(diff==='foundation'){
      a=rndInt(2,9);
      unit=chooseUnitPriceEasy();
      b=easyPickB(unit);
      if(b===a) b=(b<9?b+1:b-1);
      T=unit*a; answer=unit*b;
      if(!Number.isInteger(T)||!Number.isInteger(answer)) continue;
      if(unit>=10 && b>=10) continue;
    }else if(diff==='core'){
      a=rndInt(2,9);
      b=rndInt(2,9); if(b===a) b=b===9?8:b+1;
      unit=chooseUnitPriceDecimal(9.95);
      T=round2(unit*a); answer=round2(unit*b);
    }else if(diff==='challenge'){
      a=pick([10,20,25]);
      b=rndInt(2,9);
      unit=chooseUnitPriceDecimal(15.95);
      T=round2(unit*a); answer=round2(unit*b);
    }else return null;

    if(money){
      const txt=makeMoneyText(a,T,b,currency);
      templateName='money-'+currency; textA=txt.textA; textQ=txt.textQ; unitLabel=txt.unitLabel;
    }else{
      const tpl=pick(nonMoneyTemplates.filter(t=>t.name!=='sports')), txt=tpl.make(a,T,b);
      templateName='nonmoney-'+tpl.name; textA=txt.textA; textQ=txt.textQ; unitLabel=txt.unitLabel;
    }

    const sig=`${diff}|${templateName}|a=${a}|T=${T}|b=${b}|u=${unit}`;
    

    const unitText=money?(currency==='USD'?`$${formatNumber(unit)}`:`${formatNumber(unit)} kr`):`${formatNumber(unit)} ${unitLabel}`;
    const totalText=money?(currency==='USD'?`$${formatNumber(T)}`:`${formatNumber(T)} kr`):`${formatNumber(T)} ${unitLabel}`;
    const answerText=money?(currency==='USD'?`$${formatNumber(answer)}`:`${formatNumber(answer)} kr`):`${formatNumber(answer)} ${unitLabel}`;

    if(money) currencyStats[currency==='USD'?'usd':'sek']++;
    return {diff,a,b,unit,total:T,answer,money,currency,display:`${textA} ${textQ}`,
      step1:`Value of 1 unit: ${totalText} ÷ ${a} = <strong>${unitText}</strong>`,
      step2:`Target value: ${unitText} × ${b} = <strong>${answerText}</strong>`,answerText};
  }
  return null;
}


const currencies={usd:0,sek:0};
function make(level){
 const p=buildProblem(level,currencies);
 if(level==='challenge' && Math.random()<0.35){
  const noun=p.money?p.currency:'kg';
  const prompt=p.money?p.a+' tickets cost '+formatNumber(p.total)+' '+noun+'. How many tickets cost '+formatNumber(p.answer)+' '+noun+'?':p.a+' identical boxes weigh '+formatNumber(p.total)+' kg altogether. How many boxes weigh '+formatNumber(p.answer)+' kg?';
  return {prompt,
   answers:[String(p.b)],labels:[p.money?'Tickets':'Boxes'],steps:p.total+' ÷ '+p.a+' = '+p.unit+' '+noun+' each.<br>'+p.answer+' ÷ '+p.unit+' = '+p.b+'.',
   raw:{...p,reverse:true},key:['reverse',p.a,p.b,p.total].join('|')};
 }
 return {prompt:p.display,answers:[String(p.answer)],labels:[p.money?p.currency:'Answer'],steps:p.step1+'<br>'+p.step2,raw:p,key:[p.a,p.b,p.total].join('|')};
}
return {id:"unitary",title:"Unitary Method Proportions",make};
})();