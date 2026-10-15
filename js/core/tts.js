// js/core/tts.js
/**
 * Text-To-Speech: la app habla.
 * Compatible con todos los navegadores modernos, incluido iOS Safari.
 */

let voices = [];
let preferredURI = '';
let voicesReady = false;
const listeners = new Set();

export function initTTS(){
  if(!('speechSynthesis' in window)) return;
  loadVoices();
  speechSynthesis.onvoiceschanged = loadVoices;

  // Algunos navegadores (Safari iOS) recién cargan las voces
  // después del primer gesto del usuario.
  const kick = () => {
    loadVoices();
    if(voicesReady){
      window.removeEventListener('pointerdown', kick);
      window.removeEventListener('touchstart', kick);
      window.removeEventListener('keydown', kick);
    }
  };
  window.addEventListener('pointerdown', kick, { once:false });
  window.addEventListener('touchstart', kick, { once:false, passive:true });
  window.addEventListener('keydown', kick);

  // Reintento por si ningún evento se dispara
  let tries = 0;
  const timer = setInterval(() => {
    loadVoices();
    if(voicesReady || ++tries > 20) clearInterval(timer);
  }, 300);
}

function loadVoices(){
  if(!('speechSynthesis' in window)) return;
  const list = speechSynthesis.getVoices() || [];
  if(!list.length) return;

  const en = list.filter(v => /^en/i.test(v.lang));
  voices = en.length ? en : list; // si no hay en, mostramos todas

  // Elegir voz preferida la primera vez
  if(!preferredURI){
    const pref = voices.find(v => v.lang === 'en-US' && v.localService)
              || voices.find(v => v.lang === 'en-US')
              || voices.find(v => /^en-GB/i.test(v.lang))
              || voices[0];
    if(pref) preferredURI = pref.voiceURI;
  }

  if(!voicesReady){
    voicesReady = true;
    listeners.forEach(cb => { try{ cb(voices); }catch(e){} });
  }
}

export function onVoicesReady(cb){
  if(voicesReady) { try{ cb(voices); }catch(e){} return () => {}; }
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function getVoices(){ return voices; }
export function isVoicesReady(){ return voicesReady; }
export function getPreferredURI(){ return preferredURI; }
export function setPreferredURI(uri){ preferredURI = uri; }

function pick(){
  return voices.find(v => v.voiceURI === preferredURI) || voices[0] || null;
}

function utter(text, rate){
  return new Promise(resolve => {
    const u = new SpeechSynthesisUtterance(text);
    const v = pick();
    if(v){ u.voice = v; u.lang = v.lang; } else u.lang = 'en-US';
    u.rate = rate; u.pitch = 1;
    u.onend = resolve; u.onerror = resolve;
    speechSynthesis.speak(u);
  });
}

export async function speak(text, { rate = 0.9, reps = 2, onState } = {}){
  if(!('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  onState?.(true);
  for(let i=0;i<reps;i++){
    if(i>0) await new Promise(r => setTimeout(r, 550));
    await utter(text, rate);
  }
  onState?.(false);
}

export async function speakWords(text, rate=0.95){
  if(!('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const words = text.split(/\s+/).filter(Boolean);
  for(const w of words){
    await utter(w, Math.min(1.05, rate + 0.05));
    await new Promise(r => setTimeout(r, 180));
  }
}

export function stopTTS(){ if('speechSynthesis' in window) speechSynthesis.cancel(); }
