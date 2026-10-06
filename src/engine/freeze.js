function fnv1a(input = '') {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const key of Object.keys(value)) deepFreeze(value[key]);
  return Object.freeze(value);
}

export function freezeReading(result) {
  const canonical = {
    engineVersion: '1.0.0-beta.1',
    sourceText: result.sourceText,
    romanized: result.romanized,
    mode: result.mode,
    field: result.field,
    sections: result.sections,
    method: {
      grammarMode: 'timeless-whole-form',
      outcomePolicy: 'later-outcome-confirms-only-no-backpropagation'
    }
  };
  const fingerprint = `MM-${fnv1a(JSON.stringify(canonical))}`;
  return deepFreeze({ ...canonical, fingerprint });
}
