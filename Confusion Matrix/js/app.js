/* ================================================================
   APP
   Global state object, the generate() orchestration function,
   history push, and the remaining top-level button listeners.
   This file runs last and bootstraps the page.
   ================================================================ */

const state = {
  numClasses: 3,
  totalSamples: 300,
  accuracy: 92,
  distType: 'balanced',
  support: [],
  matrix: [],
  history: []
};

function generate(){
  const { errors, numClasses, totalSamples, accuracy, distType, customCounts } = validateInputs();
  showWarnings(errors);
  if(errors.length) return;

  let support;
  if(distType === 'balanced') support = balancedDistribution(numClasses, totalSamples);
  else if(distType === 'imbalanced') support = imbalancedDistribution(numClasses, totalSamples);
  else support = customCounts;

  const matrix = synthesizeMatrix(support, accuracy);

  state.numClasses = numClasses;
  state.totalSamples = totalSamples;
  state.accuracy = accuracy;
  state.distType = distType;
  state.support = support;
  state.matrix = matrix;

  pushHistory();
  renderAll();
  showToast('Matrix generated.');
}

function pushHistory(){
  state.history.unshift({
    label: `${state.numClasses}×${state.numClasses} · ${state.totalSamples} samples · ${state.accuracy}% target`,
    matrix: state.matrix.map(r => r.slice()),
    support: state.support.slice()
  });
  state.history = state.history.slice(0, 8);
  renderHistory();
}

document.getElementById('generateBtn').addEventListener('click', generate);

document.getElementById('randomBtn').addEventListener('click', () => {
  document.getElementById('numClasses').value = Math.floor(Math.random()*8)+2;
  document.getElementById('totalSamples').value = Math.floor(Math.random()*1900)+100;
  document.getElementById('accuracy').value = (Math.random()*40+60).toFixed(1);
  const types = ['balanced','imbalanced','custom'];
  const t = types[Math.floor(Math.random()*types.length)];
  document.getElementById('distType').value = t;
  document.getElementById('customWrap').style.display = t === 'custom' ? 'block' : 'none';
  if(t === 'custom') buildCustomInputs();
  generate();
});

document.getElementById('resetBtn').addEventListener('click', () => {
  document.getElementById('numClasses').value = 3;
  document.getElementById('totalSamples').value = 300;
  document.getElementById('accuracy').value = 92;
  document.getElementById('distType').value = 'balanced';
  document.getElementById('customWrap').style.display = 'none';
  showWarnings([]);
  document.getElementById('outputArea').innerHTML = `
    <div class="card"><div class="empty"><div class="glyph">⌗</div>
    <div>No matrix yet — set your parameters and click <strong>Generate matrix</strong>.</div></div></div>`;
  document.getElementById('exportCard').style.display = 'none';
});

/* ---- Init ---- */
buildCustomInputs();
generate();
