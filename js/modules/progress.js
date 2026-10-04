import { listTests, saveTest } from '../core/db.js';
import { getAllPhrases } from './content.js';
import { getProgressMap, BOX_DAYS } from './srs.js';

/** Guarda un test completo y devuelve el registro. */
export async function saveSessionTest(userId, summary, category, mode){
  const total = summary.total || 1;
  const score10 = Math.round(((summary.perfect + summary.partial * 0.6) / total) * 10 * 10) / 10;

  // detectar temas débiles
  const byTag = {};
  summary.results.forEach(r => {
    const tag = r.tag || 'otros';
    byTag[tag] = byTag[tag] || { seen:0, ok:0, fails:0 };
    byTag[tag].seen++;
    if(r.score >= 0.999) byTag[tag].ok++;
    else byTag[tag].fails++;
  });
  const weakTags = Object.entries(byTag)
    .map(([tag, s]) => ({ tag, ...s, rate: s.ok / s.seen }))
    .filter(t => t.rate < 0.7)
    .sort((a,b) => a.rate - b.rate);

  const weakPhrases = summary.results
    .filter(r => r.score < 0.6)
    .map(r => ({ id: r.phraseId, expected: r.expected, score: r.score }));

  const rec = {
    userId,
    date: Date.now(),
    category, mode,
    total,
    perfect: summary.perfect,
    partial: summary.partial,
    failed: summary.failed,
    score10,
    weakTags,
    weakPhrases,
    results: summary.results
  };
  const id = await saveTest(rec);
  return { id, ...rec };
}

export async function getGlobalStats(userId){
  const all = await getAllPhrases(userId);
  const progress = await getProgressMap(userId);
  const now = Date.now();
  let due = 0, mastered = 0, seen = 0, ok = 0, totalSeen = 0;
  all.forEach(p => {
    const r = progress[p.id];
    if(!r){ due++; return; }
    totalSeen++;
    if(r.due <= now) due++;
    if(r.box >= 4) mastered++;
    seen += r.seen || 0;
    ok += r.ok || 0;
  });
  const acc = seen ? ok / seen : 0;
  const tests = await listTests(userId, 200);
  const lastTest = tests[0] || null;
  return { due, mastered, total: all.length, totalSeen, acc, tests, lastTest };
}

export async function getWeakTopics(userId){
  const all = await getAllPhrases(userId);
  const progress = await getProgressMap(userId);
  const byTag = {};
  all.forEach(p => {
    const r = progress[p.id];
    if(!r) return;
    const t = p.tag || 'otros';
    byTag[t] = byTag[t] || { seen:0, ok:0, fails:0 };
    byTag[t].seen++;
    if(r.box >= 2) byTag[t].ok++;
    else byTag[t].fails++;
  });
  return Object.entries(byTag)
    .map(([tag, s]) => ({ tag, ...s, rate: s.seen ? s.ok / s.seen : 0 }))
    .filter(t => t.seen >= 2 && t.rate < 0.75)
    .sort((a,b) => a.rate - b.rate);
}

export function motivationMessage(acc, mastered, due){
  if(mastered >= 30) return '🏆 Nivel avanzado. Estás dominando el vocabulario.';
  if(acc >= 0.9)     return '🔥 Precisión altísima. Subí la velocidad o cambiá de tema.';
  if(due === 0)      return '✨ Todo al día. Podés adelantar frases nuevas.';
  if(acc >= 0.7)     return '💪 Buen ritmo. Enfocate en las que fallás.';
  if(acc >= 0.5)     return '🎯 Vas bien. Reforzá con la pista y repetí.';
  return '🌱 Todo empieza con una frase. Dale que se puede.';
}