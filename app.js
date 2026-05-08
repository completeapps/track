// Elements
const sessionListView = document.getElementById('sessionListView');
const sessionDetailView = document.getElementById('sessionDetailView');
const sessionGrid = document.getElementById('sessionGrid');
const addSessionBtn = document.getElementById('addSession');

const meetNameEl = document.getElementById('meetName');
const locationEl = document.getElementById('location');
const dateEl = document.getElementById('date');

const prelimsList = document.getElementById('prelimsList');
const finalsList = document.getElementById('finalsList');
const addPrelimBtn = document.getElementById('addPrelim');
const addFinalBtn = document.getElementById('addFinal');
const finalsStatusEl = document.getElementById('finalsStatus');
const finalsBlock = document.getElementById('finalsBlock');
const placeEl = document.getElementById('place');
const pointsEl = document.getElementById('points');
const noPointsEl = document.getElementById('noPoints');
const detailsEl = document.getElementById('details');

// Simple in-memory sessions
let sessions = [
  {
    id: 's1',
    name: 'Practice',
    location: 'Home track',
    date: '5/5/26',
    finalsStatus: 'none',
    prelims: [
      { index: 1, feet: 18, inches: 6.25, scratch: false },
      { index: 2, feet: 18, inches: 10.5, scratch: false },
      { index: 3, feet: 19, inches: 0, scratch: true }
    ],
    finals: [],
    place: '',
    points: null,
    details: ''
  }
];

let currentSessionId = null;

// Helpers
function formatMark(attempt) {
  if (attempt.scratch) return 'SCR';
  if (attempt.feet == null && attempt.inches == null) return '';
  const feet = attempt.feet ?? 0;
  const inches = attempt.inches ?? 0;
  return `${feet}' ${inches}"`;
}

function bestMark(session) {
  const all = [...session.prelims, ...session.finals].filter(a => !a.scratch && a.feet != null);
  if (all.length === 0) return '';
  // Simple best: compare by total inches
  const toInches = a => (a.feet ?? 0) * 12 + (a.inches ?? 0);
  const best = all.reduce((b, a) => (toInches(a) > toInches(b) ? a : b));
  return formatMark(best);
}

// Render sessions list
function renderSessionList() {
  sessionGrid.innerHTML = '';
  sessions.forEach(session => {
    const div = document.createElement('div');
    div.className = 'session-card';
    div.innerHTML = `
      <div class="session-card-title">${session.name || 'Untitled'}</div>
      <div class="session-card-meta">${session.location || 'No location'} · ${session.date || 'No date'}</div>
      <div class="session-card-mark">${bestMark(session) || '&nbsp;'}</div>
    `;
    div.addEventListener('click', () => openSession(session.id));
    sessionGrid.appendChild(div);
  });
}

// Open a session detail
function openSession(id) {
  const session = sessions.find(s => s.id === id);
  if (!session) return;
  currentSessionId = id;

  // Fill meta
  meetNameEl.value = session.name || '';
  locationEl.value = session.location || '';
  dateEl.value = session.date || '';
  finalsStatusEl.value = session.finalsStatus || 'none';
  placeEl.value = session.place || '';
  detailsEl.value = session.details || '';
  if (session.points == null) {
    pointsEl.value = '';
    noPointsEl.checked = true;
    pointsEl.disabled = true;
  } else {
    pointsEl.value = session.points;
    noPointsEl.checked = false;
    pointsEl.disabled = false;
  }

  // Show/hide finals block
  finalsBlock.style.display = session.finalsStatus === 'made' ? 'block' : 'none';

  // Render attempts
  renderAttempts(session);

  // Switch views
  sessionListView.style.display = 'none';
  sessionDetailView.style.display = 'block';
}

// Save current session fields back to object
function syncCurrentSessionMeta() {
  if (!currentSessionId) return;
  const session = sessions.find(s => s.id === currentSessionId);
  if (!session) return;

  session.name = meetNameEl.value.trim();
  session.location = locationEl.value.trim();
  session.date = dateEl.value.trim();
  session.finalsStatus = finalsStatusEl.value;
  session.place = placeEl.value.trim();
  session.details = detailsEl.value.trim();
  session.points = noPointsEl.checked ? null : (pointsEl.value === '' ? null : parseFloat(pointsEl.value));
}

// Attempt row builder
function makeAttemptRow(attempt, list, type) {
  const wrapper = document.createElement('div');
  wrapper.className = 'attempt-row';
  wrapper.innerHTML = `
    <div class="attempt-cell">
      <span class="muted">Attempt</span>
      <span>${attempt.index}</span>
    </div>
    <div>
      <label>Feet</label>
      <input type="number" step="1" min="0" value="${attempt.feet ?? ''}">
    </div>
    <div>
      <label>Inches</label>
      <input type="number" step="0.01" min="0" max="11.99" value="${attempt.inches ?? ''}">
    </div>
    <div class="scratch-cell">
      <label class="scratch-label">
        <input type="checkbox"${attempt.scratch ? ' checked' : ''}>
        <span>Scratch</span>
      </label>
      <span class="muted" style="font-size:0.75rem;" data-preview></span>
    </div>
  `;

  const feetInput = wrapper.querySelectorAll('input[type="number"]')[0];
  const inchesInput = wrapper.querySelectorAll('input[type="number"]')[1];
  const scratchInput = wrapper.querySelector('input[type="checkbox"]');
  const previewSpan = wrapper.querySelector('[data-preview]');

  function updatePreview() {
    previewSpan.textContent = formatMark(attempt);
    syncCurrentSessionMeta();
  }

  feetInput.addEventListener('input', () => {
    const v = feetInput.value;
    attempt.feet = v === '' ? null : parseInt(v, 10);
    updatePreview();
  });

  inchesInput.addEventListener('input', () => {
    const v = inchesInput.value;
    attempt.inches = v === '' ? null : parseFloat(v);
    updatePreview();
  });

  scratchInput.addEventListener('change', () => {
    attempt.scratch = scratchInput.checked;
    updatePreview();
  });

  updatePreview();
  return wrapper;
}

// Render attempts for a session
function renderAttempts(session) {
  prelimsList.innerHTML = '';
  session.prelims.forEach(a => {
    prelimsList.appendChild(makeAttemptRow(a, session.prelims, 'prelims'));
  });

  finalsList.innerHTML = '';
  session.finals.forEach(a => {
    finalsList.appendChild(makeAttemptRow(a, session.finals, 'finals'));
  });
}

// Add attempt
function addAttempt(scope) {
  if (!currentSessionId) return;
  const session = sessions.find(s => s.id === currentSessionId);
  if (!session) return;
  const list = scope === 'prelims' ? session.prelims : session.finals;
  const nextIndex = list.length + 1;
  list.push({
    index: nextIndex,
    feet: null,
    inches: null,
    scratch: false
  });
  renderAttempts(session);
  syncCurrentSessionMeta();
}

// Events
addSessionBtn.addEventListener('click', () => {
  const id = 's' + Date.now().toString(36);
  const newSession = {
    id,
    name: 'New session',
    location: '',
    date: '',
    finalsStatus: 'none',
    prelims: [],
    finals: [],
    place: '',
    points: null,
    details: ''
  };
  sessions.unshift(newSession);
  renderSessionList();
  openSession(id);
});

addPrelimBtn.addEventListener('click', () => addAttempt('prelims'));
addFinalBtn.addEventListener('click', () => addAttempt('finals'));

finalsStatusEl.addEventListener('change', () => {
  if (!currentSessionId) return;
  const session = sessions.find(s => s.id === currentSessionId);
  if (!session) return;
  session.finalsStatus = finalsStatusEl.value;
  finalsBlock.style.display = session.finalsStatus === 'made' ? 'block' : 'none';
  syncCurrentSessionMeta();
});

noPointsEl.addEventListener('change', () => {
  if (noPointsEl.checked) {
    pointsEl.value = '';
    pointsEl.disabled = true;
  } else {
    pointsEl.disabled = false;
  }
  syncCurrentSessionMeta();
});

meetNameEl.addEventListener('input', syncCurrentSessionMeta);
locationEl.addEventListener('input', syncCurrentSessionMeta);
dateEl.addEventListener('input', syncCurrentSessionMeta);
placeEl.addEventListener('input', syncCurrentSessionMeta);
detailsEl.addEventListener('input', syncCurrentSessionMeta);

// Initial render: list view
renderSessionList();
sessionListView.style.display = 'block';
sessionDetailView.style.display = 'none';
