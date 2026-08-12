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
    tbody.innerHTML = '<tr><td colspan="7" class="hint">No members match.</td></tr>';
    return;
  }
  tbody.innerHTML = filtered.map((m) => `
    <tr>
      <td>${m.full_name || ''}</td>
      <td>${m.email || ''}</td>
      <td>${m.department || ''}</td>
      <td>${m.level || ''}</td>
      <td>${m.location || ''}</td>
      <td>${m.ministry_group || ''}</td>
      <td>
        ${roleCellHtml(m)}
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
    btn.addEventListener('click', async () => {
      const group = prompt(
        'Enter the exact ministry group name (e.g. "Anglican Music Ministry") or hall this person leads (e.g. "Male Hall Representative" should be entered as the location value used at registration):'
      );
      if (group === null) return; // cancelled
      if (!group.trim()) { showToast('Group name cannot be empty', 'error'); return; }
      await sb.from('members').update({ role: 'leader', led_group: group.trim() }).eq('id', btn.dataset.id);
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
}

function roleCellHtml(m) {
  const linkStyle = 'border:none; background:none; color:var(--oxblood); text-decoration:underline; cursor:pointer; font-size:0.8rem; display:block; margin:0.1rem 0;';
  if (m.role === 'admin') {
    return '<span class="badge badge-active">Admin</span>';
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
  const rows = currentMembers.map(({ id, full_name, email, department, level, date_of_birth, location, ministry_group, created_at }) => ({
    id, full_name, email, department, level, date_of_birth, location, ministry_group, created_at,
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
