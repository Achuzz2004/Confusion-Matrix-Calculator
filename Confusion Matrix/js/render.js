/* ================================================================
   RENDER
   Everything that turns `state.matrix` / `state.support` into DOM:
   the stat strip, tabbed matrix / heatmap / metrics / chart views.
   ================================================================ */

function classLabel(i){ return 'C' + (i+1); }

function renderAll(){
  const { matrix, support } = state;
  const metrics = computeMetrics(matrix, support);
  const n = matrix.length;
  const total = support.reduce((a,b)=>a+b,0);

  const out = document.getElementById('outputArea');
  out.innerHTML = '';

  // ---- Stat strip ----
  const strip = document.createElement('div');
  strip.className = 'stat-strip';
  strip.innerHTML = `
    <div class="stat signal"><div class="label">Accuracy</div><div class="value">${(metrics.accuracy*100).toFixed(2)}%</div></div>
    <div class="stat"><div class="label">Macro precision</div><div class="value">${(metrics.macroPrecision*100).toFixed(1)}%</div></div>
    <div class="stat"><div class="label">Macro recall</div><div class="value">${(metrics.macroRecall*100).toFixed(1)}%</div></div>
    <div class="stat"><div class="label">Macro F1</div><div class="value">${(metrics.macroF1*100).toFixed(1)}%</div></div>
    <div class="stat"><div class="label">Classes</div><div class="value">${n}</div></div>
    <div class="stat"><div class="label">Samples</div><div class="value">${total}</div></div>
  `;
  out.appendChild(strip);

  // ---- Tabs card ----
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <div class="tabs">
      <div class="tab active" data-tab="matrix">Matrix</div>
      <div class="tab" data-tab="heatmap">Heatmap</div>
      <div class="tab" data-tab="metrics">Per-class metrics</div>
      <div class="tab" data-tab="chart">Metric chart</div>
    </div>
    <div id="tabContent"></div>
  `;
  out.appendChild(card);

  const tabContent = card.querySelector('#tabContent');
  const tabs = card.querySelectorAll('.tab');
  tabs.forEach(t => t.addEventListener('click', () => {
    tabs.forEach(x=>x.classList.remove('active'));
    t.classList.add('active');
    renderTab(t.dataset.tab, tabContent, metrics);
  }));
  renderTab('matrix', tabContent, metrics);

  document.getElementById('exportCard').style.display = 'block';
  if(state.history.length){
    document.getElementById('historyCard').style.display = 'block';
  }
}

function renderTab(tab, container, metrics){
  container.innerHTML = '';
  if(tab === 'matrix') renderMatrixTable(container);
  else if(tab === 'heatmap') renderHeatmap(container);
  else if(tab === 'metrics') renderMetricsTable(container, metrics);
  else if(tab === 'chart') renderBarChart(container, metrics);
}

function renderMatrixTable(container){
  const { matrix } = state;
  const n = matrix.length;
  const wrap = document.createElement('div');
  wrap.className = 'matrix-wrap';

  let html = '<table class="matrix"><thead><tr><th class="corner">Actual ＼ Pred</th>';
  for(let j=0;j<n;j++) html += `<th>${classLabel(j)}</th>`;
  html += '</tr></thead><tbody>';

  for(let i=0;i<n;i++){
    html += `<tr><td class="row-label">${classLabel(i)}</td>`;
    for(let j=0;j<n;j++){
      const val = matrix[i][j];
      let cls = 'off';
      if(i===j) cls = 'diag';
      else if(val===0) cls = 'zero';
      html += `<td class="${cls} editable" contenteditable="true" data-i="${i}" data-j="${j}">${val}</td>`;
    }
    html += '</tr>';
  }
  html += '</tbody></table>';
  wrap.innerHTML = html;
  container.appendChild(wrap);

  const note = document.createElement('div');
  note.className = 'hint';
  note.style.marginTop = '10px';
  note.innerHTML = 'Green = correct (diagonal) · Amber = misclassified · Cells are editable — click a value to override it.';
  container.appendChild(note);

  wrap.querySelectorAll('td.editable').forEach(cell => {
    cell.addEventListener('blur', () => {
      const i = +cell.dataset.i, j = +cell.dataset.j;
      let v = parseInt(cell.textContent.replace(/[^0-9-]/g,''), 10);
      if(isNaN(v) || v < 0) v = 0;
      state.matrix[i][j] = v;
      state.support[i] = state.matrix[i].reduce((a,b)=>a+b,0);
      renderAll();
      showToast('Cell updated — matrix recalculated.');
    });
    cell.addEventListener('keydown', e => {
      if(e.key === 'Enter'){ e.preventDefault(); cell.blur(); }
    });
  });
}

function renderHeatmap(container){
  const { matrix } = state;
  const n = matrix.length;
  const maxVal = Math.max(...matrix.flat());
  const wrap = document.createElement('div');
  wrap.className = 'heatmap-wrap';

  const isDark = document.body.getAttribute('data-theme') === 'dark';
  let html = '<table class="heatmap"><tbody>';
  for(let i=0;i<n;i++){
    html += '<tr>';
    for(let j=0;j<n;j++){
      const v = matrix[i][j];
      const intensity = maxVal > 0 ? v/maxVal : 0;
      const color = i===j
        ? mixColor('#1F7A5C', intensity, isDark)
        : mixColor('#B5552C', intensity, isDark);
      html += `<td style="background:${color}" title="${classLabel(i)}→${classLabel(j)}: ${v}"></td>`;
    }
    html += '</tr>';
  }
  html += '</tbody></table>';
  wrap.innerHTML = html;
  container.appendChild(wrap);

  const note = document.createElement('div');
  note.className = 'hint';
  note.style.marginTop = '10px';
  note.textContent = 'Darker = higher cell count. Hover a cell to see actual→predicted counts.';
  container.appendChild(note);
}

function mixColor(hex, intensity, isDark){
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  const bgVal = isDark ? 28 : 255;
  const alpha = 0.12 + intensity*0.78;
  const mr = Math.round(r*alpha + bgVal*(1-alpha));
  const mg = Math.round(g*alpha + bgVal*(1-alpha));
  const mb = Math.round(b*alpha + bgVal*(1-alpha));
  return `rgb(${mr},${mg},${mb})`;
}

function renderMetricsTable(container, metrics){
  let html = `<table class="metrics"><thead><tr>
    <th>Class</th><th>Precision</th><th>Recall</th><th>Specificity</th><th>F1</th><th>Support</th>
  </tr></thead><tbody>`;
  metrics.perClass.forEach((c,i) => {
    html += `<tr>
      <td>${classLabel(i)}</td>
      <td>${(c.precision*100).toFixed(1)}%</td>
      <td>${(c.recall*100).toFixed(1)}%</td>
      <td>${(c.specificity*100).toFixed(1)}%</td>
      <td>${(c.f1*100).toFixed(1)}%</td>
      <td>${c.support}</td>
    </tr>`;
  });
  html += `</tbody><tfoot><tr>
    <td>Macro avg</td>
    <td>${(metrics.macroPrecision*100).toFixed(1)}%</td>
    <td>${(metrics.macroRecall*100).toFixed(1)}%</td>
    <td>—</td>
    <td>${(metrics.macroF1*100).toFixed(1)}%</td>
    <td>${state.support.reduce((a,b)=>a+b,0)}</td>
  </tr></tfoot></table>`;
  container.innerHTML = html;
}

function renderBarChart(container, metrics){
  const wrap = document.createElement('div');
  wrap.className = 'bars';
  const metricsToShow = [
    ['Precision', metrics.perClass.map(c=>c.precision)],
    ['Recall', metrics.perClass.map(c=>c.recall)],
    ['F1', metrics.perClass.map(c=>c.f1)],
  ];
  metricsToShow.forEach(([label, values]) => {
    const groupLabel = document.createElement('div');
    groupLabel.style.cssText = 'font-family:JetBrains Mono, monospace;font-size:11px;color:var(--ink-dim);text-transform:uppercase;letter-spacing:.06em;margin-top:8px;';
    groupLabel.textContent = label;
    wrap.appendChild(groupLabel);
    values.forEach((v,i) => {
      const row = document.createElement('div');
      row.className = 'bar-row';
      row.innerHTML = `<div class="name">${classLabel(i)}</div>
        <div class="bar-track"><div class="bar-fill" data-w="${(v*100).toFixed(1)}"></div></div>
        <div class="pct">${(v*100).toFixed(1)}%</div>`;
      wrap.appendChild(row);
    });
  });
  container.appendChild(wrap);
  requestAnimationFrame(() => {
    wrap.querySelectorAll('.bar-fill').forEach(el => { el.style.width = el.dataset.w + '%'; });
  });
}
