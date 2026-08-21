const TIER_LABEL = { basic: 'Foundational', intermediate: 'Intermediate', advanced: 'Advanced' };
const STATUS_LABEL = { complete: 'Complete', 'in-progress': 'In progress', 'not-started': 'Not started' };

let state = {
  tier: 'all',
  status: 'all',
  query: ''
};

function statusOf(skill) {
  return skill.status || 'not-started';
}

async function loadData() {
  try {
    const res = await fetch('data.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('bad response');
    return await res.json();
  } catch (err) {
    document.getElementById('families').innerHTML =
      '<p class="empty-state">Couldn\'t load data.json. Make sure it sits alongside index.html.</p>';
    return [];
  }
}

function computeStats(data) {
  let total = 0, complete = 0, inProgress = 0;
  const tierCounts = { basic: 0, intermediate: 0, advanced: 0 };
  data.forEach(fam => fam.skills.forEach(s => {
    total++;
    tierCounts[s.tier] = (tierCounts[s.tier] || 0) + 1;
    const st = statusOf(s);
    if (st === 'complete') complete++;
    else if (st === 'in-progress') inProgress++;
  }));
  return { total, complete, inProgress, tierCounts };
}

function renderOverview(data) {
  const { total, complete, inProgress, tierCounts } = computeStats(data);
  const pct = total ? Math.round((complete / total) * 100) : 0;

  document.getElementById('stat-complete').textContent = complete;
  document.getElementById('stat-progress').textContent = inProgress;
  document.getElementById('stat-total').textContent = total;
  document.getElementById('stamp-pct').textContent = pct + '%';

  const circumference = 552.9;
  const offset = circumference - (pct / 100) * circumference;
  requestAnimationFrame(() => {
    document.getElementById('stamp-ring-fg').style.strokeDashoffset = offset;
  });

  const tierBar = document.getElementById('tier-bar');
  tierBar.innerHTML = '';
  ['basic', 'intermediate', 'advanced'].forEach(t => {
    const share = total ? (tierCounts[t] / total) * 100 : 0;
    const span = document.createElement('span');
    span.style.width = share + '%';
    span.style.background = `var(--${t})`;
    tierBar.appendChild(span);
  });

  const now = new Date();
  document.getElementById('last-updated').textContent =
    'VIEWED ' + now.toISOString().slice(0, 10).replace(/-/g, '.');
}

function matchesFilters(skill) {
  if (state.tier !== 'all' && skill.tier !== state.tier) return false;
  if (state.status !== 'all' && statusOf(skill) !== state.status) return false;
  if (state.query) {
    const q = state.query.toLowerCase();
    if (!skill.description.toLowerCase().includes(q) && !skill.id.toLowerCase().includes(q)) return false;
  }
  return true;
}

function renderFamilies(data) {
  const container = document.getElementById('families');
  container.innerHTML = '';

  let anyVisible = false;

  data.forEach((fam, famIdx) => {
    const visibleSkills = fam.skills.filter(matchesFilters);
    if (visibleSkills.length === 0 && (state.tier !== 'all' || state.status !== 'all' || state.query)) {
      return;
    }
    anyVisible = true;

    const famComplete = fam.skills.filter(s => statusOf(s) === 'complete').length;
    const famTotal = fam.skills.length;
    const famPct = famTotal ? famComplete / famTotal : 0;

    const section = document.createElement('section');
    section.className = 'family';
    section.dataset.famIdx = famIdx;

    const badgeClass = famPct === 1 ? 'badge-done' : famPct > 0 ? 'badge-mid' : '';

    section.innerHTML = `
      <button class="family-header" aria-expanded="true">
        <div class="family-header-left">
          <div class="family-badge ${badgeClass}">${famComplete}/${famTotal}</div>
          <div>
            <div class="family-title">${fam.family}</div>
            <div class="family-count">${famTotal} skills across three tiers</div>
          </div>
        </div>
        <span class="caret">▾</span>
      </button>
      <div class="skill-table-wrap">
        <table class="skill-table">
          <thead>
            <tr>
              <th style="width:60px;">ID</th>
              <th>Skill</th>
              <th style="width:130px;">Tier</th>
              <th style="width:130px;">Status</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>
    `;

    const tbody = section.querySelector('tbody');
    fam.skills.forEach(skill => {
      const row = document.createElement('tr');
      const visible = matchesFilters(skill);
      if (!visible) row.classList.add('hidden');
      const st = statusOf(skill);
      row.innerHTML = `
        <td class="skill-id">${skill.id}</td>
        <td class="skill-desc">${skill.description}${skill.note ? `<div class="skill-note">${skill.note}</div>` : ''}</td>
        <td><span class="tier-pill ${skill.tier}">${TIER_LABEL[skill.tier]}</span></td>
        <td><span class="status-pill ${st}">${STATUS_LABEL[st]}</span></td>
      `;
      tbody.appendChild(row);
    });

    const header = section.querySelector('.family-header');
    header.addEventListener('click', () => {
      section.classList.toggle('collapsed');
      header.setAttribute('aria-expanded', String(!section.classList.contains('collapsed')));
    });

    container.appendChild(section);
  });

  if (!anyVisible) {
    container.innerHTML = '<p class="empty-state">No skills match the current filters.</p>';
  }
}

function wireControls(data) {
  document.getElementById('search').addEventListener('input', e => {
    state.query = e.target.value.trim();
    renderFamilies(data);
  });

  document.getElementById('tier-filter').addEventListener('click', e => {
    const btn = e.target.closest('.filter-chip');
    if (!btn) return;
    state.tier = btn.dataset.tier;
    [...document.getElementById('tier-filter').children].forEach(c => c.classList.toggle('active', c === btn));
    renderFamilies(data);
  });

  document.getElementById('status-filter').addEventListener('click', e => {
    const btn = e.target.closest('.filter-chip');
    if (!btn) return;
    state.status = btn.dataset.status;
    [...document.getElementById('status-filter').children].forEach(c => c.classList.toggle('active', c === btn));
    renderFamilies(data);
  });
}

(async function init() {
  const data = await loadData();
  if (!data.length) return;
  renderOverview(data);
  renderFamilies(data);
  wireControls(data);
})();
