const prelimsList = document.getElementById('prelimsList');
const finalsList = document.getElementById('finalsList');
const addPrelimBtn = document.getElementById('addPrelim');
const addFinalBtn = document.getElementById('addFinal');
const finalsStatusEl = document.getElementById('finalsStatus');
const finalsBlock = document.getElementById('finalsBlock');
const noPointsEl = document.getElementById('noPoints');
const pointsEl = document.getElementById('points');
const addJumpHeader = document.getElementById('addJumpHeader');

// Preload with some example prelim jumps.
// Change these to your real marks if you want.
let prelims = [
  { index: 1, feet: 18, inches: 6.25, scratch: false },
  { index: 2, feet: 19, inches: 0, scratch: true },
  { index: 3, feet: 18, inches: 10.5, scratch: false }
];

let finals = []; // start empty; you can add as needed

function formatMark(attempt) {
  if (attempt.scratch) return 'SCR';
  if (attempt.feet == null && attempt.inches == null) return '';
  const feet = attempt.feet ?? 0;
  const inches = attempt.inches ?? 0;
  return `${feet}' ${inches}"`;
}

function makeAttemptRow(attempt) {
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
      <span class="muted" style="margin-left:0.5rem;font-size:0.75rem;" data-preview></span>
    </div>
  `;

  const feetInput = wrapper.querySelectorAll('input[type="number"]')[0];
  const inchesInput = wrapper.querySelectorAll('input[type="number"]')[1];
  const scratchInput = wrapper.querySelector('input[type="checkbox"]');
  const previewSpan = wrapper.querySelector('[data-preview]');

  function updatePreview() {
    previewSpan.textContent = formatMark(attempt);
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

  // initial preview
  updatePreview();

  return wrapper;
}

function renderAttempts() {
  prelimsList.innerHTML = '';
  prelims.forEach(a => prelimsList.appendChild(makeAttemptRow(a)));

  finalsList.innerHTML = '';
  finals.forEach(a => finalsList.appendChild(makeAttemptRow(a)));
}

function addAttempt(scope) {
  const list = scope === 'prelims' ? prelims : finals;
  const nextIndex = list.length + 1;
  list.push({
    index: nextIndex,
    feet: null,
    inches: null,
    scratch: false
  });
  renderAttempts();
}

addPrelimBtn.addEventListener('click', () => addAttempt('prelims'));
addFinalBtn.addEventListener('click', () => addAttempt('finals'));
addJumpHeader.addEventListener('click', () => addAttempt('prelims'));

finalsStatusEl.addEventListener('change', () => {
  const val = finalsStatusEl.value;
  finalsBlock.style.display = val === 'made' ? 'block' : 'none';
});

noPointsEl.addEventListener('change', () => {
  if (noPointsEl.checked) {
    pointsEl.value = '';
    pointsEl.disabled = true;
  } else {
    pointsEl.disabled = false;
  }
});

// Initial render using the preset prelims (and empty finals)
renderAttempts();
finalsBlock.style.display = 'none';
