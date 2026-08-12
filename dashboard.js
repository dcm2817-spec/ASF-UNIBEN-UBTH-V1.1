async function render() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return; // protect.js already redirects

  const { data: me } = await sb.from('members').select('role, led_group').eq('id', session.user.id).single();
  const scopeLabel = document.getElementById('scope-label');

  if (!me) {
    scopeLabel.textContent = 'Could not load your role.';
    return;
  }

  if (me.role === 'leader' && !me.led_group) {
    scopeLabel.textContent = 'No group has been assigned to you yet -- ask the GS/AGS to assign one.';
    document.getElementById('stat-total').textContent = '0';
    document.getElementById('stat-today').textContent = '0';
    document.getElementById('stat-inactive').textContent = '0';
    document.getElementById('inactive-list').innerHTML = '<p class="hint">Nothing to show yet.</p>';
    return;
  }

  scopeLabel.textContent = me.role === 'admin' ? 'Fellowship-wide' : `Showing: ${me.led_group}`;

  // RLS scopes this automatically: leaders see only their group, admins see everyone.
  const { data: members } = await sb.from('members').select('id, full_name');
  const groupMembers = members || [];
  document.getElementById('stat-total').textContent = groupMembers.length;

  // ---------- Attendance today ----------
  const today = new Date().toISOString().slice(0, 10);
  const { data: todaysEvents } = await sb.from('events').select('id').eq('date', today);
  const todaysEventIds = new Set((todaysEvents || []).map((e) => e.id));

  const { data: allAttendance } = await sb.from('attendance').select('member_id, event_id');
  const presentTodayIds = new Set(
    (allAttendance || []).filter((r) => todaysEventIds.has(r.event_id)).map((r) => r.member_id)
  );
  document.getElementById('stat-today').textContent = presentTodayIds.size;

  // ---------- Inactive (attendance % below 50, core Wed/Fri events only) ----------
  const { data: coreEventsAll } = await sb.from('events')
    .select('id')
    .in('type', ['Wednesday Service', 'Friday Service']);
  const totalCoreEvents = (coreEventsAll || []).length;
  const coreEventIds = new Set((coreEventsAll || []).map((e) => e.id));

  const coreAttendedByMember = {};
  (allAttendance || []).forEach((r) => {
    if (!coreEventIds.has(r.event_id)) return;
    coreAttendedByMember[r.member_id] = (coreAttendedByMember[r.member_id] || 0) + 1;
  });

  const withPct = groupMembers
    .map((m) => {
      const attended = coreAttendedByMember[m.id] || 0;
      const pct = totalCoreEvents > 0 ? Math.round((attended / totalCoreEvents) * 100) : null;
      return { name: m.full_name || '(no name)', pct };
    })
    .filter((m) => m.pct !== null);

  const inactive = withPct.filter((m) => m.pct < 50);
  document.getElementById('stat-inactive').textContent = inactive.length;

  const top5 = [...withPct].sort((a, b) => a.pct - b.pct).slice(0, 5);
  const list = document.getElementById('inactive-list');
  if (top5.length === 0) {
    list.innerHTML = '<p class="hint">No attendance data yet.</p>';
  } else {
    list.innerHTML = top5.map((m) => `
      <div class="inactive-row">
        <span>${m.name}</span>
        <span class="hint">${m.pct}%</span>
      </div>
    `).join('');
  }
}

render();
