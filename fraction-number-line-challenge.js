'use strict';
window.practiceModel=(()=>{

const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function mulOK(a,b){a=Math.abs(a);b=Math.abs(b);while(a%1>1e-8&&1-a%1>1e-8)a*=10;while(b%1>1e-8&&1-b%1>1e-8)b*=10;a=Math.round(a);b=Math.round(b);while(a>=10&&a%10===0)a/=10;while(b>=10&&b%10===0)b/=10;return a<10||b<10}
function chainOK(nums){const n=nums.slice().sort((a,b)=>Math.abs(b)-Math.abs(a));let acc=n.shift();for(const b of n){if(!mulOK(acc,b))return false;acc*=b}return true}

const gcd=(a,b)=>{a=Math.abs(a);b=Math.abs(b);while(b){[a,b]=[b,a%b]}return a||1}
function frac(n,d=1){
if(d<0){n=-n;d=-d}
const g=gcd(n,d); return {n:n/g,d:d/g}
}
const add=(a,b)=>frac(a.n*b.d+b.n*a.d,a.d*b.d)
const sub=(a,b)=>frac(a.n*b.d-b.n*a.d,a.d*b.d)
const mul=(a,k)=>frac(a.n*k,a.d)
const eq=(a,b)=>a.n===b.n&&a.d===b.d
const val=a=>a.n/a.d
const rand=(a,b)=>Math.floor(Math.random()*(b-a+1))+a
const choice=a=>a[rand(0,a.length-1)]

function mixedText(f){
const sign=f.n<0?"−":"";
const n=Math.abs(f.n), w=Math.floor(n/f.d), r=n%f.d;
if(r===0) return sign+w;
if(w===0) return sign+`${r}/${f.d}`;
return sign+`${w} ${r}/${f.d}`;
}
function svgFraction(x,y,f,anchor="middle"){
const n=f.n, d=f.d, w=Math.floor(Math.abs(n)/d), r=Math.abs(n)%d;
const sign=n<0?"−":"";
if(r===0) return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="25" font-weight="700">${sign}${w}</text>`;
let whole = w ? `${sign}${w}` : (sign || "");
let shift = w ? 15 : 0;
return `
${whole?`<text x="${x-shift-8}" y="${y+4}" text-anchor="middle" font-size="23" font-weight="700">${whole}</text>`:""}
<text x="${x+shift}" y="${y-13}" text-anchor="middle" font-size="19" font-weight="700">${r}</text>
<line x1="${x+shift-13}" y1="${y-7}" x2="${x+shift+13}" y2="${y-7}" stroke="#162033" stroke-width="2"/>
<text x="${x+shift}" y="${y+15}" text-anchor="middle" font-size="19" font-weight="700">${d}</text>`;
}

let mode="easy", current=null, score=0, streak=0, solved=0, answered=false;
const used=new Set();

function signature(q){
return [mode,q.step.n,q.step.d,q.leftIndex,q.rightIndex,q.arrowIndex,q.base.n,q.base.d].join("|");
}

const EASY_DENOMINATOR_PAIRS=[
{small:2,common:6},
{small:3,common:6},
{small:4,common:8},
{small:5,common:10},
{small:3,common:9},
{small:4,common:12},
{small:6,common:12}
];

function makeEasy(){
// FOUNDATION RULES:
// 1) Both labelled values must be non-zero proper fractions.
// 2) One labelled denominator must be a clean multiple (2x or 3x) of the other.
// 3) Students only need to expand ONE labelled fraction to match the other denominator.
// 4) There are only 2-4 equal common-denominator intervals between the labels.
// 5) The arrow is always strictly between the two labelled fractions.
const candidates=[];

EASY_DENOMINATOR_PAIRS.forEach(({small,common})=>{
const smallNums=[];
const commonNums=[];

for(let n=1;n<common;n++){
const reduced=frac(n,common);
if(reduced.d===small) smallNums.push(n);
if(reduced.d===common) commonNums.push(n);
}

[true,false].forEach(leftUsesSmallDenominator=>{
const leftNums=leftUsesSmallDenominator?smallNums:commonNums;
const rightNums=leftUsesSmallDenominator?commonNums:smallNums;

leftNums.forEach(a=>{
rightNums.forEach(b=>{
const gap=b-a;
if(gap<2 || gap>4) return;

const left=frac(a,common);
const right=frac(b,common);
const largerDen=Math.max(left.d,right.d);
const smallerDen=Math.min(left.d,right.d);

if(left.n<=0 || right.n<=0) return;
if(val(left)>=1 || val(right)>=1) return;
if(left.d===right.d) return;
if(largerDen%smallerDen!==0) return;
if(largerDen/smallerDen>3) return;

candidates.push({a,b,common});
});
});
});
});

const pick=choice(candidates);
const gap=pick.b-pick.a;
const arrowOffset=rand(1,gap-1);

return {
step:frac(1,pick.common),
base:frac(pick.a,pick.common),
total:gap,
leftIndex:0,
rightIndex:gap,
arrowIndex:arrowOffset,
easyCommonDenominator:pick.common,
easyLeftCommonNumerator:pick.a,
easyRightCommonNumerator:pick.b
};
}

function makeMedium(){
// Like textbook question 20: two simplified fractional landmarks, with 2–4 intervals between them.
const d=choice([6,8,10,12,15,18,20,24]);
const step=frac(1,d);
const total=rand(5,7);
const leftIndex=rand(1,2);
const gap=rand(2,Math.min(4,total-leftIndex));
const rightIndex=leftIndex+gap;
const arrowIndex=rand(leftIndex+1,rightIndex-1);
const maxBase=Math.max(0,d-total-2);
let baseN=rand(0,maxBase);
// Seek landmark fractions that simplify differently when possible.
for(let i=0;i<40;i++){
const trial=rand(0,maxBase);
const L=add(frac(trial,d),mul(step,leftIndex));
const R=add(frac(trial,d),mul(step,rightIndex));
if(L.d!==R.d || L.d!==d){baseN=trial;break}
}
return {step,base:frac(baseN,d),total,leftIndex,rightIndex,arrowIndex};
}

function makeHard(){
// Like textbook question 27: more intervals, less obvious step, and possible mixed numbers.
const d=choice([8,10,12,14,16,18,20,24]);
const step=frac(choice([1,1,1,2,3]),d);
const total=rand(6,8);
const leftIndex=rand(0,1);
const gap=rand(4,Math.min(6,total-leftIndex));
const rightIndex=leftIndex+gap;
const arrowIndex=rand(leftIndex+1,rightIndex-1);
const baseWhole=choice([0,0,0,1]);
const baseN=baseWhole*d + rand(0,Math.max(0,d-1));
return {step,base:frac(baseN,d),total,leftIndex,rightIndex,arrowIndex};
}

function diagram(q){
 const x=i=>60+480*i/q.total,y=85,L=add(q.base,mul(q.step,q.leftIndex)),R=add(q.base,mul(q.step,q.rightIndex));
 let s='<svg class="fraction-numberline" viewBox="0 0 600 200" role="img" aria-label="Two labelled fractions on an equally spaced number line; find the fraction at the red arrow."><path d="M40 85H560l-10 -6m10 6l-10 6" fill="none" stroke="#162033" stroke-width="3"/>';
 for(let i=0;i<=q.total;i++)s+=`<path d="M${x(i)} 82v18" stroke="#162033" stroke-width="3"/>`;
 s+=`<path d="M${x(q.arrowIndex)} 20V65m-7 -9l7 9 7 -9" fill="none" stroke="#c02f40" stroke-width="4"/>`;
 // Preserve stacked fraction landmarks from the original, enlarging text for phones.
 s+=svgFraction(x(q.leftIndex),140,L)+svgFraction(x(q.rightIndex),140,R);
 return s.replaceAll('font-size="19"','font-size="25"').replaceAll('font-size="23"','font-size="28"').replaceAll('font-size="25" font-weight="700">'+Math.floor(L.n/L.d)+'</text>','font-size="28" font-weight="700">'+Math.floor(L.n/L.d)+'</text>')+'</svg>';
}
makeMedium=function(){
 // Both landmarks need conversion to a common denominator; keep values below one.
 for(let i=0;i<2000;i++){
  const d=choice([12,15,18,20,24,28,30,32,36]),gap=rand(2,5),leftIndex=1,total=gap+2,baseN=rand(0,d-gap-3);
  const L=frac(baseN+leftIndex,d),R=frac(baseN+leftIndex+gap,d);
  const common=L.d*R.d/gcd(L.d,R.d);
  if(L.n===0||L.d%R.d===0||R.d%L.d===0||common/L.d>9||common/R.d>9)continue;
  return {variant:'two-denominators',step:frac(1,d),base:frac(baseN,d),total,leftIndex,rightIndex:leftIndex+gap,arrowIndex:rand(leftIndex+1,leftIndex+gap-1)};
 }throw Error('Unable to generate Core landmarks');
};
makeHard=function(){
 const variant=choice(['beyond-labels','cross-one','non-unit-step']),d=choice([8,10,12]);
 if(variant==='beyond-labels'){
  const gap=rand(3,4),leftIndex=1,rightIndex=leftIndex+gap,total=rightIndex+2;
  return {variant,step:frac(1,d),base:frac(rand(1,d-1),d),total,leftIndex,rightIndex,arrowIndex:choice([0,rightIndex+1,rightIndex+2])};
 }
 if(variant==='cross-one'){
  const leftIndex=0,gap=rand(4,6),baseN=d-rand(1,gap-1);
  return {variant,step:frac(1,d),base:frac(baseN,d),total:gap,leftIndex,rightIndex:gap,arrowIndex:rand(1,gap-1)};
 }
 const step=frac(choice([2,3,5].filter(n=>gcd(n,d)===1)),d),gap=rand(4,6);
 return {variant,step,base:frac(rand(1,d),d),total:gap+1,leftIndex:0,rightIndex:gap,arrowIndex:rand(1,gap-1)};
};

function make(level){
 const q=level==='foundation'?makeEasy():level==='core'?makeMedium():makeHard();
 const L=add(q.base,mul(q.step,q.leftIndex)),R=add(q.base,mul(q.step,q.rightIndex)),a=add(q.base,mul(q.step,q.arrowIndex)),gap=q.rightIndex-q.leftIndex,offset=q.arrowIndex-q.leftIndex;
 const common=L.d*R.d/gcd(L.d,R.d),ln=L.n*(common/L.d),rn=R.n*(common/R.d);
 const diff=sub(R,L),distance=Math.abs(offset),direction=offset<0?'before':'after',operation=offset<0?'−':'+';
 return {kind:'fractionline',raw:q,prompt:diagram(q)+'<p>What fraction is shown by the arrow?</p>',answers:[mixedText(a)],labels:['Whole number','Numerator','Denominator'],key:[L.n,L.d,R.n,R.d,gap,offset].join('|'),steps:`<p>Use a common denominator: ${L.n}/${L.d} = ${ln}/${common}; ${R.n}/${R.d} = ${rn}/${common}.</p><p>The difference is (${rn} − ${ln})/${common} = ${mixedText(diff)}. There are ${gap} equal intervals: ${mixedText(diff)} ÷ ${gap} = ${mixedText(q.step)} per interval.</p><p>The arrow is ${distance} interval${distance===1?'':'s'} ${direction} ${mixedText(L)}: ${mixedText(L)} ${operation} ${distance} × ${mixedText(q.step)} = <strong>${mixedText(a)}</strong>.</p>`,hint:'Find the difference between the two labelled fractions and divide it by the number of equal intervals.',match(values){const [w,n,d]=values.map(v=>v.trim());if(!/^\d*$/.test(w)||!/^\d*$/.test(n)||!/^\d*$/.test(d)||(!w&&!n)||(n==='')!==(d==='')||(d!==''&&Number(d)===0))return false;const den=BigInt(d||1),num=BigInt(w||0)*den+BigInt(n||0);return num*BigInt(a.d)===BigInt(a.n)*den}};
}

return {id:"numberline",title:"Fraction Number Line Challenge",make};})();