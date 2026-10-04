// js/core/tts.js
/** Text-To-Speech: la app habla. Compatible con todos los navegadores. */
let voices = [];
let preferredURI = '';

export function initTTS(){
  if(!('speechSynthesis' in window)) return [];
  loadVoices();
  speechSynthesis.onvoiceschanged = loadVoices;
  return voices;
}

function loadVoices(){
  voices = speechSynthesis.getVoices().filter(v => /^en/i.test(v.lang));
  if(!preferredURI && voices.length){
    const pref = voices.find(v => v.lang === 'en-US' && v.localService)
              || voices.find(v => v.lang === 'en-US')
              || voices[0];
    preferredURI = pref.voiceURI;
  }
}

export function getVoices(){ return voices; }
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
