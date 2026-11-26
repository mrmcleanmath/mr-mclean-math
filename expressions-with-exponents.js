'use strict';
window.practiceModel=(()=>{

const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function mulOK(a,b){a=Math.abs(a);b=Math.abs(b);while(a%1>1e-8&&1-a%1>1e-8)a*=10;while(b%1>1e-8&&1-b%1>1e-8)b*=10;a=Math.round(a);b=Math.round(b);while(a>=10&&a%10===0)a/=10;while(b>=10&&b%10===0)b/=10;return a<10||b<10}
function chainOK(nums){const n=nums.slice().sort((a,b)=>Math.abs(b)-Math.abs(a));let acc=n.shift();for(const b of n){if(!mulOK(acc,b))return false;acc*=b}return true}

const $=s=>document.querySelector(s);
const $$=s=>Array.from(document.querySelectorAll(s));
const FAMILIES=[["a","b","c"],["x","y","z"]];
const state={mode:'practice',difficulty:'foundation',current:null,evaluated:false,correct:0,incorrect:0};

function rint(a,b){return Math.floor(Math.random()*(b-a+1))+a}
function pick(a){return a[rint(0,a.length-1)]}
function shuffle(arr){const a=arr.slice();for(let i=a.length-1;i>0;i--){const j=rint(0,i);[a[i],a[j]]=[a[j],a[i]]}return a}

function monomialToString(coeff,v,exp){
  const sign=coeff<0?"-":"";
  const abs=Math.abs(coeff);
  const cPart=abs===1?"":String(abs);
  return sign+cPart+v+(exp===1?"":"^"+exp);
}
function monomialToHTML(coeff,v,exp){
  const sign=coeff<0?"-":"";
  const abs=Math.abs(coeff);
  const cPart=abs===1?"":String(abs);
  return sign+cPart+v+(exp===1?"":`<sup>${exp}</sup>`);
}
function factorToHTML(f){
  if(f.type==="num")return String(f.n);
  const c=f.coeff;
  const cPart=Math.abs(c)===1?"":String(Math.abs(c));
  return (c<0?"-":"")+cPart+f.v+(f.exp===1?"":`<sup>${f.exp}</sup>`);
}
function exprToHTML(factors){return factors.map(factorToHTML).join(' <span style="padding:0 7px">·</span> ')}

function genCoeff(diff){return diff==="foundation"?rint(1,9):diff==="core"?rint(1,12):rint(1,20)}
function maybeNeg(diff){return Math.random()<(diff==="foundation"?.08:diff==="core"?.28:.45)}
function genVarExp(diff){
  if(diff==="foundation")return 1;
  if(diff==="core")return Math.random()<.22?2:1;
  const roll=Math.random();
  return roll<.55?1:roll<.88?2:3;
}

function buildProblem(diff){
  const fam=pick(FAMILIES),set=new Set(fam),v=pick(fam);
  const want3=diff==="foundation"?Math.random()<.10:diff==="core"?Math.random()<.40:Math.random()<.55;
  const factorCount=want3?3:2,factors=[];

  for(let i=0;i<factorCount;i++){
    const canBeNum=factorCount===3&&diff!=="foundation"&&i===factorCount-1&&Math.random()<.60;
    if(canBeNum){
      let n=diff==="challenge"?rint(2,9):rint(2,6);
      if(maybeNeg(diff))n=-n;
      factors.push({type:"num",n});
      continue;
    }

    let c=genCoeff(diff);
    if(maybeNeg(diff))c=-c;
    let e=genVarExp(diff);

    if(diff!=="foundation"&&Math.random()<.10)c=c<0?-1:1;
    if(diff==="foundation"&&Math.random()<.18)c=c<0?-1:1;
    factors.push({type:"mono",coeff:c,v,exp:e});
  }

  let coeff=1,expSum=0;
  for(const f of factors){
    if(f.type==="num")coeff*=f.n;
    else{coeff*=f.coeff;expSum+=f.exp}
  }

  const maxExp=diff==="challenge"?(Math.random()<.12?4:3):3;
  if(expSum>maxExp||coeff===0)return null;
  if(diff==="foundation"&&expSum>2&&Math.random()<.70)return null;
  if(diff==="core"&&expSum<2)return null;
  if(expSum<2)return null;

  const qHTML=exprToHTML(factors);
  const qText=qHTML.replace(/<[^>]+>/g,"");
  if(qText.length>(diff==="foundation"?16:diff==="core"?20:26))return null;

  return {
    difficulty:diff,familySet:set,var:v,factors,qHTML,
    ans:{coeff,v,exp:expSum,html:monomialToHTML(coeff,v,expSum),str:monomialToString(coeff,v,expSum)}
  };
}

function generate(diff=state.difficulty){
  for(let i=0;i<1200;i++){const p=buildProblem(diff);if(p)return p}
  const set=new Set(["x","y","z"]);
  return {
    difficulty:"foundation",familySet:set,var:"x",
    factors:[{type:"mono",coeff:3,v:"x",exp:1},{type:"mono",coeff:4,v:"x",exp:1}],
    qHTML:"3x · 4x",ans:{coeff:12,v:"x",exp:2,html:"12x<sup>2</sup>",str:"12x^2"}
  };
}

function normalizeSuperscripts(s){
  return String(s).replace(/²/g,"^2").replace(/³/g,"^3").replace(/⁴/g,"^4");
}
function parseAnswer(raw,allowed){
  let s=normalizeSuperscripts(raw).trim().replace(/\s+/g,"").toLowerCase();
  if(!s)return null;
  if(/[()·×*+\/]/.test(s))return null;
  if(s.slice(1).includes("-"))return null;

  const m=s.match(/^(-)?(\d+)?([a-z])(?:\^(\d+))?$/);
  if(!m)return null;

  const sign=m[1]?-1:1;
  const coeff=m[2]===undefined?1:Number(m[2]);
  const v=m[3];
  const exp=m[4]===undefined?1:Number(m[4]);

  if(!Number.isSafeInteger(coeff)||coeff<=0)return null;
  if(!allowed.has(v))return null;
  if(!Number.isInteger(exp)||exp<=0||exp>4)return null;

  return {coeff:coeff*sign,v,exp};
}
function sameAnswer(a,b){return !!a&&a.coeff===b.coeff&&a.v===b.v&&a.exp===b.exp}

function stepsText(p){
  const nums=[],exps=[];
  for(const f of p.factors){
    if(f.type==="num")nums.push(f.n);
    else{nums.push(f.coeff);exps.push(f.exp)}
  }
  return `Multiply the numerical factors:
${nums.join(" × ")} = ${p.ans.coeff}

Add the exponents of ${p.var}:
${exps.join(" + ")} = ${p.ans.exp}

Simplified answer: ${p.ans.str}`;
}


generate=function(diff){
 const fam=pick(FAMILIES),v=pick(fam);let factors,variant;
 if(diff==='foundation'){
  variant='repeated-letter';factors=[{type:'mono',coeff:rint(1,9),v,exp:1},{type:'mono',coeff:rint(1,9),v,exp:1}];
 }else if(diff==='core'){
  variant=pick(['existing-square','signed-pair','three-letters']);
  factors=[{type:'mono',coeff:variant==='signed-pair'?-rint(1,6):rint(1,6),v,exp:variant==='existing-square'?2:1},{type:'mono',coeff:rint(1,6),v,exp:1}];
  if(variant==='three-letters')factors.push({type:'mono',coeff:rint(1,4),v,exp:1});
 }else{
  variant=pick(['two-squares','cube-and-letter','power-with-scalar']);
  factors=[{type:'mono',coeff:-rint(1,6),v,exp:variant==='cube-and-letter'?3:2},{type:'mono',coeff:(Math.random()<.5?-1:1)*rint(1,6),v,exp:variant==='two-squares'?2:1}];
  if(variant==='power-with-scalar')factors.push({type:'num',n:(Math.random()<.5?-1:1)*rint(2,4)});
 }
 factors=shuffle(factors);const coeff=factors.reduce((a,f)=>a*(f.type==='num'?f.n:f.coeff),1),exp=factors.reduce((a,f)=>a+(f.exp||0),0);
 return {difficulty:diff,variant,familySet:new Set(fam),var:v,factors,qHTML:factors.map(f=>{const h=factorToHTML(f);return (f.type==='num'?f.n:f.coeff)<0?'('+h+')':h}).join(' · '),ans:{coeff,v,exp,html:monomialToHTML(coeff,v,exp),str:monomialToString(coeff,v,exp)}};
};

function make(level){
 for(let i=0;i<5000;i++){
 const p=generate(level);if(p.difficulty!==level||!(chainOK(p.factors.map(f=>f.type==='num'?f.n:f.coeff))))continue;
 
 
 if(level==='foundation'&&Math.abs(p.ans.coeff)>200)continue;
 const answer=p.ans.str;
 return {kind:'algebra',raw:p,prompt:'<div class="algebra-expression">'+p.qHTML+'</div>',answers:[answer],labels:['Simplified expression'],key:JSON.stringify(p.factors.slice().sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)))),steps:'<pre class="math-working">'+esc(stepsText(p))+'</pre>',hint:"Multiply the coefficients; add the exponents of the repeated letter.",match(values){return sameAnswer(parseAnswer(values[0].replace(/−/g,'-'),p.familySet),p.ans);}};
 }throw Error('Unable to generate a suitable algebra question');
}

return {id:"exponents",title:"Multiplying Algebraic Expressions — Same Variable",make};})();