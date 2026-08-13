const ministrySelect = document.getElementById('ministryGroup');
MINISTRY_GROUPS.forEach((g) => {
  const opt = document.createElement('option');
  opt.value = g.name;
  opt.textContent = g.name;
  ministrySelect.appendChild(opt);
});

// Populate day-of-month dropdown (1-31, no year collected)
const dobDaySelect = document.getElementById('dob-day');
for (let d = 1; d <= 31; d++) {
  const opt = document.createElement('option');
  opt.value = String(d).padStart(2, '0');
  opt.textContent = d;
  dobDaySelect.appendChild(opt);
}

function showError(msg) {
  const el = document.getElementById('profile-error');
  el.textContent = msg;
  el.style.display = 'block';
  document.getElementById('profile-success').style.display = 'none';
}
function showSuccess(msg) {
  const el = document.getElementById('profile-success');
  el.textContent = msg;
  el.style.display = 'block';
  document.getElementById('profile-error').style.display = 'none';
}

async function loadProfile() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return; // protect.js already redirects
  const { data, error } = await sb.from('members').select('*').eq('id', session.user.id).single();
  if (error || !data) {
    // No profile row yet — that's fine, just start with a blank form.
    // Submitting will create it (see the upsert below).
    document.getElementById('fullName').value = '';
    return;
  }
  document.getElementById('fullName').value = data.full_name || '';
  document.getElementById('department').value = data.department || '';
  document.getElementById('level').value = data.level || '';
  if (data.date_of_birth) {
    const [, month, day] = data.date_of_birth.split('-');
    document.getElementById('dob-month').value = month;
    document.getElementById('dob-day').value = day;
  }
  document.getElementById('location').value = data.location || '';
  document.getElementById('ministryGroup').value = data.ministry_group || '';

  await loadStreak(session.user.id);
  setupMemberCard(data);
}

async function loadStreak(memberId) {
  const { data: coreEventsAll } = await sb.from('events')
    .select('id')
    .in('type', ['Wednesday Service', 'Friday Service'])
    .order('date', { ascending: false });
  if (!coreEventsAll || coreEventsAll.length === 0) return;

  const { data: myAttendance } = await sb.from('attendance')
    .select('event_id')
    .eq('member_id', memberId);
  const attendedIds = new Set((myAttendance || []).map((a) => a.event_id));

  let streak = 0;
  for (const ev of coreEventsAll) {
    if (attendedIds.has(ev.id)) streak++;
    else break;
  }

  if (streak >= 2) {
    document.getElementById('streak-slot').innerHTML =
      `<span class="streak-badge">🔥 ${streak}-service streak</span>`;
  }
}

function setupMemberCard(data) {
  document.getElementById('member-card-btn').addEventListener('click', () => {
    const canvas = document.getElementById('member-card-canvas');
    const ctx = canvas.getContext('2d');

    // Background
    const grad = ctx.createLinearGradient(0, 0, 640, 360);
    grad.addColorStop(0, '#7A1D1D');
    grad.addColorStop(1, '#4A0F0F');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 640, 360);

    // Sunrise ray hint
    ctx.strokeStyle = 'rgba(201,150,47,0.25)';
    ctx.lineWidth = 2;
    for (let a = 0; a < 360; a += 12) {
      const rad = (a * Math.PI) / 180;
      ctx.beginPath();
      ctx.moveTo(320, 500);
      ctx.lineTo(320 + Math.cos(rad) * 500, 500 + Math.sin(rad) * 500);
      ctx.stroke();
    }

    ctx.fillStyle = '#FBF6EE';
    ctx.font = '600 20px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('ANGLICAN STUDENTS\u2019 FELLOWSHIP', 320, 60);
    ctx.font = '400 14px Georgia, serif';
    ctx.fillStyle = '#C9962F';
    ctx.fillText('UNIBEN / UBTH', 320, 84);

    ctx.font = '700 34px Georgia, serif';
    ctx.fillStyle = '#FBF6EE';
    ctx.fillText(data.full_name || 'ASF Member', 320, 175);

    ctx.font = '400 17px Georgia, serif';
    ctx.fillStyle = 'rgba(251,246,238,0.85)';
    ctx.fillText(`${data.department || ''}${data.level ? ' \u00b7 ' + data.level + ' Level' : ''}`, 320, 205);
    ctx.fillText(data.ministry_group || '', 320, 232);

    ctx.font = 'italic 16px Georgia, serif';
    ctx.fillStyle = '#C9962F';
    ctx.fillText('"Arise, Shine!" \u2014 Isaiah 60:1', 320, 305);

    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `asf-member-card-${(data.full_name || 'member').replace(/\s+/g, '-').toLowerCase()}.png`;
      a.click();
      URL.revokeObjectURL(url);
      if (typeof showToast === 'function') showToast('Member card downloaded ✔', 'success');
    });
  });
}

document.getElementById('profile-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return;

  const { error } = await sb.from('members').upsert({
    id: session.user.id,
    email: session.user.email,
    full_name: document.getElementById('fullName').value,
    department: document.getElementById('department').value,
    level: document.getElementById('level').value,
    date_of_birth: (document.getElementById('dob-day').value && document.getElementById('dob-month').value)
      ? `2000-${document.getElementById('dob-month').value}-${document.getElementById('dob-day').value}`
      : null,
    location: document.getElementById('location').value,
    ministry_group: document.getElementById('ministryGroup').value,
  }, { onConflict: 'id' });

  if (error) {
    showError(error.message);
    showToast('Could not save', 'error');
  } else {
    showSuccess('Profile updated.');
    showToast('Profile saved ✔', 'success');
  }
});

loadProfile();
