let myId = null;
let iAmAdmin = false;
const templateIndex = {};

function messageTemplates(name) {
  return [
    `Hi ${name}, we noticed you haven't been active in recent services. We just wanted to check on you and see how you're doing. Hope to see you soon \uD83D\uDE4F`,
    `Hi ${name}, hope you're doing well. We've missed you in recent meetings and wanted to check in. Looking forward to seeing you soon \uD83D\uDE4F`,
    `Hi ${name}, just checking on you. We believe everything is okay and we'd love to see you again in fellowship. Stay blessed \uD83D\uDE4F`,
  ];
}

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
    const memberName = nameMap[f.member_id] || '(unknown)';
    const suggestBtnHtml = canComplete
      ? `<button class="suggest-btn btn btn-outline" data-id="${f.id}" data-name="${memberName}" style="border-color:var(--oxblood); color:var(--oxblood); padding:0.3rem 0.8rem; font-size:0.8rem; margin-right:0.4rem;">&#9993; Suggested Message</button>`
      : '';
    const actionHtml = canComplete
      ? `<button class="complete-btn btn btn-solid" data-id="${f.id}" style="padding:0.35rem 0.9rem; font-size:0.85rem;">Mark as Completed</button>`
      : '';
    const completedLine = f.date_completed
      ? `<p class="hint" style="margin:0.2rem 0 0;">Completed ${new Date(f.date_completed).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>`
      : '';
    const suggestionBoxHtml = canComplete ? `
      <div class="suggestion-box" id="suggestion-${f.id}" style="display:none; margin-top:0.6rem; padding-top:0.6rem; border-top:1px solid rgba(122,29,29,0.1);">
        <textarea id="suggestion-text-${f.id}" rows="4" readonly style="font-size:0.85rem;"></textarea>
        <div style="display:flex; gap:0.4rem; margin-top:0.4rem; flex-wrap:wrap;">
          <button class="cycle-btn btn btn-outline" data-id="${f.id}" data-name="${memberName}" style="border-color:var(--oxblood); color:var(--oxblood); padding:0.25rem 0.7rem; font-size:0.8rem;">&#128260; Try another</button>
          <button class="copy-btn btn btn-solid" data-id="${f.id}" style="padding:0.25rem 0.7rem; font-size:0.8rem;">&#128203; Copy</button>
          <button class="close-suggestion-btn btn btn-outline" data-id="${f.id}" style="border-color:rgba(36,20,18,0.3); color:rgba(36,20,18,0.6); padding:0.25rem 0.7rem; font-size:0.8rem;">Close</button>
        </div>
      </div>
    ` : '';

    return `
      <div class="card" style="margin-bottom:0.6rem;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <p style="margin:0; font-weight:600; color:var(--oxblood);">${memberName}</p>
          ${badgeHtml}
        </div>
        <p class="hint" style="margin:0.3rem 0 0;">Assigned to: ${nameMap[f.assigned_leader_id] || '(unknown)'}</p>
        <p class="hint" style="margin:0.2rem 0 0;">Created ${new Date(f.date_created).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
        ${completedLine}
        <div style="margin-top:0.5rem;">
          ${suggestBtnHtml}${actionHtml}
        </div>
        ${suggestionBoxHtml}
      </div>
    `;
  }).join('');

  tbody_bindActions();
}

function tbody_bindActions() {
  document.querySelectorAll('.complete-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      await sb.from('follow_ups')
        .update({ status: 'completed', date_completed: new Date().toISOString() })
        .eq('id', btn.dataset.id);
      showToast('Follow-up marked completed ✔', 'success');
      loadFollowUps();
    });
  });

  document.querySelectorAll('.suggest-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const box = document.getElementById(`suggestion-${id}`);
      const textarea = document.getElementById(`suggestion-text-${id}`);
      if (templateIndex[id] === undefined) templateIndex[id] = 0;
      textarea.value = messageTemplates(btn.dataset.name)[templateIndex[id]];
      box.style.display = box.style.display === 'none' ? 'block' : 'none';
    });
  });

  document.querySelectorAll('.cycle-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const templates = messageTemplates(btn.dataset.name);
      templateIndex[id] = ((templateIndex[id] || 0) + 1) % templates.length;
      document.getElementById(`suggestion-text-${id}`).value = templates[templateIndex[id]];
    });
  });

  document.querySelectorAll('.copy-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const textarea = document.getElementById(`suggestion-text-${btn.dataset.id}`);
      try {
        await navigator.clipboard.writeText(textarea.value);
        showToast('Copied — paste it into WhatsApp', 'success');
      } catch {
        textarea.select();
        showToast('Select the text above to copy manually', 'info');
      }
    });
  });

  document.querySelectorAll('.close-suggestion-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.getElementById(`suggestion-${btn.dataset.id}`).style.display = 'none';
    });
  });
}

render();
