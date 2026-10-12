(() => {
  const host = document.getElementById('storyStage') || document.getElementById('reader') || document.getElementById('stage');
  if (!host) return;

  let startX = 0;
  let startY = 0;
  let tracking = false;
  let suppressClickUntil = 0;
  const threshold = 50;

  host.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) return;
    tracking = true;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }, { passive: true });

  host.addEventListener('touchend', (e) => {
    if (!tracking || !e.changedTouches.length) return;
    tracking = false;
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;

    // Leave vertical gestures alone so long story pages still scroll normally.
    if (Math.abs(dx) < threshold || Math.abs(dx) <= Math.abs(dy) * 1.2) return;

    suppressClickUntil = Date.now() + 500;

    if (dx < 0) {
      // Swipe left: use each reader's existing next-page behaviour.
      if (typeof forward === 'function') forward();
      else if (typeof next === 'function') next();
    } else {
      // Swipe right: use the existing current-page state and show function.
      if (typeof show === 'function') {
        if (typeof current !== 'undefined' && current > 0) show(current - 1);
        else if (typeof i !== 'undefined' && i > 0) show(i - 1);
      }
    }
  }, { passive: true });

  // Mobile browsers may emit a click after a swipe; stop that becoming a second page turn.
  document.addEventListener('click', (e) => {
    if (Date.now() < suppressClickUntil) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  }, true);
})();
