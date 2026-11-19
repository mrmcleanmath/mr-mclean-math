'use strict';
window.practiceModel=(()=>{
// Make the divisor whole; allow 1..9 or a power of ten without cancellation.
function divisionParts(value){
 const s=String(value).replace(/ /g,'').replace(/^-/,'');
 if(!/^\d+(?:\.\d+)?$/.test(s))throw Error('Unsupported divisor '+value);
 const [whole,fraction='']=s.split('.');
 return {divisor:Number(whole+fraction),places:fraction.length};
}
function allowedDivisor(value){
 const d=divisionParts(value).divisor;
 return d>=1&&(d<=9||/^10+$/.test(String(d)));
}
function shiftForDivision(value,places){
 const s=String(value).replace(/ /g,''),negative=s.startsWith('-'),abs=negative?s.slice(1):s;
 const [w,f='']=abs.split('.'),digits=w+f,point=w.length+places;
 let result=point>=digits.length?digits+'0'.repeat(point-digits.length):digits.slice(0,point)+'.'+digits.slice(point);
 result=result.replace(/^0+(?=\d)/,'').replace(/(\.\d*?)0+$/,'$1').replace(/\.$/,'');
 return (negative?'-':'')+result;
}
function divisionWorking(numerator,denominator,answer){
 const {divisor,places}=divisionParts(denominator);
 if(!allowedDivisor(denominator))throw Error('Unsuitable student division');
 const first=numerator+' ÷ '+denominator;
 return places?first+' = '+shiftForDivision(numerator,places)+' ÷ '+divisor+' = '+answer+' (multiply both numbers by '+10**places+').':first+' = '+answer+'.';
}
function randInt(a,b){ return Math.floor(Math.random()*(b-a+1))+a; }
function pick(arr){ return arr[randInt(0,arr.length-1)]; }
function gcd(a,b){ a=Math.abs(a); b=Math.abs(b); while(b){ [a,b]=[b,a%b]; } return a||1; }
function lcm(a,b){ return (a/gcd(a,b))*b; }
function powInt(n,e){ let r=1; for(let i=0;i<e;i++) r*=n; return r; }
function F(n,d=1){ if(d===0) throw new Error("Division by zero"); if(d<0){ n=-n; d=-d; } const g=gcd(n,d); return {n:n/g,d:d/g}; }
function addF(x,y){ const L=lcm(x.d,y.d); return F(x.n*(L/x.d)+y.n*(L/y.d),L); }
function subF(x,y){ return addF(x,F(-y.n,y.d)); }
function mulF(x,y){ return F(x.n*y.n,x.d*y.d); }
function divF(x,y){ if(y.n===0) throw new Error("Division by zero"); return F(x.n*y.d,x.d*y.n); }
function intF(k){ return F(k,1); }
function tenthF(t){ return F(t,10); }

function hasTerminatingDecimal(fr){
  let d=Math.abs(fr.d);
  while(d%2===0) d/=2;
  while(d%5===0) d/=5;
  return d===1;
}

function decimalPlacesExact(fr){
  if(!hasTerminatingDecimal(fr)) return Infinity;
  let d=Math.abs(fr.d), a=0, b=0;
  while(d%2===0){ d/=2; a++; }
  while(d%5===0){ d/=5; b++; }
  return Math.max(a,b);
}

function formatCanonicalNumberString(intStr,decStr){
  intStr=intStr.replace(/\B(?=(\d{3})+(?!\d))/g," ");
  if(!decStr) return intStr;
  decStr=decStr.replace(/0+$/,'');
  return decStr ? intStr+"."+decStr : intStr;
}

function toDecimalStringFromInt(numer,k){
  const s=String(Math.abs(numer));
  const neg=numer<0?"-":"";
  if(k===0) return neg+s.replace(/\B(?=(\d{3})+(?!\d))/g," ");
  if(s.length>k){
    return neg+formatCanonicalNumberString(s.slice(0,s.length-k),s.slice(s.length-k));
  }
  return neg+formatCanonicalNumberString("0","0".repeat(k-s.length)+s);
}

function toExactDecimalString(fr){
  if(!hasTerminatingDecimal(fr)) throw new Error("Non-terminating decimal reached answer formatter");
  let n=fr.n,d=fr.d,a=0,b=0;
  while(d%2===0){ d/=2; a++; }
  while(d%5===0){ d/=5; b++; }
  const k=Math.max(a,b);
  n=n*powInt(2,k-a)*powInt(5,k-b);
  return toDecimalStringFromInt(n,k);
}

/* Accept decimal point or comma, with or without thousands spaces. */
function normalizeInputCanonical(raw){
  raw=(raw||"").trim();
  if(!raw) return {ok:false,blank:true,reason:"Enter an answer first."};
  if(/^\+/.test(raw)) return {ok:false,reason:"Do not use a + sign."};
  if(/[.,].*[.,]/.test(raw)) return {ok:false,reason:"Use only one decimal separator."};

  const normalized=raw.replace(/,/g,".");
  if(!/^-?(?:\d+|\d{1,3}(?: \d{3})+)(?:\.\d+)?$/.test(normalized)){
    return {ok:false,reason:"Enter a valid number."};
  }

  let [intPart,decPart=""]=normalized.split(".");
  intPart=intPart.replace(/ /g,"");
  if(decPart && /0$/.test(decPart)) decPart=decPart.replace(/0+$/,'');
  const numeric=Number(intPart+(decPart?"."+decPart:""));
  if(!Number.isFinite(numeric)) return {ok:false,reason:"Enter a valid number."};

  const neg=numeric<0?"-":"";
  const abs=Math.abs(numeric).toString();
  let [i,d=""]=abs.split(".");
  i=i.replace(/\B(?=(\d{3})+(?!\d))/g," ");
  return {ok:true,canonical:neg+i+(d?"."+d:"")};
}

/* ========== Expression model ========== */
function intNode(v){ return {kind:"int",v}; }
function tenthsNode(t){ return {kind:"tenths",t}; }
function add(a,b){ return {kind:"add",a,b}; }
function sub(a,b){ return {kind:"sub",a,b}; }
function mul(a,b){ return {kind:"mul",a,b}; }
function powNode(base,exp){ return {kind:"pow",base,exp}; }
function paren(e){ return {kind:"paren",e}; }
function frac(num,den){ return {kind:"frac",num,den}; }

function evalExpr(e){
  switch(e.kind){
    case "int": return intF(e.v);
    case "tenths": return tenthF(e.t);
    case "add": return addF(evalExpr(e.a),evalExpr(e.b));
    case "sub": return subF(evalExpr(e.a),evalExpr(e.b));
    case "mul": return mulF(evalExpr(e.a),evalExpr(e.b));
    case "pow": { const v=evalExpr(e.base); return F(powInt(v.n,e.exp),powInt(v.d,e.exp)); }
    case "paren": return evalExpr(e.e);
    case "frac": return divF(evalExpr(e.num),evalExpr(e.den));
    default: throw new Error("Unknown expression kind");
  }
}

function renderExprHTML(e){
  switch(e.kind){
    case "int": return `<span>${formatCanonical(e.v)}</span>`;
    case "tenths": return `<span>0.${e.t}</span>`;
    case "add": return `${renderExprHTML(e.a)} <span class="op">+</span> ${renderExprHTML(e.b)}`;
    case "sub": return `${renderExprHTML(e.a)} <span class="op">−</span> ${renderExprHTML(e.b)}`;
    case "mul": return `${renderExprHTML(e.a)} <span class="op">×</span> ${renderExprHTML(e.b)}`;
    case "pow": {
      let baseHTML=renderExprHTML(e.base);
      if(["add","sub","mul"].includes(e.base.kind)) baseHTML=`<span class="par">(</span>${baseHTML}<span class="par">)</span>`;
      return `${baseHTML}<sup class="sup">${e.exp}</sup>`;
    }
    case "paren": return `<span class="par">(</span>${renderExprHTML(e.e)}<span class="par">)</span>`;
    case "frac": {
      const num=renderExprHTML(e.num), den=renderExprHTML(e.den);
      const aria=(stripHTML(num)+" over "+stripHTML(den)).replace(/\s+/g," ").trim();
      return `<span class="frac" role="img" aria-label="${aria}"><span class="num">${num}</span><span class="bar"></span><span class="den">${den}</span></span>`;
    }
  }
}

function stripHTML(s){ return s.replace(/<[^>]*>/g,""); }
function formatCanonical(n){
  if(!Number.isFinite(n)) return String(n);
  const neg=n<0?"-":"";
  const s=String(Math.abs(n));
  let [i,dec=""]=s.split(".");
  i=i.replace(/\B(?=(\d{3})+(?!\d))/g," ");
  return dec ? neg+i+"."+dec : neg+i;
}

/* ========== Problem generators ========== */
function intRange(a,b){ const r=[]; for(let i=a;i<=b;i++) r.push(i); return r; }
const FOUNDATION_POW_BASES=intRange(2,10);
const SMALL_INTS=intRange(2,9);
const CORE_PRODUCT_FACTORS=intRange(2,3); // keeps (a×b)^n student-manageable
const K_SMALL=intRange(2,9);
const TENTHS=[1,2,3,4,5,6,7,8,9];
const TERMINATING_TENTHS=[2,4,5,8];

function genFoundation(){
  const t=pick([0,1,2,3]);
  if(t===0){
    const a=pick(FOUNDATION_POW_BASES),b=pick(FOUNDATION_POW_BASES);
    return {expr:add(powNode(intNode(a),pick([2,3])),powNode(intNode(b),2)),kind:"sumPowers"};
  }
  if(t===1){
    const a=pick(FOUNDATION_POW_BASES),c=pick(SMALL_INTS);
    return {expr:sub(powNode(intNode(a),2),mul(intNode(c),intNode(c))),kind:"minusSquareTimes"};
  }
  if(t===2){
    if(Math.random()<0.5){
      const k=pick(K_SMALL);
      return {expr:mul(intNode(k),powNode(intNode(10),2)),kind:"kTimes100"};
    }
    const k=pick(K_SMALL),n=pick(FOUNDATION_POW_BASES);
    return {expr:mul(intNode(k),powNode(intNode(n),pick([2,3]))),kind:"kTimesNPow"};
  }
  const a=pick(FOUNDATION_POW_BASES),b=pick(FOUNDATION_POW_BASES);
  return {expr:sub(powNode(intNode(a),2),powNode(intNode(b),3)),kind:"diffSquareCube"};
}

function genCore(){
  const t=pick([0,1,2,3,4]);
  if(t===0){
    return {expr:add(powNode(tenthsNode(pick(TENTHS)),pick([2,3])),powNode(tenthsNode(pick(TENTHS)),pick([2,3]))),kind:"sumDecPowers"};
  }
  if(t===1){
    const a=pick(CORE_PRODUCT_FACTORS),b=pick(CORE_PRODUCT_FACTORS);
    return {expr:powNode(paren(mul(intNode(a),intNode(b))),pick([2,3])),kind:"parenProductPow"};
  }
  if(t===2){
    return {expr:mul(intNode(pick(K_SMALL)),powNode(tenthsNode(pick(TENTHS)),pick([2,3]))),kind:"kTimesDecPow"};
  }
  if(t===3){
    return {expr:powNode(paren(sub(intNode(pick(SMALL_INTS)),intNode(pick(SMALL_INTS)))),pick([2,3])),kind:"parenDiffPow"};
  }
  return {expr:add(powNode(intNode(pick(SMALL_INTS)),2),powNode(tenthsNode(pick(TENTHS)),2)),kind:"mixIntDec"};
}

function genChallenge(){
  const t=pick([0,1,2,3,4]);
  if(t===0){
    const p=pick([2,3]);
    return {expr:frac(powNode(tenthsNode(pick(TENTHS)),p),powNode(tenthsNode(pick(TERMINATING_TENTHS)),p)),kind:"ratioDecPow"};
  }
  if(t===1){
    const p=pick([2,3]);
    return {expr:sub(sub(powNode(tenthsNode(pick(TENTHS)),p),powNode(tenthsNode(pick(TENTHS)),p)),powNode(tenthsNode(pick(TENTHS)),p)),kind:"tripleDecDiff"};
  }
  if(t===2){
    const a=pick(SMALL_INTS),b=pick([2,4,5,8,10]),k=pick(K_SMALL),p=pick([2,3]);
    return {expr:frac(mul(intNode(k),powNode(intNode(a),p)),powNode(intNode(b),p)),kind:"kTimesIntPowOverIntPow"};
  }
  if(t===3){
    return {expr:powNode(paren(sub(tenthsNode(pick(TENTHS)),tenthsNode(pick(TENTHS)))),pick([2,3])),kind:"parenDecDiffPow"};
  }
  return {expr:frac(add(powNode(intNode(pick(SMALL_INTS)),2),powNode(intNode(pick(SMALL_INTS)),2)),powNode(intNode(pick([2,4,5,8,10])),2)),kind:"sumSquaresOverC2"};
}

function genProblemByDiff(diff){
  if(diff==="foundation") return genFoundation();
  if(diff==="core") return genCore();
  return genChallenge();
}

/* Keep only exact terminating answers with no more than two decimal places. */
function genProblemFiltered(diff){
  for(let tries=0;tries<600;tries++){
    const prob=genProblemByDiff(diff);
    const val=evalExpr(prob.expr);
    const dp=decimalPlacesExact(val);
    if(dp<=2) return {prob,val};
  }
  throw new Error("Unable to generate a valid problem for "+diff);
}


function arithmeticSafe(e){
 if(e.kind==='pow'){
  const v=evalExpr(e.base);
  return arithmeticSafe(e.base)&&(Math.abs(v.n)<=10||v.n%10===0)&&v.d<=10;
 }
 if(['add','sub','mul'].includes(e.kind)){
  if(!arithmeticSafe(e.a)||!arithmeticSafe(e.b))return false;
  if(e.kind==='mul'){
   const a=evalExpr(e.a),b=evalExpr(e.b);
   return Math.abs(a.n)<10||Math.abs(b.n)<10||a.n%10===0||b.n%10===0;
  }
 }
 if(e.kind==='paren')return arithmeticSafe(e.e);
 if(e.kind==='frac'){
  const denominator=evalExpr(e.den);
  return arithmeticSafe(e.num)&&arithmeticSafe(e.den)&&hasTerminatingDecimal(denominator)&&allowedDivisor(toExactDecimalString(denominator));
 }
 return true;
}
function expressionKey(e){
 if(e.kind==='add'||e.kind==='mul')return e.kind+'('+[expressionKey(e.a),expressionKey(e.b)].sort().join(',')+')';
 if(e.kind==='sub')return 'sub('+expressionKey(e.a)+','+expressionKey(e.b)+')';
 if(e.kind==='pow')return 'pow('+expressionKey(e.base)+','+e.exp+')';
 if(e.kind==='paren')return expressionKey(e.e);
 if(e.kind==='frac')return 'frac('+expressionKey(e.num)+','+expressionKey(e.den)+')';
 return JSON.stringify(e);
}
function work(e){
 const sub=e.kind==='pow'?[e.base]:e.kind==='paren'?[e.e]:e.kind==='frac'?[e.num,e.den]:e.a?[e.a,e.b]:[];
 const previous=sub.flatMap(work);
 if(sub.length){const v=evalExpr(e);previous.push(renderExprHTML(e)+' = '+(hasTerminatingDecimal(v)?toExactDecimalString(v):v.n+'/'+v.d));
  if(e.kind==='frac')previous.push(divisionWorking(toExactDecimalString(evalExpr(e.num)),toExactDecimalString(evalExpr(e.den)),toExactDecimalString(v)));
 }
 return previous;
}
function solveX(){
 let base=randInt(2,9);const exp=randInt(2,3),offset=randInt(1,9),x=randInt(0,7);
 const variant=randInt(0,3);
 if(variant===3)base=exp===2?randInt(2,3):2;
 let prompt,answer,steps,raw;
 if(variant===0){
  prompt=base+'<sup>x</sup> = '+base**x+'. Find the non-negative integer x.';
  answer=x;steps=base+' multiplied by itself '+x+' times gives '+base**x+'. Therefore x = '+x+'.';
  if(x===0)steps=base+'⁰ = 1. Therefore x = 0.';
  raw={solve:true,variant,base,x};
 }else if(variant===1){
  prompt='x<sup>'+exp+'</sup> = '+base**exp+'. Find x'+(exp===2?' given x ≥ 0.':'.');
  answer=base;steps=base+'<sup>'+exp+'</sup> = '+base**exp+'. Therefore x = '+base+'.';
  raw={solve:true,variant,base,exp,x:base};
 }else if(variant===2){
  prompt=base+'<sup>'+exp+'</sup> + x = '+(base**exp+offset)+'. Find x.';
  answer=offset;steps='x = '+(base**exp+offset)+' − '+base**exp+' = '+offset+'.';
  raw={solve:true,variant,base,exp,x:offset};
 }else{
  prompt='x × '+base+'<sup>'+exp+'</sup> = '+(base**exp*offset)+'. Find x.';
  answer=offset;steps='x = '+(base**exp*offset)+' ÷ '+base**exp+' = '+offset+'.';
  raw={solve:true,variant,base,exp,x:offset};
 }
 return {prompt,answers:[String(answer)],labels:['x'],steps,raw,kind:'number',fraction:true,key:prompt};
}
function make(level){
 if(level==='challenge'&&Math.random()<.35)return solveX();
 for(let i=0;i<1000;i++){
  const {prob,val}=genProblemFiltered(level);
  if(!arithmeticSafe(prob.expr))continue;
  const answer=toExactDecimalString(val).replace(/ /g,'');
  return {prompt:renderExprHTML(prob.expr),answers:[answer],labels:['Answer'],steps:work(prob.expr).join('<br>'),raw:{...prob,val},kind:'number',fraction:true,key:expressionKey(prob.expr)};
 }
 throw Error('No suitable powers question');
}

return {id:"powers",title:"Calculations with Powers",make};})();