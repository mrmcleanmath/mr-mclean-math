'use strict';
window.practiceModel=(()=>{

const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function mulOK(a,b){a=Math.abs(a);b=Math.abs(b);while(a%1>1e-8&&1-a%1>1e-8)a*=10;while(b%1>1e-8&&1-b%1>1e-8)b*=10;a=Math.round(a);b=Math.round(b);while(a>=10&&a%10===0)a/=10;while(b>=10&&b%10===0)b/=10;return a<10||b<10}
function chainOK(nums){const n=nums.slice().sort((a,b)=>Math.abs(b)-Math.abs(a));let acc=n.shift();for(const b of n){if(!mulOK(acc,b))return false;acc*=b}return true}
function ri(a,b){return a+Math.floor(Math.random()*(b-a+1))}
function decimalShift(digits,places){const pos=digits.length+places;let s=pos<=0?'0.'+'0'.repeat(-pos)+digits:pos>=digits.length?digits+'0'.repeat(pos-digits.length):digits.slice(0,pos)+'.'+digits.slice(pos);if(s.includes('.'))s=s.replace(/0+$/,'').replace(/\.$/,'');return s;}
function make(level){
 let decimals,significand,exponent,variant;
 if(level==='foundation'){
  variant=Math.random()<.5?'whole-coefficient':'one-decimal';decimals=variant==='whole-coefficient'?0:1;significand=decimals?ri(1,9)*10+ri(1,9):ri(1,9);exponent=ri(1,4);
 }else if(level==='core'){
  variant=['negative-power','zero-power','positive-power'][ri(0,2)];decimals=ri(1,2);significand=ri(10**decimals,10**(decimals+1)-1);exponent=variant==='negative-power'?-ri(1,3):variant==='zero-power'?0:ri(1,4);
 }else{
  variant=['internal-zero-positive','internal-zero-negative','decimal-result'][ri(0,2)];
  decimals=variant==='decimal-result'?3:2;
  significand=variant==='decimal-result'?ri(1,9)*1000+ri(1,9)*10+ri(1,9):ri(1,9)*100+ri(1,9);
  exponent=variant==='internal-zero-negative'?-ri(2,5):variant==='decimal-result'?ri(1,2):ri(3,6);
 }
 const coefficient=decimalShift(String(significand),-decimals),answer=decimalShift(String(significand),exponent-decimals);
 const steps=exponent===0?'10⁰ = 1, so the value is unchanged.':`Move the decimal point ${Math.abs(exponent)} place${Math.abs(exponent)===1?'':'s'} to the ${exponent>0?'right':'left'}. Keep every original digit in order and add zeros where needed.`;
 return {kind:'ordinary',raw:{variant,significand,decimals,exponent,coefficient},prompt:`<div class="algebra-expression">${coefficient} × 10<sup>${exponent}</sup></div>`,answers:[answer],labels:['Ordinary number'],key:coefficient+'e'+exponent,steps:`<p>${steps}</p><p>${coefficient} × 10<sup>${exponent}</sup> = <strong>${answer}</strong></p>`,hint:'Positive exponents move the decimal point right; negative exponents move it left. Preserve zeros between significant digits.',match(values){const s=values[0].trim().replace(/\s/g,'').replace(',','.');return /^(?:\d+(?:\.\d*)?|\.\d+)$/.test(s)&&Number(s)===Number(answer)}};
}

return {id:"ordinary",title:"Scientific Notation to Ordinary Numbers",make};})();