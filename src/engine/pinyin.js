import { HAN_PINYIN } from './han-map.js';
import { normalizeLatinText } from './normalize.js';

const CHAR_OVERRIDES = Object.freeze({
  '女': 'NV', '绿': 'LV', '綠': 'LV', '吕': 'LV', '呂': 'LV', '驴': 'LV', '驢': 'LV',
  '旅': 'LV', '履': 'LV', '虑': 'LV', '慮': 'LV', '律': 'LV'
});

function restoreHiddenUmlaut(syllable) {
  let s = syllable.toUpperCase().replaceAll('Ü','V');
  // In standard pinyin orthography, u after j/q/x/y represents ü in these syllable families.
  if (/^[JQXY]U/.test(s)) s = s[0] + 'V' + s.slice(2);
  return s;
}

export function toFrozenPinyin(input = '') {
  const tokens = [];
  let latinBuffer = '';

  const flushLatin = () => {
    const n = normalizeLatinText(latinBuffer);
    if (n) tokens.push(...n.split(' '));
    latinBuffer = '';
  };

  for (const ch of String(input)) {
    if (CHAR_OVERRIDES[ch]) {
      flushLatin();
      tokens.push(CHAR_OVERRIDES[ch]);
      continue;
    }
    if (HAN_PINYIN[ch]) {
      flushLatin();
      const parts = HAN_PINYIN[ch].split(/\s+/).filter(Boolean).map(restoreHiddenUmlaut);
      tokens.push(...parts);
    } else if (/[A-Za-z]/.test(ch)) {
      latinBuffer += ch;
    } else {
      flushLatin();
    }
  }
  flushLatin();
  return tokens.join(' ');
}
