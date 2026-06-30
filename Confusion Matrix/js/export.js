/* ================================================================
   EXPORT
   Formats the current matrix as Python / NumPy / CSV text, wires
   the copy-to-clipboard button, and rasterizes the matrix table to
   a downloadable PNG.
   ================================================================ */

function formatPython(matrix){
  const rows = matrix.map(r => '  [' + r.join(', ') + ']');
  return '[\n' + rows.join(',\n') + '\n]';
}
function formatNumpy(matrix){
  return 'np.array(' + formatPython(matrix) + ')';
}
function formatCSV(matrix){
  return matrix.map(r => r.join(',')).join('\n');
}

document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-export]');
  if(!btn) return;
  const type = btn.dataset.export;
  let text = '';
  if(type === 'python') text = formatPython(state.matrix);
  else if(type === 'numpy') text = formatNumpy(state.matrix);
  else if(type === 'csv') text = formatCSV(state.matrix);
  document.getElementById('exportOutput').textContent = text;
});

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('copyBtn').addEventListener('click', () => {
    const text = document.getElementById('exportOutput').textContent;
    navigator.clipboard.writeText(text).then(() => showToast('Copied to clipboard.'));
  });

  document.getElementById('pngBtn').addEventListener('click', () => {
    const table = document.querySelector('table.matrix');
    if(!table){ showToast('Generate a matrix first.'); return; }
    const rect = table.getBoundingClientRect();
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    const bg = isDark ? '#1C2225' : '#FFFFFF';
    const fg = isDark ? '#ECEAE3' : '#1B1F1D';

    const svgHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${rect.width}" height="${rect.height}">
        <foreignObject width="100%" height="100%">
          <div xmlns="http://www.w3.org/1999/xhtml" style="background:${bg};color:${fg};">
            ${table.outerHTML}
          </div>
        </foreignObject>
      </svg>`;
    const svgBlob = new Blob([svgHTML], {type:'image/svg+xml;charset=utf-8'});
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = rect.width * 2;
      canvas.height = rect.height * 2;
      const ctx = canvas.getContext('2d');
      ctx.scale(2,2);
      ctx.fillStyle = bg;
      ctx.fillRect(0,0,rect.width,rect.height);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      canvas.toBlob(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'confusion-matrix.png';
        a.click();
        showToast('Image downloaded.');
      });
    };
    img.onerror = () => showToast('Could not render image in this browser.');
    img.src = url;
  });
});
