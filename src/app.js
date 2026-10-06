import { analyzeText } from './engine/analyze.js';
import { freezeReading } from './engine/freeze.js';

const $ = s => document.querySelector(s);
const source = $('#source');
let lastResult = null;
let lastFrozen = null;

function item(label, value){
  return `<div class="item"><strong>${label}</strong><div>${escapeHtml(value)}</div></div>`;
}

function renderSection(sec){
  const labels = sec.language === 'en'
    ? ['English Analysis','Surface Layer','Timeless Structural Reading','Hidden / Incremental Information','Outcome Confirmation Status','Signal Strength','Reality Boundary']
    : ['中文分析','表面层','无时间结构显影','隐藏 / 增量信息','后来效果确认状态','信号强度','现实边界'];
  return `<h3>${labels[0]}</h3>${item(labels[1],sec.surface)}${item(labels[2],sec.structural)}${item(labels[3],sec.increment)}${item(labels[4],sec.truthAlignment)}${item(labels[5],sec.signalStrength)}${item(labels[6],sec.realityBoundary)}`;
}

function escapeHtml(s=''){
  return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
}

function renderAudit(r){
  const whole = r.field.scopes.whole;
  const reps = Object.entries(whole.repeated).map(([k,v])=>`${k}×${v}`).join(', ') || '—';
  const letters = r.layer0.map(x=>`<div class="letter"><b>${x.letter}</b><br><span>${escapeHtml(x.en)}</span><br><small>${escapeHtml(x.zh)}${x.status!=='frozen'?` · ${x.status}`:''}</small></div>`).join('');
  const anchors = r.field.anchors.map(a=>`<tr><td>${a.letter}</td><td>${escapeHtml(a.roles.join(', '))}</td><td>${escapeHtml(a.scopes.join(', '))}</td></tr>`).join('') || '<tr><td colspan="3">—</td></tr>';
  const confirmations = r.field.confirmations.map(c=>`<li>${escapeHtml(JSON.stringify(c))}</li>`).join('') || '<li>—</li>';
  return `<p><b>Romanization / Pinyin:</b> <span class="mono">${escapeHtml(r.romanized)}</span></p>
  <p><b>Grammar model:</b> ${escapeHtml(r.field.grammarMode)} · <b>Temporal interpretation:</b> no · <b>Frequency policy:</b> retain all / no down-weight</p>
  <p><b>Length:</b> ${whole.length} · <b>First/Last:</b> ${whole.first||'—'} / ${whole.last||'—'} · <b>Center:</b> ${whole.centers.join(' / ')||'—'} · <b>Framed:</b> ${whole.framed?'yes':'no'} · <b>Repetitions:</b> ${reps}</p>
  <p><b>Frozen fingerprint:</b> <span class="mono">${escapeHtml(lastFrozen?.fingerprint || '—')}</span></p>
  <h4>A–Z Layer 0</h4><div class="letter-grid">${letters}</div>
  <h4>Structural anchors / 结构锚点</h4><table><thead><tr><th>Code</th><th>Roles</th><th>Scopes</th></tr></thead><tbody>${anchors}</tbody></table>
  <h4>Multi-scale confirmations / 多尺度确认</h4><ul>${confirmations}</ul>`;
}

function runAnalysis(){
  const input = source.value.trim();
  if(!input){ source.focus(); return; }
  const mode = document.querySelector('input[name="mode"]:checked').value;
  try {
    lastResult = analyzeText(input,{mode});
    lastFrozen = freezeReading(lastResult);
    $('#romanized').textContent = `${mode.toUpperCase()} · ${lastResult.romanized}`;
    $('#result-en').innerHTML = renderSection(lastResult.sections[0]);
    $('#result-zh').innerHTML = renderSection(lastResult.sections[1]);
    $('#audit').innerHTML = renderAudit(lastResult);
    $('#audit-card').open = mode === 'deep';
    $('#results').classList.remove('hidden');
    $('#results').scrollIntoView({behavior:'smooth',block:'start'});
  } catch(e){
    alert(`Analysis error / 解译错误: ${e.message}`);
  }
}

$('#analyze').addEventListener('click', runAnalysis);
source.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') runAnalysis();
});

$('#copy').addEventListener('click',async()=>{
  if(!lastResult) return;
  const text = [`Frozen fingerprint: ${lastFrozen?.fingerprint || '—'}`]
    .concat(lastResult.sections.map(s=>Object.entries(s).filter(([k])=>k!=='language').map(([k,v])=>`${k}: ${v}`).join('\n'))).join('\n\n');
  await navigator.clipboard.writeText(text);
  $('#copy').textContent='Copied / 已复制';
  setTimeout(()=>$('#copy').textContent='Copy result / 复制',1500);
});

for(const btn of document.querySelectorAll('[data-feedback]')) btn.addEventListener('click',()=>{
  const rec={
    time:new Date().toISOString(),
    rating:btn.dataset.feedback,
    input:source.value,
    fingerprint:lastFrozen?.fingerprint || null,
    field:lastResult?.field || null
  };
  const arr=JSON.parse(localStorage.getItem('mingmaben-feedback')||'[]');
  arr.push(rec);
  localStorage.setItem('mingmaben-feedback',JSON.stringify(arr));
  $('#feedback-status').textContent='Saved locally in this browser. / 已保存在当前浏览器本地。';
});

$('#export-feedback').addEventListener('click',()=>{
  const data=localStorage.getItem('mingmaben-feedback')||'[]';
  const blob=new Blob([data],{type:'application/json'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='mingmaben-feedback.json';
  a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),500);
});

if('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(()=>{});
