import { getProgress, putProgress } from '../core/db.js';

export const BOX_DAYS = [0, 1, 3, 7, 16, 35, 75, 150];
const DAY = 86400000;

export async function getProgressMap(userId){
  const { getProgressFor } = await import('../core/db.js');
  const list = await getProgressFor(userId);
  const map = {};
  list.forEach(p => { map[p.phraseId] = p; });
  return map;
}

export function isDue(rec, now = Date.now()){
  if(!rec) return true;
  return rec.due <= now;
}

export async function updateSRS(userId, phraseId, score){
  const rec = (await getProgress(userId, phraseId)) || {
    userId, phraseId, box:0, due:0, seen:0, ok:0, best:0
  };
  rec.seen++;
  rec.best = Math.max(rec.best || 0, score);
  if(score >= 0.999)     { rec.box = Math.min(rec.box + 1, BOX_DAYS.length - 1); rec.ok++; }
  else if(score >= 0.6)  { /* mantiene box, vuelve pronto */ }
  else                   { rec.box = 0; }
  rec.due = Date.now() + BOX_DAYS[rec.box] * DAY;
  rec.last = Date.now();
  await putProgress(rec);
  return rec;
}

export async function registerAttempt(userId, phraseId, score, { advanced = true } = {}){
  if(advanced) return updateSRS(userId, phraseId, score);
  // con pista o con reintento: no avanza caja pero registra intento
  const rec = (await getProgress(userId, phraseId)) || {
    userId, phraseId, box:0, due:0, seen:0, ok:0, best:0
  };
  rec.seen++;
  rec.due = Date.now() + DAY;
  await putProgress(rec);
  return rec;
}

export function buildQueue(phrases, progressMap, limit){
  const now = Date.now();
  const due = [], fresh = [], later = [];
  phrases.forEach(p => {
    const r = progressMap[p.id];
    if(!r) fresh.push(p);
    else if(isDue(r, now)) due.push(p);
    else later.push(p);
  });
  later.sort((a,b) => {
    const ra = progressMap[a.id], rb = progressMap[b.id];
    return (ra.box - rb.box) || (ra.due - rb.due);
  });
  return [...shuffle(due), ...shuffle(fresh), ...later].slice(0, limit).map(p => p.id);
}

function shuffle(a){ a=[...a]; for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]];} return a; }