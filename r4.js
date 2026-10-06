import { analyzeText } from './src/engine/analyze.js';

function fnv1a(input = '') {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

function stableClone(value) {
  if (Array.isArray(value)) return value.map(stableClone);
  if (!value || typeof value !== 'object') return value;
  const out = {};
  for (const key of Object.keys(value).sort()) out[key] = stableClone(value[key]);
  return out;
}

function stableStringify(value) {
  return JSON.stringify(stableClone(value));
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const key of Object.keys(value)) deepFreeze(value[key]);
  return Object.freeze(value);
}

export function freezeCanonicalReading(result) {
  const canonical = {
    engineVersion: '1.0.0-r4',
    sourceText: result.sourceText,
    romanized: result.romanized,
    field: result.field,
    sections: result.sections,
    method: {
      grammarMode: 'timeless-whole-form',
      viewPolicy: 'one-canonical-reading-many-evidence-views',
      outcomePolicy: 'later-outcome-confirms-only-no-backpropagation'
    }
  };
  const fingerprint = `MM-${fnv1a(stableStringify(canonical))}`;
  return deepFreeze({ ...canonical, fingerprint });
}

export function analyzeForView(input = '', view = 'reading') {
  const normalizedView = view === 'evidence' ? 'evidence' : 'reading';
  // Canonical decoding is always computed once in one fixed mode.
  // The selected view controls disclosure of evidence only, never the reading.
  const result = analyzeText(String(input), { mode: 'quick' });
  const frozen = freezeCanonicalReading(result);
  return { view: normalizedView, result, frozen };
}

function escapeHtml(s='') {
  return String(s).replace(/[&<>"']/g, m => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
  }[m]));
}

function item(label, value) {
  return `<div class="item"><strong>${label}</strong><div>${escapeHtml(value)}</div></div>`;
}

function renderSection(sec) {
  const labels = sec.language === 'en'
    ? ['English Analysis','Surface Layer','Timeless Structural Reading','Hidden / Incremental Information','Outcome Confirmation Status','Signal Strength','Reality Boundary']
    : ['中文分析','表面层','无时间结构显影','隐藏 / 增量信息','后来效果确认状态','信号强度','现实边界'];
  return `<h3>${labels[0]}</h3>${item(labels[1],sec.surface)}${item(labels[2],sec.structural)}${item(labels[3],sec.increment)}${item(labels[4],sec.truthAlignment)}${item(labels[5],sec.signalStrength)}${item(labels[6],sec.realityBoundary)}`;
}

function renderAudit(r, frozen) {
  const whole = r.field?.scopes?.whole || {};
  const reps = Object.entries(whole.repetitions || {}).map(([k,v])=>`${k}×${v}`).join(', ') || '—';
  const letters = (r.layer0 || []).map(x=>`<div class="letter"><b>${escapeHtml(x.letter)}</b><br><span>${escapeHtml(x.en)}</span><br><small>${escapeHtml(x.zh)}${x.status!=='frozen'?` · ${escapeHtml(x.status)}`:''}</small></div>`).join('');
  const anchors = (r.field?.anchors || []).map(a=>`<tr><td>${escapeHtml(a.letter)}</td><td>${escapeHtml((a.roles||[]).join(', '))}</td><td>${escapeHtml((a.scopes||[]).join(', '))}</td></tr>`).join('') || '<tr><td colspan="3">—</td></tr>';
  const confirmations = (r.field?.confirmations || []).map(c=>`<li>${escapeHtml(JSON.stringify(c))}</li>`).join('') || '<li>—</li>';
  return `<p><b>Canonical fingerprint:</b> <span class="mono">${escapeHtml(frozen?.fingerprint || '—')}</span></p>
  <p><b>Romanization / Pinyin:</b> <span class="mono">${escapeHtml(r.romanized || '')}</span></p>
  <p><b>Grammar model:</b> ${escapeHtml(r.field?.grammarMode || '—')} · <b>Temporal interpretation:</b> no · <b>Frequency policy:</b> retain all / no down-weight</p>
  <p><b>Length:</b> ${whole.length ?? 0} · <b>First/Last:</b> ${escapeHtml(whole.first || '—')} / ${escapeHtml(whole.last || '—')} · <b>Center:</b> ${escapeHtml((whole.centers || []).join(' / ') || '—')} · <b>Framed:</b> ${whole.framed ? 'yes' : 'no'} · <b>Repetitions:</b> ${escapeHtml(reps)}</p>
  <h4>A–Z Layer 0</h4><div class="letter-grid">${letters}</div>
  <h4>Structural anchors / 结构锚点</h4><table><thead><tr><th>Code</th><th>Roles</th><th>Scopes</th></tr></thead><tbody>${anchors}</tbody></table>
  <h4>Multi-scale confirmations / 多尺度确认</h4><ul>${confirmations}</ul>`;
}

function initBrowserApp() {
  const $ = s => document.querySelector(s);
  const source = $('#source');
  let lastBundle = null;

  function runAnalysis() {
    const input = source.value.trim();
    if (!input) { source.focus(); return; }
    const selected = document.querySelector('input[name="view"]:checked');
    const view = selected ? selected.value : 'reading';
    try {
      lastBundle = analyzeForView(input, view);
      const { result, frozen } = lastBundle;
      $('#romanized').textContent = `CANONICAL · ${result.romanized || ''}`;
      $('#fingerprint').textContent = `Frozen ID / 冻结编号: ${frozen.fingerprint}`;
      $('#result-en').innerHTML = renderSection(result.sections?.[0] || {});
      $('#result-zh').innerHTML = renderSection(result.sections?.[1] || {});
      $('#audit').innerHTML = renderAudit(result, frozen);
      $('#audit-card').open = view === 'evidence';
      $('#results').classList.remove('hidden');
      $('#results').scrollIntoView({behavior:'smooth',block:'start'});
    } catch (e) {
      console.error(e);
      alert(`Analysis error / 解译错误: ${e?.message || e}`);
    }
  }

  $('#analyze')?.addEventListener('click', runAnalysis);
  source?.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') runAnalysis();
  });

  $('#copy')?.addEventListener('click', async () => {
    if (!lastBundle) return;
    const { result, frozen } = lastBundle;
    const text = [`Frozen fingerprint: ${frozen.fingerprint}`]
      .concat((result.sections || []).map(s => Object.entries(s)
        .filter(([k]) => k !== 'language')
        .map(([k,v]) => `${k}: ${v}`).join('\n'))).join('\n\n');
    try {
      await navigator.clipboard.writeText(text);
      $('#copy').textContent = 'Copied / 已复制';
      setTimeout(() => $('#copy').textContent = 'Copy result / 复制', 1500);
    } catch {}
  });

  for (const btn of document.querySelectorAll('[data-feedback]')) {
    btn.addEventListener('click', () => {
      if (!lastBundle) return;
      const rec = {
        time: new Date().toISOString(),
        rating: btn.dataset.feedback,
        input: source.value,
        fingerprint: lastBundle.frozen.fingerprint,
        field: lastBundle.result.field
      };
      const arr = JSON.parse(localStorage.getItem('mingmaben-feedback') || '[]');
      arr.push(rec);
      localStorage.setItem('mingmaben-feedback', JSON.stringify(arr));
      $('#feedback-status').textContent = 'Saved locally in this browser. / 已保存在当前浏览器本地。';
    });
  }

  $('#export-feedback')?.addEventListener('click', () => {
    const data = localStorage.getItem('mingmaben-feedback') || '[]';
    const blob = new Blob([data], {type:'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'mingmaben-feedback.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 500);
  });

  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(console.warn);
}

if (typeof document !== 'undefined') initBrowserApp();
