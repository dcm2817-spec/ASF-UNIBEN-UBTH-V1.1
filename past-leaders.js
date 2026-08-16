function initials(name) {
  if (!name) return '?';
  return name.split(' ').filter(Boolean).slice(0, 2).map((n) => n[0]).join('').toUpperCase();
}

function avatarHtml(name, photo) {
  if (photo) return `<img class="avatar" src="${photo}" alt="${name}">`;
  return `<div class="avatar-fallback">${initials(name)}</div>`;
}

const list = document.getElementById('past-leaders-list');

if (!PAST_LEADERS || PAST_LEADERS.length === 0) {
  list.innerHTML = '<p class="hint">No past leadership sets have been added yet.</p>';
} else {
  list.innerHTML = PAST_LEADERS.map((set) => `
    <h2 style="margin-top:2rem;">${set.session}</h2>
    <div class="grid-2" style="margin-top:0.75rem;">
      ${set.exco.map((p) => `
        <div class="card person-card">
          ${avatarHtml(p.name, p.photo)}
          <div>
            <p class="person-title">${p.position}</p>
            <p class="person-name">${p.name}</p>
          </div>
        </div>
      `).join('')}
    </div>
  `).join('');
}
