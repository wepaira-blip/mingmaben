import test from 'node:test';
import assert from 'node:assert/strict';
import { synthesizeWholeForm, DECISIONS } from '../src/engine/synthesize.js';

const baseField = (overrides={}) => ({
  confirmations: [],
  anchors: [],
  whole: { length: 20 },
  motifs: {},
  unresolved: [],
  ...overrides
});

test('returns no stable mechanism when evidence does not converge', () => {
  const out = synthesizeWholeForm(baseField({
    confirmations:[{kind:'word-repetition', word:'TEST', repetitions:{T:2}}],
    anchors:[{letter:'T',roles:['repetition'],scopes:['word:1'],layer0:{en:'bent cross',zh:'弯曲十字架'}}]
  }));
  assert.equal(out.decision, DECISIONS.NONE);
  assert.equal(out.mechanism, null);
});

test('returns indeterminate for one meaningful structural family only', () => {
  const out = synthesizeWholeForm(baseField({
    confirmations:[{kind:'whole-frame',letter:'A'}],
    anchors:[{letter:'A',roles:['frame','return'],scopes:['whole'],layer0:{en:'collectivity / great love',zh:'群体性 / 大爱'}}]
  }));
  assert.equal(out.decision, DECISIONS.INDETERMINATE);
});

test('detects stable containment-continuity when independent families converge', () => {
  const out = synthesizeWholeForm(baseField({
    confirmations:[
      {kind:'whole-frame',letter:'A'},
      {kind:'cross-scale-anchor',letter:'A',roles:['frame','return','cross-scale-resonance'],scopes:['word:1','whole']}
    ],
    anchors:[{letter:'A',roles:['frame','return','cross-scale-resonance'],scopes:['word:1','whole'],layer0:{en:'collectivity / great love',zh:'群体性 / 大爱'}}]
  }));
  assert.equal(out.decision, DECISIONS.STABLE);
  assert.equal(out.mechanism.id, 'containment-continuity');
  assert.ok(out.support.independentFamilies >= 2);
});

test('gate polarity plus framing converges on boundary-polarity', () => {
  const out = synthesizeWholeForm(baseField({
    confirmations:[
      {kind:'gate-polarity',word:'MW'},
      {kind:'sentence-frame',sentence:1,letter:'M'}
    ],
    anchors:[
      {letter:'M',roles:['frame'],scopes:['sentence:1'],layer0:{en:'gate',zh:'门'}},
      {letter:'W',roles:['center'],scopes:['sentence:1'],layer0:{en:'dead gate',zh:'死门'}}
    ]
  }));
  assert.equal(out.decision, DECISIONS.STABLE);
  assert.equal(out.mechanism.id, 'boundary-polarity');
});
