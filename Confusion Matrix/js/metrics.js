/* ================================================================
   METRICS
   Computes per-class TP/FP/FN/TN and the derived precision, recall,
   specificity and F1-score, plus overall accuracy and macro averages.
   ================================================================ */

function computeMetrics(matrix, support){
  const n = matrix.length;
  const total = support.reduce((a,b)=>a+b,0);
  const colSums = new Array(n).fill(0);
  for(let i=0;i<n;i++) for(let j=0;j<n;j++) colSums[j]+=matrix[i][j];

  const perClass = [];
  for(let i=0;i<n;i++){
    const TP = matrix[i][i];
    const rowSum = support[i];
    const colSum = colSums[i];
    const FN = rowSum - TP;
    const FP = colSum - TP;
    const TN = total - TP - FP - FN;
    const precision = (TP+FP) > 0 ? TP/(TP+FP) : 0;
    const recall = (TP+FN) > 0 ? TP/(TP+FN) : 0;
    const specificity = (TN+FP) > 0 ? TN/(TN+FP) : 0;
    const f1 = (precision+recall) > 0 ? 2*precision*recall/(precision+recall) : 0;
    perClass.push({TP,FP,FN,TN,precision,recall,specificity,f1,support:rowSum});
  }

  const diagSum = matrix.reduce((acc,row,i)=>acc+row[i],0);
  const accuracy = total > 0 ? diagSum/total : 0;
  const macro = (key) => perClass.reduce((a,c)=>a+c[key],0)/n;

  return {
    perClass,
    accuracy,
    macroPrecision: macro('precision'),
    macroRecall: macro('recall'),
    macroF1: macro('f1')
  };
}
