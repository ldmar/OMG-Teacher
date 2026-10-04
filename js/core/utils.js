export const $  = (s, r=document) => r.querySelector(s);
export const $$ = (s, r=document) => [...r.querySelectorAll(s)];
export const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const norm = w => w.toLowerCase().replace(/[’']/g,"'").replace(/[^a-z0-9']/g,'').replace(/^'+|'+$/g,'');
export const shuffle = a => { a=[...a]; for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]];} return a; };
export const uid = () => Math.random().toString(36).slice(2,10) + Date.now().toString(36).slice(-4);
export const fmtDate = ts => new Date(ts).toLocaleDateString('es', { day:'2-digit', month:'short' });
export const fmtTime = ts => new Date(ts).toLocaleTimeString('es', { hour:'2-digit', minute:'2-digit' });
export const clamp = (v,a,b) => Math.max(a, Math.min(b, v));

let toastTimer;
export function toast(msg){
  const t = document.getElementById('toast');
  if(!t) return;
  t.textContent = msg;
  t.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('on'), 2600);
}

export function avatarColor(name){
  let h = 0;
  for(const c of (name||'x')) h = (h*31 + c.charCodeAt(0)) % 360;
  return `hsl(${h}, 70%, 55%)`;
}