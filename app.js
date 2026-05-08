const prelimsList = document.getElementById('prelimsList');
const finalsList = document.getElementById('finalsList');
const addPrelimBtn = document.getElementById('addPrelim');
const addFinalBtn = document.getElementById('addFinal');
const finalsStatusEl = document.getElementById('finalsStatus');
const finalsBlock = document.getElementById('finalsBlock');
const noPointsEl = document.getElementById('noPoints');
const pointsEl = document.getElementById('points');

let prelims = [];
let finals = [];

function makeAttemptRow(attempt) {
  const wrapper = document.createElement('div');
  wrapper.className = 'attempt-row';
  wrapper.innerHTML = `
    <div class="attempt-cell">
      <span class="muted">Attempt</span>
      <span>${attempt.index}</span>
    </div>
    <div>
      <label>Distance</label>
      <input type="number" step="0.01" value="${attempt.distance ?? ''}">
    </div>
    <div>
      <label>Unit</label>
      <select>
        <option value="m"${attempt.unit === 'm' ? ' selected' : ''}>m</option>
        <option value="ft"${attempt.unit === 'ft' ? ' selected' : ''}>ft</option>
      </select>
    </div>
    <div class="scratch-cell">
      <label class="scratch-label">
        <input type="checkbox"${attempt.scratch ? ' checked' : ''}>
        <span>Scratch</span>
      </label>
    </div>
  `;

  const distInput = wrapper.querySelector('input[type="number"]');
  const unitSelect = wrapper.querySelector('select');
  const scratchInput = wrapper.querySelector('input[type="checkbox"]');

  distInput.addEventListener('input', () => {
    attempt.distance = distInput.value ? parseFloat(distInput.value) : null;
  });
  unitSelect.addEventListener('change', () => {
    attempt.unit = unitSelect.value;
  });
  scratchInput.addEventListener('change', () => {
    attempt.scratch = scratchInput.checked;
  });

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
    distance: null,
    unit: 'm',
    scratch: false
  });
  renderAttempts();
}

addPrelimBtn.addEventListener('click', () => addAttempt('prelims'));
addFinalBtn.addEventListener('click', () => addAttempt('finals'));

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

// initial 3 + 3 attempts
for (let i = 0; i < 3; i++) addAttempt('prelims');
for (let i = 0; i < 3; i++) addAttempt('finals');
finalsBlock.style.display = 'none';
