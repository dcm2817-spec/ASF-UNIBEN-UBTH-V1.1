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
  const list = document.getElementById('followups-list');

  const { data: followUps } = await sb.from('follow_ups')
    .select('*')
    .order('date_created', { ascending: false });

  if (!followUps || followUps.length === 0) {
    list.innerHTML = '<p class="hint">No follow-ups yet.</p>';
    return;
  }

  // Look up member + leader names in one go.
  const ids = [...new Set(followUps.flatMap((f) => [f.member_id, f.assigned_leader_id]))];
  const { data: people } = await sb.from('members').select('id, full_name').in('id', ids);
  const nameMap = {};
  (people || []).forEach((p) => { nameMap[p.id] = p.full_name || '(no name)'; });

  list.innerHTML = followUps.map((f) => {
    const canComplete = f.status === 'pending' && (iAmAdmin || f.assigned_leader_id === myId);
    const badgeHtml = f.status === 'completed'
      ? '<span class="badge badge-active">Completed</span>'
      : '<span class="badge badge-pending">Pending</span>';
    const actionHtml = canComplete
      ? `<button class="complete-btn btn btn-solid" data-id="${f.id}" style="margin-top:0.5rem; padding:0.35rem 0.9rem; font-size:0.85rem;">Mark as Completed</button>`
      : '';
    const completedLine = f.date_completed
      ? `<p class="hint" style="margin:0.2rem 0 0;">Completed ${new Date(f.date_completed).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>`
      : '';

    return `
      <div class="card" style="margin-bottom:0.6rem;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <p style="margin:0; font-weight:600; color:var(--oxblood);">${nameMap[f.member_id] || '(unknown)'}</p>
          ${badgeHtml}
        </div>
        <p class="hint" style="margin:0.3rem 0 0;">Assigned to: ${nameMap[f.assigned_leader_id] || '(unknown)'}</p>
        <p class="hint" style="margin:0.2rem 0 0;">Created ${new Date(f.date_created).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
        ${completedLine}
        ${actionHtml}
      </div>
    `;
  }).join('');

  list.querySelectorAll('.complete-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      await sb.from('follow_ups')
        .update({ status: 'completed', date_completed: new Date().toISOString() })
        .eq('id', btn.dataset.id);
      showToast('Follow-up marked completed ✔', 'success');
      loadFollowUps();
    });
  });
}

render();
