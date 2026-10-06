import test from 'node:test';
import assert from 'node:assert/strict';
import { renderReading } from '../src/engine/render.js';
import { freezeReading } from '../src/engine/freeze.js';

const field={
  grammarMode:'timeless-whole-form',
  anchors:[{letter:'A',roles:['frame','cross-scale-resonance'],scopes:['word:1','whole'],layer0:{en:'collectivity / great love',zh:'群体性 / 大爱'}}],
  confirmations:[{kind:'whole-frame',letter:'A'},{kind:'cross-scale-anchor',letter:'A'}],
  unresolved:[]
};
const synthesis={
  version:'MINGMABEN-R5-MATURE-1',
  decision:'stable_relational_mechanism',
  mechanism:{id:'containment-continuity',en:'Canonical EN',zh:'唯一中文'},
  support:{independentFamilies:2,families:['boundary','cross-scale'],anchorLetters:['A'],unresolved:[]}
};

test('render puts frozen decision and canonical reading before evidence',()=>{
  const sections=renderReading({field,synthesis},'sample','deep');
  assert.equal(sections[0].decision,'STABLE RELATIONAL MECHANISM');
  assert.equal(sections[0].canonicalReading,'Canonical EN');
  assert.equal(sections[1].canonicalReading,'唯一中文');
  assert.match(sections[0].increment,/boundary/);
});

test('freeze fingerprint includes synthesis contract',()=>{
  const frozen=freezeReading({sourceText:'x',romanized:'X',mode:'quick',field,synthesis,sections:[]});
  assert.equal(frozen.engineVersion,'5.0.0-mature.1');
  assert.equal(frozen.method.synthesisVersion,'MINGMABEN-R5-MATURE-1');
  assert.equal(frozen.method.layer0Version,'MINGMABEN-LAYER0-2026-10-07');
  assert.equal(frozen.decision,'stable_relational_mechanism');
  assert.equal(frozen.canonicalMechanism,'containment-continuity');
  assert.match(frozen.fingerprint,/^MM-R5-/);
});
