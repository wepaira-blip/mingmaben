export const SYNTHESIS_VERSION = 'MINGMABEN-R5-MATURE-1';

export const DECISIONS = Object.freeze({
  STABLE: 'stable_relational_mechanism',
  NONE: 'no_stable_relational_mechanism',
  INDETERMINATE: 'indeterminate'
});

const FAMILY_BY_KIND = Object.freeze({
  'word-frame':'boundary',
  'sentence-frame':'boundary',
  'paragraph-frame':'boundary',
  'whole-frame':'boundary',
  'word-mirror':'symmetry',
  'word-isomorphism':'isomorphism',
  'gate-polarity':'polarity',
  'cross-scale-anchor':'cross-scale'
});

const ROLE_FAMILIES = Object.freeze({
  frame:'boundary',
  mirror:'symmetry',
  center:'center-periphery',
  'cross-scale-resonance':'cross-scale'
});

const MECHANISMS = Object.freeze({
  'boundary-polarity': {
    en:'A boundary is structurally active together with an opposed or inverted gate-state.',
    zh:'边界结构与相反／倒置的门状态同时被激活。'
  },
  'containment-continuity': {
    en:'A framed field is maintained by return or cross-scale recurrence, indicating structural continuity inside a preserved boundary.',
    zh:'一个被框定的整体通过回返或跨尺度复现维持，显示边界内部的结构连续性。'
  },
  'symmetry-resonance': {
    en:'Mirrored or isomorphic relations recur across scales, indicating a stable structural correspondence rather than a local accident.',
    zh:'镜像或同构关系跨尺度复现，显示稳定结构对应，而非局部偶合。'
  },
  'center-periphery': {
    en:'A center/periphery relation is reinforced by an independent boundary or cross-scale relation.',
    zh:'中心／边缘关系得到独立边界或跨尺度关系的共同确认。'
  },
  'recurrence-continuity': {
    en:'Return and cross-scale recurrence converge on continuity of the same structural relation.',
    zh:'回返与跨尺度复现共同收敛为同一结构关系的持续。'
  }
});

function unique(xs){ return [...new Set(xs.filter(Boolean))]; }

function evidenceFamilies(field){
  const families=[];
  for(const c of field.confirmations || []) families.push(FAMILY_BY_KIND[c.kind]);
  for(const a of field.anchors || []) for(const role of a.roles || []) families.push(ROLE_FAMILIES[role]);
  return unique(families);
}

function semanticAnchors(field){
  return (field.anchors || []).filter(a =>
    (a.roles || []).some(r=>['frame','return','mirror','center','cross-scale-resonance'].includes(r)) &&
    a.layer0?.status !== 'tentative'
  );
}

function chooseMechanism(families){
  const has=x=>families.includes(x);
  if(has('polarity') && has('boundary')) return 'boundary-polarity';
  if(has('boundary') && has('cross-scale')) return 'containment-continuity';
  if((has('symmetry') || has('isomorphism')) && has('cross-scale')) return 'symmetry-resonance';
  if(has('center-periphery') && (has('boundary') || has('cross-scale'))) return 'center-periphery';
  return null;
}

export function synthesizeWholeForm(field={}){
  const families=evidenceFamilies(field);
  const meaningful=families.filter(x=>x && x!=='repetition');
  const anchors=semanticAnchors(field);
  const mechanismId=chooseMechanism(meaningful);
  const independentFamilies=meaningful.length;

  let decision=DECISIONS.NONE;
  if(mechanismId && independentFamilies>=2) decision=DECISIONS.STABLE;
  else if(independentFamilies===1) decision=DECISIONS.INDETERMINATE;

  const mechanism = mechanismId ? {id:mechanismId, ...MECHANISMS[mechanismId]} : null;
  return Object.freeze({
    version:SYNTHESIS_VERSION,
    decision,
    mechanism: decision===DECISIONS.STABLE ? mechanism : null,
    candidateMechanism: decision===DECISIONS.INDETERMINATE ? mechanism : null,
    support:{
      independentFamilies,
      families:meaningful,
      anchorLetters:unique(anchors.map(a=>a.letter)),
      unresolved:[...(field.unresolved || [])]
    },
    policy:{
      semanticFirewall:true,
      layer0CannotDecideAlone:true,
      singleCanonicalMechanism:true,
      noNarrativeRescue:true,
      temporalCausality:false
    }
  });
}
