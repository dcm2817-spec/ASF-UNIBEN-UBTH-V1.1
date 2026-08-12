// Include on pages that require sign-in. Optionally set window.REQUIRE_ADMIN = true
// to require admin only, or window.REQUIRE_ROLES = ['leader', 'admin'] to allow
// any of a set of roles (before this script runs, in the page's inline script block).
async function protectPage() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) {
    window.location.href = 'register.html';
    return;
  }
  if (window.REQUIRE_ADMIN || window.REQUIRE_ROLES) {
    const { data: member } = await sb.from('members').select('role').eq('id', session.user.id).single();
    const role = member ? member.role : null;
    if (window.REQUIRE_ADMIN && role !== 'admin') {
      window.location.href = 'index.html';
      return;
    }
    if (window.REQUIRE_ROLES && !window.REQUIRE_ROLES.includes(role)) {
      window.location.href = 'index.html';
    }
  }
}

protectPage();
