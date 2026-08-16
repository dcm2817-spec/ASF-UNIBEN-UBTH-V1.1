let canManage = false;

async function init() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return; // protect.js already redirects

  const { data: me } = await sb.from('members').select('role, permissions').eq('id', session.user.id).single();
  canManage = me && (me.role === 'admin' || (me.permissions || []).includes('manage_songs'));

  if (canManage) {
    document.getElementById('manage-section').style.display = 'block';
    document.getElementById('song-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = document.getElementById('song-title').value.trim();
      const reference = document.getElementById('song-reference').value.trim();
      if (!title) return;
      const { error } = await sb.from('songs').insert({ title, reference: reference || null, added_by: session.user.id });
      if (error) {
        showToast(error.message, 'error');
        return;
      }
      document.getElementById('song-title').value = '';
      document.getElementById('song-reference').value = '';
      showToast('Song added ✔', 'success');
      loadSongs();
    });
  }

  await loadSongs();
}

async function loadSongs() {
  const list = document.getElementById('songs-list');
  const { data, error } = await sb.from('songs').select('*').order('title', { ascending: true });

  if (error) {
    list.innerHTML = '<p class="hint">Could not load the song list.</p>';
    return;
  }
  if (!data || data.length === 0) {
    list.innerHTML = '<p class="hint">No songs added yet.</p>';
    return;
  }

  list.innerHTML = data.map((s) => `
    <div class="card" style="margin-bottom:0.5rem; display:flex; justify-content:space-between; align-items:center;">
      <div>
        <p style="margin:0; font-weight:600;">${s.title}</p>
        ${s.reference ? `<p class="hint" style="margin:0.2rem 0 0;">${s.reference}</p>` : ''}
      </div>
      ${canManage ? `<button class="delete-song-btn" data-id="${s.id}" style="border:none; background:none; color:rgba(36,20,18,0.4); cursor:pointer; font-size:0.8rem;">Delete</button>` : ''}
    </div>
  `).join('');

  list.querySelectorAll('.delete-song-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      await sb.from('songs').delete().eq('id', btn.dataset.id);
      showToast('Song removed', 'info');
      loadSongs();
    });
  });
}

init();
