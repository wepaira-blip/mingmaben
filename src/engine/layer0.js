export const LAYER0_VERSION = 'MINGMABEN-LAYER0-2026-10-07';

export const LAYER0 = Object.freeze({
  A: { zh:'群体性 / 大爱', en:'collectivity / great love', status:'frozen', motifs:['collective','relation'] },
  B: { zh:'女性性器官', en:'female genitalia', status:'source-incomplete', motifs:['embodiment','sexuality'] },
  C: { zh:'乱伦', en:'incest / relation-order transgression', status:'frozen', motifs:['relation','disorder'] },
  D: { zh:'烂伦', en:'corrupted / deformed relational order', status:'frozen', motifs:['relation','closure','disorder'] },
  E: { zh:'电 / 盗精生的孩子', en:'electricity / result with source but without acknowledged father-role or relation', status:'frozen', motifs:['generation','embodiment','dislocation'] },
  F: { zh:'佛', en:'Buddha / remembrance / contemplation / faith', status:'frozen', motifs:['faith','cross'] },
  G: { zh:'国', en:'country / state', status:'frozen', motifs:['collective','power'] },
  H: { zh:'王座 / 权力座位', en:'throne / seat of authority', status:'frozen', motifs:['power','center'] },
  I: { zh:'倒奸', en:'inverted sexual violation posture', status:'frozen', motifs:['sexuality','inversion','power'] },
  J: { zh:'王子', en:'prince', status:'frozen', motifs:['power'] },
  K: { zh:'王', en:'king', status:'frozen', motifs:['power','center'] },
  L: { zh:'爱', en:'love', status:'frozen', motifs:['relation','love'] },
  M: { zh:'门', en:'gate', status:'frozen', motifs:['gate','opening'] },
  N: { zh:'性行为', en:'sexual act', status:'frozen', motifs:['sexuality','relation'] },
  O: { zh:'人伦', en:'human relational order', status:'frozen', motifs:['relation'] },
  P: { zh:'虎 / 虎皮残余指涉', en:'tiger / residual skin pointing to an absent tiger', status:'frozen', motifs:['power','absence'] },
  Q: { zh:'妻', en:'wife', status:'frozen', motifs:['relation'] },
  R: { zh:'日（性行为）', en:'colloquial sexual act', status:'frozen', motifs:['sexuality','relation'] },
  S: { zh:'螺旋', en:'spiral', status:'frozen', motifs:['spiral','return'] },
  T: { zh:'弯曲十字架', en:'bent cross; direction differs from F', status:'frozen', motifs:['cross','direction'] },
  U: { zh:'被交的男人屁眼', en:'male anus in the specific penetrated posture system', status:'frozen', motifs:['sexuality','embodiment'] },
  V: { zh:'胜利', en:'victory', status:'frozen', motifs:['victory','power'] },
  W: { zh:'死门', en:'dead gate / inversion of M', status:'frozen', motifs:['gate','closure','death','inversion'] },
  X: { zh:'女阴 / 上帝', en:'vulva / God', status:'frozen', motifs:['sexuality','faith','cross'] },
  Y: { zh:'光 / 电 / 磁', en:'light / electricity / magnetism', status:'frozen', motifs:['generation','information'] },
  Z: { zh:'动物园？（未冻结）', en:'zoo? (tentative; not frozen)', status:'tentative', motifs:['unknown'] }
});

export function expandLayer0(text='') {
  return [...String(text).toUpperCase()]
    .filter(ch => /[A-Z]/.test(ch))
    .map(letter => ({ letter, ...LAYER0[letter] }));
}
