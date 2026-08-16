async function render() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return; // protect.js already redirects

  const { data: me } = await sb.from('members').select('role, led_group').eq('id', session.user.id).single();
  const label = document.getElementById('group-label');
  const tbody = document.getElementById('group-tbody');

  if (!me) {
    label.textContent = 'Could not load your role.';
    tbody.innerHTML = '';
    return;
  }

  if (me.role === 'admin') {
    label.textContent = "You're an admin -- use the Admin and Attendance pages for full fellowship-wide access.";
    tbody.innerHTML = '';
    return;
  }

  if (!me.led_group) {
    label.textContent = 'No group has been assigned to you yet -- ask the GS/AGS to assign one from the Admin page.';
    tbody.innerHTML = '';
    return;
  }

  label.textContent = `Showing: ${me.led_group}`;

  // RLS automatically limits this to members in the leader's scoped group.
  const { data: members } = await sb.from('members').select('*');
  const groupMembers = members || [];

  // Pulls one pre-aggregated row per member from the database instead of
  // every raw attendance row -- keeps this fast as history builds up.
  const { data: coreCountRow } = await sb.from('core_event_count').select('total').single();
  const totalCoreEvents = coreCountRow ? coreCountRow.total : 0;

  const { data: statsRows } = await sb.from('member_core_attendance')
    .select('member_id, core_attended, hit_last_3_core');
  const byMember = {};
  (statsRows || []).forEach((r) => {
    byMember[r.member_id] = { coreAttended: r.core_attended, hitLast3Core: r.hit_last_3_core };
  });

  const enoughCoreHistory = totalCoreEvents >= 3;

  if (groupMembers.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="hint">No members in this group yet.</td></tr>';
    return;
  }

  // Leaders only see members flagged inactive or who missed the last 3 core
  // services -- not the full active roster. This keeps their view focused
  // on who needs attention, rather than general member browsing.
  const rowsData = groupMembers.map((m) => {
    const stats = byMember[m.id] || { coreAttended: 0, hitLast3Core: false };
    const pct = totalCoreEvents > 0 ? Math.round((stats.coreAttended / totalCoreEvents) * 100) : null;
    const isInactive = pct !== null && pct < 50;
    const missedLast3 = enoughCoreHistory && !stats.hitLast3Core;
    return { m, pct, isInactive, missedLast3 };
  });

  const visibleRows = rowsData.filter((r) => r.isInactive || r.missedLast3);

  if (visibleRows.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="hint">Everyone in your group is active. Nothing needs attention right now.</td></tr>';
    return;
  }

  tbody.innerHTML = visibleRows.map(({ m, pct, isInactive, missedLast3 }) => {
    const badges = [];
    if (isInactive) badges.push('<span class="badge badge-inactive">Inactive</span>');
    if (missedLast3) badges.push('<span class="badge badge-pending">Missed last 3</span>');

    return `
      <tr>
        <td>${m.full_name || ''}</td>
        <td>${m.department || ''}</td>
        <td>${m.level || ''}</td>
        <td>${pct === null ? '—' : pct + '%'}</td>
        <td>${badges.join(' ')}</td>
      </tr>
    `;
  }).join('');
}

render();
