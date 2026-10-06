function strengthFromSynthesis(s,lang='en'){
  const n=s?.support?.independentFamilies || 0;
  if(lang==='en') return n>=3?'Strong structural support':n===2?'Moderate structural support':n===1?'Limited structural support':'Open / exploratory';
  return n>=3?'结构支持强':n===2?'结构支持中等':n===1?'有限结构支持':'开放 / 探索性';
}

function decisionLabel(decision,lang='en'){
  const map={
    stable_relational_mechanism:['STABLE RELATIONAL MECHANISM','稳定关系机制'],
    no_stable_relational_mechanism:['NO STABLE RELATIONAL MECHANISM','未形成稳定关系机制'],
    indeterminate:['INDETERMINATE','无法确定']
  };
  return (map[decision]||map.indeterminate)[lang==='en'?0:1];
}

function canonicalText(s,lang='en'){
  if(s?.decision==='stable_relational_mechanism' && s.mechanism) return s.mechanism[lang];
  if(s?.decision==='no_stable_relational_mechanism') return lang==='en'?'No stable whole-form mechanism emerged.':'尚未形成稳定整体机制。';
  return lang==='en'?'The structural evidence does not converge strongly enough to freeze a single canonical mechanism.':'现有结构证据尚不足以收敛并冻结为唯一整体机制。';
}

export function renderReading(core,sourceText,mode='quick'){
  const {field,synthesis}=core;
  const families=synthesis?.support?.families || [];
  const anchorLetters=synthesis?.support?.anchorLetters || [];
  const unresolved=field?.unresolved || [];
  const enEvidence=families.length?`Independent structural families: ${families.join(', ')}. Structurally active Layer 0 anchors: ${anchorLetters.join(', ') || 'none'}.`:'No independent higher-order structural families converged.';
  const zhEvidence=families.length?`独立结构族：${families.join('、')}。参与结构的 Layer 0 锚点：${anchorLetters.join('、') || '无'}。`:'没有独立的高阶结构族发生收敛。';
  const enStructural='Timeless whole-form grammar: the complete text is held as one structural field. Order keeps grammatical/positional meaning but is not automatically converted into event chronology. Layer 0 codes are evidence material only and cannot decide the reading by themselves.';
  const zhStructural='无时间整体语法：全文作为一个同时成立的结构场。顺序保留语法／位置意义，但不自动转译成事件先后。Layer 0 原码只是证据材料，不能单独决定结论。';
  const enTruth=`Frozen before later reality is compared. Later outcomes may confirm, partly confirm, or fail to confirm this reading, but may not rewrite it.${unresolved.length?` Unresolved code: ${unresolved.join(', ')}.`:''}`;
  const zhTruth=`本次结果先冻结，再与后来现实比较。后来结果只能确认、部分确认或不确认，不能反向修改本次解译。${unresolved.length?`未完全冻结原码：${unresolved.join('、')}。`:''}`;
  return [
    {language:'en',decision:decisionLabel(synthesis?.decision,'en'),canonicalReading:canonicalText(synthesis,'en'),surface:`Source text preserved exactly for independent comparison: ${sourceText}`,structural:enStructural,increment:enEvidence,truthAlignment:enTruth,signalStrength:strengthFromSynthesis(synthesis,'en'),realityBoundary:'Experimental symbolic/structural reading only. It does not by itself prove external facts, identity, intent, guilt, hidden motive, or future events.'},
    {language:'zh',decision:decisionLabel(synthesis?.decision,'zh'),canonicalReading:canonicalText(synthesis,'zh'),surface:`原文完整保留，用于独立对照：${sourceText}`,structural:zhStructural,increment:zhEvidence,truthAlignment:zhTruth,signalStrength:strengthFromSynthesis(synthesis,'zh'),realityBoundary:'仅属于实验性的符号／结构解译；它本身不能证明现实事实、身份、意图、罪责、隐藏动机或未来事件。'}
  ];
}
