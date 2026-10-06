import { analyzeText } from './engine/analyze.js';
import { freezeReading } from './engine/freeze.js';

const $ = s => document.querySelector(s);
const source = $('#source');
let lastResult = null;
let lastFrozen = null;

function escapeHtml(s=''){
  return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
}
function item(label,value,cls=''){
  return `<div class="item ${cls}"><strong>${label}</strong><div>${escapeHtml(value)}</div></div>`;
}
function renderSection(sec){
  const en=sec.language==='en';
  return `<h3>${en?'English Analysis':'中文分析'}</h3>`+
    item(en?'Structural Decision':'结构判断',sec.decision,'decision')+
    item(en?'Canonical Frozen Reading':'唯一冻结显影',sec.canonicalReading,'canonical')+
    item(en?'Surface Layer':'表面层',sec.surface)+
    item(en?'Timeless Structural Grammar':'无时间结构语法',sec.structural)+
    item(en?'Structural Evidence':'结构证据',sec.increment)+
    item(en?'Outcome Confirmation Status':'后来效果确认状态',sec.truthAlignment)+
    item(en?'Evidence Strength':'证据强度',sec.signalStrength)+
    item(en?'Reality Boundary':'现实边界',sec.realityBoundary);
}
function renderAudit(r){
  const whole=r.field.scopes.whole;
  const reps=Object.entries(whole.repetitions||{}).map(([k,v])=>`${k}×${v}`).join(', ')||'—';
  const anchors=r.field.anchors.map(a=>`<tr><td>${a.letter}</td><td>${escapeHtml(a.roles.join(', '))}</td><td>${escapeHtml(a.scopes.join(', '))}</td></tr>`).join('')||'<tr><td colspan="3">—</td></tr>';
  const confirmations=r.field.confirmations.map(c=>`<li>${escapeHtml(JSON.stringify(c))}</li>`).join('')||'<li>—</li>';
  return `<p><b>R5 Synthesis:</b> ${escapeHtml(r.synthesis.version)} · <b>Decision:</b> ${escapeHtml(r.synthesis.decision)} · <b>Mechanism:</b> ${escapeHtml(r.synthesis.mechanism?.id||'—')}</p>
  <p><b>Romanization / Pinyin:</b> <span class="mono">${escapeHtml(r.romanized)}</span></p>
  <p><b>Grammar model:</b> ${escapeHtml(r.field.grammarMode)} · <b>Temporal interpretation:</b> no · <b>Frequency policy:</b> retain all / no down-weight</p>
  <p><b>Length:</b> ${whole.length} · <b>First/Last:</b> ${whole.first||'—'} / ${whole.last||'—'} · <b>Center:</b> ${whole.centers.join(' / ')||'—'} · <b>Framed:</b> ${whole.framed?'yes':'no'} · <b>Repetitions:</b> ${reps}</p>
  <p><b>Frozen fingerprint:</b> <span class="mono">${escapeHtml(lastFrozen?.fingerprint||'—')}</span></p>
  <h4>Structural anchors / 结构锚点</h4><table><thead><tr><th>Code</th><th>Roles</th><th>Scopes</th></tr></thead><tbody>${anchors}</tbody></table>
  <h4>Multi-scale confirmations / 多尺度确认</h4><ul>${confirmations}</ul>`;
}
function runAnalysis(){
  const input=source.value.trim();
  if(!input){source.focus();return;}
  const view=document.querySelector('input[name="view"]:checked')?.value||'reading';
  const mode=view==='evidence'?'deep':'quick';
  try{
    lastResult=analyzeText(input,{mode});
    lastFrozen=freezeReading(lastResult);
    $('#romanized').textContent=`${mode.toUpperCase()} · ${lastResult.romanized}`;
    $('#fingerprint').textContent=lastFrozen.fingerprint;
    $('#result-en').innerHTML=renderSection(lastResult.sections[0]);
    $('#result-zh').innerHTML=renderSection(lastResult.sections[1]);
    $('#audit').innerHTML=renderAudit(lastResult);
    $('#audit-card').open=view==='evidence';
    $('#results').classList.remove('hidden');
    $('#results').scrollIntoView({behavior:'smooth',block:'start'});
  }catch(e){ alert(`Analysis error / 解译错误: ${e.message}`); }
}
$('#analyze').addEventListener('click',runAnalysis);
source.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='Enter')runAnalysis();});
$('#copy').addEventListener('click',async()=>{
  if(!lastResult)return;
  const text=[`Frozen fingerprint: ${lastFrozen?.fingerprint||'—'}`,`Decision: ${lastResult.synthesis.decision}`,`Mechanism: ${lastResult.synthesis.mechanism?.id||'—'}`]
    .concat(lastResult.sections.map(s=>Object.entries(s).filter(([k])=>k!=='language').map(([k,v])=>`${k}: ${v}`).join('\n'))).join('\n\n');
  await navigator.clipboard.writeText(text);
  $('#copy').textContent='Copied / 已复制'; setTimeout(()=>$('#copy').textContent='Copy result / 复制',1500);
});
for(const btn of document.querySelectorAll('[data-feedback]')) btn.addEventListener('click',()=>{
  const rec={time:new Date().toISOString(),rating:btn.dataset.feedback,input:source.value,fingerprint:lastFrozen?.fingerprint||null,decision:lastResult?.synthesis?.decision||null,mechanism:lastResult?.synthesis?.mechanism?.id||null};
  const arr=JSON.parse(localStorage.getItem('mingmaben-feedback')||'[]'); arr.push(rec); localStorage.setItem('mingmaben-feedback',JSON.stringify(arr));
  $('#feedback-status').textContent='Saved locally in this browser. / 已保存在当前浏览器本地。';
});
$('#export-feedback').addEventListener('click',()=>{
  const data=localStorage.getItem('mingmaben-feedback')||'[]'; const blob=new Blob([data],{type:'application/json'}); const a=document.createElement('a');
  a.href=URL.createObjectURL(blob); a.download='mingmaben-feedback.json'; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),500);
});
if('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(()=>{});
