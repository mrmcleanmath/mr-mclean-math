(() => {
  'use strict';
  const reset = document.getElementById('resetProgressButton');
  if (!reset || document.getElementById('practiceFullscreenButton')) return;
  const root = document.documentElement;
  const button = document.createElement('button');
  button.id = 'practiceFullscreenButton';
  button.type = 'button';
  button.className = 'practice-fullscreen-button';
  button.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path d="M9 4H4v5m11-5h5v5M4 15v5h5m11-5v5h-5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  reset.after(button);
  const exit = document.createElement('button');
  exit.type = 'button';
  exit.className = 'practice-fullscreen-exit';
  exit.textContent = '✕ Exit fullscreen';
  exit.hidden = true;
  document.body.appendChild(exit);
  let active = false;
  let pending = false;
  let previousScroll = 0;
  function update() {
    root.classList.toggle('practice-fullscreen', active);
    button.setAttribute('aria-pressed', String(active));
    button.setAttribute('aria-label', active ? 'Exit fullscreen' : 'Enter fullscreen');
    button.title = active ? 'Exit fullscreen' : 'Enter fullscreen';
    exit.hidden = !active;
  }
  function restore() {
    if (!active) return;
    active = false;
    update();
    button.focus({preventScroll: true});
    window.scrollTo(0, previousScroll);
  }
  async function leave() {
    if (pending) return;
    if (document.fullscreenElement === root) {
      try { await document.exitFullscreen(); } catch (_) { return; }
    }
    restore();
  }
  async function enter() {
    if (pending || active) return;
    pending = true;
    previousScroll = window.scrollY;
    active = true;
    update();
    // Keep the same focused page layout when native fullscreen is unavailable.
    try {
      if (root.requestFullscreen && document.fullscreenEnabled) await root.requestFullscreen();
    } catch (_) { /* The in-page fullscreen layout remains usable. */ }
    pending = false;
    if (active) {
      window.scrollTo(0, 0);
      exit.focus({preventScroll: true});
    }
  }
  button.addEventListener('click', () => active ? leave() : enter());
  exit.addEventListener('click', leave);
  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement && active && !pending) restore();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && active && !document.fullscreenElement) leave();
  });
  update();
})();
