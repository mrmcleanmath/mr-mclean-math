(()=>{
  'use strict';
  const page=(location.pathname.split('/').pop()||'').toLowerCase();
  const selectors={
    'fraction-breaker.html':'#numInput,#denInput',
    'pi-memory-challenge.html':'#charInput'
  };
  const selector=selectors[page];
  if(!selector)return;
  const touchSize=()=>Math.min(window.screen?.width||window.innerWidth,window.screen?.height||window.innerHeight);
  const coarse=()=>{try{return !!window.matchMedia&&window.matchMedia('(pointer:coarse)').matches}catch(e){return false}};
  const anyCoarse=()=>{try{return !!window.matchMedia&&window.matchMedia('(any-pointer:coarse)').matches}catch(e){return false}};
  const isPhoneTarget=()=>{
    const ua=navigator.userAgent||'';
    const platform=(navigator.userAgentData&&navigator.userAgentData.platform)||navigator.platform||'';
    const touch=(navigator.maxTouchPoints||0)>0;
    if(!touch)return false;
    const desktopComputer=/CrOS|Windows NT|Windows|X11/i.test(ua+' '+platform)&&!/Android/i.test(ua);
    if(desktopComputer)return false;
    const mobileUa=/Android|iPhone|iPod|Mobile/i.test(ua);
    return touchSize()<=700&&(mobileUa||coarse()||anyCoarse());
  };
  const original=new WeakMap();
  function save(input){if(!original.has(input))original.set(input,{readOnly:input.readOnly,inputmode:input.getAttribute('inputmode')})}
  function protect(input){
    if(!input||!isPhoneTarget())return;
    save(input);
    input.readOnly=true;
    input.setAttribute('inputmode','none');
    input.dataset.mmmCustomPhonePad='1';
  }
  function restore(input){
    const o=original.get(input);if(!o)return;
    input.readOnly=!!o.readOnly;
    if(o.inputmode==null)input.removeAttribute('inputmode');else input.setAttribute('inputmode',o.inputmode);
    delete input.dataset.mmmCustomPhonePad;
  }
  function sync(){
    const inputs=document.querySelectorAll(selector);
    if(isPhoneTarget())inputs.forEach(protect);else inputs.forEach(restore);
  }
  document.addEventListener('focus',e=>{if(e.target.matches?.(selector))protect(e.target)},true);
  document.addEventListener('pointerdown',e=>{const input=e.target.closest?.(selector);if(input)protect(input)},true);
  const mo=new MutationObserver(sync);
  mo.observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener('resize',sync,{passive:true});
  window.addEventListener('orientationchange',sync,{passive:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',sync,{once:true});else sync();
})();
