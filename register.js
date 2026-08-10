let mode = 'register'; // 'register' | 'signin'

const registerOnlyFields = [
  'fullName', 'department', 'level', 'dob', 'location', 'ministryGroup',
].map((id) => document.getElementById(id).closest('.field'));

// Populate ministry group dropdown
const ministrySelect = document.getElementById('ministryGroup');
MINISTRY_GROUPS.forEach((g) => {
  const opt = document.createElement('option');
  opt.value = g.name;
  opt.textContent = g.name;
  ministrySelect.appendChild(opt);
});

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
  registerOnlyFields.forEach((el) => {
    el.querySelectorAll('input, select').forEach((input) => {
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
            date_of_birth: document.getElementById('dob').value || '',
            location: document.getElementById('location').value,
            ministry_group: document.getElementById('ministryGroup').value,
          },
        },
      });
      if (error) throw error;
      // The database trigger (on_auth_user_created) creates the members row
      // automatically from this metadata — no separate insert needed here.
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
