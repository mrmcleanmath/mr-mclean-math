(()=>{
  'use strict';
  const page=(location.pathname.split('/').pop()||'').toLowerCase();
  const coarse=()=>{try{return !!window.matchMedia&&window.matchMedia('(pointer:coarse)').matches}catch(e){return false}};
  const anyCoarse=()=>{try{return !!window.matchMedia&&window.matchMedia('(any-pointer:coarse)').matches}catch(e){return false}};
  const touchSize=()=>Math.min(window.screen?.width||window.innerWidth,window.screen?.height||window.innerHeight);
  const isTouchTarget=()=>{
    const ua=navigator.userAgent||'';
    if(/CrOS/i.test(ua))return false;
    const touch=(navigator.maxTouchPoints||0)>0;
    const appleTablet=(navigator.platform==='MacIntel'&&touch);
    const mobileUa=/Android|iPhone|iPad|iPod|Mobile/i.test(ua);
    return touchSize()<=1200&&touch&&(coarse()||anyCoarse()||mobileUa||appleTablet);
  };

  const positiveDecimal=['1','2','3','⌫','4','5','6','Clear','7','8','9','.','0','Enter'];
  const signedDecimal=['1','2','3','⌫','4','5','6','Clear','7','8','9','−','.','0','Enter'];
  const integer=['1','2','3','⌫','4','5','6','Clear','7','8','9','0','Enter'];
  const probability=['1','2','3','⌫','4','5','6','Clear','7','8','9','/','0','.','%','Enter'];
  const algebra=['1','2','3','⌫','4','5','6','Clear','7','8','9','−','0','.','+','x','y','a','c','Enter'];

  const configs={
    'adding-subtracting-algebraic-expressions.html':{selector:'input[id$="Answer"]',keys:algebra,cols:5,enterSpan:1,caption:'Math keypad'},
    'adding-subtracting-fractions.html':{selector:'input.answer-field',keys:integer,cols:4,enterSpan:4,caption:'Number keypad'},
    'area-triangles-quadrilaterals.html':{selector:'input.surface-answer',keys:positiveDecimal,cols:4,enterSpan:3,caption:'Number keypad'},
    'basic-probability.html':{selector:'input[id$="Answer"]',keys:probability,cols:4,enterSpan:1,caption:'Probability keypad'},
    'converting-cubic-units-liters.html':{selector:'input[id$="Answer"]',keys:positiveDecimal,cols:4,enterSpan:3,caption:'Number keypad'},
    'expected-frequency.html':{selector:'input[id$="Answer"]',keys:positiveDecimal,cols:4,enterSpan:3,caption:'Number keypad'},
    'order-of-operations.html':{selector:'input[id$="Input"]',keys:signedDecimal,cols:4,enterSpan:2,caption:'Number keypad'},
    'prime-factorization.html':{selector:'input[id$="Input"]',keys:['⌫','Clear','Enter'],cols:3,enterSpan:1,caption:'Use the prime buttons above • edit here'},
    'simplifying-fractions.html':{selector:'input.answer-field',keys:integer,cols:4,enterSpan:4,caption:'Number keypad'},
    'solving-equations-with-brackets.html':{selector:'input[id$="Input"]',keys:signedDecimal,cols:4,enterSpan:2,caption:'Number keypad'},
    'surface-area-cuboids.html':{selector:'input.dimension-answer,input.surface-answer',keys:positiveDecimal,cols:4,enterSpan:3,caption:'Number keypad'}
  };
  const cfg=configs[page];
  if(!cfg)return;

  let activeInput=null;
  let keypad=null;
  let grid=null;
  let hideTimer=null;
  const original=new WeakMap();

  function eligible(node){return !!node&&node.matches?.(cfg.selector)}
  function saveOriginal(input){
    if(original.has(input))return;
    original.set(input,{readOnly:input.readOnly,inputmode:input.getAttribute('inputmode'),tabindex:input.getAttribute('tabindex')});
  }
  function prepareInput(input){
    if(!eligible(input)||!isTouchTarget())return;
    saveOriginal(input);
    input.readOnly=true;
    input.setAttribute('inputmode','none');
    input.dataset.mmmTouchKeypad='1';
  }
  function restoreInput(input){
    const o=original.get(input);if(!o)return;
    input.readOnly=!!o.readOnly;
    if(o.inputmode==null)input.removeAttribute('inputmode');else input.setAttribute('inputmode',o.inputmode);
    if(o.tabindex==null)input.removeAttribute('tabindex');else input.setAttribute('tabindex',o.tabindex);
    delete input.dataset.mmmTouchKeypad;
  }
  function scan(){
    document.querySelectorAll(cfg.selector).forEach(i=>isTouchTarget()?prepareInput(i):restoreInput(i));
  }
  function ensureKeypad(){
    if(keypad)return keypad;
    keypad=document.createElement('div');
    keypad.id='mmmMobileKeypad';
    keypad.setAttribute('role','group');
    keypad.setAttribute('aria-label','On-screen math keypad');
    keypad.style.setProperty('--mmm-keypad-cols',String(cfg.cols||4));
    const caption=document.createElement('div');caption.className='mmm-keypad-caption';caption.textContent=cfg.caption||'Math keypad';
    grid=document.createElement('div');grid.className='mmm-keypad-grid';
    cfg.keys.forEach(label=>{
      const b=document.createElement('button');b.type='button';b.className='mmm-key';b.dataset.key=label;b.textContent=label==='⌫'?'←':label;
      if(['⌫','Clear'].includes(label))b.classList.add('mmm-key-action');
      if(label==='Enter'){
        b.classList.add('mmm-key-enter');b.setAttribute('aria-label','Check or next');
        const span=Math.max(1,Number(cfg.enterSpan)||1);if(span>1)b.style.gridColumn='span '+span;
      }
      if(label==='⌫')b.setAttribute('aria-label','Backspace');
      grid.appendChild(b);
    });
    keypad.append(caption,grid);document.body.appendChild(keypad);
    const press=e=>{
      const btn=e.target.closest('.mmm-key');if(!btn||!activeInput||activeInput.disabled)return;
      if(e.type==='pointerdown'){e.preventDefault();e.stopPropagation();btn.classList.add('is-pressed');setTimeout(()=>btn.classList.remove('is-pressed'),80)}
      handleKey(btn.dataset.key||'');
    };
    grid.addEventListener('pointerdown',press,{passive:false});
    grid.addEventListener('click',e=>{if(e.detail===0)press(e)});
    return keypad;
  }
  function show(input){
    if(!isTouchTarget()||!eligible(input)||input.disabled)return;
    clearTimeout(hideTimer);prepareInput(input);activeInput=input;ensureKeypad();
    keypad.classList.add('mmm-keypad-visible');
    document.documentElement.classList.add('mmm-touch-keypad-on');document.body.classList.add('mmm-keypad-open');
    requestAnimationFrame(()=>{
      const h=Math.ceil(keypad.getBoundingClientRect().height+20);
      document.documentElement.style.setProperty('--mmm-keypad-space',h+'px');
    });
  }
  function hide(){
    if(!keypad)return;
    keypad.classList.remove('mmm-keypad-visible');document.body.classList.remove('mmm-keypad-open');activeInput=null;
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
  function sendEnter(){
    const input=activeInput;if(!input||input.disabled)return;
    const ev=new KeyboardEvent('keydown',{key:'Enter',code:'Enter',bubbles:true,cancelable:true});
    input.dispatchEvent(ev);
    setTimeout(()=>{
      if(activeInput&&activeInput.disabled)hide();
      const focused=document.activeElement;
      if(eligible(focused)&&!focused.disabled)show(focused);
      else if(focused!==activeInput)hide();
    },0);
  }
  function handleKey(key){
    if(!activeInput||activeInput.disabled)return;
    if(key==='⌫'){backspace();return}
    if(key==='Clear'){setValue(activeInput,'',0);return}
    if(key==='Enter'){sendEnter();return}
    if(key==='−'){insert('-');return}
    insert(key);
  }

  document.addEventListener('pointerdown',e=>{
    const input=e.target.closest?.(cfg.selector);
    if(!input||!isTouchTarget())return;
    prepareInput(input);activeInput=input;
    // readonly + preventDefault keeps the OS keyboard closed while preserving our own focus/caret.
    e.preventDefault();
    try{input.focus({preventScroll:true})}catch(_){input.focus()}
    const end=input.value.length;try{input.setSelectionRange(end,end)}catch(_){ }
    show(input);
  },true);
  document.addEventListener('focusin',e=>{if(eligible(e.target)&&isTouchTarget())show(e.target)});
  document.addEventListener('focusout',()=>{
    clearTimeout(hideTimer);hideTimer=setTimeout(()=>{
      const f=document.activeElement;
      if(!eligible(f))hide();
    },70);
  });
  document.addEventListener('click',e=>{
    if(!keypad?.classList.contains('mmm-keypad-visible'))return;
    if(e.target.closest('#mmmMobileKeypad')||eligible(e.target))return;
    // Keep the keypad while tapping Check; answer resolution will hide it on disable/focus change.
    if(e.target.closest('button[id$="Check"]'))return;
    hide();
  });

  const mo=new MutationObserver(()=>{
    scan();
    if(activeInput&&(!document.contains(activeInput)||activeInput.disabled)){hide();return;}
    const focused=document.activeElement;
    if(isTouchTarget()&&eligible(focused)&&!focused.disabled)show(focused);
  });
  mo.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['disabled']});
  const media=window.matchMedia?.('(pointer:coarse)');
  const sync=()=>{scan();if(!isTouchTarget())hide()};
  media?.addEventListener?.('change',sync);window.addEventListener('resize',sync,{passive:true});
  document.documentElement.classList.add('mmm-touch-keypad-on');
  scan();
})();
