console.log('hover-script booted');

(() => {
  const HOTZONE = 40;      // px from left where hover activates
  let open = false;

  document.addEventListener('mousemove', e => {
    const shouldOpen = e.clientX < HOTZONE;
    if (shouldOpen !== open) {
      open = shouldOpen;
      document.body.classList.toggle('sidebar-open', open);
    }
  });
})();