import { $, $$, esc, toast, avatarColor, fmtDate } from './core/utils.js';
import { loginWithName, switchTo, listUsers } from './modules/auth.js';
import { getAllPhrases, filterByCategory, getCategories } from './modules/content.js';
import * as Session from './modules/session.js';
import * as Progress from './modules/progress.js';
import { saveSessionTest } from './modules/progress.js';
import { getGlobalStats, getWeakTopics, motivationMessage } from './modules/progress.js';
import { speak, speakWords, stopTTS, getVoices, getPreferredURI, setPreferredURI } from './core/tts.js';
import { isSTTSupported, recognize } from './core/stt.js';
import { scorePronunciation } from './modules/pronunciation.js';
import { shareApp, shareViaWhatsApp, shareViaTelegram, shareViaEmail, copyLink, shareResult } from './core/share.js';
import { diffWords } from './core/diff.js';
import { BOX_DAYS } from './modules/srs.js';
import { listCustomPhrases, replaceCustomPhrases, saveTest, listTests, getUser } from './core/db.js';

export let CURRENT_USER = null;
export function setUser(u){ CURRENT_USER = u; }

let state = {
  category: 'all',
  length: 10,
  mode: 'dictation',
  answer: '',
  lastResult: null,
  pronSupported: isSTTSupported(),
};

/* ============== Router ============== */
export function renderApp(view, params = {}){
  const root = $('#app');
  window.scrollTo({ top:0 });
  switch(view){
    case 'welcome':     return renderWelcome(root);
    case 'home':        return renderHome(root);
    case 'study':       return renderStudy(root, params);
    case 'result':      return renderResult(root, params);
    case 'pron':        return renderPron(root, params);
    case 'pronResult':  return renderPronResult(root, params);
    case 'report':      return renderReport(root);
    case 'tests':       return renderTests(root);
    case 'settings':    return renderSettings(root);
    case 'users':       return renderUsers(root);
    case 'data':        return renderData(root);
  }
}

/* ============== Welcome ============== */
function renderWelcome(root){
  root.innerHTML = `
    <section class="view on">
      <div class="card hero">
        <div class="big">🎧</div>
        <h2>Bienvenido a OMG-Teacher</h2>
        <p>Dictado + pronunciación en inglés.<br><b>by OhMyGoch</b></p>
        <input id="nameInput" type="text" placeholder="¿Cómo te llamás?" autocomplete="name" autofocus>
        <button class="primary" id="btnEnter" style="margin-top:14px">Entrar</button>
      </div>
      <p class="note">Tu progreso queda guardado en este dispositivo.<br>Nada se sube a internet.</p>
      <p class="foot">OMG-Teacher · construido por OhMyGoch</p>
    </section>`;
  const input = $('#nameInput');
  const enter = async () => {
    const name = input.value.trim();
    if(!name){ toast('Escribí tu nombre'); return; }
    try{
      const u = await loginWithName(name);
      setUser(u);
      toast(`¡Hola, ${u.name}!`);
      renderApp('home');
    }catch(e){ toast('Error: ' + e.message); }
  };
  $('#btnEnter').onclick = enter;
  input.addEventListener('keydown', e => { if(e.key === 'Enter') enter(); });
}

/* ============== Home ============== */
async function renderHome(root){
  const userId = CURRENT_USER.id;
  const stats = await getGlobalStats(userId);
  const cats = getCategories();
  const h = new Date().getHours();
  const greet = h < 12 ? 'Buen día' : h < 20 ? 'Buenas tardes' : 'Buenas noches';
  const msg = motivationMessage(stats.acc, stats.mastered, stats.due);

  root.innerHTML = `
    <section class="view on">
      <div class="card hero">
        <div class="big">🎧</div>
        <h2>${esc(greet)}, ${esc(CURRENT_USER.name)}</h2>
        <p>${esc(msg)}</p>
        <button class="primary" id="btnStart">Empezar dictado</button>
        <div class="row" style="margin-top:10px">
          <button class="ghost" id="btnPron" style="flex:1">🎤 Pronunciación</button>
          <button class="ghost" id="btnReport" style="flex:1">📊 Mi progreso</button>
        </div>
      </div>

      <div class="stats">
        <div class="stat due"><b>${stats.due}</b><small>Para hoy</small></div>
        <div class="stat done"><b>${stats.mastered}</b><small>Dominadas</small></div>
        <div class="stat"><b>${stats.total}</b><small>Frases</small></div>
      </div>

      <div class="card">
        <label class="field"><span>Categoría</span>
          <div class="chips" id="catChips">
            ${cats.map(c => `<button class="chip${state.category===c.id?' on':''}" data-cat="${c.id}">${esc(c.label)}</button>`).join('')}
          </div>
        </label>
        <label class="field" style="margin-bottom:0"><span>Longitud</span>
          <div class="chips" id="lenChips">
            ${[5,10,20].map(n => `<button class="chip${state.length===n?' on':''}" data-n="${n}">${n} frases</button>`).join('')}
          </div>
        </label>
      </div>

      ${stats.lastTest ? `
      <div class="card">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
          <span class="badge neutral">Último test</span>
          <span style="color:var(--dim);font-size:.82rem">${fmtDate(stats.lastTest.date)}</span>
          <span style="margin-left:auto;font-weight:800">${stats.lastTest.score10}/10</span>
        </div>
        <div style="font-size:.85rem;color:var(--dim)">${esc(stats.lastTest.category)} · ${stats.lastTest.perfect} perfectas · ${stats.lastTest.failed} a repetir</div>
      </div>` : ''}

      <div class="row">
        <button class="ghost" id="btnData" style="flex:1">📚 Mis frases</button>
        <button class="ghost" id="btnTests" style="flex:1">📈 Tests</button>
        <button class="ghost" id="btnUsers" style="flex:1">👤 Usuarios</button>
      </div>

      <p class="foot">OMG-Teacher · by OhMyGoch</p>
    </section>`;

  $('#btnStart').onclick = () => startDictation();
  $('#btnPron').onclick  = () => startPron();
  $('#btnReport').onclick= () => renderApp('report');
  $('#btnTests').onclick = () => renderApp('tests');
  $('#btnUsers').onclick = () => renderApp('users');
  $('#btnData').onclick  = () => renderApp('data');

  $('#catChips').addEventListener('click', e => {
    const b = e.target.closest('[data-cat]'); if(!b) return;
    state.category = b.dataset.cat;
    $$('#catChips .chip').forEach(x => x.classList.toggle('on', x === b));
  });
  $('#lenChips').addEventListener('click', e => {
    const b = e.target.closest('[data-n]'); if(!b) return;
    state.length = +b.dataset.n;
    $$('#lenChips .chip').forEach(x => x.classList.toggle('on', x === b));
  });
}

/* ============== Dictado ============== */
async function startDictation(){
  const n = await Session.startSession({
    userId: CURRENT_USER.id,
    category: state.category,
    length: state.length,
    mode: 'dictation'
  });
  if(!n){ toast('No hay frases en esta categoría'); return; }
  renderApp('study');
}

async function renderStudy(root){
  const p = await Session.loadCurrent();
  if(!p){ return finishDictation(); }

  const total = Session.S.queue.length;
  const idx = Session.S.idx + 1;

  root.innerHTML = `
    <section class="view on">
      <div class="bar">
        <button class="iconbtn" id="btnQuit">✕</button>
        <div class="pbar"><i style="width:${(Session.S.idx/total)*100}%"></i></div>
        <span>${idx}/${total}</span>
      </div>
      <div class="card">
        <button class="playBtn" id="btnPlay">🔊</button>
        <div class="playrow">
          <button class="mini" id="btnSlow">🐢 Lento</button>
          <button class="mini" id="btnWords">🔤 Palabra x palabra</button>
        </div>
        <textarea id="answer" rows="2" placeholder="Escribí lo que escuchás…" autocapitalize="sentences"></textarea>
        <div id="hintBox" class="hint hidden"></div>
        <div class="row" style="margin-top:12px">
          <button class="ghost" id="btnHint">💡</button>
          <button class="primary" id="btnCheck">Comprobar</button>
        </div>
      </div>
    </section>`;

  const ans = $('#answer');
  ans.focus();
  setTimeout(() => { speak(p.en, { rate: 0.9, reps: 2, onState: s => $('#btnPlay').classList.toggle('playing', s) }); }, 200);

  $('#btnPlay').onclick  = () => speak(p.en, { onState: s => $('#btnPlay').classList.toggle('playing', s) });
  $('#btnSlow').onclick  = () => speak(p.en, { rate: 0.6, reps: 1 });
  $('#btnWords').onclick = () => speakWords(p.en, 0.9);
  $('#btnHint').onclick  = () => showHint(p);
  $('#btnCheck').onclick = () => doCheck(p);
  $('#btnQuit').onclick  = () => { stopTTS(); renderApp('home'); };

  ans.addEventListener('keydown', e => {
    if(e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); doCheck(p); }
  });
}

function showHint(p){
  if(Session.S.answered || Session.S.hinted) return;
  Session.S.hinted = true;
  const words = p.en.split(/\s+/).filter(Boolean);
  const masked = words.map(w => {
    const c = w.replace(/[^A-Za-z']/g,'');
    if(!c) return w;
    return w[0] + '·'.repeat(Math.max(1, c.length - 1));
  }).join('  ');
  $('#hintBox').innerHTML = `${esc(masked)}<small>${words.length} palabra${words.length===1?'':'s'}</small>`;
  $('#hintBox').classList.remove('hidden');
}

async function doCheck(p){
  if(Session.S.answered) return;
  const val = $('#answer').value.trim();
  if(!val){ toast('Escribí algo primero'); return; }
  const r = Session.grade(val);
  Session.S.answered = true;
  await Session.commitResult({ score: r.score, heardText: val });
  state.lastResult = { p, r, mode: 'dictation' };
  renderApp('result');
}

async function finishDictation(){
  const summary = Session.sessionSummary();
  const saved = await saveSessionTest(CURRENT_USER.id, summary, state.category, 'dictation');
  state.lastSummary = saved;
  renderApp('result', { final: true });
}

function renderResult(root, { final = false } = {}){
  if(final){
    const s = state.lastSummary;
    root.innerHTML = `
      <section class="view on">
        <div class="card hero">
          <div class="big">${s.score10 >= 8 ? '🏆' : s.score10 >= 6 ? '💪' : '📚'}</div>
          <h2>Test terminado</h2>
          <p>${s.total} frases · ${esc(s.category)}</p>
          <div class="meter">
            <div>
              <div class="val">${s.score10}</div>
              <div class="lbl">Nota /10</div>
            </div>
            <div class="bar2"><i style="width:${s.score10*10}%"></i></div>
          </div>
          <div class="stats" style="margin-top:6px">
            <div class="stat"><b style="color:var(--ok)">${s.perfect}</b><small>Perfectas</small></div>
            <div class="stat"><b style="color:var(--warn)">${s.partial}</b><small>Casi</small></div>
            <div class="stat"><b style="color:var(--bad)">${s.failed}</b><small>A repetir</small></div>
          </div>
          <div class="row" style="margin-top:6px">
            <button class="ghost" id="btnShareResult" style="flex:1">↗ Compartir</button>
            <button class="primary" id="btnBack" style="flex:1">Volver</button>
          </div>
        </div>
        ${s.weakTags.length ? `
        <div class="card">
          <b>📌 Temas a repasar</b>
          ${s.weakTags.map(t => `
            <div class="weak">
              <span class="badge bad">${Math.round(t.rate*100)}%</span>
              <span class="name">${esc(labelForTag(t.tag))}</span>
              <span class="pct">${t.ok}/${t.seen}</span>
            </div>`).join('')}
          <button class="ghost warn" id="btnStudyWeak" style="width:100%;margin-top:10px">Practicar estos temas</button>
        </div>` : `<div class="card"><b>🎯 ¡Sin temas débiles!</b><p style="color:var(--dim);font-size:.88rem;margin:6px 0 0">Buen trabajo. Probá subir la velocidad o cambiar de categoría.</p></div>`}
        ${s.weakPhrases.length ? `
        <div class="card">
          <b>Frases a repasar</b>
          ${s.weakPhrases.slice(0,6).map(w => `<div class="weak"><span style="flex:1">${esc(w.expected)}</span><span class="badge bad">${Math.round(w.score*100)}%</span></div>`).join('')}
        </div>` : ''}
        <p class="foot">OMG-Teacher · by OhMyGoch</p>
      </section>`;

    $('#btnBack').onclick = () => renderApp('home');
    $('#btnShareResult').onclick = () => shareResult({ score: s.score10, total: 10, category: s.category });
    const sw = $('#btnStudyWeak');
    if(sw) sw.onclick = () => {
      state.category = s.weakTags[0].tag;
      startDictation();
    };
    return;
  }

  // Resultado de una frase
  const { p, r } = state.lastResult;
  let emoji, title, sub;
  if(r.score >= 0.999){ emoji='🎯'; title='¡Perfecto!'; sub = Session.S.hinted ? 'Con pista' : '¡Al palo!'; }
  else if(r.score >= 0.6){ emoji='🤏'; title='Casi…'; sub = `${Math.round(r.score*100)}% de precisión`; }
  else { emoji='🔁'; title='A repetir'; sub = `${Math.round(r.score*100)}% de precisión`; }

  let diffHtml = '';
  r.parts.forEach(part => {
    if(part.t === 'ok')   diffHtml += `<span class="w ok">${esc(part.w)}</span> `;
    if(part.t === 'miss') diffHtml += `<span class="w miss">${esc(part.w)}</span> `;
  });
  const extras = r.parts.filter(x => x.t === 'extra').map(x => x.w);

  root.innerHTML = `
    <section class="view on">
      <div class="card">
        <div class="verdict">
          <div class="em">${emoji}</div>
          <h3>${title}</h3>
          <p>${sub}</p>
        </div>
        <div class="diff">${diffHtml.trim()}</div>
        ${extras.length ? `<div class="extras">De más: ${extras.map(w => `<s>${esc(w)}</s>`).join(' ')}</div>` : ''}
        <div class="trans"><b>ES</b> · ${esc(p.es)}</div>
        <div class="row">
          <button class="ghost" id="btnReplay">🔊</button>
          <button class="primary" id="btnNext">Siguiente →</button>
        </div>
      </div>
    </section>`;

  $('#btnReplay').onclick = () => speak(p.en, { reps: 1 });
  $('#btnNext').onclick   = () => {
    if(Session.next()) return finishDictation();
    renderApp('study');
  };
  setTimeout(() => speak(p.en, { reps: 1 }), 300);
}

/* ============== Pronunciación ============== */
async function startPron(){
  if(!state.pronSupported){
    toast('Tu navegador no soporta reconocimiento de voz. Probá Chrome/Edge en Android o escritorio.');
    return;
  }
  const n = await Session.startSession({
    userId: CURRENT_USER.id,
    category: state.category,
    length: state.length,
    mode: 'pronunciation'
  });
  if(!n){ toast('No hay frases'); return; }
  renderApp('pron');
}

async function renderPron(root){
  const p = await Session.loadCurrent();
  if(!p) return finishPron();

  const total = Session.S.queue.length;
  const idx = Session.S.idx + 1;

  root.innerHTML = `
    <section class="view on">
      <div class="bar">
        <button class="iconbtn" id="btnQuit">✕</button>
        <div class="pbar"><i style="width:${(Session.S.idx/total)*100}%"></i></div>
        <span>${idx}/${total}</span>
      </div>
      <div class="card">
        <div style="text-align:center;color:var(--dim);font-size:.8rem;text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px">Escuchá y repetí</div>
        <div style="text-align:center;font-size:1.15rem;line-height:1.5;margin-bottom:16px">${esc(p.en)}</div>
        <button class="playBtn" id="btnPlay">🔊</button>
        <div class="playrow">
          <button class="mini" id="btnSlow">🐢 Lento</button>
          <button class="mini" id="btnWords">🔤 Palabra x palabra</button>
        </div>
        <button class="playBtn rec" id="btnRec">🎤</button>
        <div id="recStatus" style="text-align:center;color:var(--dim);font-size:.85rem;min-height:22px">Tocá el micrófono y leé la frase</div>
        <div id="heardBox" style="margin-top:12px"></div>
      </div>
    </section>`;

  $('#btnPlay').onclick  = () => speak(p.en, { onState: s => $('#btnPlay').classList.toggle('playing', s) });
  $('#btnSlow').onclick  = () => speak(p.en, { rate: 0.6, reps: 1 });
  $('#btnWords').onclick = () => speakWords(p.en, 0.9);
  $('#btnQuit').onclick  = () => { stopTTS(); renderApp('home'); };
  $('#btnRec').onclick   = () => doPronRec(p);

  setTimeout(() => speak(p.en, { reps: 1 }), 250);
}

async function doPronRec(p){
  const btn = $('#btnRec');
  const status = $('#recStatus');
  if(btn.classList.contains('playing')) return;
  btn.classList.add('playing');
  status.textContent = '🎙️ Escuchando…';
  try{
    const res = await recognize({ lang:'en-US', timeout: 9000 });
    btn.classList.remove('playing');
    if(!res.transcript){
      status.textContent = 'No te escuché. Probá de nuevo.';
      return;
    }
    const score = scorePronunciation(p.en, res.transcript);
    state.lastPron = { p, res, score };
    await Session.commitResult({ score: score.score, heardText: res.transcript });
    renderApp('pronResult');
  }catch(e){
    btn.classList.remove('playing');
    status.textContent = 'Error: ' + (e.message || 'no se pudo grabar');
  }
}

function renderPronResult(root){
  const { p, res, score } = state.lastPron;
  let diffHtml = '';
  score.parts.forEach(part => {
    if(part.t === 'ok')   diffHtml += `<span class="w ok">${esc(part.w)}</span> `;
    if(part.t === 'miss') diffHtml += `<span class="w miss">${esc(part.w)}</span> `;
  });
  const pct = Math.round(score.score * 100);
  const emoji = pct >= 90 ? '🌟' : pct >= 70 ? '👍' : pct >= 50 ? '💪' : '🔁';
  const title = pct >= 90 ? '¡Pronunciación excelente!' : pct >= 70 ? 'Muy bien' : pct >= 50 ? 'Vas bien' : 'A practicar';

  root.innerHTML = `
    <section class="view on">
      <div class="card">
        <div class="verdict">
          <div class="em">${emoji}</div>
          <h3>${title}</h3>
          <p>${pct}% de coincidencia</p>
        </div>
        <div class="diff">${diffHtml.trim()}</div>
        <div class="trans"><b>Escuché:</b> ${esc(res.transcript)}</div>
        ${score.missing.length ? `<div class="extras" style="color:var(--bad)">No te escuché: ${score.missing.map(w => `<b>${esc(w)}</b>`).join(', ')}</div>` : ''}
        <div class="trans"><b>ES</b> · ${esc(p.es)}</div>
        <div class="row">
          <button class="ghost" id="btnReplay">🔊</button>
          <button class="primary" id="btnNext">Siguiente →</button>
        </div>
      </div>
    </section>`;

  $('#btnReplay').onclick = () => speak(p.en, { reps: 1 });
  $('#btnNext').onclick   = () => {
    if(Session.next()) return finishPron();
    renderApp('pron');
  };
  setTimeout(() => speak(p.en, { reps: 1 }), 300);
}

async function finishPron(){
  const summary = Session.sessionSummary();
  const saved = await saveSessionTest(CURRENT_USER.id, summary, state.category, 'pronunciation');
  state.lastSummary = saved;
  renderApp('result', { final: true });
}

/* ============== Reporte / progreso ============== */
async function renderReport(root){
  const userId = CURRENT_USER.id;
  const stats = await getGlobalStats(userId);
  const weak = await getWeakTopics(userId);
  const tests = await listTests(userId, 20);
  const lastN = tests.slice(0, 10).reverse();

  root.innerHTML = `
    <section class="view on">
      <div class="bar">
        <button class="iconbtn" id="btnBack">←</button>
        <span style="font-weight:700">Mi progreso</span>
      </div>

      <div class="card">
        <div class="meter">
          <div>
            <div class="val">${Math.round(stats.acc*100)}%</div>
            <div class="lbl">Precisión</div>
          </div>
          <div class="bar2"><i style="width:${stats.acc*100}%"></i></div>
        </div>
        <div class="stats">
          <div class="stat due"><b>${stats.due}</b><small>Pendientes</small></div>
          <div class="stat done"><b>${stats.mastered}</b><small>Dominadas</small></div>
          <div class="stat"><b>${stats.totalSeen}</b><small>Practicadas</small></div>
        </div>
      </div>

      ${lastN.length ? `
      <div class="card">
        <b>Notas de los últimos tests</b>
        <div class="hist">
          ${lastN.map(t => `
            <div class="item">
              <b style="color:${t.score10>=8?'var(--ok)':t.score10>=5?'var(--warn)':'var(--bad)'}">${t.score10}</b>
              <small>${fmtDate(t.date)}</small>
            </div>`).join('')}
        </div>
      </div>` : ''}

      <div class="card">
        <b>📌 Temas a repasar</b>
        ${weak.length ? weak.map(w => `
          <div class="weak">
            <span class="badge bad">${Math.round(w.rate*100)}%</span>
            <span class="name">${esc(labelForTag(w.tag))}</span>
            <span class="pct">${w.ok}/${w.seen}</span>
          </div>`).join('') : '<p style="color:var(--dim);font-size:.88rem">Sin temas débiles. ¡Seguí así!</p>'}
      </div>

      <div class="card">
        <b>💬 Compartir</b>
        <div class="row" style="margin-top:10px">
          <button class="ghost" id="btnWA" style="flex:1">WhatsApp</button>
          <button class="ghost" id="btnTG" style="flex:1">Telegram</button>
          <button class="ghost" id="btnMail" style="flex:1">Email</button>
        </div>
      </div>

      <p class="foot">OMG-Teacher · by OhMyGoch</p>
    </section>`;

  $('#btnBack').onclick = () => renderApp('home');
  $('#btnWA').onclick   = () => shareViaWhatsApp();
  $('#btnTG').onclick   = () => shareViaTelegram();
  $('#btnMail').onclick = () => shareViaEmail();
}

function labelForTag(tag){
  const c = getCategories().find(c => c.id === tag);
  return c ? c.label : tag;
}

/* ============== Lista de tests ============== */
async function renderTests(root){
  const tests = await listTests(CURRENT_USER.id, 50);
  root.innerHTML = `
    <section class="view on">
      <div class="bar">
        <button class="iconbtn" id="btnBack">←</button>
        <span style="font-weight:700">Historial de tests</span>
      </div>
      ${tests.length ? tests.map(t => `
        <div class="card" style="padding:14px">
          <div style="display:flex;align-items:center;gap:10px">
            <span class="badge ${t.score10>=8?'ok':t.score10>=5?'warn':'bad'}">${t.score10}/10</span>
            <span style="font-weight:700;font-size:.9rem;flex:1">${esc(labelForTag(t.category))}</span>
            <span style="color:var(--dim);font-size:.8rem">${fmtDate(t.date)}</span>
          </div>
          <div style="margin-top:6px;font-size:.82rem;color:var(--dim)">
            ${t.mode === 'pronunciation' ? '🎤 Pronunciación' : '🎧 Dictado'} ·
            ${t.perfect} ✓ · ${t.partial} ~ · ${t.failed} ✗
          </div>
        </div>`).join('') : '<div class="card"><p style="color:var(--dim)">Todavía no hay tests guardados.</p></div>'}
      <p class="foot">OMG-Teacher · by OhMyGoch</p>
    </section>`;
  $('#btnBack').onclick = () => renderApp('home');
}

/* ============== Ajustes ============== */
async function renderSettings(root){
  const voices = getVoices();
  root.innerHTML = `
    <section class="view on">
      <div class="bar">
        <button class="iconbtn" id="btnBack">←</button>
        <span style="font-weight:700">Ajustes</span>
      </div>

      <div class="card">
        <label class="field"><span>Voz en inglés</span>
          <select id="selVoice">
            ${voices.length ? voices.map(v => `<option value="${v.voiceURI}"${v.voiceURI===getPreferredURI()?' selected':''}>${esc(v.name)} (${v.lang})</option>`).join('') : '<option>— sin voces —</option>'}
          </select>
        </label>
        <label class="field" style="margin-bottom:0"><span>Velocidad</span>
          <input type="range" id="rngRate" min="0.5" max="1.3" step="0.05" value="${state.rate||0.9}">
          <div style="text-align:center;color:var(--dim);font-size:.8rem"><b id="rateVal">${(state.rate||0.9).toFixed(2)}</b>x</div>
        </label>
      </div>

      <div class="card">
        <b>Cuenta</b>
        <div class="user-pill" style="margin-top:10px">
          <span class="av" style="background:${avatarColor(CURRENT_USER.name)}"></span>
          ${esc(CURRENT_USER.name)}
        </div>
        <div class="row" style="margin-top:12px">
          <button class="ghost" id="btnSwitch" style="flex:1">Cambiar usuario</button>
          <button class="ghost bad" id="btnReset" style="flex:1">Borrar progreso</button>
        </div>
      </div>

      <div class="card">
        <b>Sobre la app</b>
        <p style="color:var(--dim);font-size:.85rem;line-height:1.6;margin:8px 0 0">
          <b>OMG-Teacher</b> · construido por <b>OhMyGoch</b><br>
          Dictado y pronunciación en inglés con repetición espaciada.<br>
          Todo se guarda localmente en tu dispositivo (IndexedDB).
        </p>
        <button class="ghost" id="btnShareApp" style="width:100%;margin-top:12px">↗ Compartir la app</button>
      </div>

      <p class="foot">OMG-Teacher · by OhMyGoch</p>
    </section>`;

  $('#btnBack').onclick = () => renderApp('home');
  $('#selVoice').onchange = e => { setPreferredURI(e.target.value); state.voice = e.target.value; speak('This is my voice.', { reps:1 }); };
  $('#rngRate').oninput = e => { state.rate = +e.target.value; $('#rateVal').textContent = state.rate.toFixed(2); };
  $('#rngRate').onchange = () => speak('How fast can you go?', { reps:1 });
  $('#btnSwitch').onclick = () => { renderApp('users'); };
  $('#btnReset').onclick = async () => {
    if(!confirm('¿Borrar todo tu progreso? No se puede deshacer.')) return;
    const { clearCurrentUser } = await import('./core/db.js');
    // simple: eliminamos usuario actual y volvemos a welcome
    const { getUser } = await import('./core/db.js');
    // En una app real borraríamos progress/tests del usuario.
    // Acá reseteamos el puntero y mostramos welcome.
    await clearCurrentUser();
    toast('Sesión cerrada. Los datos quedan en la base.');
    CURRENT_USER = null;
    renderApp('welcome');
  };
  $('#btnShareApp').onclick = () => shareApp();
}

/* ============== Usuarios ============== */
async function renderUsers(root){
  const users = await listUsers();
  root.innerHTML = `
    <section class="view on">
      <div class="bar">
        <button class="iconbtn" id="btnBack">←</button>
        <span style="font-weight:700">Usuarios</span>
      </div>
      <div class="card">
        <label class="field"><span>Nuevo usuario</span>
          <input id="newName" type="text" placeholder="Nombre">
        </label>
        <button class="primary" id="btnNew" style="width:100%">Crear y usar</button>
      </div>
      <div class="card">
        <b>Existentes</b>
        ${users.map(u => `
          <div class="weak" data-id="${u.id}" style="cursor:pointer">
            <span class="av" style="width:26px;height:26px;border-radius:50%;background:${avatarColor(u.name)}"></span>
            <span class="name">${esc(u.name)}</span>
            ${u.id === CURRENT_USER.id ? '<span class="badge ok">activo</span>' : ''}
          </div>`).join('')}
      </div>
      <p class="foot">OMG-Teacher · by OhMyGoch</p>
    </section>`;

  $('#btnBack').onclick = () => renderApp('home');
  $('#btnNew').onclick = async () => {
    const name = $('#newName').value.trim();
    if(!name){ toast('Poné un nombre'); return; }
    const u = await loginWithName(name);
    setUser(u);
    toast(`Hola, ${u.name}`);
    renderApp('home');
  };
  $$('.weak[data-id]').forEach(el => {
    el.onclick = async () => {
      const u = await switchTo(el.dataset.id);
      setUser(u);
      toast(`Hola de nuevo, ${u.name}`);
      renderApp('home');
    };
  });
}

/* ============== Mis frases ============== */
async function renderData(root){
  const custom = await listCustomPhrases(CURRENT_USER.id);
  root.innerHTML = `
    <section class="view on">
      <div class="bar">
        <button class="iconbtn" id="btnBack">←</button>
        <span style="font-weight:700">Mis frases</span>
      </div>
      <div class="card">
        <label class="field"><span>Formato: <code>English | Español</code></span>
          <textarea id="customData" rows="12" placeholder="The weather is lovely today. | El clima está precioso hoy.">${esc(custom.map(p => `${p.en} | ${p.es}`).join('\n'))}</textarea>
        </label>
        <button class="primary" id="btnSave" style="width:100%">Guardar</button>
      </div>
      <p class="note">Se guardan en IndexedDB, solo en tu teléfono.</p>
      <p class="foot">OMG-Teacher · by OhMyGoch</p>
    </section>`;

  $('#btnBack').onclick = () => renderApp('home');
  $('#btnSave').onclick = async () => {
    const lines = $('#customData').value.split('\n').map(l => l.trim()).filter(Boolean);
    const out = [];
    lines.forEach((line, i) => {
      const idx = line.indexOf('|');
      let en, es;
      if(idx === -1){ en = line; es = '—'; }
      else { en = line.slice(0, idx).trim(); es = line.slice(idx+1).trim() || '—'; }
      if(!en) return;
      out.push({ id: 'u_' + CURRENT_USER.id.slice(0,4) + '_' + i, en, es, tag:'mias' });
    });
    await replaceCustomPhrases(CURRENT_USER.id, out);
    toast(`${out.length} frases guardadas`);
    renderApp('home');
  };
}

/* ============== Botones globales del header ============== */
document.addEventListener('DOMContentLoaded', () => {
  const bs = document.getElementById('btnShare');
  const bg = document.getElementById('btnSettings');
  if(bs) bs.onclick = () => {
    if(!confirm('¿Compartir OhMyGoch Teacher?')) return;
    shareApp();
  };
  if(bg) bg.onclick = () => {
    if(!CURRENT_USER) return;
    renderApp('settings');
  };
});