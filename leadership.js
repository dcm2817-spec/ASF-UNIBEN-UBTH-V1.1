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

function bioDetailsHtml(p) {
  if (!p.bio) {
    const description = (typeof ROLE_DESCRIPTIONS !== 'undefined') ? ROLE_DESCRIPTIONS[p.title] : null;
    return description ? `<p class="hint" style="margin:0;">${description}</p>` : '';
  }
  const b = p.bio;
  const skillsHtml = b.skills && b.skills.length
    ? `<p class="hint" style="margin:0.4rem 0 0;"><strong>Skills:</strong> ${b.skills.join(', ')}</p>`
    : '';
  const scriptureHtml = b.scripture
    ? `<p class="hint" style="margin:0.4rem 0 0; font-style:italic;">"${b.scripture}" &mdash; ${b.scriptureRef}</p>`
    : '';
  return `
    ${b.department ? `<p class="hint" style="margin:0;">${b.department}${b.level ? ', ' + b.level + ' Level' : ''}</p>` : ''}
    ${b.roleDescription ? `<p class="hint" style="margin:0.4rem 0 0;">${b.roleDescription}</p>` : ''}
    ${b.personal ? `<p class="hint" style="margin:0.4rem 0 0;">${b.personal}</p>` : ''}
    ${skillsHtml}
    ${scriptureHtml}
  `;
}

function personCardHtml(cardId, title, name, photo, phone, bio) {
  const nameHtml = name
    ? `<p class="person-name">${name}</p>`
    : `<p class="person-name vacant">Vacant</p>`;
  const phoneHtml = phone
    ? `<a href="https://wa.me/${phone.replace('+', '')}" target="_blank" rel="noopener" class="hint" style="display:inline-block; margin-top:0.2rem; color:var(--oxblood);">📱 Message on WhatsApp</a>`
    : '';
  const detailsInner = bioDetailsHtml({ title, bio });

  return `
    <div class="card person-card-toggle" data-card-id="${cardId}">
      <div class="person-card">
        ${avatarHtml(name, photo)}
        <div>
          <p class="person-title">${title} <span class="badge badge-pending">Leader</span></p>
          ${nameHtml}
          ${phoneHtml}
        </div>
      </div>
      ${detailsInner ? `<div class="card-details" id="details-${cardId}">${detailsInner}</div>` : ''}
    </div>
  `;
}

function groupCardHtml(cardId, title, lead, leadPhoto, asst, asstPhoto) {
  let asstHtml = '';
  if (asst) {
    asstHtml = `
      <div class="person-card" style="margin-top:0.6rem;">
        ${avatarHtml(asst, asstPhoto)}
        <p class="hint" style="margin:0;">Asst: ${asst}</p>
      </div>
    `;
  }
  const groupInfo = findGroupInfo(title);
  const detailsHtml = groupInfo
    ? `<div class="card-details" id="details-${cardId}"><p class="hint" style="margin:0;">${groupInfo.summary}</p></div>`
    : '';

  return `
    <div class="card person-card-toggle" data-card-id="${cardId}">
      <p class="person-title">${title} <span class="badge badge-pending">Leader</span></p>
      <div class="person-card" style="margin-top:0.4rem;">
        ${avatarHtml(lead, leadPhoto)}
        <p class="person-name">${lead}</p>
      </div>
      ${asstHtml}
      ${detailsHtml}
    </div>
  `;
}

document.getElementById('exco-list').innerHTML = EXCO
  .map((p, i) => personCardHtml(`exco-${i}`, p.position, p.name, p.photo, p.phone, p.bio))
  .join('');

document.getElementById('ministry-leaders-list').innerHTML = MINISTRY_LEADERS
  .map((m, i) => groupCardHtml(`ml-${i}`, m.group, m.lead, m.leadPhoto, m.asst, m.asstPhoto))
  .join('');

document.getElementById('coordinators-list').innerHTML = COORDINATORS
  .map((c, i) => groupCardHtml(`co-${i}`, c.role, c.lead, c.leadPhoto, c.asst, c.asstPhoto))
  .join('');

// Tap-to-expand: only cards that actually have a details block respond.
document.querySelectorAll('.person-card-toggle').forEach((card) => {
  const details = card.querySelector('.card-details');
  if (!details) return;
  card.style.cursor = 'pointer';
  card.addEventListener('click', () => {
    details.classList.toggle('open');
  });
});
