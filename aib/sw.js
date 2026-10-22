// AIB-C01 service worker. Its cache names start with "aib-study-", and cleanup only touches that
// prefix, so it never removes the AIF-C01 app's "aif-study-" caches (and vice versa).
const CACHE='aib-study-v1';
const ASSETS=['./','./index.html','./questions.js','./manifest.webmanifest','./icon.svg','./icon-180.png','./icon-192.png','./icon-512.png','./LICENSE-questions.txt'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS.map(u=>new Request(u,{cache:'reload'})))).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('aib-study-')&&k!==CACHE).map(k=>caches.delete(k)))),self.clients.claim()])));
// Network first so updates arrive when online, with a short timeout so a weak connection falls back
// to the cache quickly. Navigations fall back to the cached app shell.
self.addEventListener('fetch',e=>{const req=e.request;if(req.method!=='GET')return;const url=new URL(req.url);if(url.origin!==self.location.origin)return;
  const fromCache=()=>caches.open(CACHE).then(c=>c.match(req,{ignoreSearch:true}).then(r=>r||(req.mode==='navigate'?c.match('./index.html'):undefined))).then(r=>r||Response.error());
  e.respondWith(new Promise(resolve=>{let done=false;const finish=r=>{if(!done){done=true;resolve(r)}};
    const timer=setTimeout(()=>fromCache().then(r=>{if(r.type!=='error')finish(r)}),3000);
    fetch(req).then(res=>{clearTimeout(timer);if(res.ok&&res.type==='basic'){const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy))}finish(res)}).catch(()=>{clearTimeout(timer);fromCache().then(finish)})}))});
