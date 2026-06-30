/* ================================================================
   DISTRIBUTIONS
   Functions that turn (numClasses, totalSamples) into a per-class
   sample count array ("support"), for the balanced and imbalanced
   distribution modes. Custom mode reads its counts directly from
   the per-class input fields (see ui.js).
   ================================================================ */

// Equal split across classes; remainder distributed to first classes.
function balancedDistribution(n, total){
  const base = Math.floor(total / n);
  const rem = total % n;
  const out = new Array(n).fill(base);
  for(let i=0;i<rem;i++) out[i]++;
  return out;
}

// Skewed split: geometric-ish weighting so some classes dominate.
function imbalancedDistribution(n, total){
  const weights = [];
  for(let i=0;i<n;i++) weights.push(Math.pow(0.65, i) + 0.05*Math.random());
  const sumW = weights.reduce((a,b)=>a+b,0);
  let out = weights.map(w => Math.floor((w/sumW) * total));
  shuffleInPlace(out); // so class 0 isn't always the biggest
  let diff = total - out.reduce((a,b)=>a+b,0);
  let i=0;
  while(diff !== 0){
    const idx = i % n;
    if(diff > 0){ out[idx]++; diff--; } else if(out[idx] > 0){ out[idx]--; diff++; }
    i++;
  }
  return out.map(v => Math.max(v,0));
}

function shuffleInPlace(arr){
  for(let i=arr.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [arr[i],arr[j]] = [arr[j],arr[i]];
  }
}
