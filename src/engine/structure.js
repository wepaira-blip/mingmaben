export function extractStructure(tokens = []) {
  const arr = tokens.filter(Boolean);
  const repetitions = {};
  for (const t of arr) repetitions[t] = (repetitions[t] || 0) + 1;
  const n = arr.length;
  let mirrorMatches = 0;
  for (let i=0; i<Math.floor(n/2); i++) if (arr[i] === arr[n-1-i]) mirrorMatches++;
  const pairs = Math.floor(n/2);
  const palindromeRatio = pairs ? mirrorMatches / pairs : (n ? 1 : 0);
  const centers = n === 0 ? [] : n % 2 ? [arr[Math.floor(n/2)]] : [arr[n/2-1], arr[n/2]];
  const repeated = Object.fromEntries(Object.entries(repetitions).filter(([,v]) => v > 1));
  return {
    length:n,
    first:arr[0] || null,
    last:arr[n-1] || null,
    centers,
    framed:n > 1 && arr[0] === arr[n-1],
    repetitions:repeated,
    uniqueCount:Object.keys(repetitions).length,
    palindromeRatio:Number(palindromeRatio.toFixed(3))
  };
}
