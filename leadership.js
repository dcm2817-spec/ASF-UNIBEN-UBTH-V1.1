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

function findGroupInfo(groupName) {
  return (typeof MINISTRY_GROUPS !== 'undefined')
    ? MINISTRY_GROUPS.find((g) => g.name === groupName)
    : null;
}

function backContent(title, bio) {
  if (bio) {
    const skillsHtml = bio.skills && bio.skills.length
      ? `<p class="hint" style="margin:0.4rem 0 0;"><strong>Skills:</strong> ${bio.skills.join(', ')}</p>`
      : '';
    const scriptureHtml = bio.scripture
      ? `<p class="hint" style="margin:0.4rem 0 0; font-style:italic;">"${bio.scripture}" &mdash; ${bio.scriptureRef}</p>`
      : '';
    return `
      ${bio.department ? `<p class="hint" style="margin:0;">${bio.department}${bio.level ? ', ' + bio.level + ' Level' : ''}</p>` : ''}
      ${bio.roleDescription ? `<p class="hint" style="margin:0.4rem 0 0;">${bio.roleDescription}</p>` : ''}
      ${bio.personal ? `<p class="hint" style="margin:0.4rem 0 0;">${bio.personal}</p>` : ''}
      ${skillsHtml}
      ${scriptureHtml}
    `;
  }
  const roleDesc = (typeof ROLE_DESCRIPTIONS !== 'undefined') ? ROLE_DESCRIPTIONS[title] : null;
  const groupInfo = findGroupInfo(title);
  if (roleDesc) return `<p class="hint" style="margin:0;">${roleDesc}</p>`;
  if (groupInfo) return `<p class="hint" style="margin:0;">${groupInfo.summary}</p>`;
  return `<p class="hint" style="margin:0;">More info coming soon.</p>`;
}

function flipCardHtml(cardId, title, name, photo, phone, bio) {
  const nameHtml = name
    ? `<p class="person-name">${name}</p>`
    : `<p class="person-name vacant">Vacant</p>`;
  const phoneHtml = phone
    ? `<a href="https://wa.me/${phone.replace('+', '')}" target="_blank" rel="noopener" class="hint" style="display:inline-block; margin-top:0.2rem; color:var(--oxblood);" onclick="event.stopPropagation()">📱 WhatsApp</a>`
    : '';

  return `
    <div class="flip-card" data-card-id="${cardId}">
      <div class="flip-inner">
        <div class="flip-front person-card">
          ${avatarHtml(name, photo)}
          <div>
            <p class="person-title">${title} <span class="badge badge-pending">Leader</span></p>
            ${nameHtml}
            ${phoneHtml}
          </div>
        </div>
        <div class="flip-back">
          <p class="person-title" style="margin-bottom:0.4rem;">${title}</p>
          ${backContent(title, bio)}
        </div>
      </div>
    </div>
  `;
}

function groupFlipCardHtml(cardId, title, lead, leadPhoto, asst, asstPhoto) {
  let asstHtml = '';
  if (asst) {
    asstHtml = `
      <div class="person-card" style="margin-top:0.5rem;">
        ${avatarHtml(asst, asstPhoto)}
        <p class="hint" style="margin:0;">Asst: ${asst}</p>
      </div>
    `;
  }
  return `
    <div class="flip-card" data-card-id="${cardId}">
      <div class="flip-inner">
        <div class="flip-front" style="flex-direction:column; align-items:stretch;">
          <p class="person-title">${title} <span class="badge badge-pending">Leader</span></p>
          <div class="person-card" style="margin-top:0.4rem;">
            ${avatarHtml(lead, leadPhoto)}
            <p class="person-name">${lead}</p>
          </div>
          ${asstHtml}
        </div>
        <div class="flip-back">
          <p class="person-title" style="margin-bottom:0.4rem;">${title}</p>
          ${backContent(title, null)}
        </div>
      </div>
    </div>
  `;
}

document.getElementById('exco-list').innerHTML = EXCO
  .map((p, i) => flipCardHtml(`exco-${i}`, p.position, p.name, p.photo, p.phone, p.bio))
  .join('');

document.getElementById('ministry-leaders-list').innerHTML = MINISTRY_LEADERS
  .map((m, i) => groupFlipCardHtml(`ml-${i}`, m.group, m.lead, m.leadPhoto, m.asst, m.asstPhoto))
  .join('');

document.getElementById('coordinators-list').innerHTML = COORDINATORS
  .map((c, i) => groupFlipCardHtml(`co-${i}`, c.role, c.lead, c.leadPhoto, c.asst, c.asstPhoto))
  .join('');

document.querySelectorAll('.flip-card').forEach((card) => {
  card.addEventListener('click', () => card.classList.toggle('flipped'));
});
