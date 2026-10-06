import test from 'node:test';
import assert from 'node:assert/strict';
import { LAYER0, LAYER0_VERSION } from '../src/engine/layer0.js';

test('R5 uses the current frozen Layer 0 contract',()=>{
  assert.equal(LAYER0_VERSION,'MINGMABEN-LAYER0-2026-10-07');
  assert.equal(LAYER0.D.zh,'烂伦');
  assert.equal(LAYER0.I.zh,'倒奸');
  assert.equal(LAYER0.R.zh,'日（性行为）');
  assert.equal(LAYER0.Z.status,'tentative');
});
