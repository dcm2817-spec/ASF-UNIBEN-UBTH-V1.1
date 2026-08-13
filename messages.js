let myRole = null;
let myLedGroup = null;

async function init() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return; // protect.js already redirects

  const { data: me } = await sb.from('members').select('role, led_group').eq('id', session.user.id).single();
  myRole = me ? me.role : 'member';
  myLedGroup = me ? me.led_group : null;

  if (myRole === 'admin' || myRole === 'leader') {
    document.getElementById('send-section').style.display = 'block';
    setupSendForm();
  }

  await loadMessages();
  initPullToRefresh(document.getElementById('messages-list'), loadMessages);
}

function setupSendForm() {
  const targetField = document.getElementById('target-field');
  const groupField = document.getElementById('group-field');
  const groupInput = document.getElementById('group-name');
  const groupLabel = document.getElementById('group-label');
  const targetSelect = document.getElementById('target-type');

  if (myRole === 'leader') {
    // Leaders can only send to the group they lead -- no choice to make.
    targetField.style.display = 'none';
    groupField.style.display = 'block';
    groupLabel.textContent = 'Sending to';
    groupInput.value = myLedGroup || '(no group assigned)';
    groupInput.disabled = true;
  } else {
    // Admin: toggle the group field based on the target dropdown.
    targetSelect.addEventListener('change', () => {
      groupField.style.display = targetSelect.value === 'group' ? 'block' : 'none';
    });
  }

  document.getElementById('send-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const content = document.getElementById('message-content').value.trim();
    if (!content) return;

    let payload;
    if (myRole === 'leader') {
      if (!myLedGroup) {
        showToast('You have no group assigned yet', 'error');
        return;
      }
      payload = { sender_role: 'leader', target_type: 'group', group_id: myLedGroup, content };
    } else {
      const targetType = targetSelect.value;
      if (targetType === 'group' && !groupInput.value.trim()) {
        showToast('Enter a group name', 'error');
        return;
      }
      payload = {
        sender_role: 'admin',
        target_type: targetType,
        group_id: targetType === 'group' ? groupInput.value.trim() : null,
        content,
      };
    }

    const { data: { session } } = await sb.auth.getSession();
    const { error } = await sb.from('messages').insert({ ...payload, sender_id: session.user.id });

    if (error) {
      showToast(error.message, 'error');
      return;
    }
    document.getElementById('message-content').value = '';
    showToast('Message sent ✔', 'success');
    loadMessages();
  });
}

async function loadMessages() {
  const list = document.getElementById('messages-list');
  const { data: msgs, error } = await sb.from('messages')
    .select('*')
    .order('date_created', { ascending: false });

  if (error) {
    list.innerHTML = '<p class="hint">Could not load messages.</p>';
    return;
  }
  if (!msgs || msgs.length === 0) {
    list.innerHTML = '<p class="hint">No messages yet.</p>';
    return;
  }

  const senderIds = [...new Set(msgs.map((m) => m.sender_id))];
  const { data: senders } = await sb.from('members').select('id, full_name').in('id', senderIds);
  const nameMap = {};
  (senders || []).forEach((s) => { nameMap[s.id] = s.full_name || '(no name)'; });

  list.innerHTML = msgs.map((m) => {
    const target = m.target_type === 'all' ? 'All Members' : m.group_id;
    const badgeClass = m.target_type === 'all' ? 'badge-active' : 'badge-pending';
    return `
      <div class="card" style="margin-bottom:0.6rem;">
        <p style="margin:0;">${m.content}</p>
        <p class="message-meta">
          <span class="badge ${badgeClass}">${target}</span>
          &middot; ${nameMap[m.sender_id] || '(unknown)'}
          &middot; ${new Date(m.date_created).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
      </div>
    `;
  }).join('');
}

init();
