let mode = 'register'; // 'register' | 'signin'

const registerOnlyFields = [
  'fullName', 'department', 'level', 'dob-day', 'location', 'ministryGroup', 'ministryGroup2',
].map((id) => document.getElementById(id).closest('.field'));

// Populate ministry group dropdowns (first required, second optional)
const ministrySelect = document.getElementById('ministryGroup');
const ministrySelect2 = document.getElementById('ministryGroup2');
MINISTRY_GROUPS.forEach((g) => {
  const opt = document.createElement('option');
  opt.value = g.name;
  opt.textContent = g.name;
  ministrySelect.appendChild(opt);

  const opt2 = document.createElement('option');
  opt2.value = g.name;
  opt2.textContent = g.name;
  ministrySelect2.appendChild(opt2);
});

// Populate day-of-month dropdown (1-31, no year collected)
const dobDaySelect = document.getElementById('dob-day');
for (let d = 1; d <= 31; d++) {
  const opt = document.createElement('option');
  opt.value = String(d).padStart(2, '0');
  opt.textContent = d;
  dobDaySelect.appendChild(opt);
}

function setMode(newMode) {
  mode = newMode;
  document.getElementById('tab-register').classList.toggle('active', mode === 'register');
  document.getElementById('tab-signin').classList.toggle('active', mode === 'signin');
  registerOnlyFields.forEach((el) => { el.style.display = mode === 'register' ? 'block' : 'none'; });
  document.getElementById('page-heading').textContent = mode === 'register' ? 'Join ASF' : 'Welcome back';
  document.getElementById('page-subheading').textContent = mode === 'register'
    ? 'One form creates your account and your membership record.'
    : 'Sign in to access ministry groups, Ask ASF and more.';
  document.getElementById('submit-btn').textContent = mode === 'register' ? 'Create account' : 'Sign in';
  document.getElementById('forgot-link-wrap').style.display = mode === 'signin' ? 'block' : 'none';
  // Toggle required on hidden fields so the browser doesn't block submit
  // (ministryGroup2 stays optional even in register mode)
  registerOnlyFields.forEach((el) => {
    el.querySelectorAll('input, select').forEach((input) => {
      if (input.id === 'ministryGroup2') { input.required = false; return; }
      input.required = mode === 'register';
    });
  });
  hideError();
}

document.getElementById('tab-register').addEventListener('click', () => setMode('register'));
document.getElementById('tab-signin').addEventListener('click', () => setMode('signin'));

document.getElementById('forgot-link').addEventListener('click', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  if (!email) {
    showError('Enter your email above first, then tap "Forgot your password?" again.');
    return;
  }
  hideError();
  const { error } = await sb.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + window.location.pathname.replace('register.html', 'reset-password.html'),
  });
  if (error) {
    showError(error.message);
  } else {
    document.getElementById('forgot-link').textContent = 'Reset link sent — check your email.';
  }
});

function showError(message) {
  const el = document.getElementById('form-error');
  el.textContent = message;
  el.style.display = 'block';
}
function hideError() {
  document.getElementById('form-error').style.display = 'none';
}

document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  hideError();

  if (mode === 'register') {
    const g1 = document.getElementById('ministryGroup').value;
    const g2 = document.getElementById('ministryGroup2').value;
    if (g2 && g1 === g2) {
      showError('Your second ministry group must be different from your first.');
      return;
    }
  }

  const submitBtn = document.getElementById('submit-btn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Please wait…';

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    if (mode === 'register') {
      const { data, error } = await sb.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: document.getElementById('fullName').value,
            department: document.getElementById('department').value,
            level: document.getElementById('level').value,
            date_of_birth: (document.getElementById('dob-day').value && document.getElementById('dob-month').value)
              ? `2000-${document.getElementById('dob-month').value}-${document.getElementById('dob-day').value}`
              : '',
            location: document.getElementById('location').value,
            ministry_group: document.getElementById('ministryGroup').value,
            ministry_group_2: document.getElementById('ministryGroup2').value || '',
          },
        },
      });
      if (error) throw error;
      // The database trigger (on_auth_user_created) creates the members row
      // automatically from this metadata — no separate insert needed here.
      // Flag this as a fresh join so index.html can show a one-time welcome.
      sessionStorage.setItem('justRegisteredName', document.getElementById('fullName').value || 'friend');
    } else {
      const { error } = await sb.auth.signInWithPassword({ email, password });
      if (error) throw error;
    }
    window.location.href = 'index.html';
  } catch (err) {
    showError(err.message || 'Something went wrong. Please try again.');
    submitBtn.disabled = false;
    submitBtn.textContent = mode === 'register' ? 'Create account' : 'Sign in';
  }
});
