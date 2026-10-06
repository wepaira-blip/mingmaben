import { LAYER0_VERSION } from './layer0.js';
function fnv1a(input=''){
  let hash=0x811c9dc5;
  for(let i=0;i<input.length;i++){
    hash^=input.charCodeAt(i);
    hash=Math.imul(hash,0x01000193);
  }
  return (hash>>>0).toString(16).padStart(8,'0');
}
function deepFreeze(value){
  if(!value || typeof value!=='object' || Object.isFrozen(value)) return value;
  for(const key of Object.keys(value)) deepFreeze(value[key]);
  return Object.freeze(value);
}
export function freezeReading(result){
  const canonical={
    engineVersion:'5.0.0-mature.1',
    sourceText:result.sourceText,
    romanized:result.romanized,
    mode:result.mode,
    field:result.field,
    synthesis:result.synthesis,
    decision:result.synthesis?.decision || 'indeterminate',
    canonicalMechanism:result.synthesis?.mechanism?.id || null,
    sections:result.sections,
    method:{
      grammarMode:'timeless-whole-form',
      synthesisVersion:result.synthesis?.version || 'unknown',
      layer0Version:LAYER0_VERSION,
      outcomePolicy:'later-outcome-confirms-only-no-backpropagation',
      semanticFirewall:true,
      singleCanonicalMechanism:true
    }
  };
  const fingerprint=`MM-R5-${fnv1a(JSON.stringify(canonical))}`;
  return deepFreeze({...canonical,fingerprint});
}
