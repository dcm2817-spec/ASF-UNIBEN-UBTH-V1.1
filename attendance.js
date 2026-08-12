// ---------- Tabs ----------
const tabCheckin = document.getElementById('tab-checkin');
const tabAnalytics = document.getElementById('tab-analytics');
const checkinPanel = document.getElementById('checkin-panel');
const analyticsPanel = document.getElementById('analytics-panel');

tabCheckin.addEventListener('click', () => {
  tabCheckin.classList.add('active');
  tabAnalytics.classList.remove('active');
  checkinPanel.style.display = 'block';
  analyticsPanel.style.display = 'none';
});

tabAnalytics.addEventListener('click', () => {
  tabAnalytics.classList.add('active');
  tabCheckin.classList.remove('active');
  analyticsPanel.style.display = 'block';
  checkinPanel.style.display = 'none';
  loadAnalytics();
});

// Default the date picker to today
document.getElementById('event-date').value = new Date().toISOString().slice(0, 10);

// ---------- Check-in ----------
let allMembers = [];
let currentEvent = null;
let presentMemberIds = new Set();

async function loadMembersOnce() {
  if (allMembers.length) return allMembers;
  const { data } = await sb.from('members').select('id, full_name').order('full_name', { ascending: true });
  allMembers = data || [];
  return allMembers;
}

document.getElementById('load-checkin-btn').addEventListener('click', async () => {
  const type = document.getElementById('event-type').value;
  const date = document.getElementById('event-date').value;
  if (!date) return;

  const isOptional = type === 'Sunday Prayer Meeting';

  // Find existing event for this type+date, or create it.
  let { data: existing } = await sb.from('events').select('*').eq('type', type).eq('date', date).maybeSingle();
  if (!existing) {
    const { data: created, error } = await sb.from('events')
      .insert({ type, date, is_optional: isOptional })
      .select()
      .single();
    if (error) {
      alert('Could not start check-in: ' + error.message);
      return;
    }
    existing = created;
  }
  currentEvent = existing;

  const { data: attendanceRows } = await sb.from('attendance').select('member_id').eq('event_id', currentEvent.id);
  presentMemberIds = new Set((attendanceRows || []).map((r) => r.member_id));

  await loadMembersOnce();
  renderCheckinList();
});

function renderCheckinList() {
  const list = document.getElementById('checkin-list');
  const summary = document.getElementById('checkin-summary');
  list.style.display = 'block';

  summary.textContent = `${currentEvent.type} — ${currentEvent.date} — ${presentMemberIds.size} / ${allMembers.length} present`;

  list.innerHTML = allMembers.map((m) => `
    <div class="member-row">
      <span>${m.full_name || '(no name)'}</span>
      <button class="present-btn ${presentMemberIds.has(m.id) ? 'marked' : ''}" data-id="${m.id}">
        ${presentMemberIds.has(m.id) ? 'Present' : 'Mark present'}
      </button>
    </div>
  `).join('');

  list.querySelectorAll('.present-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const memberId = btn.dataset.id;
      if (presentMemberIds.has(memberId)) {
        await sb.from('attendance').delete().eq('event_id', currentEvent.id).eq('member_id', memberId);
        presentMemberIds.delete(memberId);
      } else {
        await sb.from('attendance').insert({ event_id: currentEvent.id, member_id: memberId });
        presentMemberIds.add(memberId);
      }
      renderCheckinList();
    });
  });
}

// ---------- Analytics ----------
async function loadAnalytics() {
  const tbody = document.getElementById('analytics-tbody');
  tbody.innerHTML = '<tr><td colspan="4" class="hint">Loading&hellip;</td></tr>';

  await loadMembersOnce();

  // Last 3 Wednesday/Friday events, for the "missed" flag
  const { data: coreEvents } = await sb.from('events')
    .select('id, date, type')
    .in('type', ['Wednesday Service', 'Friday Service'])
    .order('date', { ascending: false })
    .limit(3);
  const coreEventIds = new Set((coreEvents || []).map((e) => e.id));

  // All attendance rows with their event date, for totals + last-attended
  const { data: rows } = await sb.from('attendance')
    .select('member_id, event_id, events(date)');

  const byMember = {};
  (rows || []).forEach((r) => {
    if (!byMember[r.member_id]) byMember[r.member_id] = { total: 0, lastDate: null, hitCore: false };
    byMember[r.member_id].total += 1;
    const d = r.events ? r.events.date : null;
    if (d && (!byMember[r.member_id].lastDate || d > byMember[r.member_id].lastDate)) {
      byMember[r.member_id].lastDate = d;
    }
    if (coreEventIds.has(r.event_id)) byMember[r.member_id].hitCore = true;
  });

  const enoughCoreHistory = (coreEvents || []).length >= 3;

  tbody.innerHTML = allMembers.map((m) => {
    const stats = byMember[m.id] || { total: 0, lastDate: null, hitCore: false };
    const missedFlag = enoughCoreHistory && !stats.hitCore;
    return `
      <tr>
        <td>${m.full_name || '(no name)'}</td>
        <td>${stats.total}</td>
        <td>${stats.lastDate || '—'}</td>
        <td>${missedFlag ? '<span class="flag-missed">Missed last 3</span>' : '<span class="hint">OK</span>'}</td>
      </tr>
    `;
  }).join('');
}
