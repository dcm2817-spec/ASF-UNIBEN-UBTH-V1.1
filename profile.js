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
