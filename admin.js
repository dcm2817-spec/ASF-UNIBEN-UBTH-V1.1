function toCsv(rows) {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const escape = (v) => `"${String(v == null ? '' : v).replace(/"/g, '""')}"`;
  const lines = [headers.join(','), ...rows.map((r) => headers.map((h) => escape(r[h])).join(','))];
  return lines.join('\n');
}

function downloadCsv(filename, csv) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

let currentMembers = [];
let currentUserId = null;

async function loadMembers() {
  const { data: { session } } = await sb.auth.getSession();
  currentUserId = session ? session.user.id : null;

  if (!window.ALL_GROUPS) {
    const { data: groupsData } = await sb.from('groups').select('name').order('name', { ascending: true });
    window.ALL_GROUPS = (groupsData || []).map((g) => g.name);
  }

  const { data } = await sb.from('members').select('*').order('created_at', { ascending: false });
  currentMembers = data || [];
  document.getElementById('member-count').textContent = currentMembers.length;
  renderMembers();
  renderBirthdays();
}

function renderMembers() {
  const search = document.getElementById('filter-search').value.trim().toLowerCase();
  const level = document.getElementById('filter-level').value;

  const filtered = currentMembers.filter((m) => {
    const matchesSearch = !search
      || (m.full_name || '').toLowerCase().includes(search)
      || (m.department || '').toLowerCase().includes(search);
    const matchesLevel = !level || m.level === level;
    return matchesSearch && matchesLevel;
  });

  const tbody = document.getElementById('members-tbody');
  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="hint">No members match.</td></tr>';
    return;
  }
  tbody.innerHTML = filtered.map((m) => `
    <tr>
      <td>${m.full_name || ''}</td>
      <td>${m.email || ''}</td>
      <td>${m.department || ''}</td>
      <td>${m.level || ''}</td>
      <td>${m.location || ''}</td>
      <td>${[m.ministry_group, m.ministry_group_2].filter(Boolean).join(', ')}</td>
      <td>
        ${roleCellHtml(m)}
      </td>
      <td>
        ${permissionsCellHtml(m)}
      </td>
    </tr>
  `).join('');

  tbody.querySelectorAll('.promote-admin-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (!confirm('Give this member admin (GS/AGS) access?')) return;
      await sb.from('members').update({ role: 'admin' }).eq('id', btn.dataset.id);
      showToast('Member promoted to admin ✔', 'success');
      loadMembers();
    });
  });

  tbody.querySelectorAll('.promote-leader-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const panel = document.getElementById(`group-panel-promote-${btn.dataset.id}`);
      panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    });
  });

  tbody.querySelectorAll('.confirm-promote-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      const group = document.getElementById(`group-select-promote-${id}`).value;
      if (!group) { showToast('Pick a group first', 'error'); return; }
      await sb.from('members').update({ role: 'leader', led_group: group }).eq('id', id);
      showToast('Member made a leader ✔', 'success');
      loadMembers();
    });
  });

  tbody.querySelectorAll('.demote-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (!confirm('Remove this person\'s leader access?')) return;
      await sb.from('members').update({ role: 'member', led_group: null }).eq('id', btn.dataset.id);
      showToast('Leader access removed', 'info');
      loadMembers();
    });
  });

  tbody.querySelectorAll('.demote-to-leader-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const panel = document.getElementById(`group-panel-demote-${btn.dataset.id}`);
      panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    });
  });

  tbody.querySelectorAll('.confirm-demote-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      const group = document.getElementById(`group-select-demote-${id}`).value;
      if (!group) { showToast('Pick a group first', 'error'); return; }
      if (!confirm('Demote this admin to a leader? They will lose admin access.')) return;
      await sb.from('members').update({ role: 'leader', led_group: group }).eq('id', id);
      showToast('Admin demoted to leader', 'info');
      loadMembers();
    });
  });

  tbody.querySelectorAll('.remove-access-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (!confirm('Remove ALL admin/leader access from this person? They become a plain member.')) return;
      await sb.from('members').update({ role: 'member', led_group: null, permissions: [] }).eq('id', btn.dataset.id);
      showToast('All access removed', 'info');
      loadMembers();
    });
  });

  tbody.querySelectorAll('.perm-manage-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const panel = document.getElementById(`perm-panel-${btn.dataset.id}`);
      panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    });
  });

  tbody.querySelectorAll('.perm-save-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      const checked = Array.from(document.querySelectorAll(`.perm-checkbox-${id}:checked`)).map((c) => c.value);
      await sb.from('members').update({ permissions: checked }).eq('id', id);
      showToast('Permissions updated ✔', 'success');
      loadMembers();
    });
  });
}

const PERMISSION_OPTIONS = [
  { value: 'mark_attendance', label: 'Mark Attendance' },
  { value: 'tag_members', label: 'Tag Members' },
  { value: 'manage_songs', label: 'Manage Songs' },
];

function permissionsCellHtml(m) {
  const perms = m.permissions || [];
  const badges = perms.length
    ? perms.map((p) => {
        const opt = PERMISSION_OPTIONS.find((o) => o.value === p);
        return `<span class="badge badge-pending" style="display:inline-block; margin:0.1rem;">${opt ? opt.label : p}</span>`;
      }).join('')
    : '<span class="hint">None</span>';

  const checkboxesHtml = PERMISSION_OPTIONS.map((opt) => `
    <label style="display:block; font-size:0.8rem; font-weight:400; margin:0.2rem 0;">
      <input type="checkbox" class="perm-checkbox-${m.id}" value="${opt.value}" ${perms.includes(opt.value) ? 'checked' : ''}>
      ${opt.label}
    </label>
  `).join('');

  return `
    <div>${badges}</div>
    <button class="perm-manage-btn" data-id="${m.id}" style="border:none; background:none; color:var(--oxblood); text-decoration:underline; cursor:pointer; font-size:0.78rem; margin-top:0.2rem;">Manage</button>
    <div id="perm-panel-${m.id}" style="display:none; margin-top:0.3rem; padding:0.4rem; background:rgba(122,29,29,0.05); border-radius:0.4rem;">
      ${checkboxesHtml}
      <button class="perm-save-btn btn btn-solid" data-id="${m.id}" style="padding:0.2rem 0.6rem; font-size:0.75rem; margin-top:0.3rem;">Save</button>
    </div>
  `;
}

function groupSelectPanelHtml(memberId, action) {
  const options = (window.ALL_GROUPS || [])
    .map((g) => `<option value="${g}">${g}</option>`)
    .join('');
  const confirmClass = action === 'promote' ? 'confirm-promote-btn' : 'confirm-demote-btn';
  const confirmLabel = action === 'promote' ? 'Confirm' : 'Confirm demote';
  return `
    <div id="group-panel-${action}-${memberId}" style="display:none; margin-top:0.3rem; padding:0.4rem; background:rgba(122,29,29,0.05); border-radius:0.4rem;">
      <select id="group-select-${action}-${memberId}" style="font-size:0.8rem; padding:0.25rem; width:100%;">
        <option value="" disabled selected>Select group/hall&hellip;</option>
        ${options}
      </select>
      <button class="${confirmClass} btn btn-solid" data-id="${memberId}" style="padding:0.2rem 0.6rem; font-size:0.75rem; margin-top:0.3rem;">${confirmLabel}</button>
    </div>
  `;
}

function roleCellHtml(m) {
  const linkStyle = 'border:none; background:none; color:var(--oxblood); text-decoration:underline; cursor:pointer; font-size:0.8rem; display:block; margin:0.1rem 0;';
  if (m.role === 'admin') {
    return `
      <span class="badge badge-active">Admin</span><br>
      <button class="demote-to-leader-btn" data-id="${m.id}" style="${linkStyle}">Demote to leader</button>
      <button class="remove-access-btn" data-id="${m.id}" style="${linkStyle} color:#b91c1c;">Remove all access</button>
      ${groupSelectPanelHtml(m.id, 'demote')}
    `;
  }
  if (m.role === 'leader') {
    return `
      <span class="badge badge-pending">Leader${m.led_group ? ` (${m.led_group})` : ''}</span><br>
      <button class="demote-btn" data-id="${m.id}" style="${linkStyle}">Remove leader</button>
    `;
  }
  return `
    <button class="promote-leader-btn" data-id="${m.id}" style="${linkStyle}">Make leader</button>
    <button class="promote-admin-btn" data-id="${m.id}" style="${linkStyle}">Make admin</button>
    ${groupSelectPanelHtml(m.id, 'promote')}
  `;
}

function renderBirthdays() {
  const now = new Date();
  const thisMonth = now.getMonth();
  const withBirthdays = currentMembers.filter((m) => {
    if (!m.date_of_birth) return false;
    const dob = new Date(m.date_of_birth);
    return dob.getMonth() === thisMonth;
  });
  const card = document.getElementById('birthdays-card');
  if (withBirthdays.length === 0) {
    card.style.display = 'none';
    return;
  }
  card.style.display = 'block';
  document.getElementById('birthdays-list').innerHTML = withBirthdays
    .sort((a, b) => new Date(a.date_of_birth).getDate() - new Date(b.date_of_birth).getDate())
    .map((m) => `<p style="margin:0.2rem 0;">${new Date(m.date_of_birth).getDate()} — ${m.full_name}</p>`)
    .join('');
}

document.getElementById('filter-search').addEventListener('input', renderMembers);
document.getElementById('filter-level').addEventListener('change', renderMembers);

async function loadAnnouncements() {
  const { data } = await sb.from('announcements').select('*').order('created_at', { ascending: false });
  const list = document.getElementById('announcements-list');
  list.innerHTML = (data || []).map((a) => `
    <div class="card" data-id="${a.id}">
      <div style="display:flex; align-items:flex-start; justify-content:space-between;">
        <p style="font-weight:600; color:var(--oxblood); margin:0;">${a.title}</p>
        <button class="delete-ann-btn" data-id="${a.id}" style="border:none; background:none; color:rgba(36,20,18,0.4); cursor:pointer; font-size:0.8rem;">Delete</button>
      </div>
      <p style="margin:0.4rem 0 0;">${a.body}</p>
    </div>
  `).join('');

  list.querySelectorAll('.delete-ann-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      await sb.from('announcements').delete().eq('id', btn.dataset.id);
      showToast('Announcement deleted', 'info');
      loadAnnouncements();
    });
  });
}

document.getElementById('export-btn').addEventListener('click', () => {
  const rows = currentMembers.map(({ id, full_name, email, department, level, date_of_birth, location, ministry_group, ministry_group_2, created_at }) => ({
    id, full_name, email, department, level, date_of_birth, location, ministry_group, ministry_group_2, created_at,
  }));
  downloadCsv(`asf-members-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(rows));
  showToast('CSV downloaded ✔', 'success');
});

document.getElementById('announcement-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('ann-title').value.trim();
  const body = document.getElementById('ann-body').value.trim();
  if (!title || !body) return;
  await sb.from('announcements').insert({ title, body });
  document.getElementById('ann-title').value = '';
  document.getElementById('ann-body').value = '';
  showToast('Announcement posted ✔', 'success');
  loadAnnouncements();
});

loadMembers();
loadAnnouncements();
