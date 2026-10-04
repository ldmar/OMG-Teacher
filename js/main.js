// js/main.js
import { initDB, getCurrentUser } from './core/db.js';
import { generateIcons, setFavicons } from './core/icons.js';
import { registerSW } from './core/sw.js';
import { renderApp, setUser } from './views.js';        
import { toast } from './core/utils.js';                 

(async function bootstrap(){
  try{
    setFavicons();
    await initDB();

    // Usuario actual (persistido)
    let user = await getCurrentUser();
    if(!user){
      // primer arranque: pedimos nombre
      renderApp('welcome');
    } else {
      setUser(user);
      renderApp('home');
    }
    registerSW();
  }catch(err){
    console.error(err);
    document.getElementById('app').innerHTML =
      `<div class="card"><b>Error de arranque</b><p>${String(err.message||err)}</p></div>`;
  }
})();

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  window.__omgInstall = e;
  document.dispatchEvent(new CustomEvent('omg:installable'));
});

window.addEventListener('online',  () => toast('Conexión restaurada'));
window.addEventListener('offline', () => toast('Modo offline — todo sigue funcionando'));
