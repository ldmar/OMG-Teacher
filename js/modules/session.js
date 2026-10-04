import { getAllPhrases, filterByCategory, findPhrase } from './content.js';
import { getProgressMap, buildQueue, registerAttempt } from './srs.js';
import { diffWords } from '../core/diff.js';

export const S = {
  userId: null,
  queue: [],
  idx: 0,
  current: null,
  answered: false,
  hinted: false,
  category: 'all',
  length: 10,
  mode: 'dictation', // 'dictation' | 'pronunciation'
  stats: { perfect:0, partial:0, failed:0, words:0, heard:0 },
  results: [] // { phraseId, tag, score, heard, expected }
};

export async function startSession({ userId, category='all', length=10, mode='dictation' }){
  S.userId = userId; S.category = category; S.length = length; S.mode = mode;
  S.idx = 0; S.answered = false; S.hinted = false;
  S.stats = { perfect:0, partial:0, failed:0, words:0, heard:0 };
  S.results = [];

  const all = await getAllPhrases(userId);
  const pool = filterByCategory(all, category);
  const progress = await getProgressMap(userId);
  S.queue = buildQueue(pool, progress, length);

  return S.queue.length;
}

export function phraseById(id){
  return S.allCache?.[id] || S.allCache?.[id];
}

export async function loadAllForUser(userId){
  const all = await getAllPhrases(userId);
  S.allCache = Object.fromEntries(all.map(p => [p.id, p]));
  return all;
}

export async function loadCurrent(){
  if(S.idx >= S.queue.length) return null;
  const id = S.queue[S.idx];
  if(!S.allCache) await loadAllForUser(S.userId);
  S.current = S.allCache[id] || null;
  S.answered = false;
  S.hinted = false;
  return S.current;
}

export function grade(answer){
  if(!S.current) return null;
  const r = diffWords(S.current.en, answer);
  return r;
}

export async function commitResult({ score, heardText = '' }){
  if(!S.current) return;
  const advanced = !S.hinted;
  await registerAttempt(S.userId, S.current.id, score, { advanced });
  S.results.push({
    phraseId: S.current.id,
    tag: S.current.tag,
    expected: S.current.en,
    heard: heardText,
    score
  });
  if(score >= 0.999)      S.stats.perfect++;
  else if(score >= 0.6)   S.stats.partial++;
  else                    S.stats.failed++;
  S.stats.words += S.current.en.split(/\s+/).filter(Boolean).length;
  S.stats.heard += heardText.split(/\s+/).filter(Boolean).length;
}

export function next(){
  S.idx++;
  return S.idx >= S.queue.length;
}

export function sessionSummary(){
  const total = S.stats.perfect + S.stats.partial + S.stats.failed;
  const score = total ? (S.stats.perfect + S.stats.partial * 0.6) / total : 0;
  return {
    total, score, ...S.stats,
    results: S.results.slice()
  };
}