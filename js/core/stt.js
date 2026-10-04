// js/core/stt.js
/** Speech-To-Text: la app escucha. Solo Chrome/Edge (Android + desktop). */
export function isSTTSupported(){
  return typeof window !== 'undefined'
      && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
}

export function isIOS(){
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

export function recognize({ lang='en-US', timeout=9000, interim=false } = {}){
  return new Promise((resolve, reject) => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if(!SR) return reject(new Error('stt-not-supported'));

    const rec = new SR();
    rec.lang = lang;
    rec.interimResults = interim;
    rec.maxAlternatives = 3;
    rec.continuous = false;

    let finished = false;
    const timer = setTimeout(() => {
      if(finished) return;
      finished = true;
      try { rec.stop(); } catch(e){}
      resolve({ transcript:'', confidence:0, timeout:true, alternatives:[] });
    }, timeout);

    rec.onresult = e => {
      if(finished) return;
      finished = true;
      clearTimeout(timer);
      const result = e.results[0];
      const alts = [];
      for(let i=0;i<result.length;i++){
        alts.push({ transcript: result[i].transcript, confidence: result[i].confidence });
      }
      const best = alts[0];
      resolve({ transcript: best.transcript, confidence: best.confidence, alternatives: alts });
    };

    rec.onerror = e => {
      if(finished) return;
      finished = true;
      clearTimeout(timer);
      reject(new Error(e.error || 'stt-error'));
    };

    rec.onend = () => {
      if(finished) return;
      finished = true;
      clearTimeout(timer);
      resolve({ transcript:'', confidence:0, alternatives:[] });
    };

    try { rec.start(); } catch(err){ reject(err); }
  });
}
