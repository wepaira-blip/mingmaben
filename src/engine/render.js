const CONFIRM_LABELS = Object.freeze({
  'word-frame':['same-code framing inside a word','词内同码首尾框架'],
  'word-mirror':['mirror correspondence inside a word','词内镜像对应'],
  'word-repetition':['repetition inside a word','词内重复'],
  'sentence-frame':['same-code framing of a sentence','句子同码首尾框架'],
  'paragraph-frame':['same-code framing of a paragraph','段落同码首尾框架'],
  'whole-frame':['same-code framing of the whole field','全文同码首尾框架'],
  'gate-polarity':['M/W gate polarity co-present in one word','M/W 门正反极性共处一词'],
  'cross-scale-anchor':['the same code holds structural roles across scales','同一原码跨尺度占据结构位置'],
  'word-isomorphism':['distinct word-forms share the same structural grammar','不同词形出现结构同构']
});

function confirmationLabel(c,lang='en'){
  const base=CONFIRM_LABELS[c.kind]?.[lang==='en'?0:1]||c.kind;
  if(c.word) return `${base}: ${c.word}`;
  if(c.letter) return `${base}: ${c.letter}`;
  if(c.words) return `${base}: ${c.words.join(' ↔ ')}`;
  return base;
}

function meaningfulConfirmations(field){
  // No code is removed. This only decides which structural relations are summarized in prose.
  return field.confirmations.filter(c=>['word-frame','word-mirror','sentence-frame','paragraph-frame','whole-frame','gate-polarity','cross-scale-anchor','word-isomorphism'].includes(c.kind));
}

function brightAnchors(field,limit){
  return field.anchors
    .filter(a=>a.roles.some(r=>['frame','center','mirror','return','cross-scale-resonance'].includes(r)))
    .sort((a,b)=>Number(b.roles.includes('cross-scale-resonance'))-Number(a.roles.includes('cross-scale-resonance')) || b.roles.length-a.roles.length)
    .slice(0,limit);
}

function anchorText(a,lang='en'){
  const meaning=lang==='en'?a.layer0?.en:a.layer0?.zh;
  return `${a.letter}=${meaning || '?'} [${a.roles.join(', ')}]`;
}

function strength(field,lang='en'){
  const c=meaningfulConfirmations(field);
  const cross=field.anchors.filter(a=>a.roles.includes('cross-scale-resonance')).length;
  const score=Math.min(6,c.length)+Math.min(4,cross);
  if(lang==='en') return score>=7?'Strong whole-form confirmation':score>=4?'Moderate whole-form confirmation':score>=1?'Limited structural confirmation':'Open / exploratory';
  return score>=7?'整体结构确认强':score>=4?'整体结构确认中等':score>=1?'有限结构确认':'开放 / 探索性';
}

export function renderReading(core,sourceText,mode='quick'){
  const field=core.field;
  const confirms=meaningfulConfirmations(field);
  const max=mode==='deep'?12:5;
  const anchors=brightAnchors(field,mode==='deep'?8:4);
  const enConfirm=confirms.length?confirms.slice(0,max).map(c=>confirmationLabel(c,'en')).join('; '):'none forced by the program';
  const zhConfirm=confirms.length?confirms.slice(0,max).map(c=>confirmationLabel(c,'zh')).join('；'):'程序没有强行生成';
  const enAnchor=anchors.length?anchors.map(a=>anchorText(a,'en')).join('; '):'none singled out structurally';
  const zhAnchor=anchors.length?anchors.map(a=>anchorText(a,'zh')).join('；'):'没有被结构位置单独点亮的原码';

  const enStructural=`Timeless structural field / whole-form grammar: the entire A–Z form is held at once. Order is grammatical position, not event chronology. No Layer 0 occurrence is deleted or frequency-downweighted. Observation scales are letter → word → sentence → paragraph → whole text, but these are zoom levels rather than time stages. Structurally bright anchors: ${enAnchor}. Whole-form confirmations: ${enConfirm}.`;
  const zhStructural=`无时间整体结构场：整段 A–Z 形式同时成立。顺序表示语法 / 结构位置，不自动解释为事件先后；任何 Layer 0 原码都不删除、不降权。字母→单词→句子→段落→全文只是观察尺度逐级拉远，不是时间阶段。结构位置点亮的锚点：${zhAnchor}。整体结构确认：${zhConfirm}。`;

  const enIncrement=confirms.length
    ? `The increment comes from structural correspondence inside the frozen whole-form — framing, center/mirror roles, inversion, cross-scale resonance or isomorphism — rather than from raw motif frequency or a causal story. ${enConfirm}.`
    : 'No additional whole-form relation is forced. The complete code field is preserved for inspection rather than being rescued by a semantic narrative.';
  const zhIncrement=confirms.length
    ? `隐藏增量只来自冻结整体内部的结构对应——首尾、中心 / 镜像、倒置、跨尺度共振或同构——不是来自频率加权，也不是因果时间故事。${zhConfirm}。`
    : '程序没有强行制造额外整体关系；完整原码场保留待核查，不用表面语义去“救”结论。';

  const unresolved=field.unresolved;
  const enTruth=`Unconfirmed at initial reading. A later real-world outcome is not part of decoding. This reading must be frozen first; a later outcome may highly confirm, partially confirm, or fail to confirm it, but may not rewrite the original code or reading.${unresolved.length?` Unresolved code: ${unresolved.join(', ')}.`:''}`;
  const zhTruth=`初始解译阶段不确认现实真伪；后来的现实结果不参与解码。必须先冻结本次显影，后来结果只能高度确认、部分确认或不确认此前结果，不能反向修改原码或原始解译。${unresolved.length?`未完全冻结原码：${unresolved.join('、')}。`:''}`;

  return [
    {language:'en',surface:`Source text preserved exactly for independent comparison: ${sourceText}`,structural:enStructural,increment:enIncrement,truthAlignment:enTruth,signalStrength:strength(field,'en'),realityBoundary:'Mingmaben is an experimental symbolic/structural reading. It does not by itself prove external facts, identity, intent, guilt, future events, or hidden motives.'},
    {language:'zh',surface:`原文完整保留，用于独立对照：${sourceText}`,structural:zhStructural,increment:zhIncrement,truthAlignment:zhTruth,signalStrength:strength(field,'zh'),realityBoundary:'明码本属于实验性的符号 / 结构解译；它本身不能证明现实事实、身份、意图、罪责、未来事件或隐藏动机。'}
  ];
}
