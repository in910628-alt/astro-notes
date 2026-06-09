const state = {
  tab: 'chart',        // chart | houses | hd | notes
  hdPerson: 'me',      // me | brother
  detail: null,        // { type: 'planet'|'house'|'channel', id }
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
    if (state.detail.type === 'planet')  html = renderPlanetDetail(state.detail.id);
    else if (state.detail.type === 'house')   html = renderHouseDetail(state.detail.number);
    else if (state.detail.type === 'channel') html = renderChannelDetail(state.detail.id);
  } else {
    html = `
      <div class="app-shell">
        <div class="page-content">
          ${state.tab === 'chart'  ? renderChart()  : ''}
          ${state.tab === 'houses' ? renderHouses() : ''}
          ${state.tab === 'hd'     ? renderHD()     : ''}
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
    { id: 'hd',     label: '人類圖', icon: '🩷' },
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

// ---- Human Design Tab ----
function renderHD() {
  const isRef = state.hdPerson === 'ref';
  const circuits = isRef ? HD_REFERENCE : HD_PEOPLE.find(p => p.id === state.hdPerson).circuits;
  const total = circuits.reduce((n, c) => n + c.channels.length, 0);
  return `
    <div class="page-header" style="background:linear-gradient(135deg,#831843,#DB2777)">
      <div class="page-header-inner">
        <div class="header-logo">🩷</div>
        <div>
          <h1 class="header-title">人類圖</h1>
          <p class="header-sub">Human Design・${total} 條通道</p>
        </div>
      </div>
    </div>
    <div class="hd-person-tabs">
      ${HD_PEOPLE.map(p => `
        <button class="hd-person-tab ${state.hdPerson === p.id ? 'active' : ''}"
                onclick="state.hdPerson='${p.id}';render()">
          ${p.name}
        </button>`).join('')}
      <button class="hd-person-tab ${state.hdPerson === 'ref' ? 'active' : ''}"
              onclick="state.hdPerson='ref';render()" style="--active-color:#6B7280">
        📖 參考庫
      </button>
    </div>
    ${circuits.map(circuit => `
      <div class="section-label" style="margin-top:8px">${circuit.icon} ${circuit.name}</div>
      <div class="hd-channel-list">
        ${circuit.channels.map(ch => renderChannelCard(ch, circuit)).join('')}
      </div>`).join('')}`;
}

function renderChannelCard(ch, circuit) {
  const hasNote = !!getNote(ch.id);
  return `
    <div class="hd-channel-card" onclick="navigate(null, {type:'channel', id:'${ch.id}'})"
         style="border-left:4px solid ${circuit.color}">
      <div class="hd-gate-badge" style="background:${circuit.colorLight};color:${circuit.color}">
        ${ch.gateLabel}
      </div>
      <div class="hd-channel-info">
        <div class="hd-channel-name">
          ${ch.name}
          ${hasNote ? '<span class="note-dot">●</span>' : ''}
        </div>
        <div class="hd-channel-tagline">${circuit.icon} ${ch.tagline}</div>
      </div>
      <div class="card-arrow">›</div>
    </div>`;
}

function renderChannelDetail(id) {
  let ch = null;
  let circuit = null;
  const allCircuits = [
    ...HD_PEOPLE.flatMap(p => p.circuits),
    ...HD_REFERENCE
  ];
  for (const c of allCircuits) {
    const found = c.channels.find(x => x.id === id);
    if (found) { ch = found; circuit = c; break; }
  }
  if (!ch) return '';
  const note = getNote(ch.id);
  return `
    <div class="detail-page">
      <div class="detail-header" style="background:linear-gradient(135deg,${circuit.color},#831843)">
        <button class="back-btn" onclick="navigate(null, null)">← 返回</button>
        <div class="detail-hero">
          <div class="detail-emoji">${circuit.icon}</div>
          <h2 class="detail-name">${ch.name}</h2>
          <div class="detail-sub">${ch.gateLabel || ch.gates}・${ch.tagline}</div>
        </div>
      </div>
      <div class="detail-body">
        <div class="info-chip" style="display:inline-block;background:${circuit.colorLight};color:${circuit.color};border-color:${circuit.color};margin-bottom:4px;border:1px solid">
          ${circuit.name}
        </div>
        <div class="section-label" style="margin-top:20px">通道說明</div>
        <div class="interpret-card">
          ${ch.description.split('\n\n').map(p => `<p>${p}</p>`).join('')}
        </div>
        <div class="section-label" style="margin-top:20px">閘門詳解</div>
        ${ch.gates.map(g => `
          <div class="gate-card">
            <div class="gate-num" style="background:${circuit.colorLight};color:${circuit.color}">
              閘門 ${g.number}
            </div>
            <div class="gate-name">${g.name}</div>
            <div class="gate-desc">${g.description}</div>
          </div>`).join('')}
        <div class="section-label" style="margin-top:20px">我的筆記</div>
        <div class="note-area">
          <textarea id="note-input" placeholder="記錄你的想法、心得或觀察…" rows="5">${note}</textarea>
          <button class="save-btn" onclick="saveNoteUI('${ch.id}')">儲存筆記</button>
        </div>
      </div>
    </div>`;
}

// ---- Init ----
window.addEventListener('DOMContentLoaded', () => render());
