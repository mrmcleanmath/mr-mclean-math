'use strict';
window.practiceModel=(()=>{
function randint(r, min, max){
    return Math.floor(r() * (max - min + 1)) + min;
  }

  function gcd(a,b){
    while(b){ [a,b] = [b,a%b]; }
    return a;
  }

  function fmtInt(n){
    return String(Math.trunc(Math.abs(n))).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  }

  function fracHTML(top, bottom){
    return `<span class="frac"><span class="top">${top}</span><span class="bar"></span><span class="bottom">${bottom}</span></span>`;
  }

  /*
    Arithmetic-safety rule:
    Students must never need multi-digit × multi-digit or multi-digit ÷
    multi-digit arithmetic to discover or use the scale factor.

    Every question is built around a single-digit anchor:
    - N? questions use the reduced denominator b as the known anchor (b <= 9).
    - D? questions use the reduced numerator a as the known anchor (a <= 9).
    - The scale factor k is always 2–9.

    This guarantees that the intended solution path uses only:
    - single-digit × single-digit,
    - multi-digit × single-digit, or
    - multi-digit ÷ single-digit.
  */
  function genOne(r, tier, forceType=null){
    const retry = 800;

    for(let i=0; i<retry; i++){
      const direction = forceType?.startsWith('reduce')
        ? 'reduce'
        : forceType?.startsWith('expand')
          ? 'expand'
          : (r() < 0.5 ? 'expand' : 'reduce');

      const kind = forceType?.endsWith('N?')
        ? 'N?'
        : forceType?.endsWith('D?')
          ? 'D?'
          : (r() < 0.5 ? 'N?' : 'D?');

      let a, b, k;

      if(tier === 'foundation'){
        // Friendly numbers and short multiplication facts.
        b = kind === 'N?' ? randint(r,2,8) : randint(r,3,10);
        a = kind === 'D?'
          ? randint(r,1,Math.min(6,b-1))
          : randint(r,1,b-1);
        k = randint(r,2,4);
      }
      else if(tier === 'core'){
        // Standard classroom-level questions with moderate values.
        b = kind === 'N?' ? randint(r,5,9) : randint(r,8,18);
        a = kind === 'D?'
          ? randint(r,2,Math.min(9,b-1))
          : randint(r,1,b-1);
        k = randint(r,3,6);
      }
      else{
        // Challenge uses larger-looking fractions, but the arithmetic pathway
        // remains fair: the anchor and scale factor are still single-digit.
        b = kind === 'N?' ? randint(r,7,9) : randint(r,18,40);
        a = kind === 'D?'
          ? randint(r,4,Math.min(9,b-1))
          : randint(r,Math.min(3,b-1),b-1);
        k = randint(r,6,9);

        // Most Challenge base fractions are already in simplest form, which
        // makes the structure less visually obvious without adding long division.
        if(r() < 0.70 && gcd(a,b) !== 1) continue;
      }

      const top = a * k;
      const bot = b * k;

      // Difficulty bounds keep the three modes meaningfully separated.
      if(tier === 'foundation' && (top > 40 || bot > 40)) continue;
      if(tier === 'core' && (top > 110 || bot > 110)) continue;
      if(tier === 'challenge' && (top > 360 || bot > 360)) continue;

      // Absolute arithmetic guards. These are invariants, not preferences.
      if(kind === 'N?' && b > 9) continue;
      if(kind === 'D?' && a > 9) continue;
      if(k < 2 || k > 9) continue;

      let htmlText, answer, steps, operationLabel;

      if(direction === 'expand'){
        if(kind === 'N?'){
          htmlText = `${fracHTML(fmtInt(a),fmtInt(b))} <span class="eq">=</span> ${fracHTML('?',fmtInt(bot))}`;
          answer = top;
        } else {
          htmlText = `${fracHTML(fmtInt(a),fmtInt(b))} <span class="eq">=</span> ${fracHTML(fmtInt(top),'?')}`;
          answer = bot;
        }
        steps = `Multiply BOTH numerator and denominator by ${k}:\n${a}/${b} × ${k}/${k} = ${fmtInt(top)}/${fmtInt(bot)}`;
        operationLabel = `multiplied both by ${k}`;
      }
      else{
        if(kind === 'N?'){
          htmlText = `${fracHTML(fmtInt(top),fmtInt(bot))} <span class="eq">=</span> ${fracHTML('?',fmtInt(b))}`;
          answer = a;
        } else {
          htmlText = `${fracHTML(fmtInt(top),fmtInt(bot))} <span class="eq">=</span> ${fracHTML(fmtInt(a),'?')}`;
          answer = b;
        }
        steps = `Divide BOTH numerator and denominator by ${k}:\n${fmtInt(top)}/${fmtInt(bot)} ÷ ${k}/${k} = ${a}/${b}`;
        operationLabel = `divided both by ${k}`;
      }

      return {htmlText, answer, steps, kind, direction, operationLabel, a, b, k, top, bot};
    }

    return {
      htmlText:`${fracHTML('2','4')} <span class="eq">=</span> ${fracHTML('?','2')}`,
      answer:1,
      steps:'Divide BOTH numerator and denominator by 2:\n2/4 ÷ 2/2 = 1/2',
      kind:'N?', direction:'reduce', operationLabel:'divided both by 2',
      a:1, b:2, k:2, top:2, bot:4
    };
  }

  
function make(level,type){
 const p=genOne(Math.random,level,type==='Mix'?null:type);
 return {prompt:p.htmlText,answers:[String(p.answer)],labels:[p.kind==='N?'?'Missing numerator':'Missing denominator'],steps:p.steps.replace(/\n/g,'<br>'),raw:p};
}
return {id:"equivalent",title:"Finding Equivalent Fractions",make};
})();