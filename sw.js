/* يخلي التطبيق والدروس اللي اتنزلت تفتح من غير نت. الدروس بتتخزن متشفرة. */
const C="mf-v1";
self.addEventListener("install",e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(["./","./index.html"])).catch(()=>{}));self.skipWaiting()});
self.addEventListener("activate",e=>e.waitUntil(self.clients.claim()));
self.addEventListener("fetch",e=>{
  const req=e.request,u=new URL(req.url);
  if(req.method!=="GET"||u.origin!==location.origin)return;
  if(u.pathname.endsWith(".enc")){
    // الدرس: من الجهاز الأول، ولو مش موجود ينزل ويتخزن
    e.respondWith(caches.open(C).then(async c=>{
      const hit=await c.match(req);if(hit)return hit;
      const res=await fetch(req);
      if(res.ok){
        for(const k of await c.keys()){const ku=new URL(k.url);if(ku.pathname===u.pathname)await c.delete(k)}
        await c.put(req,res.clone());
      }
      return res;
    }));
    return;
  }
  // الصفحة و data.json: من النت الأول، ولو مفيش نت من الجهاز
  const key=u.origin+u.pathname;
  e.respondWith(fetch(req).then(async res=>{if(res.ok){const c=await caches.open(C);await c.put(key,res.clone())}return res})
    .catch(async()=>{const c=await caches.open(C);return (await c.match(key))||(await c.match("./index.html"))||Response.error()}));
});
