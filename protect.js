// Include on pages that require sign-in. Optionally set window.REQUIRE_ADMIN = true
// before this script runs (in the page's inline script block) to also require admin role.
async function protectPage() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) {
    window.location.href = 'register.html';
    return;
  }
  if (window.REQUIRE_ADMIN) {
    const { data: member } = await sb.from('members').select('role').eq('id', session.user.id).single();
    if (!member || member.role !== 'admin') {
      window.location.href = 'index.html';
    }
  }
}

protectPage();
