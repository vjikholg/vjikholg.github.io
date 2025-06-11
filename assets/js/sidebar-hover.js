/* sidebar-hover.js  — coordinate-only version */
(() => {
  const HOTZONE     =  40;   // px from left-edge that opens
  const SIDEBAR_W   = 280;   // actual sidebar width
  const BUFFER      =  20;   // extra breathing room before closing
  const DELAY_MS    = 300;   // grace period before hiding

  let hideTimer = null;

  const open = () => {
    clearTimeout(hideTimer);
    document.body.classList.add('sidebar-open');
  };

  const closeWithDelay = () => {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      document.body.classList.remove('sidebar-open');
    }, DELAY_MS);
  };

  document.addEventListener('mousemove', e => {
    const x = e.clientX;

    if (x < HOTZONE) {        // pointer hugs left edge → open immediately
      open();
      return;
    }

    // pointer farther right than sidebar+buffer → schedule close
    if (x > SIDEBAR_W + BUFFER &&
        document.body.classList.contains('sidebar-open')) {
      closeWithDelay();
    }
  });
})();