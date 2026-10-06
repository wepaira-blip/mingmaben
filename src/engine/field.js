import { LAYER0 } from './layer0.js';
import { normalizeLatinText } from './normalize.js';

function centers(arr) {
  if (!arr.length) return [];
  const n = arr.length;
  return n % 2 ? [arr[Math.floor(n / 2)]] : [arr[n / 2 - 1], arr[n / 2]];
}

function centerIndexes(n) {
  if (!n) return [];
  return n % 2 ? [Math.floor(n/2)] : [n/2-1, n/2];
}

function repetitions(arr) {
  const counts = {};
  for (const item of arr) counts[item] = (counts[item] || 0) + 1;
  return Object.fromEntries(Object.entries(counts).filter(([, count]) => count > 1));
}

function mirrorPairs(arr) {
  const pairs = [];
  for (let i=0;i<Math.floor(arr.length/2);i++) {
    const j = arr.length - 1 - i;
    if (arr[i] === arr[j]) pairs.push({letter:arr[i],left:i,right:j});
  }
  return pairs;
}

function motifSetForLetters(letters) {
  const motifs = new Set();
  for (const letter of letters) for (const motif of LAYER0[letter]?.motifs || []) motifs.add(motif);
  return [...motifs].sort();
}

function makeScope(text, index, kind) {
  const normalized = normalizeLatinText(text);
  const letters = normalized.replace(/[^A-Z]/g,'').split('');
  return {
    index, kind, text:String(text).trim(), normalized,
    letters, sequence:[...letters], length:letters.length,
    first:letters[0] || null, last:letters.at(-1) || null,
    centers:centers(letters), centerIndexes:centerIndexes(letters.length),
    framed:letters.length>1 && letters[0]===letters.at(-1),
    repetitions:repetitions(letters), mirrorPairs:mirrorPairs(letters),
    motifs:motifSetForLetters(letters)
  };
}

const splitWords = text => String(text).split(/\s+/).map(x=>x.trim()).filter(Boolean);
const splitSentences = text => String(text).split(/[.!?。！？]+/).map(x=>x.trim()).filter(Boolean);
const splitParagraphs = text => String(text).split(/\n+/).map(x=>x.trim()).filter(Boolean);

function orderedAdjacency(words) {
  const out = {};
  for (const w of words) for (let i=0;i<w.letters.length-1;i++) {
    const key=`${w.letters[i]}>${w.letters[i+1]}`;
    out[key]=(out[key]||0)+1;
  }
  return out;
}

function motifLedger(letters) {
  const motifs={};
  letters.forEach((letter,index)=>{
    for (const motif of LAYER0[letter]?.motifs || []) {
      motifs[motif] ||= {occurrences:0,letters:{},indexes:[]};
      motifs[motif].occurrences++;
      motifs[motif].letters[letter]=(motifs[motif].letters[letter]||0)+1;
      motifs[motif].indexes.push(index);
    }
  });
  return motifs;
}

function roleLedger(scopes) {
  const map=new Map();
  const touch=(letter,role,scope)=>{
    if(!letter) return;
    if(!map.has(letter)) map.set(letter,{letter,roles:new Set(),scopes:new Set(),events:[]});
    const r=map.get(letter); r.roles.add(role); r.scopes.add(scope); r.events.push({role,scope});
  };
  const inspect=(s,name)=>{
    if(s.framed){touch(s.first,'frame',name);touch(s.first,'return',name);}
    s.centers.forEach(x=>touch(x,'center',name));
    Object.keys(s.repetitions).forEach(x=>touch(x,'repetition',name));
    s.mirrorPairs.forEach(x=>touch(x.letter,'mirror',name));
  };
  scopes.words.forEach((s,i)=>inspect(s,`word:${i+1}`));
  scopes.sentences.forEach((s,i)=>inspect(s,`sentence:${i+1}`));
  scopes.paragraphs.forEach((s,i)=>inspect(s,`paragraph:${i+1}`));
  inspect(scopes.whole,'whole');
  for(const r of map.values()) if(r.scopes.size>1) r.roles.add('cross-scale-resonance');
  return [...map.values()].map(r=>({letter:r.letter,roles:[...r.roles],scopes:[...r.scopes],events:r.events,layer0:LAYER0[r.letter]}));
}

function signature(s) {
  return {
    framed:s.framed,
    centerCount:s.centers.length,
    mirrorCount:s.mirrorPairs.length,
    repetitionKinds:Object.keys(s.repetitions).length
  };
}

function sameSignature(a,b) {
  const x=signature(a), y=signature(b);
  return x.framed===y.framed && x.centerCount===y.centerCount && x.mirrorCount===y.mirrorCount && x.repetitionKinds===y.repetitionKinds;
}

function confirmations(scopes, anchors) {
  const out=[];
  for(const w of scopes.words){
    if(w.framed) out.push({kind:'word-frame',word:w.normalized,wordIndex:w.index,letter:w.first});
    if(w.mirrorPairs.length) out.push({kind:'word-mirror',word:w.normalized,wordIndex:w.index,pairs:w.mirrorPairs});
    if(Object.keys(w.repetitions).length) out.push({kind:'word-repetition',word:w.normalized,wordIndex:w.index,repetitions:w.repetitions});
    if(w.letters.includes('M')&&w.letters.includes('W')) out.push({kind:'gate-polarity',word:w.normalized,wordIndex:w.index});
  }
  scopes.sentences.forEach((s,i)=>{if(s.framed)out.push({kind:'sentence-frame',sentence:i+1,letter:s.first});});
  scopes.paragraphs.forEach((p,i)=>{if(p.framed)out.push({kind:'paragraph-frame',paragraph:i+1,letter:p.first});});
  if(scopes.whole.framed) out.push({kind:'whole-frame',letter:scopes.whole.first});
  anchors.filter(a=>a.roles.includes('cross-scale-resonance')).forEach(a=>out.push({kind:'cross-scale-anchor',letter:a.letter,roles:a.roles,scopes:a.scopes}));

  // Whole-form isomorphism: same structural signature in distinct word forms.
  for(let i=0;i<scopes.words.length;i++) for(let j=i+1;j<scopes.words.length;j++) {
    const a=scopes.words[i], b=scopes.words[j];
    if(a.normalized!==b.normalized && a.length>=3 && b.length>=3 && sameSignature(a,b) && (a.framed || a.mirrorPairs.length || Object.keys(a.repetitions).length)) {
      out.push({kind:'word-isomorphism',words:[a.normalized,b.normalized],wordIndexes:[i,j],signature:signature(a)});
    }
  }
  return out;
}

export function buildStructuralField(normalized='', layer0Entries=[]) {
  const raw=String(normalized);
  const words=splitWords(raw).map((x,i)=>makeScope(x,i,'word'));
  const sentences=splitSentences(raw).map((x,i)=>makeScope(x,i,'sentence'));
  const paragraphs=splitParagraphs(raw).map((x,i)=>makeScope(x,i,'paragraph'));
  const whole=makeScope(raw,0,'whole'); whole.uniqueCount=new Set(whole.letters).size;
  const scopes={letters:whole.letters.map((letter,index)=>({letter,index,layer0:LAYER0[letter]})),words,sentences,paragraphs,whole};
  const anchors=roleLedger(scopes);
  return {
    grammarMode:'timeless-whole-form', model:'timeless-structural-field', temporalInterpretation:false, weighting:'none',
    letters:whole.letters, words, sentences, paragraphs, whole, scopes,
    orderedAdjacency:orderedAdjacency(words), motifs:motifLedger(whole.letters),
    confirmations:confirmations(scopes,anchors), anchors,
    layer0:layer0Entries.map((entry,structuralIndex)=>({structuralIndex,...entry})),
    unresolved:[...new Set(whole.letters.filter(x=>LAYER0[x]?.status!=='frozen'))],
    metadata:{adjacencyMeaning:'structural-order-not-time',frequencyPolicy:'retain-all-no-downweight',outcomePolicy:'later-outcome-confirms-only-no-backpropagation',scalePolicy:'letter-word-sentence-paragraph-whole-are-observation-scales-not-time-stages'}
  };
}
