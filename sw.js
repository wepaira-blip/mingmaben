const CACHE='mingmaben-v1.0-text-r1';
const CORE=[
  './','./index.html','./src/styles.css','./src/app.js',
  './src/engine/analyze.js','./src/engine/normalize.js','./src/engine/pinyin.js',
  './src/engine/han-map.js','./src/engine/layer0.js','./src/engine/structure.js',
  './src/engine/field.js','./src/engine/freeze.js','./src/engine/render.js',
  './public/manifest.json','./public/icon-192.png','./public/icon-512.png'
];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(resp=>{
    const copy=resp.clone();
    caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{});
    return resp;
  })));
});
