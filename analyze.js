import { normalizeLatinText, lettersOnly } from './normalize.js';
import { toFrozenPinyin } from './pinyin.js';
import { expandLayer0 } from './layer0.js';
import { extractStructure } from './structure.js';
import { buildStructuralField } from './field.js';
import { synthesizeWholeForm } from './synthesize.js';
import { renderReading } from './render.js';

export function containsHanzi(s='') { return /[\u3400-\u9FFF]/.test(s); }

function splitKeepBoundaries(source='') {
  return String(source).split(/(\n+|[.!?。！？]+)/).filter(x=>x!==undefined && x!=='');
}

export function romanizePreservingBoundaries(input='') {
  const isZh = containsHanzi(input);
  return splitKeepBoundaries(input).map(part => {
    if (/^(\n+|[.!?。！？]+)$/.test(part)) return part;
    return isZh ? toFrozenPinyin(part) : normalizeLatinText(part);
  }).join(' ')
    .replace(/\s*\n\s*/g,'\n')
    .replace(/\s+([.!?。！？]+)/g,'$1')
    .replace(/([.!?。！？]+)\s*/g,'$1 ')
    .trim();
}

export function analyzeNormalized(normalized='') {
  const letters = lettersOnly(normalized);
  const layer0 = expandLayer0(normalized);
  const features = extractStructure(letters);
  const field = buildStructuralField(normalized, layer0);
  const synthesis = synthesizeWholeForm(field);
  return { normalized, letters, layer0, features, field, synthesis };
}

export function analyzeText(input='', {mode='quick'}={}) {
  const sourceText = String(input);
  const romanized = romanizePreservingBoundaries(sourceText);
  const core = analyzeNormalized(romanized);
  const sections = renderReading(core, sourceText, mode);
  return {...core, sourceText, romanized, mode, sections};
}
