const state = {
  tab: 'chart',        // chart | houses | notes
  detail: null,        // { type: 'planet'|'house', id }
};

// ---- Persistence ----
function loadNotes() {
  try { return JSON.parse(localStorage.getItem('astro_notes') || '{}'); } catch { return {}; }
}
function saveNote(id, text) {
  const notes = loadNotes();
  if (text.trim()) notes[id] = text.trim();
  else delete notes[id];
  localStorage.setItem('astro_notes', JSON.stringify(notes));
}
function getNote(id) { return loadNotes()[id] || ''; }

// ---- Navigation ----
function navigate(tab, detail) {
  state.tab = tab || state.tab;
  state.detail = detail || null;
  render();
  window.scrollTo(0, 0);
}

// ---- Render ----
function root() { return document.getElementById('app-root'); }

function render() {
  let html = '';
  if (state.detail) {
    if (state.detail.type === 'planet') html = renderPlanetDetail(state.detail.id);
    else if (state.detail.type === 'house') html = renderHouseDetail(state.detail.number);
  } else {
    html = `
      <div class="app-shell">
        <div class="page-content">
          ${state.tab === 'chart'  ? renderChart()  : ''}
          ${state.tab === 'houses' ? renderHouses() : ''}
          ${state.tab === 'notes'  ? renderNotes()  : ''}
        </div>
        ${renderNav()}
      </div>`;
  }
  root().innerHTML = html;
}

// ---- Bottom Nav ----
function renderNav() {
  const tabs = [
    { id: 'chart',  label: '星盤', icon: '✨' },
    { id: 'houses', label: '宮位', icon: '🏛' },
    { id: 'notes',  label: '筆記', icon: '📝' },
  ];
  return `
    <nav class="bottom-nav">
      ${tabs.map(t => `
        <button class="nav-tab ${state.tab === t.id ? 'active' : ''}"
                onclick="navigate('${t.id}')">
          <span class="nav-icon">${t.icon}</span>
          <span class="nav-label">${t.label}</span>
        </button>`).join('')}
    </nav>`;
}

// ---- Chart Tab ----
function renderChart() {
  return `
    <div class="page-header">
      <div class="page-header-inner">
        <div class="header-logo">✨</div>
        <div>
          <h1 class="header-title">我的星盤</h1>
          <p class="header-sub">本命星盤・行星解析</p>
        </div>
      </div>
    </div>
    <div class="section-label">行星與宮位</div>
    <div class="planet-list">
      ${PLANETS.map(p => renderPlanetCard(p)).join('')}
    </div>`;
}

function renderPlanetCard(p) {
  const el = ELEMENT_COLORS[p.signElement];
  const hasNote = !!getNote(p.id);
  return `
    <div class="planet-card" onclick="navigate(null, {type:'planet', id:'${p.id}'})">
      <div class="planet-symbol" style="color:${p.color}">${p.emoji}</div>
      <div class="planet-info">
        <div class="planet-name">
          ${p.name}
          <span class="planet-symbol-small" style="color:${p.color}">${p.symbol}</span>
          ${p.retrograde ? '<span class="retro-badge">℞</span>' : ''}
          ${hasNote ? '<span class="note-dot">●</span>' : ''}
        </div>
        <div class="planet-meta">
          <span class="sign-badge" style="background:${el.bg};color:${el.text};border-color:${el.border}">
            ${p.signSymbol} ${p.sign}
          </span>
          <span class="degree-text">${p.degree}</span>
        </div>
      </div>
      <div class="planet-house">
        <div class="house-num">第 ${p.house} 宮</div>
      </div>
      <div class="card-arrow">›</div>
    </div>`;
}

// ---- Planet Detail ----
function renderPlanetDetail(id) {
  const p = PLANETS.find(x => x.id === id);
  if (!p) return '';
  const el = ELEMENT_COLORS[p.signElement];
  const note = getNote(p.id);
  return `
    <div class="detail-page">
      <div class="detail-header" style="background:${p.color}">
        <button class="back-btn" onclick="navigate(null, null)">← 返回</button>
        <div class="detail-hero">
          <div class="detail-emoji">${p.emoji}</div>
          <h2 class="detail-name">${p.name} ${p.symbol}</h2>
          <div class="detail-sub">${p.nameEn}${p.retrograde ? ' ℞' : ''}</div>
        </div>
      </div>
      <div class="detail-body">
        <div class="info-row">
          <div class="info-chip" style="background:${el.bg};color:${el.text};border-color:${el.border}">
            ${p.signSymbol} ${p.sign}・${p.degree}
          </div>
          <div class="info-chip house-chip">
            第 ${p.house} 宮
          </div>
        </div>
        ${p.interpretation ? `
          <div class="section-label" style="margin-top:20px">解析</div>
          <div class="interpret-card">
            ${p.interpretation.split('\n\n').map(para => `<p>${para}</p>`).join('')}
          </div>` : `
          <div class="empty-interpret">
            <div>📖</div>
            <div>尚未有解析資料</div>
            <div class="empty-sub">可在下方筆記記錄你的心得</div>
          </div>`}
        <div class="section-label" style="margin-top:20px">我的筆記</div>
        <div class="note-area">
          <textarea id="note-input" placeholder="記錄你的想法、心得或觀察…" rows="5">${note}</textarea>
          <button class="save-btn" onclick="saveNoteUI('${p.id}')">儲存筆記</button>
        </div>
      </div>
    </div>`;
}

function saveNoteUI(id) {
  const text = document.getElementById('note-input').value;
  saveNote(id, text);
  const btn = document.querySelector('.save-btn');
  btn.textContent = '✓ 已儲存';
  btn.style.background = '#22C55E';
  setTimeout(() => { btn.textContent = '儲存筆記'; btn.style.background = ''; }, 1500);
}

// ---- Houses Tab ----
function renderHouses() {
  return `
    <div class="page-header">
      <div class="page-header-inner">
        <div class="header-logo">🏛</div>
        <div>
          <h1 class="header-title">十二宮位</h1>
          <p class="header-sub">各宮位代表意義說明</p>
        </div>
      </div>
    </div>
    <div class="section-label">宮位列表</div>
    <div class="house-list">
      ${HOUSES.map(h => renderHouseItem(h)).join('')}
    </div>`;
}

function renderHouseItem(h) {
  const planetsHere = PLANETS.filter(p => p.house === h.number);
  const hasNote = !!getNote(`house-${h.number}`);
  return `
    <div class="house-item" onclick="navigate('houses', {type:'house', number:${h.number}})">
      <div class="house-num-badge">${h.number}</div>
      <div class="house-item-info">
        <div class="house-item-title">
          第 ${h.number} 宮
          ${hasNote ? '<span class="note-dot">●</span>' : ''}
        </div>
        <div class="house-keyword">${h.icon} ${h.keyword}</div>
        ${planetsHere.length > 0 ? `
          <div class="house-planets">
            ${planetsHere.map(p => `<span class="house-planet-tag" style="color:${p.color}">${p.emoji} ${p.name}</span>`).join('')}
          </div>` : ''}
      </div>
      <div class="card-arrow">›</div>
    </div>`;
}

// ---- House Detail ----
function renderHouseDetail(number) {
  const h = HOUSES.find(x => x.number === number);
  if (!h) return '';
  const planetsHere = PLANETS.filter(p => p.house === number);
  const note = getNote(`house-${number}`);
  return `
    <div class="detail-page">
      <div class="detail-header" style="background:#4F46E5">
        <button class="back-btn" onclick="navigate(null, null)">← 返回</button>
        <div class="detail-hero">
          <div class="detail-emoji">${h.icon}</div>
          <h2 class="detail-name">第 ${h.number} 宮</h2>
          <div class="detail-sub">${h.keyword}</div>
        </div>
      </div>
      <div class="detail-body">
        ${planetsHere.length > 0 ? `
          <div class="section-label">我的星盤・落入此宮</div>
          <div class="house-planet-list">
            ${planetsHere.map(p => `
              <div class="mini-planet-card" onclick="navigate(null, {type:'planet', id:'${p.id}'})">
                <span style="font-size:20px">${p.emoji}</span>
                <span style="color:${p.color};font-weight:600">${p.name}</span>
                <span style="color:#6B7280;font-size:13px">${p.signSymbol} ${p.sign}・${p.degree}</span>
                <span class="card-arrow" style="margin-left:auto">›</span>
              </div>`).join('')}
          </div>` : ''}
        <div class="section-label" style="margin-top:20px">宮位說明</div>
        <div class="interpret-card">
          ${h.description.split('\n\n').map(para => `<p>${para}</p>`).join('')}
        </div>
        <div class="section-label" style="margin-top:20px">我的筆記</div>
        <div class="note-area">
          <textarea id="note-input" placeholder="記錄你對這個宮位的想法…" rows="5">${note}</textarea>
          <button class="save-btn" onclick="saveNoteUI('house-${number}')">儲存筆記</button>
        </div>
      </div>
    </div>`;
}

// ---- Notes Tab ----
function renderNotes() {
  const notes = loadNotes();
  const entries = Object.entries(notes);
  return `
    <div class="page-header">
      <div class="page-header-inner">
        <div class="header-logo">📝</div>
        <div>
          <h1 class="header-title">我的筆記</h1>
          <p class="header-sub">共 ${entries.length} 則筆記</p>
        </div>
      </div>
    </div>
    ${entries.length === 0 ? `
      <div class="empty-notes">
        <div style="font-size:48px">📝</div>
        <div>還沒有筆記</div>
        <div class="empty-sub">在行星或宮位的詳細頁面可以新增筆記</div>
      </div>` : `
      <div class="section-label">所有筆記</div>
      <div class="notes-list">
        ${entries.map(([id, text]) => renderNoteEntry(id, text)).join('')}
      </div>`}`;
}

function renderNoteEntry(id, text) {
  const planet = PLANETS.find(p => p.id === id);
  const houseMatch = id.match(/^house-(\d+)$/);
  const house = houseMatch ? HOUSES.find(h => h.number === parseInt(houseMatch[1])) : null;

  let title, emoji, onclick;
  if (planet) {
    title = planet.name;
    emoji = planet.emoji;
    onclick = `navigate(null, {type:'planet', id:'${id}'})`;
  } else if (house) {
    title = `第 ${house.number} 宮・${house.keyword}`;
    emoji = house.icon;
    onclick = `navigate('houses', {type:'house', number:${house.number}})`;
  } else {
    return '';
  }

  const preview = text.length > 60 ? text.slice(0, 60) + '…' : text;
  return `
    <div class="note-entry" onclick="${onclick}">
      <div class="note-entry-title">${emoji} ${title}</div>
      <div class="note-entry-preview">${preview}</div>
    </div>`;
}

// ---- Init ----
window.addEventListener('DOMContentLoaded', () => render());
