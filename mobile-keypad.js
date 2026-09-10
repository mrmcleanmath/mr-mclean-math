(()=>{
  'use strict';

  // Mr. McLean Math embedded phone answer pads.
  // Each practice app declares only the keys its answers need.
  const page=(document.documentElement.dataset.mmmPadPage||location.pathname.split('/').pop()||'').toLowerCase();
  const touchSize=()=>Math.min(window.screen?.width||window.innerWidth,window.screen?.height||window.innerHeight);
  const coarse=()=>{try{return !!window.matchMedia&&window.matchMedia('(pointer:coarse)').matches}catch(e){return false}};
  const anyCoarse=()=>{try{return !!window.matchMedia&&window.matchMedia('(any-pointer:coarse)').matches}catch(e){return false}};
  const isPhoneTarget=()=>{
    const ua=navigator.userAgent||'';
    const platform=(navigator.userAgentData&&navigator.userAgentData.platform)||navigator.platform||'';
    const touch=(navigator.maxTouchPoints||0)>0;
    if(!touch)return false;
    // Never convert Windows/ChromeOS/Linux desktop-class devices just because they have touch.
    const desktopComputer=/CrOS|Windows NT|Windows|X11/i.test(ua+' '+platform)&&!/Android/i.test(ua);
    if(desktopComputer)return false;
    const mobileUa=/Android|iPhone|iPod|Mobile/i.test(ua);
    return touchSize()<=700&&(mobileUa||coarse()||anyCoarse());
  };

  // Compact layouts: digit-only pads fit in three rows on a phone.
  const integer=['1','2','3','4','5','6','7','8','9','0','⌫','Clear','Enter'];
  const positiveDecimal=['1','2','3','4','5','6','7','8','9','0','.','⌫','Clear','Enter'];
  const signedDecimal=['1','2','3','4','5','6','7','8','9','0','−','.','⌫','Clear','Enter'];
  const probability=['1','2','3','4','5','6','7','8','9','0','/','%','.','⌫','Clear','Enter'];
  const algebra=['1','2','3','4','5','6','7','8','9','0','x','y','a','c','+','−','.','⌫','Clear','Enter'];
  const editOnly=['⌫','Clear','Enter'];

  const configs={
    'adding-subtracting-algebraic-expressions.html':{selector:'input[id$="Answer"]',keys:algebra,cols:5,enterSpan:3,caption:'Algebra answer buttons'},
    'adding-subtracting-fractions.html':{selector:'input.answer-field',keys:integer,cols:5,enterSpan:3,caption:'Fraction answer buttons'},
    'area-triangles-quadrilaterals.html':{selector:'input.surface-answer',keys:positiveDecimal,cols:5,enterSpan:2,caption:'Number answer buttons'},
    'basic-probability.html':{selector:'input[id$="Answer"]',keys:probability,cols:6,enterSpan:3,caption:'Probability answer buttons'},
    'converting-cubic-units-liters.html':{selector:'input[id$="Answer"]',keys:positiveDecimal,cols:5,enterSpan:2,caption:'Number answer buttons'},
    'division-with-decimals.html':{selector:'input[id$="Answer"]',keys:integer,cols:5,enterSpan:3,caption:'Number answer buttons'},
    'convert-a-fraction.html':{selector:'input[id$="Answer"]',keys:positiveDecimal,cols:5,enterSpan:2,caption:'Conversion answer buttons'},
    'expected-frequency.html':{selector:'input[id$="Answer"]',keys:positiveDecimal,cols:5,enterSpan:2,caption:'Number answer buttons'},
    'order-of-operations.html':{selector:'input[id$="Input"]',keys:signedDecimal,cols:5,enterSpan:1,caption:'Number answer buttons'},
    'prime-factorization.html':{selector:'input[id$="Input"]',keys:editOnly,cols:3,enterSpan:1,caption:'Edit answer • use the prime buttons above'},
    'simplifying-fractions.html':{selector:'input.answer-field',keys:integer,cols:5,enterSpan:3,caption:'Fraction answer buttons'},
    'solving-equations-with-brackets.html':{selector:'input[id$="Input"]',keys:signedDecimal,cols:5,enterSpan:1,caption:'Equation answer buttons'},
    'surface-area-cuboids.html':{selector:'input.dimension-answer,input.surface-answer',keys:positiveDecimal,cols:5,enterSpan:2,caption:'Number answer buttons'}
  };

  const cfg=configs[page];
  if(!cfg)return;

  let activeInput=null;
  let pad=null;
  let grid=null;
  let caption=null;
  const original=new WeakMap();

  function eligible(node){return !!node&&node.matches?.(cfg.selector)}
  function visible(node){return !!node&&(node.offsetParent!==null||node.getClientRects?.().length)}

  function saveOriginal(input){
    if(original.has(input))return;
    original.set(input,{readOnly:input.readOnly,inputmode:input.getAttribute('inputmode')});
  }
  function prepareInput(input){
    if(!eligible(input)||!isPhoneTarget())return;
    saveOriginal(input);
    input.readOnly=true;
    input.setAttribute('inputmode','none');
    input.dataset.mmmPhonePad='1';
  }
  function restoreInput(input){
    const o=original.get(input);if(!o)return;
    input.readOnly=!!o.readOnly;
    if(o.inputmode==null)input.removeAttribute('inputmode');else input.setAttribute('inputmode',o.inputmode);
    delete input.dataset.mmmPhonePad;
  }
  function restoreAll(){document.querySelectorAll(cfg.selector).forEach(restoreInput)}

  function inputLabel(input){
    const label=(input?.getAttribute('aria-label')||input?.placeholder||'').trim();
    if(!label)return cfg.caption||'Answer buttons';
    // Multi-box fraction/dimension apps benefit from showing which box receives the digits.
    const multi=document.querySelectorAll(cfg.selector).length>1;
    return multi?`${cfg.caption||'Answer buttons'} · ${label}`:(cfg.caption||'Answer buttons');
  }

  function ensurePad(){
    if(pad)return pad;
    pad=document.createElement('div');
    pad.id='mmmMobileKeypad';
    pad.className='mmm-embedded-answer-pad';
    pad.setAttribute('role','group');
    pad.setAttribute('aria-label','On-screen answer buttons');
    pad.style.setProperty('--mmm-keypad-cols',String(cfg.cols||5));
    caption=document.createElement('div');
    caption.className='mmm-keypad-caption';
    caption.textContent=cfg.caption||'Answer buttons';
    grid=document.createElement('div');
    grid.className='mmm-keypad-grid';

    cfg.keys.forEach(label=>{
      const b=document.createElement('button');
      b.type='button';
      b.className='mmm-key';
      b.dataset.key=label;
      b.textContent=label==='⌫'?'←':label;
      if(['⌫','Clear'].includes(label))b.classList.add('mmm-key-action');
      if(label==='Enter'){
        b.classList.add('mmm-key-enter');
        b.setAttribute('aria-label','Check or next');
        const span=Math.max(1,Number(cfg.enterSpan)||1);
        if(span>1)b.style.gridColumn='span '+span;
      }
      if(label==='⌫')b.setAttribute('aria-label','Backspace');
      grid.appendChild(b);
    });
    pad.append(caption,grid);

    const press=e=>{
      const btn=e.target.closest('.mmm-key');
      if(!btn||!activeInput)return;
      e.preventDefault();
      e.stopPropagation();
      btn.classList.add('is-pressed');
      setTimeout(()=>btn.classList.remove('is-pressed'),80);
      handleKey(btn.dataset.key||'');
    };
    grid.addEventListener('pointerdown',press,{passive:false});
    grid.addEventListener('click',e=>{if(e.detail===0)press(e)});
    return pad;
  }

  function mountAnchor(input){
    // Put the pad inside the current practice card, immediately after its answer area.
    return input.closest('.fraction-answer-entry,.numeric-answer-entry,.reverse-answer-entry,.prime-answer-wrap,.row')||input;
  }
  function mountPad(input){
    ensurePad();
    const anchor=mountAnchor(input);
    if(!anchor||!anchor.parentNode)return;
    if(anchor.nextElementSibling!==pad)anchor.insertAdjacentElement('afterend',pad);
    const nextCaption=inputLabel(input);
    if(caption.textContent!==nextCaption)caption.textContent=nextCaption;
    pad.classList.add('mmm-keypad-visible');
    document.documentElement.classList.add('mmm-phone-answer-pad');
    updateResolvedState();
  }
  function hidePad(){
    if(pad)pad.classList.remove('mmm-keypad-visible');
    document.documentElement.classList.remove('mmm-phone-answer-pad');
  }

  function activate(input,{focus=false}={}){
    if(!isPhoneTarget()||!eligible(input))return;
    prepareInput(input);
    activeInput=input;
    mountPad(input);
    if(focus){
      try{input.focus({preventScroll:true})}catch(_){input.focus()}
      const end=input.value.length;
      try{input.setSelectionRange(end,end)}catch(_){ }
    }
  }

  function selection(input){
    const len=input.value.length;
    let s=typeof input.selectionStart==='number'?input.selectionStart:len;
    let e=typeof input.selectionEnd==='number'?input.selectionEnd:s;
    return [s,e];
  }
  function setValue(input,value,cursor){
    input.value=value;
    try{input.setSelectionRange(cursor,cursor)}catch(e){}
    input.dispatchEvent(new Event('input',{bubbles:true}));
  }
  function insert(text){
    const input=activeInput;if(!input||input.disabled)return;
    const [s,e]=selection(input),v=input.value;
    setValue(input,v.slice(0,s)+text+v.slice(e),s+text.length);
  }
  function backspace(){
    const input=activeInput;if(!input||input.disabled)return;
    const [s,e]=selection(input),v=input.value;
    if(s!==e){setValue(input,v.slice(0,s)+v.slice(e),s);return}
    if(s>0)setValue(input,v.slice(0,s-1)+v.slice(e),s-1);
  }
  function relatedNext(input){
    if(!input)return null;
    const id=input.id||'';
    const prefix=id.replace(/(?:Answer|Input|Whole|Numerator|Denominator|Length|Width|Height)$/,'');
    const byId=prefix?document.getElementById(prefix+'Next'):null;
    if(byId&&!byId.classList.contains('hidden')&&!byId.disabled)return byId;
    const scope=input.closest('[id$="Body"],.level-body,.level-card,.card')||document;
    return Array.from(scope.querySelectorAll('button[id$="Next"]')).find(b=>!b.classList.contains('hidden')&&!b.disabled)||null;
  }
  function sendEnter(){
    const input=activeInput;if(!input)return;
    const next=relatedNext(input);
    if(input.disabled&&next){next.click();return}
    // Existing app key handlers preserve each app's normal Enter behavior.
    const ev=new KeyboardEvent('keydown',{key:'Enter',code:'Enter',bubbles:true,cancelable:true});
    input.dispatchEvent(ev);
    setTimeout(updateResolvedState,0);
  }
  function handleKey(key){
    if(!activeInput)return;
    if(key==='Enter'){sendEnter();return}
    if(activeInput.disabled)return;
    if(key==='⌫'){backspace();return}
    if(key==='Clear'){setValue(activeInput,'',0);return}
    if(key==='−'){insert('-');return}
    insert(key);
  }

  function updateResolvedState(){
    if(!pad)return;
    const resolved=!!activeInput?.disabled;
    pad.classList.toggle('mmm-pad-resolved',resolved);
    grid?.querySelectorAll('.mmm-key').forEach(btn=>{
      const blocked=resolved&&btn.dataset.key!=='Enter';
      btn.disabled=blocked;
      btn.setAttribute('aria-disabled',String(blocked));
    });
  }

  function sync(){
    if(!isPhoneTarget()){
      restoreAll();activeInput=null;hidePad();return;
    }
    document.documentElement.classList.add('mmm-phone-answer-pad');
    const inputs=Array.from(document.querySelectorAll(cfg.selector)).filter(visible);
    inputs.forEach(prepareInput);
    if(!inputs.length){activeInput=null;hidePad();return}

    // Keep the current target through answer resolution so the embedded Enter
    // button can still advance to the next problem.
    if(!activeInput||!document.contains(activeInput)||!inputs.includes(activeInput)){
      const focused=document.activeElement;
      activeInput=eligible(focused)&&inputs.includes(focused)?focused:(inputs.find(i=>!i.disabled)||inputs[0]);
    }
    if(activeInput)mountPad(activeInput);
  }

  // Tapping an answer box chooses the target but never opens the phone keyboard.
  document.addEventListener('pointerdown',e=>{
    const input=e.target.closest?.(cfg.selector);
    if(!input||!isPhoneTarget())return;
    prepareInput(input);
    e.preventDefault();
    activate(input,{focus:true});
  },true);
  document.addEventListener('focusin',e=>{
    if(eligible(e.target)&&isPhoneTarget())activate(e.target);
  });

  // If a real hardware keyboard is connected to the phone, allow normal typing.
  document.addEventListener('keydown',e=>{
    if(!e.isTrusted)return;
    const input=e.target;
    if(!eligible(input)||input.dataset.mmmPhonePad!=='1')return;
    const key=e.key||'';
    const hardwareInputKey=key.length===1||['Backspace','Delete','Enter','ArrowLeft','ArrowRight','Home','End'].includes(key);
    if(!hardwareInputKey)return;
    restoreInput(input);
  },true);

  document.addEventListener('click',e=>{
    if(e.target.closest?.('button[id$=\"Check\"]'))setTimeout(updateResolvedState,0);
  },true);

  const mo=new MutationObserver(sync);
  mo.observe(document.body,{childList:true,subtree:true});
  window.addEventListener('resize',sync,{passive:true});
  window.addEventListener('orientationchange',sync,{passive:true});
  sync();
})();
