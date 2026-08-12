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

  // Core (Wed/Fri) events, for attendance % -- same logic as the admin Attendance page.
  const { data: coreEventsAll } = await sb.from('events')
    .select('id, date, type')
    .in('type', ['Wednesday Service', 'Friday Service'])
    .order('date', { ascending: false });
  const totalCoreEvents = (coreEventsAll || []).length;
  const last3CoreIds = new Set((coreEventsAll || []).slice(0, 3).map((e) => e.id));
  const coreEventIds = new Set((coreEventsAll || []).map((e) => e.id));

  // Attendance rows -- RLS already limits this to the leader's scoped members.
  const { data: rows } = await sb.from('attendance').select('member_id, event_id');

  const byMember = {};
  (rows || []).forEach((r) => {
    if (!byMember[r.member_id]) byMember[r.member_id] = { coreAttended: 0, hitLast3Core: false };
    if (coreEventIds.has(r.event_id)) byMember[r.member_id].coreAttended += 1;
    if (last3CoreIds.has(r.event_id)) byMember[r.member_id].hitLast3Core = true;
  });

  const enoughCoreHistory = totalCoreEvents >= 3;

  if (groupMembers.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="hint">No members in this group yet.</td></tr>';
    return;
  }

  tbody.innerHTML = groupMembers.map((m) => {
    const stats = byMember[m.id] || { coreAttended: 0, hitLast3Core: false };
    const pct = totalCoreEvents > 0 ? Math.round((stats.coreAttended / totalCoreEvents) * 100) : null;
    const isInactive = pct !== null && pct < 50;
    const missedLast3 = enoughCoreHistory && !stats.hitLast3Core;

    const badges = [];
    if (isInactive) badges.push('<span class="flag-missed">Inactive</span>');
    if (missedLast3) badges.push('<span class="flag-missed">Missed last 3</span>');
    if (badges.length === 0) badges.push('<span class="hint">OK</span>');

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
