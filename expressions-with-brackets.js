'use strict';
window.practiceModel=(()=>{
const ALL_VARS=["a","b","n","x","y","z"];
function rint(a,b){return Math.floor(Math.random()*(b-a+1))+a}
function pick(a){return a[rint(0,a.length-1)]}
function shuffle(arr){const a=arr.slice();for(let i=a.length-1;i>0;i--){const j=rint(0,i);[a[i],a[j]]=[a[j],a[i]]}return a}
function cloneMap(m){return JSON.parse(JSON.stringify(m))}
function addMaps(a,b,scaleB){
  const out=cloneMap(a);
  for(const k of Object.keys(b))out[k]=(out[k]||0)+(b[k]||0)*scaleB;
  for(const k of Object.keys(out))if(Object.is(out[k],-0))out[k]=0;
  return out;
}
function mapToCanonical(map){
  const keys=Object.keys(map).filter(k=>k!=="const").sort();
  const parts=[];
  for(const k of keys){
    const c=map[k]||0;if(c===0)continue;
    if(c===1)parts.push(k);else if(c===-1)parts.push("-"+k);else parts.push(String(c)+k);
  }
  const c0=map.const||0;if(c0!==0)parts.push(String(c0));
  if(!parts.length)return "0";
  let out=parts[0];
  for(let i=1;i<parts.length;i++)out+=parts[i].startsWith("-")?" - "+parts[i].slice(1):" + "+parts[i];
  return out;
}

function parseUserExpression(str){
  const s=(str||"").replace(/\s+/g,"");
  if(!s)return null;
  if(!/^[0-9a-zA-Z+\-]+$/.test(s))return null;

  let t=s;
  if(t[0]==="-")t="0"+t;
  t=t.replace(/-/g,"+-");
  const tokens=t.split("+").filter(Boolean);
  if(!tokens.length)return null;

  const map={const:0};
  for(const tok of tokens){
    const m=tok.match(/^(-?\d+)?([a-zA-Z])$/);
    if(m){
      const v=m[2].toLowerCase();
      const c=(m[1]===undefined||m[1]==="")?1:Number(m[1]);
      if(!Number.isInteger(c))return null;
      map[v]=(map[v]||0)+c;
    }else{
      if(!/^-?\d+$/.test(tok))return null;
      const n=Number(tok);if(!Number.isSafeInteger(n))return null;
      map.const+=n;
    }
  }
  return map;
}
function mapsEqual(a,b){
  const keys=new Set([...Object.keys(a),...Object.keys(b)]);
  for(const k of keys)if((a[k]||0)!==(b[k]||0))return false;
  return true;
}

function chooseVarSet(diff){
  if(diff==="foundation"){
    if(Math.random()>=.10)return [pick(ALL_VARS)];
    return shuffle(ALL_VARS).slice(0,2).sort();
  }
  if(diff==="core"){
    if(Math.random()>=.35)return [pick(ALL_VARS)];
    return shuffle(ALL_VARS).slice(0,2).sort();
  }
  return Math.random()<.35?shuffle(ALL_VARS).slice(0,3).sort():shuffle(ALL_VARS).slice(0,2).sort();
}

function termTextVar(c,v){return Math.abs(c)===1?v:String(Math.abs(c))+v}
function termTextConst(k){return String(Math.abs(k))}

function buildOrderedGroup(diff,allowedVars,opts){
  const {requireNonNegativeLead,allowConst,coeffMax,constMax}=opts;
  let useVars;
  if(allowedVars.length===1)useVars=[allowedVars[0]];
  else if(diff==="foundation")useVars=Math.random()<.75?[allowedVars[0]]:allowedVars.slice(0,2);
  else if(diff==="core")useVars=Math.random()<.55?[allowedVars[0]]:allowedVars.slice(0,2);
  else useVars=allowedVars.slice(0,(allowedVars.length===3&&Math.random()<.45)?3:2);
  useVars=useVars.slice().sort();

  const map={const:0},varTerms=[],constTerms=[];
  useVars.forEach((v,i)=>{
    let c=rint(1,coeffMax);
    if(!(i===0&&requireNonNegativeLead)&&Math.random()<.40)c=-c;
    map[v]=(map[v]||0)+c;varTerms.push({v,c});
  });

  if(allowConst&&Math.random()<(diff==="foundation"?.85:diff==="core"?.80:.85)){
    let k=rint(1,constMax);if(Math.random()<.45)k=-k;
    map.const+=k;constTerms.push(k);
  }
  if(diff==="challenge"&&allowConst&&Math.random()<.25){
    let k=rint(1,constMax);if(Math.random()<.45)k=-k;
    map.const+=k;constTerms.push(k);
  }
  if(varTerms.length+constTerms.length<2){
    let k=rint(1,constMax);if(Math.random()<.45)k=-k;
    map.const+=k;constTerms.push(k);
  }

  const parts=[];
  for(const t of varTerms){
    const piece=termTextVar(t.c,t.v),neg=t.c<0;
    parts.push(parts.length?(neg?"- ":"+ ")+piece:(neg?"-":"")+piece);
  }
  for(const k of constTerms)parts.push((k<0?"- ":"+ ")+termTextConst(k));

  if(requireNonNegativeLead&&parts[0].startsWith("-"))return buildOrderedGroup(diff,allowedVars,opts);
  return {text:parts.join(" ").replace(/\+\s-/g,"- ").replace(/^\+\s+/,""),map};
}

function buildOutsideTerm(diff,allowedVars){
  const coeffMax=diff==="foundation"?9:diff==="core"?12:20;
  const constMax=diff==="foundation"?10:diff==="core"?12:15;

  if(Math.random()<.70){
    const v=pick(allowedVars);let c=rint(1,coeffMax);
    if(Math.random()<(diff==="foundation"?.12:.30))c=-c;
    const map={const:0};map[v]=c;
    return {text:c===1?v:c===-1?"-"+v:String(c)+v,map};
  }
  let k=rint(1,constMax);
  if(Math.random()<(diff==="foundation"?.12:.35))k=-k;
  return {text:String(k),map:{const:k}};
}

function lengthCap(diff){return diff==="foundation"?34:diff==="core"?52:78}

function buildFoundation(vars){
  const roll=Math.random(),opts={requireNonNegativeLead:true,allowConst:true,coeffMax:9,constMax:10};
  if(roll<.40){
    const t=buildOutsideTerm("foundation",vars),g=buildOrderedGroup("foundation",vars,opts),op=Math.random()<.5?"+":"-";
    const map=addMaps(t.map,g.map,op==="+"?1:-1);return {q:`${t.text} ${op} (${g.text})`,map,a:mapToCanonical(map)};
  }else if(roll<.60){
    const g=buildOrderedGroup("foundation",vars,opts),t=buildOutsideTerm("foundation",vars),op=Math.random()<.5?"+":"-";
    const map=addMaps(g.map,t.map,op==="+"?1:-1);return {q:`(${g.text}) ${op} ${t.text}`,map,a:mapToCanonical(map)};
  }else if(roll<.85){
    const g1=buildOrderedGroup("foundation",vars,opts),g2=buildOrderedGroup("foundation",vars,opts),op=Math.random()<.5?"+":"-";
    const map=addMaps(g1.map,g2.map,op==="+"?1:-1);return {q:`(${g1.text}) ${op} (${g2.text})`,map,a:mapToCanonical(map)};
  }
  const t1=buildOutsideTerm("foundation",vars),g=buildOrderedGroup("foundation",vars,opts),t2=buildOutsideTerm("foundation",vars);
  const op1=Math.random()<.5?"+":"-",op2=Math.random()<.5?"+":"-";
  let map=addMaps(t1.map,g.map,op1==="+"?1:-1);map=addMaps(map,t2.map,op2==="+"?1:-1);
  return {q:`${t1.text} ${op1} (${g.text}) ${op2} ${t2.text}`,map,a:mapToCanonical(map)};
}

function buildCore(vars){
  const roll=Math.random(),opts={requireNonNegativeLead:true,allowConst:true,coeffMax:12,constMax:12};
  if(roll<.25){
    const t=buildOutsideTerm("core",vars),g=buildOrderedGroup("core",vars,opts),op=Math.random()<.5?"+":"-";
    const map=addMaps(t.map,g.map,op==="+"?1:-1);return {q:`${t.text} ${op} (${g.text})`,map,a:mapToCanonical(map)};
  }else if(roll<.55){
    const t=buildOutsideTerm("core",vars),g1=buildOrderedGroup("core",vars,opts),g2=buildOrderedGroup("core",vars,opts);
    const op1=Math.random()<.5?"+":"-",op2=Math.random()<.5?"+":"-";
    let map=addMaps(t.map,g1.map,op1==="+"?1:-1);map=addMaps(map,g2.map,op2==="+"?1:-1);
    return {q:`${t.text} ${op1} (${g1.text}) ${op2} (${g2.text})`,map,a:mapToCanonical(map)};
  }else if(roll<.80){
    const g1=buildOrderedGroup("core",vars,opts),g2=buildOrderedGroup("core",vars,opts),t=buildOutsideTerm("core",vars);
    const op1=Math.random()<.5?"+":"-",op2=Math.random()<.5?"+":"-";
    let map=addMaps(g1.map,g2.map,op1==="+"?1:-1);map=addMaps(map,t.map,op2==="+"?1:-1);
    return {q:`(${g1.text}) ${op1} (${g2.text}) ${op2} ${t.text}`,map,a:mapToCanonical(map)};
  }
  const t1=buildOutsideTerm("core",vars),g=buildOrderedGroup("core",vars,opts),t2=buildOutsideTerm("core",vars);
  const op1=Math.random()<.5?"+":"-",op2=Math.random()<.5?"+":"-";
  let map=addMaps(t1.map,g.map,op1==="+"?1:-1);map=addMaps(map,t2.map,op2==="+"?1:-1);
  return {q:`${t1.text} ${op1} (${g.text}) ${op2} ${t2.text}`,map,a:mapToCanonical(map)};
}

function buildChallenge(vars){
  const opts={requireNonNegativeLead:false,allowConst:true,coeffMax:20,constMax:15};
  const count=Math.random()<.55?3:4;const parts=[];let map={const:0};
  for(let i=0;i<count;i++){
    const g=buildOrderedGroup("challenge",vars,opts),op=i===0?"+":(Math.random()<.5?"+":"-");
    if(i===0){parts.push(`(${g.text})`);map=addMaps(map,g.map,1)}
    else{parts.push(`${op} (${g.text})`);map=addMaps(map,g.map,op==="+"?1:-1)}
  }
  if(Math.random()<.55){
    const t=buildOutsideTerm("challenge",vars),op=Math.random()<.5?"+":"-";
    parts.push(`${op} ${t.text}`);map=addMaps(map,t.map,op==="+"?1:-1);
  }
  return {q:parts.join(" "),map,a:mapToCanonical(map)};
}

function polish(q){return (q||"").replace(/\s-\s-(\d+)/g," - (-$1)")}

function generate(diff){
  const vars=chooseVarSet(diff),cap=lengthCap(diff);
  for(let tries=0;tries<160;tries++){
    let p=diff==="foundation"?buildFoundation(vars):diff==="core"?buildCore(vars):buildChallenge(vars);
    p.q=p.q.replace(/([+-]) +-(?=[0-9a-z])/g,(_,op)=>op==='-'?'+ ':'- ');
    if(/\b-?\d+\s*\*\(/.test(p.q))continue;
    if((diff==="foundation"||diff==="core")&&/\(\s*-/.test(p.q))continue;
    if(diff==="foundation"&&/-\s*\(\s*-\d*[a-z]/i.test(p.q))continue;
    if(p.q.length>cap)continue;
    const varsInQ=[...new Set((p.q.match(/[a-z]/g)||[]))];
    if(diff!=="challenge"&&varsInQ.length>2)continue;
    if(p.a==="0"&&Math.random()<.85)continue;
    return {difficulty:diff,q:p.q,map:p.map,a:p.a};
  }
  return {difficulty:diff,q:"x + (2x + 3)",map:{const:3,x:3},a:"3x + 3"};
}

 
function make(level){
 const p=generate(level);
 const expanded=p.q.replace(/([+-]?)\s*\(([^()]*)\)/g,(_,op,inner)=>{
   const terms=inner.replace(/\s/g,'').match(/[+-]?[^+-]+/g);
   return terms.map(t=>((op==='-')!==(t[0]==='-')?'-':'+')+t.replace(/^[+-]/,'')).join('');
 }).replace(/\s/g,'').replaceAll('--','+').replaceAll('+-','-').replaceAll('-+','-').replaceAll('++','+').replace(/^\+/,'');
 return {prompt:p.q,answers:[p.a],labels:['Simplified expression'],steps:expanded+' = '+p.a,raw:p};
}
function equivalent(value,q){
 const s=value.replace(/\s/g,'').replace(/−/g,'-');
 if(!/^[+-]?(?:\d*[abnxyz]|\d+)(?:[+-](?:\d*[abnxyz]|\d+))*$/.test(s))return false;
 const terms=s.match(/[+-]?[^+-]+/g), seen=new Set(), map={};
 for(const term of terms){
  const variable=term.match(/[abnxyz]$/)?.[0]||'const';
  if(seen.has(variable))return false;
  seen.add(variable);
  let coeff=variable==='const'?term:term.slice(0,-1);
  map[variable]=coeff==='-'?-1:coeff==='+'||coeff===''?1:Number(coeff);
  if(map[variable]===0&&terms.length>1)return false;
 }
 return mapsEqual(map,q.raw.map);
}
return {id:"brackets",title:"Expressions With Brackets",make,equivalent};
})();