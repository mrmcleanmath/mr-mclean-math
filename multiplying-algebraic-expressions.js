'use strict';
window.practiceModel=(()=>{

const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function mulOK(a,b){a=Math.abs(a);b=Math.abs(b);while(a%1>1e-8&&1-a%1>1e-8)a*=10;while(b%1>1e-8&&1-b%1>1e-8)b*=10;a=Math.round(a);b=Math.round(b);while(a>=10&&a%10===0)a/=10;while(b>=10&&b%10===0)b/=10;return a<10||b<10}
function chainOK(nums){const n=nums.slice().sort((a,b)=>Math.abs(b)-Math.abs(a));let acc=n.shift();for(const b of n){if(!mulOK(acc,b))return false;acc*=b}return true}

const $=s=>document.querySelector(s);
const $$=s=>Array.from(document.querySelectorAll(s));

const DOT=" · ";
const FAMILIES=[["a","b","c"],["x","y","z"]];
const state={mode:'practice',difficulty:'foundation',current:null,evaluated:false,correct:0,incorrect:0};

function rint(a,b){return Math.floor(Math.random()*(b-a+1))+a}
function pick(a){return a[rint(0,a.length-1)]}
function shuffle(arr){const a=arr.slice();for(let i=a.length-1;i>0;i--){const j=rint(0,i);[a[i],a[j]]=[a[j],a[i]]}return a}
function oneDecimal(n){return Math.round(n*10)/10}
function fmtNum(n){
  const v=oneDecimal(n);
  if(Number.isInteger(v))return String(v);
  return String(v).replace(/\.0$/,"");
}
function coeffToText(c){return c===1?"":c===-1?"-":fmtNum(c)}
function canonicalAnswer(coeff,vars){
  const v=vars.slice().sort();
  return coeffToText(coeff)+v.join("");
}
function displayVarFactor(coeff,v){
  if(coeff===1)return v;
  if(coeff===-1)return "-"+v;
  return fmtNum(coeff)+v;
}
function isOneDecimalPlace(n){
  return Number.isFinite(n)&&!Number.isInteger(n)&&Math.abs(oneDecimal(n)-n)<1e-9;
}

function parseMonomialInput(raw){
  if(raw==null)return null;
  let s=String(raw).trim();
  if(!s)return null;

  if(/[()\+\*\/×·]/.test(s))return null;
  if(s.slice(1).includes("-"))return null;
  if(!/^-?[0-9a-zA-Z,\.\s]+$/.test(s))return null;

  s=s.replace(/\s+/g,"");
  let sign=1;
  if(s[0]==="-"){sign=-1;s=s.slice(1)}
  if(!s)return null;

  const m=s.match(/^([0-9,\.]*)([a-zA-Z]*)$/);
  if(!m)return null;

  let coeffStr=m[1]||"";
  const letters=(m[2]||"").toLowerCase();
  if(letters.length===0||letters.length>2)return null;
  if(letters.length===2&&letters[0]===letters[1])return null;

  const allowed=new Set(["a","b","c","x","y","z"]);
  for(const ch of letters)if(!allowed.has(ch))return null;

  const hasDot=coeffStr.includes(".");
  const hasComma=coeffStr.includes(",");

  if(hasDot&&hasComma){
    // Dot is decimal separator; commas are thousands separators.
    if(!/^\d{1,3}(?:,\d{3})*(?:\.\d+)?$/.test(coeffStr))return null;
    coeffStr=coeffStr.replace(/,/g,"");
  }else if(hasDot){
    if(!/^\d+(?:\.\d+)?$/.test(coeffStr))return null;
  }else if(hasComma){
    const commas=(coeffStr.match(/,/g)||[]).length;
    if(commas===1){
      const [a,b]=coeffStr.split(",");
      if(b.length===1){
        if(!/^\d+$/.test(a)||!/^\d$/.test(b))return null;
        coeffStr=a+"."+b;
      }else{
        if(!/^\d{1,3}(?:,\d{3})+$/.test(coeffStr))return null;
        coeffStr=coeffStr.replace(/,/g,"");
      }
    }else{
      if(!/^\d{1,3}(?:,\d{3})+$/.test(coeffStr))return null;
      coeffStr=coeffStr.replace(/,/g,"");
    }
  }

  let coeff=1;
  if(coeffStr!==""){
    if(!/^\d+(?:\.\d+)?$/.test(coeffStr))return null;
    if(coeffStr.includes(".")&&coeffStr.split(".")[1].length>1)return null;
    coeff=Number(coeffStr);
    if(!Number.isFinite(coeff))return null;
  }
  coeff=oneDecimal(coeff*sign);
  return {coeff,vars:letters.split("").sort()};
}

function sameMonomial(user,target){
  if(!user||!target)return false;
  if(oneDecimal(user.coeff)!==oneDecimal(target.coeff))return false;
  if(user.vars.length!==target.vars.length)return false;
  return user.vars.every((v,i)=>v===target.vars[i]);
}

function pickVars(){
  const fam=pick(FAMILIES);
  const count=Math.random()<.70?2:1;
  return shuffle(fam).slice(0,count).sort();
}
function signedInt(max,negProb,min=1){
  let v=rint(min,max);if(Math.random()<negProb)v=-v;return v;
}
function genVarCoeffInt(diff){
  const max=diff==="foundation"?9:diff==="core"?12:25;
  const neg=diff==="foundation"?.12:diff==="core"?.45:.60;
  return signedInt(max,neg,1);
}
function genConstInt(diff){
  const max=diff==="foundation"?12:diff==="core"?20:90;
  const neg=diff==="foundation"?.12:diff==="core"?.45:.60;
  return signedInt(max,neg,2);
}
function genHardDecimalFactor(){
  while(true){
    const base=rint(11,99);
    if(base%10===0)continue;
    const d=oneDecimal(base/10);
    if(!Number.isInteger(d)&&d>=1.1)return d;
  }
}
function hardPickTwoDigitEnds0(){return 10*rint(1,9)}
function hardPickTwoDigitNotEnds0(){
  let n;do{n=rint(10,99)}while(n%10===0);return n;
}
function hardPickSingleDigit(){return rint(2,9)}

function hardFactorsAreValid(numericFactors){
  const nonOne=numericFactors.filter(f=>Math.abs(f.value)!==1);
  const decs=nonOne.filter(f=>f.kind==="dec");
  if(decs.length>1)return false;

  if(decs.length===1){
    const dec=decs[0];
    if(!isOneDecimalPlace(dec.value))return false;
    const mag=Math.round(Math.abs(dec.value)*10);
    if(mag<10||mag>99)return false;
    const others=nonOne.filter(f=>f!==dec);
    if(others.length!==1)return false;
    const other=others[0],m=Math.abs(other.value);
    return other.kind==="int"&&m>=2&&m<=9;
  }

  const ints=nonOne.filter(f=>f.kind==="int").map(f=>Math.abs(f.value));
  if(ints.some(v=>v>=100))return false;
  const two=ints.filter(v=>v>=10&&v<=99);
  if(two.length<=1)return true;
  if(two.length===2){
    const a0=two[0]%10===0,b0=two[1]%10===0;
    return a0!==b0;
  }
  return false;
}

function generate(diff=state.difficulty){
  for(let tries=0;tries<700;tries++){
    const vars=pickVars();
    const wantExtra=diff==="foundation"?Math.random()<.30:diff==="core"?Math.random()<.50:Math.random()<.55;
    let varCoeffs=[],constFactors=[];

    if(diff!=="challenge"){
      for(let i=0;i<vars.length;i++)varCoeffs.push(genVarCoeffInt(diff));
      if(vars.length===1||wantExtra)constFactors.push(genConstInt(diff));
    }else{
      const useDecimal=Math.random()<.28;

      if(useDecimal){
        const dec=genHardDecimalFactor(),sd=hardPickSingleDigit();
        const decS=Math.random()<.6?-dec:dec;
        const sdS=Math.random()<.6?-sd:sd;
        if(vars.length===2){
          varCoeffs=Math.random()<.5?[decS,(Math.random()<.5?-1:1)]:[(Math.random()<.5?-1:1),decS];
          constFactors=[sdS];
        }else{
          varCoeffs=[decS];constFactors=[sdS];
        }
      }else{
        if(Math.random()<.40){
          const tens=hardPickTwoDigitEnds0(),other=hardPickTwoDigitNotEnds0();
          const aS=Math.random()<.60?-tens:tens;
          const bS=Math.random()<.55?-other:other;
          if(vars.length===2){
            if(Math.random()<.55){varCoeffs=[aS,bS]}
            else{varCoeffs=[aS,(Math.random()<.5?-1:1)];constFactors=[bS]}
          }else{
            varCoeffs=[aS];constFactors=[bS];
          }
        }else{
          const twoDigit=Math.random()<.55?hardPickTwoDigitNotEnds0():null;
          for(let i=0;i<vars.length;i++){
            let c;
            if(Math.random()<.25)c=Math.random()<.5?-1:1;
            else{c=hardPickSingleDigit();if(Math.random()<.60)c=-c}
            varCoeffs.push(c);
          }
          if(twoDigit!=null){
            const td=Math.random()<.60?-twoDigit:twoDigit;
            if(Math.random()<.55)varCoeffs[rint(0,varCoeffs.length-1)]=td;
            else constFactors.push(td);
          }
          if(vars.length===1||wantExtra){
            let k=hardPickSingleDigit();if(Math.random()<.60)k=-k;constFactors.push(k);
          }
        }
      }
    }

    let factors=[];
    vars.forEach((v,i)=>factors.push({type:"var",v,c:varCoeffs[i]}));
    constFactors.forEach(k=>factors.push({type:"const",k}));

    if(factors.length<2)continue;
    if(factors.some(f=>f.type==="const"&&(f.k===1||f.k===-1)))continue;

    if(diff==="challenge"){
      const nums=factors.map(f=>{
        const val=f.type==="var"?f.c:f.k;
        return {value:Math.abs(val),kind:isOneDecimalPlace(Math.abs(val))?"dec":"int"};
      });
      if(!hardFactorsAreValid(nums))continue;
    }

    factors=shuffle(factors);
    const q=factors.map(f=>f.type==="var"?displayVarFactor(f.c,f.v):fmtNum(f.k)).join(DOT);
    if(!q.includes("·"))continue;

    let coeff=1,outVars=[];
    for(const f of factors){
      if(f.type==="var"){coeff=oneDecimal(coeff*f.c);outVars.push(f.v)}
      else coeff=oneDecimal(coeff*f.k);
    }
    outVars=[...new Set(outVars)].sort();
    if(!outVars.length||coeff===0||Math.abs(coeff)>99999)continue;

    const a=canonicalAnswer(coeff,outVars);
    const cap=diff==="foundation"?18:diff==="core"?26:38;
    if(q.length>cap)continue;

    return {difficulty:diff,q,monomial:{coeff,vars:outVars},a,factors};
  }

  return {difficulty:"foundation",q:"2x"+DOT+"3",monomial:{coeff:6,vars:["x"]},a:"6x",factors:[{type:"var",v:"x",c:2},{type:"const",k:3}]};
}

function stepsText(p){
  const numeric=p.factors.map(f=>f.type==="var"?f.c:f.k);
  const vars=p.factors.filter(f=>f.type==="var").map(f=>f.v).sort();
  return `Multiply the numerical factors:
${numeric.map(fmtNum).join(" × ")} = ${fmtNum(p.monomial.coeff)}

Combine the variables:
${vars.join(" · ")} = ${vars.join("")}

Simplified answer: ${p.a}`;
}


generate=function(diff){
 const vars=shuffle(pick(FAMILIES)).slice(0,2);let factors,variant;
 if(diff==='foundation'){
  variant=pick(['number-and-letter','different-letters']);
  factors=[{type:'var',v:vars[0],c:rint(1,9)},variant==='number-and-letter'?{type:'const',k:rint(2,9)}:{type:'var',v:vars[1],c:rint(1,9)}];
 }else if(diff==='core'){
  variant=pick(['signed-pair','three-factors']);
  factors=[{type:'var',v:vars[0],c:-rint(1,6)},{type:'var',v:vars[1],c:(Math.random()<.5?-1:1)*rint(1,6)}];
  if(variant==='three-factors')factors.push({type:'const',k:(Math.random()<.5?-1:1)*rint(2,5)});
 }else{
  variant=pick(['decimal-coefficient','place-value-product']);
  const a=variant==='decimal-coefficient'?rint(1,4)+rint(1,9)/10:10*rint(2,5);
  const b=variant==='decimal-coefficient'?rint(2,9):rint(11,19);
  factors=[{type:'var',v:vars[0],c:(Math.random()<.5?-1:1)*a},{type:'var',v:vars[1],c:(Math.random()<.5?-1:1)*b}];
 }
 factors=shuffle(factors);const coeff=oneDecimal(factors.reduce((a,f)=>a*(f.type==='var'?f.c:f.k),1)),outVars=factors.filter(f=>f.type==='var').map(f=>f.v).sort();
 return {difficulty:diff,variant,q:factors.map(f=>{const n=f.type==='var'?f.c:f.k,s=f.type==='var'?displayVarFactor(f.c,f.v):fmtNum(f.k);return n<0?'('+s+')':s}).join(DOT),monomial:{coeff,vars:outVars},a:canonicalAnswer(coeff,outVars),factors};
};

function make(level){
 for(let i=0;i<5000;i++){
 const p=generate(level);if(p.difficulty!==level||!(chainOK(p.factors.map(f=>f.type==='var'?f.c:f.k))))continue;
 if(level==='foundation'&&Math.abs(p.monomial.coeff)>200)continue;
 
 
 const answer=p.a;
 return {kind:'algebra',raw:p,prompt:'<div class="algebra-expression">'+esc(p.q)+'</div>',answers:[answer],labels:['Simplified expression'],key:JSON.stringify(p.factors.slice().sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)))),steps:'<pre class="math-working">'+esc(stepsText(p))+'</pre>',hint:"Multiply the numerical factors, then write the letters together.",match(values){return sameMonomial(parseMonomialInput(values[0].replace(/−/g,'-')),p.monomial);}};
 }throw Error('Unable to generate a suitable algebra question');
}

return {id:"multiplying",title:"Multiplying Algebraic Expressions — Different Variables",make};})();