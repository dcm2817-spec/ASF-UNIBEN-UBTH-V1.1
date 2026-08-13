// Runs on every page. Expects the navbar markup with these ids to be present:
// #nav-ministry, #nav-chat, #nav-admin, #nav-auth-slot
async function initNav() {
  const { data: { session } } = await sb.auth.getSession();
  const user = session ? session.user : null;

  const ministryLink = document.getElementById('nav-ministry');
  const chatLink = document.getElementById('nav-chat');
  const announcementsLink = document.getElementById('nav-announcements');
  const messagesLink = document.getElementById('nav-messages');
  const profileLink = document.getElementById('nav-profile');
  const adminLink = document.getElementById('nav-admin');
  const authSlot = document.getElementById('nav-auth-slot');

  if (ministryLink) ministryLink.style.display = user ? 'inline-block' : 'none';
  if (chatLink) chatLink.style.display = user ? 'inline-block' : 'none';
  if (announcementsLink) announcementsLink.style.display = user ? 'inline-block' : 'none';
  if (messagesLink) messagesLink.style.display = user ? 'inline-block' : 'none';
  if (profileLink) profileLink.style.display = user ? 'inline-block' : 'none';

  let isAdmin = false;
  if (user) {
    const { data: member } = await sb.from('members').select('role').eq('id', user.id).single();
    isAdmin = member && member.role === 'admin';
    if (adminLink) adminLink.style.display = isAdmin ? 'inline-block' : 'none';

    if (authSlot) {
      authSlot.innerHTML = '<button class="btn btn-outline" id="sign-out-btn">Sign out</button>';
      document.getElementById('sign-out-btn').addEventListener('click', async () => {
        await sb.auth.signOut();
        window.location.href = 'index.html';
      });
    }
  } else {
    if (adminLink) adminLink.style.display = 'none';
    if (authSlot) {
      authSlot.innerHTML = '<a class="btn btn-primary" href="register.html">Register / Sign in</a>';
    }
  }

  // Highlight the current page's nav link
  const current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navbar nav a').forEach((a) => {
    if (a.getAttribute('href') === current) a.classList.add('active');
  });

  initDarkModeToggle(authSlot);
  injectBottomTabs(user, current);
}

// ---------- Dark mode ----------
function initDarkModeToggle(authSlot) {
  const saved = localStorage.getItem('asf-theme');
  if (saved === 'dark') document.documentElement.classList.add('dark');

  const btn = document.createElement('button');
  btn.textContent = document.documentElement.classList.contains('dark') ? '☀️' : '🌙';
  btn.setAttribute('aria-label', 'Toggle dark mode');
  btn.style.cssText = 'border:none; background:none; font-size:1.1rem; cursor:pointer; margin-right:0.4rem; padding:0.2rem 0.4rem;';
  btn.addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('asf-theme', isDark ? 'dark' : 'light');
    btn.textContent = isDark ? '☀️' : '🌙';
  });

  const navEl = document.querySelector('.navbar nav');
  if (navEl) navEl.insertBefore(btn, authSlot || null);
}

// ---------- Bottom tab bar (mobile only, CSS controls visibility) ----------
function injectBottomTabs(user, current) {
  if (document.querySelector('.bottom-tabs')) return;
  const tabs = [
    { href: 'index.html', icon: '🏠', label: 'Home' },
    { href: 'leadership.html', icon: '👥', label: 'Leaders' },
    { href: 'messages.html', icon: '✉️', label: 'Messages', needsAuth: true },
    { href: 'chat.html', icon: '💬', label: 'Ask ASF', needsAuth: true },
    { href: 'profile.html', icon: '👤', label: 'Profile', needsAuth: true },
  ];
  const bar = document.createElement('nav');
  bar.className = 'bottom-tabs';
  bar.innerHTML = tabs
    .filter((t) => !t.needsAuth || user)
    .map((t) => `
      <a href="${t.href}" class="${t.href === current ? 'active' : ''}">
        <span class="tab-icon">${t.icon}</span>${t.label}
      </a>
    `).join('');
  document.body.appendChild(bar);
}

// ---------- Ripple effect (delegated, works on dynamically-added buttons too) ----------
document.addEventListener('click', (e) => {
  const el = e.target.closest('.btn, .present-btn, .assign-btn, .complete-btn, .tab-btn, .promote-admin-btn, .promote-leader-btn, .demote-btn, .demote-to-leader-btn, .suggest-btn, .cycle-btn, .copy-btn');
  if (!el) return;
  el.classList.add('ripple-el');
  const rect = el.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const dot = document.createElement('span');
  dot.className = 'ripple-dot';
  dot.style.width = dot.style.height = size + 'px';
  dot.style.left = (e.clientX - rect.left - size / 2) + 'px';
  dot.style.top = (e.clientY - rect.top - size / 2) + 'px';
  el.appendChild(dot);
  setTimeout(() => dot.remove(), 500);
});

// ---------- Confetti (light, no library) ----------
function burstConfetti() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const colors = ['#7A1D1D', '#C9962F', '#166534', '#FBF6EE'];
  for (let i = 0; i < 24; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random() * 100 + 'vw';
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDelay = (Math.random() * 0.3) + 's';
    piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 1700);
  }
}
window.burstConfetti = burstConfetti;

initNav();
