// Lightweight toast notifications. Usage: showToast('Saved!', 'success')
// Types: 'success' (green), 'error' (red), 'info' (default, oxblood)
function ensureToastContainer() {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = 'position:fixed; bottom:1rem; left:50%; transform:translateX(-50%); z-index:200; display:flex; flex-direction:column; gap:0.5rem; align-items:center; pointer-events:none;';
    document.body.appendChild(container);
  }
  return container;
}

function showToast(message, type) {
  type = type || 'info';
  const colors = {
    success: { bg: '#166534', text: '#ffffff' },
    error: { bg: '#b91c1c', text: '#ffffff' },
    info: { bg: '#4A0F0F', text: '#FBF6EE' },
  };
  const c = colors[type] || colors.info;

  const container = ensureToastContainer();
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.cssText = `
    background:${c.bg}; color:${c.text}; padding:0.6rem 1.1rem; border-radius:999px;
    font-size:0.9rem; box-shadow:0 4px 14px rgba(0,0,0,0.2);
    opacity:0; transform:translateY(8px); transition:opacity 0.25s ease, transform 0.25s ease;
  `;
  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });

  // Swipe-to-dismiss (horizontal drag)
  let startX = null;
  toast.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
  toast.addEventListener('touchmove', (e) => {
    if (startX === null) return;
    const dx = e.touches[0].clientX - startX;
    toast.style.transform = `translate(${dx}px, 0)`;
    toast.style.opacity = String(1 - Math.min(Math.abs(dx) / 120, 0.9));
  }, { passive: true });
  toast.addEventListener('touchend', (e) => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 60) {
      toast.style.transform = `translate(${dx > 0 ? 200 : -200}px, 0)`;
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 200);
    } else {
      toast.style.transform = 'translateY(0)';
      toast.style.opacity = '1';
    }
    startX = null;
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(8px)';
    setTimeout(() => toast.remove(), 250);
  }, 2200);
}
