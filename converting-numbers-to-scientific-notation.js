'use strict';
window.practiceModel=(()=>{

const rand=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
function shiftDecimal(digits,places){
 const parts=String(digits).split('.');
 const raw=parts.join(''),point=parts[0].length+places;
 let result=point<=0?'0.'+'0'.repeat(-point)+raw:point>=raw.length?raw+'0'.repeat(point-raw.length):raw.slice(0,point)+'.'+raw.slice(point);
 result=result.replace(/^0+(?=\d)/,'').replace(/(\.\d*?)0+$/,'$1').replace(/\.$/,'');
 return result;
}
function make(level){
 const digits=rand(10,999),coefficient=shiftDecimal(digits,-String(digits).length+1);
 const exponent=level==='foundation'?rand(0,6):rand(-7,8);
 const ordinary=shiftDecimal(coefficient,exponent);
 if(level==='foundation' && ordinary.includes('.'))return make(level);
 const nonstandard=level==='challenge'&&Math.random()<.65;
 let prompt='Write '+ordinary+' in scientific notation.',steps,raw;
 if(nonstandard){
  const shift=[-4,-3,-2,-1,1,2,3,4][rand(0,7)];
  const given=shiftDecimal(coefficient,shift),power=exponent-shift;
  prompt='Write '+given+' × 10<sup>'+power+'</sup> in scientific notation.';
  steps=given+' = '+coefficient+' × 10<sup>'+shift+'</sup>.<br>Combine the exponents: '+shift+' + ('+power+') = '+exponent+'.';
  raw={digits,coefficient,exponent,ordinary,given,power,shift,nonstandard};
 }else{
  steps=ordinary+' = '+coefficient+' × 10<sup>'+exponent+'</sup>.<br>The coefficient is at least 1 and less than 10.';
  raw={digits,coefficient,exponent,ordinary,nonstandard};
 }
 return {prompt,answers:[coefficient,String(exponent)],labels:['Coefficient a','Exponent n'],kind:'scientific',steps:steps+'<br>Answer: '+coefficient+' × 10<sup>'+exponent+'</sup>.',raw,key:nonstandard?[raw.given,raw.power].join('|'):ordinary};
}

return {id:"scientific",title:"Converting Numbers to Scientific Notation",make};})();