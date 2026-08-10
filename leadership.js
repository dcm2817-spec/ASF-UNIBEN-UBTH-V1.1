function initials(name) {
  if (!name) return '?';
  return name.split(' ').filter(Boolean).slice(0, 2).map((n) => n[0]).join('').toUpperCase();
}

function avatarHtml(name, photo) {
  if (photo) {
    return `<img class="avatar" src="${photo}" alt="${name}">`;
  }
  return `<div class="avatar-fallback">${initials(name)}</div>`;
}

function personCardHtml(title, name, photo, phone) {
  const nameHtml = name
    ? `<p class="person-name">${name}</p>`
    : `<p class="person-name vacant">Vacant</p>`;
  const phoneHtml = phone
    ? `<a href="https://wa.me/${phone.replace('+', '')}" target="_blank" rel="noopener" class="hint" style="display:inline-block; margin-top:0.2rem; color:var(--oxblood);">📱 Message on WhatsApp</a>`
    : '';
  return `
    <div class="card person-card">
      ${avatarHtml(name, photo)}
      <div>
        <p class="person-title">${title}</p>
        ${nameHtml}
        ${phoneHtml}
      </div>
    </div>
  `;
}

function groupCardHtml(title, lead, leadPhoto, asst, asstPhoto) {
  let asstHtml = '';
  if (asst) {
    asstHtml = `
      <div class="person-card" style="margin-top:0.6rem;">
        ${avatarHtml(asst, asstPhoto)}
        <p class="hint" style="margin:0;">Asst: ${asst}</p>
      </div>
    `;
  }
  return `
    <div class="card">
      <p class="person-title">${title}</p>
      <div class="person-card" style="margin-top:0.4rem;">
        ${avatarHtml(lead, leadPhoto)}
        <p class="person-name">${lead}</p>
      </div>
      ${asstHtml}
    </div>
  `;
}

document.getElementById('exco-list').innerHTML = EXCO
  .map((p) => personCardHtml(p.position, p.name, p.photo, p.phone))
  .join('');

document.getElementById('ministry-leaders-list').innerHTML = MINISTRY_LEADERS
  .map((m) => groupCardHtml(m.group, m.lead, m.leadPhoto, m.asst, m.asstPhoto))
  .join('');

document.getElementById('coordinators-list').innerHTML = COORDINATORS
  .map((c) => groupCardHtml(c.role, c.lead, c.leadPhoto, c.asst, c.asstPhoto))
  .join('');
