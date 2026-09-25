/* Keep the small pre-play explanation out of active Fraction Breaker rounds. */
(() => {
  const note = document.getElementById('fractionLearning');
  const start = document.getElementById('startBtn');
  if (!note || !start) return;
  const sync = () => { note.hidden = start.classList.contains('hidden'); };
  new MutationObserver(sync).observe(start, {attributes: true, attributeFilter: ['class']});
  sync();
})();
