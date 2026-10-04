/**
 * Genera PNG desde SVG en runtime y los expone como dataURL.
 * El manifest se inyecta con blobs para que la app sea instalable sin build.
 */

const SVG_OMG_BUBBLE = (bg1='#7c5cff', bg2='#22d3ee', fill='#7c5cff') => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${bg1}"/><stop offset="1" stop-color="${bg2}"/>
  </linearGradient></defs>
  <rect width="512" height="512" rx="112" fill="url(#g)"/>
  <path d="M96 130 Q96 86 140 86 H372 Q416 86 416 130 V306
           Q416 350 372 350 H236 L156 434 V350 H140
           Q96 350 96 306 Z" fill="#fff"/>
  <text x="256" y="248" text-anchor="middle"
        font-family="Arial Black, Impact, sans-serif"
        font-size="132" font-weight="900" fill="${fill}"
        letter-spacing="-6">OMG</text>
  <circle cx="440" cy="120" r="14" fill="#fff" opacity=".9"/>
  <circle cx="470" cy="90"  r="9"  fill="#fff" opacity=".6"/>
  <circle cx="480" cy="160" r="6"  fill="#fff" opacity=".4"/>
</svg>`;

function svgToPng(svg, size){
  return new Promise((resolve, reject) => {
    const img = new Image();
    const blob = new Blob([svg], { type:'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = c.height = size;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0, size, size);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL('image/png'));
    };
    img.onerror = e => { URL.revokeObjectURL(url); reject(e); };
    img.src = url;
  });
}

export async function generateIcons(){
  const svg = SVG_OMG_BUBBLE();
  const [png192, png512, png180] = await Promise.all([
    svgToPng(svg, 192),
    svgToPng(svg, 512),
    svgToPng(svg, 180)
  ]);
  return { png192, png512, png180 };
}

export async function setFavicons(){
  try{
    const { png180 } = await generateIcons();
    // Apple touch
    let link = document.querySelector('link[rel="apple-touch-icon"]');
    if(!link){ link = document.createElement('link'); link.rel = 'apple-touch-icon'; document.head.appendChild(link); }
    link.href = png180;
    // favicon
    let fav = document.querySelector('link[rel="icon"]');
    if(!fav){ fav = document.createElement('link'); fav.rel = 'icon'; document.head.appendChild(fav); }
    fav.href = png180;
    // logo del header
    const logo = document.getElementById('brandLogo');
    if(logo) logo.style.backgroundImage = `url(${png180})`;
  }catch(e){ /* canvas bloqueado: seguimos */ }
}

/** Inyecta un manifest con blobs PNG (para instalación PWA sin build). */
export async function injectManifest(){
  try{
    const { png192, png512 } = await generateIcons();
    const manifest = {
      name: 'OhMyGoch Teacher',
      short_name: 'OMG-Teacher',
      description: 'Dictado y pronunciación en inglés con repetición espaciada. by OhMyGoch.',
      start_url: '.', scope: '.',
      display: 'standalone', orientation: 'portrait',
      background_color: '#0b0e13', theme_color: '#0b0e13',
      lang: 'es',
      icons: [
        { src: png192, sizes:'192x192', type:'image/png', purpose:'any' },
        { src: png512, sizes:'512x512', type:'image/png', purpose:'any' },
        { src: png512, sizes:'512x512', type:'image/png', purpose:'maskable' }
      ]
    };
    const blob = new Blob([JSON.stringify(manifest)], { type:'application/manifest+json' });
    const link = document.createElement('link');
    link.rel = 'manifest';
    link.href = URL.createObjectURL(blob);
    document.head.appendChild(link);
  }catch(e){}
}