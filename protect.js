// Include on pages that require sign-in. Optionally set window.REQUIRE_ADMIN = true
// to require admin only, window.REQUIRE_ROLES = ['leader', 'admin'] to allow any of
// a set of roles, or window.REQUIRE_PERMISSION = 'mark_attendance' to allow admins
// plus anyone specifically granted that permission (before this script runs).
async function protectPage() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) {
    window.location.href = 'register.html';
    return;
  }
  if (window.REQUIRE_ADMIN || window.REQUIRE_ROLES || window.REQUIRE_PERMISSION) {
    const { data: member } = await sb.from('members').select('role, permissions').eq('id', session.user.id).single();
    const role = member ? member.role : null;
    const permissions = (member && member.permissions) || [];

    if (window.REQUIRE_ADMIN && role !== 'admin') {
      window.location.href = 'index.html';
      return;
    }
    if (window.REQUIRE_ROLES && !window.REQUIRE_ROLES.includes(role)) {
      window.location.href = 'index.html';
      return;
    }
    if (window.REQUIRE_PERMISSION && role !== 'admin' && !permissions.includes(window.REQUIRE_PERMISSION)) {
      window.location.href = 'index.html';
    }
  }
}

protectPage();
