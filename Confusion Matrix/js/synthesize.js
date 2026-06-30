/* ================================================================
   MATRIX SYNTHESIS
   Builds an NxN confusion matrix whose row sums equal `support`
   and whose diagonal sum is as close as possible to the requested
   accuracy, with the remainder distributed as realistic "confusion"
   to neighbouring classes (off-diagonal, weighted toward nearby
   indices, which simulates visually/semantically similar classes).
   ================================================================ */

function synthesizeMatrix(support, accuracyPct){
  const n = support.length;
  const total = support.reduce((a,b)=>a+b,0);
  const targetCorrect = Math.round((accuracyPct/100) * total);

  const matrix = Array.from({length:n}, () => new Array(n).fill(0));

  // Distribute targetCorrect across rows proportional to their support,
  // capped at the row's own support (can't have more correct than samples).
  let diagTargets = support.map(s => Math.round((s/total) * targetCorrect));
  diagTargets = diagTargets.map((d,i) => Math.min(d, support[i]));

  // Adjust rounding drift so sum(diagTargets) is as close to targetCorrect as possible.
  let drift = targetCorrect - diagTargets.reduce((a,b)=>a+b,0);
  let guard = 0;
  while(drift !== 0 && guard < 10000){
    guard++;
    for(let i=0;i<n && drift!==0;i++){
      if(drift > 0 && diagTargets[i] < support[i]){ diagTargets[i]++; drift--; }
      else if(drift < 0 && diagTargets[i] > 0){ diagTargets[i]--; drift++; }
    }
  }

  for(let i=0;i<n;i++){
    const correct = diagTargets[i];
    matrix[i][i] = correct;
    let errors = support[i] - correct;
    if(errors <= 0) continue;

    // Weight other columns: closer index => higher weight (plus jitter).
    const others = [];
    let weightSum = 0;
    for(let j=0;j<n;j++){
      if(j===i) continue;
      const dist = Math.abs(j-i);
      const w = 1/dist + Math.random()*0.3;
      others.push({j, w});
      weightSum += w;
    }
    let allocated = 0;
    others.forEach(o => {
      const amt = Math.floor((o.w/weightSum) * errors);
      matrix[i][o.j] = amt;
      allocated += amt;
    });
    let remainder = errors - allocated;
    let k = 0;
    while(remainder > 0){
      const o = others[k % others.length];
      matrix[i][o.j]++;
      remainder--;
      k++;
    }
  }
  return matrix;
}
