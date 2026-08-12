let myId = null;
let iAmAdmin = false;

async function render() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return; // protect.js already redirects
  myId = session.user.id;

  const { data: me } = await sb.from('members').select('role').eq('id', myId).single();
  iAmAdmin = me && me.role === 'admin';
  document.getElementById('scope-label').textContent = iAmAdmin
    ? 'All follow-ups (admin view).'
    : 'Follow-ups assigned to you.';

  await loadFollowUps();
}

async function loadFollowUps() {
  const tbody = document.getElementById('followups-tbody');

  const { data: followUps } = await sb.from('follow_ups')
    .select('*')
    .order('date_created', { ascending: false });

  if (!followUps || followUps.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="hint">No follow-ups yet.</td></tr>';
    return;
  }

  // Look up member + leader names in one go.
  const ids = [...new Set(followUps.flatMap((f) => [f.member_id, f.assigned_leader_id]))];
  const { data: people } = await sb.from('members').select('id, full_name').in('id', ids);
  const nameMap = {};
  (people || []).forEach((p) => { nameMap[p.id] = p.full_name || '(no name)'; });

  tbody.innerHTML = followUps.map((f) => {
    const canComplete = f.status === 'pending' && (iAmAdmin || f.assigned_leader_id === myId);
    const statusHtml = f.status === 'completed'
      ? '<span class="status-completed">Completed</span>'
      : '<span class="status-pending">Pending</span>';
    const actionHtml = canComplete
      ? `<button class="complete-btn" data-id="${f.id}" style="border:none; background:none; color:var(--oxblood); text-decoration:underline; cursor:pointer; font-size:0.85rem;">Mark as Completed</button>`
      : '';

    return `
      <tr>
        <td>${nameMap[f.member_id] || '(unknown)'}</td>
        <td>${nameMap[f.assigned_leader_id] || '(unknown)'}</td>
        <td>${statusHtml}</td>
        <td>${new Date(f.date_created).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
        <td>${f.date_completed ? new Date(f.date_completed).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</td>
        <td>${actionHtml}</td>
      </tr>
    `;
  }).join('');

  tbody.querySelectorAll('.complete-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      await sb.from('follow_ups')
        .update({ status: 'completed', date_completed: new Date().toISOString() })
        .eq('id', btn.dataset.id);
      loadFollowUps();
    });
  });
}

render();
