const CACHE='mingmaben-r5-mature-1';
const CORE=[
  './index.html','./src/app.js','./src/styles.css',
  './src/engine/analyze.js','./src/engine/normalize.js','./src/engine/pinyin.js',
  './src/engine/han-map.js','./src/engine/layer0.js','./src/engine/structure.js',
  './src/engine/field.js','./src/engine/synthesize.js','./src/engine/render.js','./src/engine/freeze.js',
  './public/manifest.json','./public/icon-192.png','./public/icon-512.png'
];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  if(event.request.mode==='navigate'){
    event.respondWith(fetch(event.request).then(resp=>{const copy=resp.clone();caches.open(CACHE).then(c=>c.put('./index.html',copy)).catch(()=>{});return resp;}).catch(()=>caches.match('./index.html')));return;
  }
  event.respondWith(caches.match(event.request).then(r=>r||fetch(event.request).then(resp=>{const copy=resp.clone();caches.open(CACHE).then(c=>c.put(event.request,copy)).catch(()=>{});return resp;})));
});
