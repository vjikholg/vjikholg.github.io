/* sidebar-hover.js  — coordinate-only version */
(() => {
  const HOTZONE     =  300;   // px from left-edge that opens
  const SIDEBAR_W   = 300;   // actual sidebar width
  const BUFFER      =  20;   // extra breathing room before closing
  const DELAY_MS    = 300;   // grace period before hiding
  const STORAGE_KEY = 'sidebarOpen';

  let hideTimer = null;
  let first = true; 


  const open = () => {
    clearTimeout(hideTimer);
    document.body.classList.add('sidebar-open');
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  const closeWithDelay = () => {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      document.body.classList.remove('sidebar-open');
      localStorage.setItem(STORAGE_KEY, 'false'); 
    }, DELAY_MS);
  };

  const initOpen = () => { 
    if (first) {
      clearTimeout(hideTimer); 
      document.body.classList.add('sidebar-open'); 
      first = false; 
    }
    closeWithDelay()
  }


  window.addEventListener("load", (event) => {
    document.body.classList.add('sidebar-open');

    setTimeout(() => {
      document.body.classList.add('sidebar-animated');
    }, 0)
  })

  document.addEventListener('mousemove', e => {
    initOpen();

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