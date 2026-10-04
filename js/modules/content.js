import { DEFAULT_PHRASES, CATS } from '../data/phrases.js';
import { listCustomPhrases } from '../core/db.js';

export function getCategories(){ return CATS; }

export async function getAllPhrases(userId){
  const custom = await listCustomPhrases(userId);
  const customTagged = custom.map(p => ({ ...p, tag: 'mias' }));
  return [...DEFAULT_PHRASES, ...customTagged];
}

export function filterByCategory(phrases, cat){
  if(!cat || cat === 'all') return phrases;
  if(cat === 'mias') return phrases.filter(p => p.tag === 'mias');
  return phrases.filter(p => p.tag === cat);
}

export function findPhrase(phrases, id){
  return phrases.find(p => p.id === id) || null;
}