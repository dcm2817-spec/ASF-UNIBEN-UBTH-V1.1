// Runs on every page. Expects the navbar markup with these ids to be present:
// #nav-ministry, #nav-chat, #nav-admin, #nav-auth-slot
async function initNav() {
  const { data: { session } } = await sb.auth.getSession();
  const user = session ? session.user : null;

  const ministryLink = document.getElementById('nav-ministry');
  const chatLink = document.getElementById('nav-chat');
  const announcementsLink = document.getElementById('nav-announcements');
  const profileLink = document.getElementById('nav-profile');
  const adminLink = document.getElementById('nav-admin');
  const authSlot = document.getElementById('nav-auth-slot');

  if (ministryLink) ministryLink.style.display = user ? 'inline-block' : 'none';
  if (chatLink) chatLink.style.display = user ? 'inline-block' : 'none';
  if (announcementsLink) announcementsLink.style.display = user ? 'inline-block' : 'none';
  if (profileLink) profileLink.style.display = user ? 'inline-block' : 'none';

  if (user) {
    const { data: member } = await sb.from('members').select('role').eq('id', user.id).single();
    const isAdmin = member && member.role === 'admin';
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
}

initNav();
