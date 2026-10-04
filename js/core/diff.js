import { norm } from './utils.js';

/**
 * Diff palabra por palabra (LCS).
 * Devuelve { parts, matched, total, score, missingWords, extraWords }
 */
export function diffWords(expected, actual){
  const E = expected.split(/\s+/).filter(Boolean);
  const A = actual.split(/\s+/).filter(Boolean);
  const e = E.map(norm), a = A.map(norm);
  const m = e.length, n = a.length;

  const dp = Array.from({length:m+1}, () => new Int32Array(n+1));
  for(let i=m-1;i>=0;i--)
    for(let j=n-1;j>=0;j--)
      dp[i][j] = e[i] === a[j] ? dp[i+1][j+1] + 1
                               : Math.max(dp[i+1][j], dp[i][j+1]);

  const parts = [];
  let i=0, j=0;
  while(i<m && j<n){
    if(e[i] === a[j]){ parts.push({t:'ok', w:E[i]}); i++; j++; }
    else if(dp[i+1][j] >= dp[i][j+1]){ parts.push({t:'miss', w:E[i]}); i++; }
    else { parts.push({t:'extra', w:A[j]}); j++; }
  }
  while(i<m) parts.push({t:'miss', w:E[i++]});
  while(j<n) parts.push({t:'extra', w:A[j++]});

  const matched = parts.filter(p=>p.t==='ok').length;
  const missingWords = parts.filter(p=>p.t==='miss').map(p=>p.w);
  const extraWords   = parts.filter(p=>p.t==='extra').map(p=>p.w);

  return { parts, matched, total: m, score: m ? matched/m : 0, missingWords, extraWords };
}

/** Similitud tipo palabra-a-palabra para pronunciación (más laxa). */
export function similarity(a, b){
  const d = diffWords(a, b);
  return d.score;
}