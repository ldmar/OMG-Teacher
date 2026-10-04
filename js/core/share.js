export function shareApp({ url = location.href, title = 'OhMyGoch Teacher', text = '' } = {}){
  const fullText = text || 'Aprendé inglés con dictado y pronunciación. by OhMyGoch.';
  if(navigator.share){
    return navigator.share({ title, text: fullText, url }).catch(()=>{});
  }
  // Fallback: WhatsApp
  open('https://wa.me/?text=' + encodeURIComponent(fullText + ' ' + url));
}

export function shareViaWhatsApp({ url = location.href, text = 'Aprendé inglés con OMG-Teacher by OhMyGoch' } = {}){
  open('https://wa.me/?text=' + encodeURIComponent(text + ' ' + url), '_blank');
}
export function shareViaTelegram({ url = location.href, text = 'Aprendé inglés con OMG-Teacher by OhMyGoch' } = {}){
  open('https://t.me/share/url?url=' + encodeURIComponent(url) + '&text=' + encodeURIComponent(text), '_blank');
}
export function shareViaEmail({ url = location.href, subject = 'OMG-Teacher', body = 'Mirá esta app para practicar inglés:' } = {}){
  location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body + ' ' + url)}`;
}
export function copyLink(text = location.href){
  if(navigator.clipboard) return navigator.clipboard.writeText(text);
  const ta = document.createElement('textarea');
  ta.value = text; document.body.appendChild(ta); ta.select();
  document.execCommand('copy'); ta.remove();
  return Promise.resolve();
}

export function shareResult({ score, total, category }){
  const text = `Saqué ${score}/${total} en OMG-Teacher (${category}) 🎧 by OhMyGoch`;
  if(navigator.share){
    return navigator.share({ title:'OMG-Teacher', text, url: location.href }).catch(()=>{});
  }
  shareViaWhatsApp({ text });
}