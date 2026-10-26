/* Opt-in recording mode. Normal site behaviour is untouched unless ?showcase=1. */
(function () {
  'use strict';
  if (new URLSearchParams(window.location.search).get('showcase') !== '1') return;

  const page = window.location.pathname.toLowerCase().split('/').pop();
  if (page !== 'practice.html' && page !== 'games.html') return;
  const isPractice = page === 'practice.html';
  const root = document.documentElement;
  root.classList.add('showcase-active', isPractice ? 'showcase-practice' : 'showcase-games');

  // Use the actual Practice-page data, not a copied list: new apps appear automatically.
  if (isPractice && typeof areaData !== 'undefined') {
    const main = document.querySelector('main');
    const intro = main && main.querySelector('.intro');
    if (main && intro) {
      const catalog = document.createElement('div');
      catalog.className = 'showcase-catalog';
      catalog.setAttribute('aria-label', 'Full practice app library');
      Object.values(areaData).forEach(group => {
        const section = document.createElement('section');
        section.className = 'showcase-subject';
        section.style.setProperty('--accent', group.accent);
        if (group.symbolInk) section.style.setProperty('--symbol-ink', group.symbolInk);
        const heading = document.createElement('div');
        heading.className = 'showcase-subject-title';
        const name = document.createElement('h2');
        name.textContent = group.title + ' Practice';
        const cards = document.createElement('div');
        cards.className = 'concept-list';
        cards.innerHTML = group.html;
        const count = document.createElement('span');
        const total = cards.querySelectorAll('a.concept-card').length;
        count.textContent = total + (total === 1 ? ' app' : ' apps');
        heading.append(name, count);
        section.append(heading, cards);
        catalog.append(section);
      });
      intro.insertAdjacentElement('afterend', catalog);
    }
  }

  const panel = document.createElement('div');
  panel.className = 'showcase-controls';
  panel.setAttribute('role', 'region');
  panel.setAttribute('aria-label', 'Showcase recording controls');
  panel.innerHTML = `
    <div class="showcase-controls-header"><span class="showcase-controls-name">✦ SHOWCASE MODE</span><span class="showcase-controls-type">${isPractice ? 'PRACTICE LIBRARY' : 'GAME LIBRARY'}</span></div>
    <p class="showcase-controls-help">Automatic, even-paced scrolling for your phone screen recording. Controls disappear when you start.</p>
    <label for="showcase-direction">Scroll direction</label>
    <select id="showcase-direction">
      <option value="down" selected>↓ Top to bottom</option>
      <option value="up">↑ Bottom to top</option>
    </select>
    <label for="showcase-speed" class="showcase-speed-label">Scrolling speed</label>
    <select id="showcase-speed">
      <option value="45">Slow — best for reading</option>
      <option value="75" selected>Medium — smooth showcase</option>
      <option value="115">Fast — quick overview</option>
    </select>
    <div class="showcase-controls-actions">
      <button type="button" class="showcase-start">▶ Start scrolling</button>
      <button type="button" class="showcase-restart">↺ Restart</button>
      <a class="showcase-switch" href="${isPractice ? 'games.html' : 'practice.html'}?showcase=1">View ${isPractice ? 'games' : 'practice'} library</a>
      <a class="showcase-exit" href="${page}">Exit</a>
    </div>
    <div class="showcase-controls-tip">Choose a direction and speed, then start recording. Tap Start to scroll from that end of the page. Tap anywhere to pause; tap Start to resume. Restart begins again from the selected end.</div>`;
  const tap = document.createElement('button');
  tap.type = 'button';
  tap.className = 'showcase-tap-layer';
  tap.setAttribute('aria-label', 'Pause scrolling and show recording controls');
  document.body.append(panel, tap);

  const directionSelect = panel.querySelector('#showcase-direction');
  const speedSelect = panel.querySelector('#showcase-speed');
  const startButton = panel.querySelector('.showcase-start');
  const restartButton = panel.querySelector('.showcase-restart');
  const playing = () => root.classList.contains('showcase-playing');
  let raf = 0;
  let delayTimer = 0;
  let previousTime = null;
  let exactY = 0;
  let finished = false;
  let startedOnce = false;
  const isUpward = () => directionSelect.value === 'up';
  const edgeY = () => isUpward()
    ? Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
    : 0;
  const edgeLabel = () => isUpward() ? 'bottom' : 'top';

  function stop(showControls = true) {
    window.cancelAnimationFrame(raf);
    window.clearTimeout(delayTimer);
    raf = 0;
    delayTimer = 0;
    previousTime = null;
    if (showControls) {
      root.classList.remove('showcase-playing');
      startButton.textContent = finished ? `↺ Replay from ${edgeLabel()}` : '▶ Resume scrolling';
    }
  }

  function step(now) {
    if (!playing()) return;
    if (previousTime == null) previousTime = now;
    const delta = Math.min(100, Math.max(0, now - previousTime));
    previousTime = now;
    const maximum = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const direction = isUpward() ? -1 : 1;
    const nextY = exactY + direction * (Number(speedSelect.value) || 75) * delta / 1000;
    exactY = Math.min(maximum, Math.max(0, nextY));
    window.scrollTo(0, exactY);
    if ((isUpward() && exactY <= 0.5) || (!isUpward() && exactY >= maximum - 0.5)) {
      finished = true;
      stop(false); // The recording remains visually clean at the end.
      return;
    }
    raf = window.requestAnimationFrame(step);
  }

  function start(fromBeginning) {
    stop(false);
    startedOnce = true;
    if (fromBeginning) {
      exactY = edgeY();
      window.scrollTo(0, exactY);
      finished = false;
    } else {
      exactY = window.scrollY;
    }
    startButton.textContent = '▶ Resume scrolling';
    root.classList.add('showcase-playing');
    // A brief static opening gives the viewer a clean moment before the motion.
    delayTimer = window.setTimeout(() => {
      previousTime = null;
      raf = window.requestAnimationFrame(step);
    }, fromBeginning ? 1800 : 250);
  }

  directionSelect.addEventListener('change', () => {
    // Changing direction prepares a new run from the correct end of the page.
    stop(true);
    startedOnce = false;
    finished = false;
    exactY = edgeY();
    window.scrollTo(0, exactY);
    startButton.textContent = '▶ Start scrolling';
  });
  startButton.addEventListener('click', () => start(!startedOnce || finished));
  restartButton.addEventListener('click', () => start(true));
  tap.addEventListener('click', () => {
    if (!playing()) return;
    stop(true);
  });
  window.addEventListener('pagehide', () => stop(false));
})();
