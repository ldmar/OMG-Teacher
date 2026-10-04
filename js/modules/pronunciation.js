import { recognize, isSTTSupported } from '../core/stt.js';
import { diffWords } from '../core/diff.js';
import { speak } from '../core/tts.js';

/** Puntúa la pronunciación a partir del texto reconocido. */
export function scorePronunciation(expected, heard){
  const d = diffWords(expected, heard);
  const wordScore = d.score;
  // Señales extra: si el reconocedor devolvió confidence bajo, castigamos
  return {
    score: wordScore,
    wordScore,
    missing: d.missingWords,
    extra: d.extraWords,
    parts: d.parts
  };
}

export async function listenOnce({ lang='en-US', timeout=9000 } = {}){
  return recognize({ lang, timeout });
}

export async function playAndScore(expected, { rate=0.9 } = {}){
  await speak(expected, { rate, reps: 1 });
}

export { isSTTSupported };