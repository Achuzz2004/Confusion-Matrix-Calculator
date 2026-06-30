/* ================================================================
   UI
   Validation, toast/warning helpers, custom-distribution inputs,
   theme toggle, and history list rendering.
   ================================================================ */

function showToast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => t.classList.remove('show'), 2200);
}

function showWarnings(list){
  const box = document.getElementById('warnings');
  box.innerHTML = '';
  list.forEach(msg => {
    const div = document.createElement('div');
    div.className = 'warning';
    div.innerHTML = `<span>⚠</span><span>${msg}</span>`;
    box.appendChild(div);
  });
}

function validateInputs(){
  const errors = [];
  const numClasses = parseInt(document.getElementById('numClasses').value, 10);
  const totalSamples = parseInt(document.getElementById('totalSamples').value, 10);
  const accuracy = parseFloat(document.getElementById('accuracy').value);
  const distType = document.getElementById('distType').value;

  if(isNaN(numClasses) || numClasses < 2) errors.push('Number of classes must be at least 2.');
  if(numClasses > 100) errors.push('Number of classes cannot exceed 100.');
  if(isNaN(totalSamples) || totalSamples <= 0) errors.push('Total samples must be greater than 0.');
  if(isNaN(accuracy) || accuracy < 0) errors.push('Accuracy cannot be below 0%.');
  if(accuracy > 100) errors.push('Accuracy cannot exceed 100%.');

  let customCounts = null;
  if(distType === 'custom'){
    customCounts = Array.from(document.querySelectorAll('.cc-input')).map(i => parseInt(i.value,10) || 0);
    const sum = customCounts.reduce((a,b)=>a+b,0);
    if(sum !== totalSamples){
      errors.push(`Custom class counts sum to ${sum}, but total samples is ${totalSamples}. They must match.`);
    }
    if(customCounts.some(c => c < 0)) errors.push('Class counts cannot be negative.');
  }

  return { errors, numClasses, totalSamples, accuracy, distType, customCounts };
}

function buildCustomInputs(){
  const numClasses = parseInt(document.getElementById('numClasses').value, 10) || 2;
  const totalSamples = parseInt(document.getElementById('totalSamples').value, 10) || 0;
  const wrap = document.getElementById('customClasses');
  wrap.innerHTML = '';
  const base = balancedDistribution(numClasses, totalSamples);
  for(let i=0;i<numClasses;i++){
    const row = document.createElement('div');
    row.className = 'cc-row';
    row.innerHTML = `<span>${classLabel(i)}</span><input type="number" class="cc-input" min="0" value="${base[i]}" />`;
    wrap.appendChild(row);
  }
  wrap.querySelectorAll('.cc-input').forEach(inp => inp.addEventListener('input', updateCustomSum));
  updateCustomSum();
}

function updateCustomSum(){
  const totalSamples = parseInt(document.getElementById('totalSamples').value, 10) || 0;
  const sum = Array.from(document.querySelectorAll('.cc-input')).reduce((a,i) => a + (parseInt(i.value,10)||0), 0);
  const el = document.getElementById('ccSum');
  el.textContent = `Sum: ${sum} / ${totalSamples}`;
  el.className = 'cc-sum ' + (sum === totalSamples ? 'ok' : 'bad');
}

function renderHistory(){
  const list = document.getElementById('historyList');
  list.innerHTML = '';
  state.history.forEach((h) => {
    const item = document.createElement('div');
    item.className = 'history-item';
    item.innerHTML = `<span>${h.label}</span><span>↻</span>`;
    item.addEventListener('click', () => {
      state.matrix = h.matrix.map(r => r.slice());
      state.support = h.support.slice();
      renderAll();
      showToast('Restored from history.');
    });
    list.appendChild(item);
  });
  document.getElementById('historyCard').style.display = state.history.length ? 'block' : 'none';
}

/* ---- Theme toggle ---- */
document.getElementById('themeToggle').addEventListener('click', () => {
  const body = document.body;
  const next = body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  body.setAttribute('data-theme', next);
  document.getElementById('themeIcon').textContent = next === 'dark' ? '☀' : '☾';
  document.getElementById('themeLabel').textContent = next === 'dark' ? 'Light' : 'Dark';
  if(state.matrix.length) renderAll();
});

/* ---- Distribution type switching ---- */
document.getElementById('distType').addEventListener('change', (e) => {
  const isCustom = e.target.value === 'custom';
  document.getElementById('customWrap').style.display = isCustom ? 'block' : 'none';
  if(isCustom) buildCustomInputs();
});
document.getElementById('numClasses').addEventListener('input', () => {
  if(document.getElementById('distType').value === 'custom') buildCustomInputs();
});
document.getElementById('totalSamples').addEventListener('input', () => {
  if(document.getElementById('distType').value === 'custom') updateCustomSum();
});
