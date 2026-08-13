// Usage: initPullToRefresh(document.getElementById('some-list'), async () => { ...reload... });
// Only triggers when the page is scrolled to the very top.
function initPullToRefresh(container, onRefresh) {
  const indicator = document.createElement('div');
  indicator.className = 'ptr-indicator';
  indicator.textContent = '↓ Pull to refresh';
  container.parentNode.insertBefore(indicator, container);

  let startY = null;
  let pulling = false;

  window.addEventListener('touchstart', (e) => {
    if (window.scrollY === 0) startY = e.touches[0].clientY;
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (startY === null) return;
    const dy = e.touches[0].clientY - startY;
    if (dy > 40 && window.scrollY === 0) {
      pulling = true;
      indicator.style.height = '1.6rem';
      indicator.textContent = dy > 90 ? '↑ Release to refresh' : '↓ Pull to refresh';
    }
  }, { passive: true });

  window.addEventListener('touchend', async (e) => {
    if (pulling) {
      const dy = (e.changedTouches[0].clientY - startY);
      indicator.style.height = '0';
      if (dy > 90) {
        indicator.textContent = 'Refreshing…';
        indicator.style.height = '1.6rem';
        await onRefresh();
        setTimeout(() => { indicator.style.height = '0'; }, 400);
      }
    }
    startY = null;
    pulling = false;
  });
}
