import { uid } from './utils.js';

const DB_NAME = 'omg-teacher';
const DB_VERSION = 1;

const STORES = {
  users:    { keyPath: 'id' },
  progress: { keyPath: ['userId', 'phraseId'] },
  tests:    { keyPath: 'id', autoIncrement: true, indexes: [['userId','userId'], ['date','date']] },
  phrases:  { keyPath: 'id', indexes: [['userId','userId']] },
  meta:     { keyPath: 'key' }
};

let db;

export function initDB(){
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = e => {
      const d = e.target.result;
      for(const [name, def] of Object.entries(STORES)){
        if(d.objectStoreNames.contains(name)) continue;
        const s = d.createObjectStore(name, { keyPath: def.keyPath, autoIncrement: !!def.autoIncrement });
        (def.indexes || []).forEach(([idx, path, opts]) => s.createIndex(idx, path, opts || {}));
      }
    };
    req.onsuccess = e => { db = e.target.result; resolve(db); };
    req.onerror   = e => reject(e.target.error);
  });
}

function tx(store, mode='readonly'){ return db.transaction(store, mode).objectStore(store); }
const wrap = req => new Promise((res, rej) => { req.onsuccess = () => res(req.result); req.onerror = () => rej(req.error); });

/* ---------- Users ---------- */
export async function createUser(name){
  const user = {
    id: uid(),
    name: name.trim(),
    createdAt: Date.now(),
    lastSeen: Date.now()
  };
  await wrap(tx('users','readwrite').add(user));
  await wrap(tx('meta','readwrite').put({ key:'currentUser', value:user.id }));
  return user;
}

export async function getUser(id){ return wrap(tx('users').get(id)); }

export async function listUsers(){
  const users = await wrap(tx('users').getAll());
  return users.sort((a,b) => b.lastSeen - a.lastSeen);
}

export async function touchUser(id){
  const u = await getUser(id);
  if(!u) return;
  u.lastSeen = Date.now();
  await wrap(tx('users','readwrite').put(u));
}

export async function getCurrentUser(){
  const meta = await wrap(tx('meta').get('currentUser'));
  if(!meta) return null;
  return getUser(meta.value);
}
export async function setCurrentUser(id){ await wrap(tx('meta','readwrite').put({ key:'currentUser', value:id })); }
export async function clearCurrentUser(){ await wrap(tx('meta','readwrite').delete('currentUser')); }

/* ---------- Progress ---------- */
/* ---------- Progress ---------- */
export async function getProgressFor(userId){
  const all = await wrap(tx('progress').getAll());
  return all.filter(p => p.userId === userId);
}
export async function putProgress(p){ await wrap(tx('progress','readwrite').put(p)); }
export async function getProgress(userId, phraseId){
  return wrap(tx('progress').get([userId, phraseId]));
}

/* ---------- Tests ---------- */
export async function saveTest(t){
  const rec = { ...t, date: t.date || Date.now() };
  const id = await wrap(tx('tests','readwrite').add(rec));
  return id;
}
export async function listTests(userId, limit=50){
  const idx = tx('tests').index('userId');
  const arr = await wrap(idx.getAll(userId));
  return arr.sort((a,b) => b.date - a.date).slice(0, limit);
}

/* ---------- Custom phrases ---------- */
export async function listCustomPhrases(userId){
  const all = await wrap(tx('phrases').getAll());
  return all.filter(p => p.userId === userId);
}
export async function replaceCustomPhrases(userId, phrases){
  const s = tx('phrases','readwrite');
  const all = await wrap(tx('phrases').getAll());
  for(const p of all){ if(p.userId === userId) s.delete(p.id); }
  for(const p of phrases){ s.put({ ...p, userId }); }
  return new Promise((res, rej) => { s.transaction.oncomplete = res; s.transaction.onerror = () => rej(s.transaction.error); });
}

/* ---------- Meta helpers ---------- */
export async function metaGet(key){ const r = await wrap(tx('meta').get(key)); return r?.value; }
export async function metaSet(key, value){ await wrap(tx('meta','readwrite').put({ key, value })); }
