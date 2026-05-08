// app.js – no Firebase, local sessions only

let sessions = [
  {
    id: "s1",
    type: "meet",
    name: "Practice",
    location: "Home track",
    date: "5/5/26",
    finalsStatus: "none",
    prelims: [
      { index: 1, feet: 18, inches: 6.25, scratch: false },
      { index: 2, feet: 18, inches: 10.5, scratch: false },
      { index: 3, feet: 19, inches: 0, scratch: true }
    ],
    finals: [],
    place: "",
    points: null,
    details: ""
  }
];

let currentSessionId = null;
let originalSnapshot = null;
let dirty = false;
let mode = "view"; // "view" | "edit"

// Elements
const sessionListView = document.getElementById("sessionListView");
const sessionDetailView = document.getElementById("sessionDetailView");
const sessionGrid = document.getElementById("sessionGrid");
const addSessionBtn = document.getElementById("addSession");
const backToSessionsBtn = document.getElementById("backToSessions");
const saveSessionBtn = document.getElementById("saveSession");
const editSessionBtn = document.getElementById("editSession");
const saveStatusEl = document.getElementById("saveStatus");
const detailTitleEl = document.getElementById("detailTitle");

const meetNameEl = document.getElementById("meetName");
const locationEl = document.getElementById("location");
const dateEl = document.getElementById("date");

const prelimsList = document.getElementById("prelimsList");
const finalsList = document.getElementById("finalsList");
const addPrelimBtn = document.getElementById("addPrelim");
const addFinalBtn = document.getElementById("addFinal");
const finalsStatusEl = document.getElementById("finalsStatus");
const finalsBlock = document.getElementById("finalsBlock");
const placeEl = document.getElementById("place");
const pointsEl = document.getElementById("points");
const noPointsEl = document.getElementById("noPoints");
const detailsEl = document.getElementById("details");

// Helpers
function formatMark(attempt) {
  if (attempt.scratch) return "SCR";
  if (attempt.feet == null && attempt.inches == null) return "";
  const feet = attempt.feet ?? 0;
  const inches = attempt.inches ?? 0;
  return `${feet}' ${inches}"`;
}

function toInches(a) {
  return (a.feet ?? 0) * 12 + (a.inches ?? 0);
}

function bestMark(session) {
  const all = [...(session.prelims || []), ...(session.finals || [])].filter(
    (a) => !a.scratch && a.feet != null
  );
  if (all.length === 0) return "";
  const best = all.reduce((b, a) => (toInches(a) > toInches(b) ? a : b));
  return formatMark(best);
}

function overallBestInches() {
  const allAttempts = sessions.flatMap((s) =>
    [...(s.prelims || []), ...(s.finals || [])].filter(
      (a) => !a.scratch && a.feet != null
    )
  );
  if (allAttempts.length === 0) return null;
  return allAttempts.reduce((max, a) => Math.max(max, toInches(a)), 0);
}

function toInchesFromString(mark) {
  const match = mark.match(/(\d+)'[\s]+([\d.]+)"/);
  if (!match) return 0;
  const feet = parseInt(match[1], 10);
  const inches = parseFloat(match[2]);
  return feet * 12 + inches;
}

// UI mode
function setDetailMode(nextMode) {
  mode = nextMode;
  const isEdit = mode === "edit";

  const inputs = [
    meetNameEl,
    locationEl,
    dateEl,
    finalsStatusEl,
    placeEl,
    pointsEl,
    detailsEl
  ];
  inputs.forEach((el) => {
    el.disabled = !isEdit;
  });

  const attemptInputs = sessionDetailView.querySelectorAll(".attempt-row input");
  attemptInputs.forEach((input) => {
    input.disabled = !isEdit;
  });

  if (isEdit) {
    editSessionBtn.style.display = "none";
    saveSessionBtn.style.display = "inline-block";
  } else {
    editSessionBtn.style.display = "inline-block";
    saveSessionBtn.style.display = "none";
  }
}

// Sessions list
function renderSessionList() {
  const overallBest = overallBestInches();
  sessionGrid.innerHTML = "";
  sessions.forEach((session) => {
    const bm = bestMark(session);
    const hasBest =
      bm && overallBest !== null && toInchesFromString(bm) === overallBest;

    const div = document.createElement("div");
    div.className = "session-card" + (hasBest ? " session-card-pr" : "");
    div.innerHTML = `
      <div class="session-card-title-row">
        <div class="session-card-title">${session.name || "Untitled"}</div>
        <div class="session-card-type">${(session.type || "session").toUpperCase()}</div>
      </div>
      <div class="session-card-meta">${session.location || "No location"} · ${
      session.date || "No date"
    }</div>
      <div class="session-card-mark">
        <span>${bm || "No mark"}</span>
      </div>
    `;
    div.addEventListener("click", () => openSession(session.id));
    sessionGrid.appendChild(div);
  });
}

// Detail
function openSession(id) {
  const session = sessions.find((s) => s.id === id);
  if (!session) return;
  currentSessionId = id;

  // Fill meta
  meetNameEl.value = session.name || "";
  locationEl.value = session.location || "";
  dateEl.value = session.date || "";
  finalsStatusEl.value = session.finalsStatus || "none";
  placeEl.value = session.place || "";
  detailsEl.value = session.details || "";
  if (session.points == null) {
    pointsEl.value = "";
    noPointsEl.checked = true;
    pointsEl.disabled = true;
  } else {
    pointsEl.value = session.points;
    noPointsEl.checked = false;
    pointsEl.disabled = false;
  }

  // Finals visibility
  finalsBlock.style.display =
    session.finalsStatus === "made" ? "block" : "none";

  // Attempts
  renderAttempts(session);

  // Dirty tracking
  originalSnapshot = JSON.stringify(session);
  dirty = false;
  detailTitleEl.textContent = session.name || "Session";

  sessionListView.style.display = "none";
  sessionDetailView.style.display = "block";

  setDetailMode("view");
  hideSaved();
}

function syncCurrentSessionMeta() {
  if (!currentSessionId) return;
  const session = sessions.find((s) => s.id === currentSessionId);
  if (!session) return;

  session.name = meetNameEl.value.trim();
  session.location = locationEl.value.trim();
  session.date = dateEl.value.trim();
  session.finalsStatus = finalsStatusEl.value;
  session.place = placeEl.value.trim();
  session.details = detailsEl.value.trim();
  session.points = noPointsEl.checked
    ? null
    : pointsEl.value === ""
    ? null
    : parseFloat(pointsEl.value);
  detailTitleEl.textContent = session.name || "Session";

  const nowSnapshot = JSON.stringify(session);
  dirty = nowSnapshot !== originalSnapshot;
}

function makeAttemptRow(attempt) {
  const wrapper = document.createElement("div");
  wrapper.className = "attempt-row";
  wrapper.innerHTML = `
    <div class="attempt-cell">
      <span class="muted">Attempt</span>
      <span>${attempt.index}</span>
    </div>
    <div>
      <label>Feet</label>
      <input type="number" step="1" min="0" value="${attempt.feet ?? ""}">
    </div>
    <div>
      <label>Inches</label>
      <input type="number" step="0.01" min="0" max="11.99" value="${
        attempt.inches ?? ""
      }">
    </div>
    <div class="scratch-cell">
      <label class="scratch-label">
        <input type="checkbox"${attempt.scratch ? " checked" : ""}>
        <span>Scratch</span>
      </label>
      <span class="attempt-preview">${formatMark(attempt)}</span>
    </div>
  `;

  const feetInput = wrapper.querySelectorAll('input[type="number"]')[0];
  const inchesInput = wrapper.querySelectorAll('input[type="number"]')[1];
  const scratchInput = wrapper.querySelector('input[type="checkbox"]');
  const previewSpan = wrapper.querySelector(".attempt-preview");

  function updatePreviewAndDirty() {
    previewSpan.textContent = formatMark(attempt);
    syncCurrentSessionMeta();
  }

  feetInput.addEventListener("input", () => {
    const v = feetInput.value;
    attempt.feet = v === "" ? null : parseInt(v, 10);
    updatePreviewAndDirty();
  });

  inchesInput.addEventListener("input", () => {
    const v = inchesInput.value;
    attempt.inches = v === "" ? null : parseFloat(v);
    updatePreviewAndDirty();
  });

  scratchInput.addEventListener("change", () => {
    attempt.scratch = scratchInput.checked;
    updatePreviewAndDirty();
  });

  return wrapper;
}

function renderAttempts(session) {
  prelimsList.innerHTML = "";
  (session.prelims || []).forEach((a) =>
    prelimsList.appendChild(makeAttemptRow(a))
  );

  finalsList.innerHTML = "";
  (session.finals || []).forEach((a) =>
    finalsList.appendChild(makeAttemptRow(a))
  );

  setDetailMode(mode);
}

// Add attempt
function addAttempt(scope) {
  if (!currentSessionId) return;
  const session = sessions.find((s) => s.id === currentSessionId);
  if (!session) return;
  const list = scope === "prelims" ? session.prelims : session.finals;
  if (!list) {
    if (scope === "prelims") session.prelims = [];
    else session.finals = [];
  }
  const target = scope === "prelims" ? session.prelims : session.finals;
  const nextIndex = target.length + 1;
  target.push({
    index: nextIndex,
    feet: null,
    inches: null,
    scratch: false
  });
  renderAttempts(session);
  syncCurrentSessionMeta();
}

// Create new session
function createSession() {
  const id = "s" + Date.now().toString(36);
  const newSession = {
    id,
    type: "practice",
    name: "New session",
    location: "",
    date: "",
    finalsStatus: "none",
    prelims: [],
    finals: [],
    place: "",
    points: null,
    details: ""
  };
  sessions.unshift(newSession);
  renderSessionList();
  openSession(id);
}

// Save current session (local only)
function saveCurrentSession() {
  syncCurrentSessionMeta();
  if (!currentSessionId) return;
  const session = sessions.find((s) => s.id === currentSessionId);
  if (!session) return;
  originalSnapshot = JSON.stringify(session);
  dirty = false;
  setDetailMode("view");
  showSaved();
}

// Saved label
function showSaved() {
  saveStatusEl.textContent = "Saved";
  saveStatusEl.style.opacity = "1";
  setTimeout(() => {
    saveStatusEl.style.opacity = "0";
  }, 1500);
}

function hideSaved() {
  saveStatusEl.style.opacity = "0";
}

// Events
addSessionBtn.addEventListener("click", createSession);
addPrelimBtn.addEventListener("click", () => addAttempt("prelims"));
addFinalBtn.addEventListener("click", () => addAttempt("finals"));
saveSessionBtn.addEventListener("click", saveCurrentSession);

editSessionBtn.addEventListener("click", () => {
  setDetailMode("edit");
});

backToSessionsBtn.addEventListener("click", () => {
  if (mode === "edit" && dirty) {
    const ok = confirm("You have unsaved changes. Go back and lose changes?");
    if (!ok) return;
  }
  sessionDetailView.style.display = "none";
  sessionListView.style.display = "block";
  renderSessionList();
});

// Finals status + meta inputs
finalsStatusEl.addEventListener("change", () => {
  if (!currentSessionId) return;
  const session = sessions.find((s) => s.id === currentSessionId);
  if (!session) return;
  session.finalsStatus = finalsStatusEl.value;
  finalsBlock.style.display =
    session.finalsStatus === "made" ? "block" : "none";
  syncCurrentSessionMeta();
});

noPointsEl.addEventListener("change", () => {
  if (noPointsEl.checked) {
    pointsEl.value = "";
    pointsEl.disabled = true;
  } else {
    pointsEl.disabled = false;
  }
  syncCurrentSessionMeta();
});

meetNameEl.addEventListener("input", syncCurrentSessionMeta);
locationEl.addEventListener("input", syncCurrentSessionMeta);
dateEl.addEventListener("input", syncCurrentSessionMeta);
placeEl.addEventListener("input", syncCurrentSessionMeta);
detailsEl.addEventListener("input", syncCurrentSessionMeta);
pointsEl.addEventListener("input", syncCurrentSessionMeta);

// Initial render: list view
renderSessionList();
sessionListView.style.display = "block";
sessionDetailView.style.display = "none";
