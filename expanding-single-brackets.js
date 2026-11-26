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
function oneDecimal(n){return Math.round(n*10)/10}
function fmtNum(n){const v=oneDecimal(n);return Number.isInteger(v)?String(v):String(v).replace(/\.0$/,"")}
function isOneDecimalPlace(n){return Number.isFinite(n)&&!Number.isInteger(n)&&Math.abs(oneDecimal(n)-n)<1e-9}
function coeffToText(c){return c===1?"":c===-1?"-":fmtNum(c)}
function termToText(coeff,key){return key===""?fmtNum(coeff):coeffToText(coeff)+key}

function polyToCanonical(map){
  const keys=Object.keys(map).filter(k=>k!==""&&map[k]!==0);
  const two=keys.filter(k=>k.length===2).sort();
  const one=keys.filter(k=>k.length===1).sort();
  const parts=[];
  const push=k=>{const c=map[k];if(c!==0)parts.push(termToText(c,k))};
  two.forEach(push);one.forEach(push);
  const c0=map[""]||0;if(c0!==0)parts.push(fmtNum(c0));
  if(!parts.length)return "0";
  let out=parts[0];
  for(let i=1;i<parts.length;i++)out+=parts[i].startsWith("-")?" - "+parts[i].slice(1):" + "+parts[i];
  return out;
}

function normalizeNumberToken(s){
  const hasDot=s.includes("."),hasComma=s.includes(",");
  if(hasDot&&hasComma){
    if(!/^\d{1,3}(?:,\d{3})*(?:\.\d+)?$/.test(s))return null;
    return s.replace(/,/g,"");
  }
  if(hasDot){
    if(!/^\d+(?:\.\d+)?$/.test(s))return null;
    return s;
  }
  if(hasComma){
    const count=(s.match(/,/g)||[]).length;
    if(count===1){
      const [a,b]=s.split(",");
      if(b.length===1){
        if(!/^\d+$/.test(a)||!/^\d$/.test(b))return null;
        return a+"."+b;
      }
    }
    if(!/^\d{1,3}(?:,\d{3})+$/.test(s))return null;
    return s.replace(/,/g,"");
  }
  return /^\d+$/.test(s)?s:null;
}

function parseExpandedPolynomial(raw,allowedVars){
  if(raw==null)return null;
  let s=String(raw).trim();
  if(!s||/[+-]\s*[+-]|[+-]\s*$/.test(s))return null;
  if(/[()×·*\/]/.test(s))return null;
  if(!/^[0-9a-zA-Z+\-.,\s]+$/.test(s))return null;

  s=s.replace(/\s+/g,"");
  if(!s)return null;
  if(s[0]==="-")s="0"+s;
  s=s.replace(/-/g,"+-");
  const tokens=s.split("+").filter(Boolean);
  if(!tokens.length)return null;

  const map={"":0};
  for(const tok of tokens){
    const m=tok.match(/^(-?)([0-9.,]*)([a-zA-Z]{0,2})$/);
    if(!m)return null;
    const sign=m[1]==="-"?-1:1;
    const numPart=m[2]||"";
    let letters=(m[3]||"").toLowerCase();

    if(letters.length>2)return null;
    if(letters.length===2&&letters[0]===letters[1])return null;
    for(const ch of letters)if(!allowedVars.has(ch))return null;
    if(letters.length===2)letters=letters.split("").sort().join("");

    let coeff=1;
    if(numPart!==""){
      const norm=normalizeNumberToken(numPart);
      if(norm===null||!/^\d+(?:\.\d+)?$/.test(norm))return null;
      if(norm.includes(".")&&norm.split(".")[1].length>1)return null;
      coeff=Number(norm);if(!Number.isFinite(coeff))return null;
    }
    coeff=oneDecimal(coeff*sign);
    map[letters]=oneDecimal((map[letters]||0)+coeff);
  }
  return map;
}
function mapsEqual(a,b){
  const keys=new Set([...Object.keys(a),...Object.keys(b)]);
  for(const k of keys)if(oneDecimal(a[k]||0)!==oneDecimal(b[k]||0))return false;
  return true;
}

function hardPairAllowed(outMag,inMag,outIsDecimal){
  const a=Math.abs(outMag),b=Math.abs(inMag);
  if(outIsDecimal){
    if(!isOneDecimalPlace(a))return false;
    const a10=Math.round(a*10);
    return a10>=10&&a10<=99&&Number.isInteger(b)&&b>=2&&b<=9;
  }
  if(!Number.isInteger(a)||!Number.isInteger(b))return false;
  const aDD=a>=10&&a<=99,bDD=b>=10&&b<=99;
  if(aDD&&bDD)return (a%10===0)!==(b%10===0);
  return true;
}

function pickFamily(){const fam=pick(FAMILIES);return {fam,set:new Set(fam)}}
function genSignedInt(min,max,neg){let n=rint(min,max);if(Math.random()<neg)n=-n;return n}

function genOutsideFactor(diff,fam,used,allowDecimal){
  if(diff==="foundation"){
    if(Math.random()>=.35)return {type:"number",coeff:genSignedInt(2,9,.08)};
    const avail=fam.filter(v=>!used.has(v));
    if(!avail.length)return {type:"number",coeff:genSignedInt(2,9,.08)};
    return {type:"mono",coeff:genSignedInt(1,9,.10),v:pick(avail)};
  }
  if(diff==="core"){
    if(Math.random()>=.48)return {type:"number",coeff:genSignedInt(2,12,.28)};
    const avail=fam.filter(v=>!used.has(v));
    if(!avail.length)return {type:"number",coeff:genSignedInt(2,12,.28)};
    return {type:"mono",coeff:genSignedInt(1,12,.35),v:pick(avail)};
  }

  const useMono=Math.random()<.52;
  if(!useMono){
    if(allowDecimal&&Math.random()<.28){
      let base=rint(11,99);while(base%10===0)base=rint(11,99);
      const dec=oneDecimal(base/10);
      return {type:"number",coeff:Math.random()<.55?-dec:dec,decimal:true};
    }
    return {type:"number",coeff:genSignedInt(2,90,.45),decimal:false};
  }

  const avail=fam.filter(v=>!used.has(v));
  if(!avail.length)return {type:"number",coeff:genSignedInt(2,90,.45),decimal:false};
  const v=pick(avail);
  if(allowDecimal&&Math.random()<.22){
    let base=rint(11,99);while(base%10===0)base=rint(11,99);
    const dec=oneDecimal(base/10);
    return {type:"mono",coeff:Math.random()<.55?-dec:dec,v,decimal:true};
  }
  return {type:"mono",coeff:genSignedInt(1,90,.55),v,decimal:false};
}

function genBracketTerms(diff,fam){
  if(diff==="foundation"||diff==="core"){
    const v=pick(fam);
    const vmax=diff==="foundation"?9:12,cmax=diff==="foundation"?12:20;
    const neg=diff==="foundation"?.08:.35;
    return {
      terms:[
        {kind:"var",coeff:genSignedInt(1,vmax,neg),v},
        {kind:"const",value:genSignedInt(1,cmax,neg)}
      ],
      varsUsed:new Set([v])
    };
  }
  const vs=shuffle(fam).slice(0,2).sort();
  return {
    terms:[
      {kind:"var",coeff:genSignedInt(1,20,.55),v:vs[0]},
      {kind:"var",coeff:genSignedInt(1,20,.55),v:vs[1]}
    ],
    varsUsed:new Set(vs)
  };
}

function outsideToText(out){
  if(out.type==="number")return fmtNum(out.coeff);
  if(out.coeff===1)return out.v;
  if(out.coeff===-1)return "-"+out.v;
  return fmtNum(out.coeff)+out.v;
}
function bracketToText(br){
  const [t1,t2]=br.terms;
  const varText=(c,v)=>c===1?v:c===-1?"-"+v:fmtNum(c)+v;
  const left=t1.kind==="var"?varText(t1.coeff,t1.v):fmtNum(t1.value);
  let sign="+",body;
  if(t2.kind==="const"){
    sign=t2.value<0?"-":"+";
    body=fmtNum(Math.abs(t2.value));
  }else{
    sign=t2.coeff<0?"-":"+";
    body=varText(Math.abs(t2.coeff),t2.v);
  }
  return `(${left} ${sign} ${body})`;
}
function expandToMap(out,br){
  const map={"":0},outCoeff=out.coeff,outVar=out.type==="mono"?out.v:null;
  const add=(k,v)=>map[k]=oneDecimal((map[k]||0)+v);
  for(const t of br.terms){
    if(t.kind==="const"){
      const val=oneDecimal(outCoeff*t.value);
      add(outVar||"",val);
    }else{
      const val=oneDecimal(outCoeff*t.coeff);
      const key=outVar?[outVar,t.v].sort().join(""):t.v;
      add(key,val);
    }
  }
  return map;
}
function validateHardNumeric(out,br){
  const outMag=Math.abs(out.coeff);
  const outIsDecimal=!!out.decimal&&isOneDecimalPlace(outMag);
  for(const t of br.terms){
    const inMag=t.kind==="const"?Math.abs(t.value):Math.abs(t.coeff);
    if(inMag===1)return false;
    if(!hardPairAllowed(outMag,inMag,outIsDecimal))return false;
  }
  return true;
}

function generate(diff=state.difficulty){
  for(let tries=0;tries<900;tries++){
    const {fam,set}=pickFamily();
    const br=genBracketTerms(diff,fam);
    const out=genOutsideFactor(diff,fam,br.varsUsed,diff==="challenge");

    if(out.type==="mono"&&br.varsUsed.has(out.v))continue;

    const q=outsideToText(out)+bracketToText(br);
    if(/[×*·]/.test(q))continue;
    if(diff==="challenge"&&!validateHardNumeric(out,br))continue;

    const answerMap=expandToMap(out,br);
    const canon=polyToCanonical(answerMap);
    if(canon==="0")continue;

    const maxLen=diff==="foundation"?16:diff==="core"?20:26;
    if(q.length>maxLen)continue;

    const vars=[...new Set(q.match(/[a-z]/g)||[])];
    if(!vars.every(v=>set.has(v))||vars.length>2)continue;

    return {difficulty:diff,familySet:set,q,answerMap,a:canon,out,br};
  }

  const set=new Set(["x","y","z"]),answerMap={"x":6,"":15};
  return {difficulty:"foundation",familySet:set,q:"3(2x + 5)",answerMap,a:"6x + 15",
    out:{type:"number",coeff:3},br:{terms:[{kind:"var",coeff:2,v:"x"},{kind:"const",value:5}],varsUsed:new Set(["x"])}};
}

function stepsText(p){
  const f=outsideToText(p.out),inside=bracketToText(p.br);
  const products=[];
  for(const t of p.br.terms){
    if(t.kind==="const"){
      const val=oneDecimal(p.out.coeff*t.value);
      products.push(`${f} × ${fmtNum(t.value)} = ${fmtNum(val)}${p.out.type==="mono"?p.out.v:""}`);
    }else{
      const val=oneDecimal(p.out.coeff*t.coeff);
      const key=p.out.type==="mono"?[p.out.v,t.v].sort().join(""):t.v;
      products.push(`${f} × ${t.coeff===1?t.v:t.coeff===-1?"-"+t.v:fmtNum(t.coeff)+t.v} = ${termToText(val,key)}`);
    }
  }
  return `Multiply the factor outside the brackets by each term inside:

${products.join("\n")}

Simplified answer: ${p.a}`;
}


// Separate distribution, signed arithmetic and algebraic/decimal factors.
generate=function(diff){
 const fam=pick(FAMILIES),v=pick(fam),other=pick(fam.filter(x=>x!==v));
 let coeff= rint(2,9),out={type:'number',coeff},terms,variant;
 if(diff==='foundation'){
  variant='positive-distribution';terms=[{kind:'var',coeff:rint(1,5),v},{kind:'const',value:rint(1,9)}];
 }else if(diff==='core'){
  variant=pick(['subtract-inside','negative-outside','both-signs']);
  out.coeff=variant==='subtract-inside'?coeff:-coeff;
  terms=[{kind:'var',coeff:rint(1,9),v},{kind:'const',value:(variant==='negative-outside'?1:-1)*rint(1,9)}];
 }else{
  variant=pick(['letter-factor','two-letters','decimal-factor']);
  if(variant==='letter-factor')out={type:'mono',coeff:(Math.random()<.5?-1:1)*rint(1,6),v:other};
  else if(variant==='decimal-factor')out={type:'number',coeff:(Math.random()<.4?-1:1)*(rint(1,4)+rint(1,9)/10),decimal:true};
  else out.coeff=(Math.random()<.5?-1:1)*coeff;
  terms=[{kind:'var',coeff:rint(2,9),v},variant==='two-letters'?{kind:'var',coeff:(Math.random()<.5?-1:1)*rint(2,9),v:other}:{kind:'const',value:(Math.random()<.5?-1:1)*rint(2,9)}];
 }
 const br={terms,varsUsed:new Set(terms.filter(t=>t.kind==='var').map(t=>t.v))};
 const answerMap=expandToMap(out,br),q=outsideToText(out)+bracketToText(br);
 return {difficulty:diff,variant,familySet:new Set(fam),q,answerMap,a:polyToCanonical(answerMap),out,br};
};

function make(level){
 for(let i=0;i<5000;i++){
 const p=generate(level);if(p.difficulty!==level||!(p.br.terms.every(t=>mulOK(p.out.coeff,t.kind==='const'?t.value:t.coeff))))continue;
 
 if(level==='foundation'&&Object.values(p.answerMap).some(c=>Math.abs(c)>120))continue;
 
 const answer=p.a;
 return {kind:'algebra',raw:p,prompt:'<div class="algebra-expression">'+esc(p.q)+'</div>',answers:[answer],labels:['Simplified expression'],key:p.q,steps:'<pre class="math-working">'+esc(stepsText(p))+'</pre>',hint:"Multiply every term inside the brackets by the outside factor.",match(values){const text=values[0].replace(/−/g,'-');const a=parseExpandedPolynomial(text,p.familySet);if(!a)return false;const terms=text.replace(/\s/g,'').match(/[+-]?[^+-]+/g)||[];const keys=terms.map(t=>(t.match(/[a-z]/gi)||[]).sort().join(''));return new Set(keys).size===keys.length&&mapsEqual(a,p.answerMap);}};
 }throw Error('Unable to generate a suitable algebra question');
}

return {id:"expanding",title:"Expanding Single Brackets",make};})();