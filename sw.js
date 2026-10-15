const CACHE = 'omg-teacher-v2';
const ASSETS = [
  '.', 'index.html',
  'css/app.css',
  'js/main.js', 'js/views.js',
  'js/data/phrases.js',
  'js/core/utils.js', 'js/core/db.js', 'js/core/tts.js',
  'js/core/stt.js', 'js/core/diff.js', 'js/core/share.js', 'js/core/icons.js',
  'js/modules/auth.js', 'js/modules/content.js', 'js/modules/srs.js',
  'js/modules/session.js', 'js/modules/pronunciation.js', 'js/modules/progress.js'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(()=>{});
      return res;
    }).catch(() => caches.match('index.html')))
  );
});
