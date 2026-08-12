async function render() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return; // protect.js already redirects

  const { data: me } = await sb.from('members').select('role, led_group').eq('id', session.user.id).single();
  const scopeLabel = document.getElementById('scope-label');
  window.iAmAdmin = me && me.role === 'admin';

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
      return { id: m.id, name: m.full_name || '(no name)', pct };
    })
    .filter((m) => m.pct !== null);

  const inactive = withPct.filter((m) => m.pct < 50);
  document.getElementById('stat-inactive').textContent = inactive.length;

  const top5 = [...withPct].sort((a, b) => a.pct - b.pct).slice(0, 5);
  const list = document.getElementById('inactive-list');
  if (top5.length === 0) {
    list.innerHTML = '<p class="hint">No attendance data yet.</p>';
    return;
  }

  if (!window.iAmAdmin) {
    // Leaders see the list only -- assignment is an admin-only action.
    list.innerHTML = top5.map((m) => `
      <div class="inactive-row">
        <span>${m.name}</span>
        <span class="hint">${m.pct}%</span>
      </div>
    `).join('');
    return;
  }

  // Admin view: check which of these 5 already have a pending follow-up.
  const top5Ids = top5.map((m) => m.id);
  const { data: existingFollowUps } = await sb.from('follow_ups')
    .select('member_id')
    .in('member_id', top5Ids)
    .eq('status', 'pending');
  const alreadyAssigned = new Set((existingFollowUps || []).map((f) => f.member_id));

  const { data: leaders } = await sb.from('members').select('id, full_name').eq('role', 'leader');
  const leaderOptions = (leaders || [])
    .map((l) => `<option value="${l.id}">${l.full_name || '(no name)'}</option>`)
    .join('');

  list.innerHTML = top5.map((m) => `
    <div class="inactive-row" style="flex-direction:column; align-items:stretch; gap:0.4rem;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span>${m.name}</span>
        <span class="hint">${m.pct}%</span>
      </div>
      <div class="followup-action" data-member-id="${m.id}">
        ${alreadyAssigned.has(m.id)
          ? '<span class="hint" style="color:#166534;">Assigned &#9989;</span>'
          : `
            <select class="leader-select" style="font-size:0.85rem; padding:0.3rem;">
              <option value="" disabled selected>Select leader&hellip;</option>
              ${leaderOptions}
            </select>
            <button class="assign-btn btn btn-outline" style="border-color:var(--oxblood); color:var(--oxblood); padding:0.25rem 0.7rem; font-size:0.8rem;">Follow Up</button>
          `}
      </div>
    </div>
  `).join('');

  list.querySelectorAll('.assign-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const wrapper = btn.closest('.followup-action');
      const memberId = wrapper.dataset.memberId;
      const select = wrapper.querySelector('.leader-select');
      const leaderId = select.value;
      if (!leaderId) {
        alert('Pick a leader first.');
        return;
      }
      const { error } = await sb.from('follow_ups').insert({
        member_id: memberId,
        assigned_leader_id: leaderId,
      });
      if (error) {
        alert(error.message.includes('duplicate') || error.message.includes('unique')
          ? 'This member already has a pending follow-up.'
          : error.message);
        return;
      }
      wrapper.innerHTML = '<span class="hint" style="color:#166534;">Assigned &#9989;</span>';
    });
  });
}

render();
