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

// Adapted from the user's inline Comparing Fractions source.
// Retains comparison by exact cross-products and simplify/common-denominator working.
const rand=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const pick=a=>a[rand(0,a.length-1)];
function gcd(a,b){while(b)[a,b]=[b,a%b];return a;}
function frac(a,b){return '<span class="frac"><span class="num">'+a+'</span><span class="bar"></span><span class="den">'+b+'</span></span>';}
function make(level){
 for(let i=0;i<1500;i++){
  let a,b,c,d,structure;
  if(level==='foundation'){
   b=rand(2,12);d=b;a=rand(1,b-1);c=rand(1,b-1);structure='same denominator';
   if(Math.random()<.4){d=rand(2,12);a=rand(1,Math.min(b,d)-1);c=a;structure='same numerator';}
   if(Math.random()<.2){const k=rand(2,5);c=a*k;d=b*k;structure='equivalent';}
  }else{
   b=rand(2,level==='core'?15:30);d=rand(2,level==='core'?15:30);
   a=rand(1,level==='core'?b-1:b+15);c=rand(1,level==='core'?d-1:d+15);
   structure='unlike denominators';
   if(Math.random()<.2){const k=rand(2,6);c=a*k;d=b*k;structure='equivalent';}
  }
  const ga=gcd(a,b),gc=gcd(c,d),an=a/ga,bn=b/ga,cn=c/gc,dn=d/gc;
  if(!allowedDivisor(ga)||!allowedDivisor(gc))continue;
  const lcm=bn*dn/gcd(bn,dn),m1=lcm/bn,m2=lcm/dn;
  if(lcm>180||m1>9||m2>9)continue;
  const left=an*m1,right=cn*m2,ans=left<right?'<':left>right?'>':'=';
  const steps='Simplify: '+frac(a,b)+' = '+frac(an,bn)+' and '+frac(c,d)+' = '+frac(cn,dn)+'.<br>Common denominator '+lcm+': '+an+' × '+m1+' = '+left+' and '+cn+' × '+m2+' = '+right+'.<br>'+frac(left,lcm)+' '+(ans==='<'?'&lt;':ans==='>'?'&gt;':'=')+' '+frac(right,lcm)+'.';
  return {prompt:frac(a,b)+' <span class="comparison-gap">?</span> '+frac(c,d),answers:[ans],labels:['Comparison'],options:['<','=','>'],kind:'comparison',steps,raw:{a,b,c,d,structure,lcm,m1,m2},key:[a+'/'+b,c+'/'+d].sort().join('|')};
 }
 throw Error('No suitable fraction comparison');
}

return {id:"comparing",title:"Comparing Fractions",make};})();