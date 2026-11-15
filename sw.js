const CACHE='mermaid-slither-v1.0.3';
const ROOT=new URL('./',self.location).href;
const FILES=['./','index.html','style.css','js/app.js','js/data.js','js/engine.js','js/motion.js','js/input.js','js/storage.js','js/render.js','js/audio.js','js/art.js','manifest.webmanifest','assets/icon.svg','assets/apple-touch-icon.png','assets/icon-192.png','assets/icon-512.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES.map(p=>new URL(p,ROOT).href)))));
// No skipWaiting: never swap runtime versions in the middle of a swim.
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('mermaid-slither-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET'||!event.request.url.startsWith(ROOT))return;
  const url=new URL(event.request.url);url.search='';
  const known=FILES.some(p=>new URL(p,ROOT).href===url.href);
  if(!known)return;
  event.respondWith(caches.open(CACHE).then(async cache=>(await cache.match(url.href))||fetch(event.request)));
});
