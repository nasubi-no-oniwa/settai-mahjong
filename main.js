// 接待麻雀：流れ（タイトル→ムービー→迷う3秒→ロンの5秒→エンド→結果）・操作・通信・動画
import { mkWorld, mkAtlas, THREE, K, cl, ez, eo, eb, lerp, V3, HANDS } from './world.js?v=3';
import * as FX from './fx.js?v=3';
import { audio, ctx as actx, out as aout, S as SND, runSfx, UI, now as anow } from './snd.js?v=3';
import { TX, LANGS, RANK, RCOL } from './tx.js?v=3';
import { mkActs } from './acts.js?v=3';
const $ = id => document.getElementById(id);
const Q = new URLSearchParams(location.search);
const TEST = Q.has('test'), STEP = Q.has('step'), OGP = Q.has('ogp'), ICON = Q.has('icon'), HOME = Q.has('homeimg');
const GAME_URL = 'https://nasubi-no-oniwa.github.io/settai-mahjong/';
const REL = Date.parse('2026-11-13T18:00:00+09:00'), HIDE = Date.parse('2026-11-13T20:00:00+09:00'), PRE = 'f2cfdd3cf5de95f27a2918944a6201efb11b39fcef903e130ac93ae5dad68ed2'; // 公開の時刻・「回答発表」の文を消す時刻・確認用の合鍵
const NE = 11;
const mem = {}; const ls = { get(k, d) { try { const v = localStorage.getItem(k); return v == null ? (k in mem ? mem[k] : d) : JSON.parse(v); } catch (e) { return k in mem ? mem[k] : d; } }, set(k, v) { mem[k] = v; try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } } };
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const sleep = ms => new Promise(r => setTimeout(r, ms));
function gaEv(n) { try { if (typeof gtag === 'function') gtag('event', n, { game: 'settai-mahjong' }); } catch (e) { } }
let lang = (q => TX[q] ? q : null)(Q.get('lang')) || ls.get('sm_lang', null) || (n => n.startsWith('ja') ? 'ja' : n.startsWith('zh') ? 'zh' : n.startsWith('ko') ? 'ko' : 'en')((navigator.language || 'ja').toLowerCase());
if (!TX[lang]) lang = 'ja';
const t = (k, o) => { let s = TX[lang][k]; if (s == null) s = TX.ja[k]; if (o && typeof s === 'string') for (const [a, b] of Object.entries(o)) s = s.split('{' + a + '}').join(b); return s; };
// 記録：got[i]＝0 まだ／-1 見つけた（何人目かは不明）／n 見つけた n人目
let S = Object.assign({ got: Array(NE).fill(0), sent: [], comp: 0, code: '', plays: 0 }, ls.get('sm_s', {})); if (!Array.isArray(S.got) || S.got.length !== NE) S.got = Array(NE).fill(0);
const save = () => ls.set('sm_s', S); const nFound = () => S.got.filter(x => x).length;

// ===== 絵 =====
const cv = $('c'), fx = $('fx'), G = fx.getContext('2d');
const atlas = mkAtlas(), W = mkWorld(atlas);
const R = new THREE.WebGLRenderer({ canvas: cv, antialias: true, preserveDrawingBuffer: OGP || ICON || HOME || TEST });
const A = mkActs(W, atlas);
const V = { g: G, w: 1, h: 1, u: 1, q: [], T: t };
function resize() { const dpr = Math.min(2, window.devicePixelRatio || 1), w = innerWidth, h = innerHeight; R.setPixelRatio(dpr); R.setSize(w, h, false); fx.width = Math.round(w * dpr); fx.height = Math.round(h * dpr); V.w = fx.width; V.h = fx.height; V.u = Math.min(V.w, V.h * .56) / 390; }
function paint(a, tt, VV, after) { W.view.w = VV.w; W.view.h = VV.h; VV.q.length = 0; W.reset(); a.run(tt, VV); if (after) after(VV); W.apply(); R.render(W.SC, W.CAM); }
function drawFx(VV) { const g = VV.g; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, VV.w, VV.h); for (const f of VV.q) { g.save(); try { f(); } catch (e) { console.error(e); } g.restore(); } }
const TITLE = { len: 1e9, sfx: [], run(tt) { W.seatC.forEach((c, i) => { c.by = Math.sin(tt * 1.7 + i) * .004; if (((tt * .31 + i * .27) % 1) < .035) c.ey = .12; }); const a = Math.sin(tt * .13) * .7; W.setCam([Math.sin(a) * 2.6, 2.5, Math.cos(a) * 2.6], [0, .95, 0], 1.25, 1.2, tt); } };

// ===== 流れ =====
let mode = 'boot', act = TITLE, T = 0, speed = 1, cur = -1, ronN = 0, waitT = 0, lastEnd = -1, IT = 0, lt = 0, vidBusy = false, fromResult = false, RES = { isNew: false, wait: false, cnt: null };
const PANELS = ['soon', 'title', 'result', 'vidPanel', 'zPanel', 'hPanel'];
function show(id) { for (const p of PANELS) $(p).hidden = p !== id; }
function go(m) { mode = m; act = A[m]; T = 0; speed = m === 'movie' && fromResult ? 2 : 1; }
function startEnd(e) { cur = e; mode = 'end'; act = e === 0 ? A.ron : e === 1 ? A.arrest : A.e[e]; T = 0; speed = 1; ronN = 0; P0 = null; gaEv('act_' + e); }
function startGame(again) { audio(); UI.ok(); fromResult = !!again; show(null); go('movie'); gaEv('start'); wake(); }
function showTitle() { mode = 'title'; act = TITLE; cur = -1; show('title'); applyLang(); }
function waitAudio(a, b) { // 30秒をすぎると、廊下から泣き声と足音が近づいてくる
  if (!actx()) return; const s0 = Math.floor(a * 2), s1 = Math.floor(b * 2); if (s0 === s1 || b < 30) return; const s = b, n = anow() + .02, v = cl((s - 30) / 28);
  if (s1 % 6 === 0) SND.sob(n, .08 + v * .75); if (s >= 42) SND.step(n, .15 + cl((s - 42) / 16) * .9); if (s >= 52 && s1 % 8 === 0) SND.siren(n, 3.8, .1 + cl((s - 52) / 8) * .3);
}
function frame(dt) {
  IT += dt;
  if (mode === 'title' || mode === 'soon' || mode === 'boot') { paint(TITLE, IT, V); drawFx(V); ui(); return; }
  const t0 = T; T += dt * speed;
  if (mode !== 'result' && mode !== 'wait') runSfx(act.sfx, t0, T);
  if (mode === 'movie' && T >= act.len) go('hes');
  else if (mode === 'hes' && T >= act.len) go('dec');
  else if (mode === 'dec' && T >= act.len) startEnd(2);
  else if (mode === 'end') { if (act === A.ron) { if (T >= act.len) { mode = 'wait'; act = A.wait; T = 0; waitT = 0; } } else if (T >= act.len) finish(cur); }
  else if (mode === 'wait') { const w0 = waitT; waitT += dt; waitAudio(w0, waitT); if (waitT >= 60) startEnd(1); }
  paint(act, T, V); drawFx(V); ui();
}
function loop(now) { const dt = Math.min(.1, (now - lt) / 1000 || 0); lt = now; if (mode !== 'video') frame(dt); requestAnimationFrame(loop); }
function ui() {
  const dec = mode === 'dec' && T >= .6, mash = mode === 'end' && act === A.ron && T < 1.25;
  $('ronBtn').hidden = !(dec || mash); $('ronRing').hidden = !dec; if (dec) $('ronRing').style.setProperty('--p', String(cl(1 - (T - .6) / 5)));
  $('endBtn').hidden = mode !== 'wait';
  $('skipBtn').hidden = !(mode === 'movie' || (mode === 'end' && S.got[cur] && !mash && T < act.len - 1.2 && !(act === A.ron && T >= 21.8)));
}
function ron(ev) { if (ev) ev.preventDefault(); audio(); if (mode === 'dec' && T >= .6) { startEnd(0); ronN = 1; } else if (mode === 'end' && act === A.ron && T < 1.25) { ronN++; if (ronN >= 5) startEnd(9); } }
$('ronBtn').addEventListener('pointerdown', ron);
$('endBtn').onclick = () => { if (mode === 'wait') { UI.tap(); finish(0); } };
$('skipBtn').onclick = () => { UI.tap(); if (mode === 'movie') go('hes'); else if (mode === 'end') { if (act === A.ron) T = 21.8; else T = act.len; } };

// ===== 画面をさわる（タップ・長押し・スライド） =====
let P0 = null;
const inter = () => mode === 'hes' || (mode === 'dec' && T >= .45);
function hit(x, y) {
  const tg = A.targets(), u = V.u, d = (p, r) => { const q = W.pj(p); return Math.hypot(q.x - x, q.y - y) < r * u; };
  if (mode === 'dec') { const q = W.pj(tg.white); if (Math.hypot(q.x - x, q.y - y) < 28 * u || Math.hypot(q.x - x, q.y - 34 * u - y) < 32 * u) return 'white'; }
  if (mode === 'hes' && (d(tg.bu, 46) || d(tg.white, 42))) return 'bu';
  if (d(tg.lamp, 48)) return 'lamp';
  { const q = W.pj(tg.win); if (Math.abs(q.x - x) < 56 * u && Math.abs(q.y - y) < 62 * u) return 'win'; }
  if (d(tg.onna, 52)) return 'onna';
  return '';
}
const xy = e => { const r = fx.getBoundingClientRect(), s = fx.width / r.width; return [(e.clientX - r.left) * s, (e.clientY - r.top) * s]; };
fx.addEventListener('pointerdown', e => {
  audio(); if (!inter()) return; const [x, y] = xy(e); P0 = { x, y, at: performance.now(), mv: 0, tg: hit(x, y), id: e.pointerId, lp: 0 };
  P0.lp = setTimeout(() => { const p = P0; if (!p || p.mv > 14 * V.u || !inter()) return; if (p.tg === 'white' && mode === 'dec') startEnd(4); else if (p.tg === 'onna') startEnd(6); }, 600);
});
fx.addEventListener('pointermove', e => {
  const p = P0; if (!p || e.pointerId !== p.id || !inter()) return; const [x, y] = xy(e), dx = x - p.x, dy = y - p.y, u = V.u; p.mv = Math.max(p.mv, Math.hypot(dx, dy));
  if (p.mv > 14 * u) clearTimeout(p.lp);
  if (p.tg === 'white' && mode === 'dec' && dx < -46 * u && Math.abs(dy) < Math.abs(dx)) { startEnd(7); return; }
  if (p.tg !== 'white' && Math.abs(dx) > Math.max(120 * u, V.w * .3) && Math.abs(dy) < Math.abs(dx) * .8 && performance.now() - p.at < 700) startEnd(3);
});
const pup = e => { const p = P0; if (!p || e.pointerId !== p.id) return; clearTimeout(p.lp); P0 = null; if (!inter() || p.mv > 14 * V.u || performance.now() - p.at > 400) return; if (p.tg === 'bu' && mode === 'hes') startEnd(5); else if (p.tg === 'lamp') startEnd(8); else if (p.tg === 'win') startEnd(10); };
fx.addEventListener('pointerup', pup); fx.addEventListener('pointercancel', e => { if (P0) { clearTimeout(P0.lp); P0 = null; } });
document.addEventListener('dblclick', e => e.preventDefault(), { passive: false });
// 画面が消えないようにする（1分待つエンドのため）
let WL = null; async function wake() { try { if (navigator.wakeLock && !WL) { WL = await navigator.wakeLock.request('screen'); WL.addEventListener('release', () => { WL = null; }); } } catch (e) { WL = null; } }
document.addEventListener('visibilitychange', () => { if (!document.hidden && mode !== 'title' && mode !== 'soon') wake(); });

// ===== Firebase（ft-red の settaimj の下）：エンドごとの「見つけた人数」・引き継ぎコード =====
const FB = { apiKey: 'AIzaSyBCzVyblBmfNQq4XdPHdQppE94gyiYxDkA', databaseURL: 'https://ft-red-default-rtdb.asia-southeast1.firebasedatabase.app' };
const DBR = FB.databaseURL + '/settaimj';
async function fetchR(url, opt) { let err; for (let i = 0; i < 3; i++) { try { return await fetch(url, opt); } catch (e) { err = e; await sleep(500 * (i + 1)); } } throw err; }
let AUTH = null, authP = null;
function fbAuth() { if (TEST) return Promise.reject(new Error('test')); if (AUTH && AUTH.exp > Date.now() + 60000) return Promise.resolve(AUTH); if (!authP) authP = fbAuth0().then(a => { AUTH = a; authP = null; return a; }, e => { authP = null; throw e; }); return authP; }
async function fbAuth0() {
  let a = AUTH || ls.get('sm_auth', null); if (a && a.exp > Date.now() + 60000) return a;
  if (a && a.refresh) { try { const r = await fetchR('https://securetoken.googleapis.com/v1/token?key=' + FB.apiKey, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'grant_type=refresh_token&refresh_token=' + encodeURIComponent(a.refresh) }); if (r.ok) { const j = await r.json(); a = { uid: j.user_id, token: j.id_token, refresh: j.refresh_token, exp: Date.now() + (+j.expires_in) * 1000 }; ls.set('sm_auth', a); return a; } } catch (_) { } }
  const r = await fetchR('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + FB.apiKey, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ returnSecureToken: true }) });
  if (!r.ok) throw new Error('auth'); const j = await r.json(); a = { uid: j.localId, token: j.idToken, refresh: j.refreshToken, exp: Date.now() + (+j.expiresIn) * 1000 }; ls.set('sm_auth', a); return a;
}
const QA = a => '.json?auth=' + encodeURIComponent(a.token), TS = { '.sv': 'timestamp' }, JH = { method: 'PUT', headers: { 'Content-Type': 'application/json' } };
let CNT = null;
const FAKE = { e0: 412, e1: 4, e2: 366, e3: 120, e4: 41, e5: 38, e6: 29, e7: 33, e8: 9, e9: 301, e10: 255, comp: 1 };
async function counts(force) { if (!force && CNT && Date.now() - CNT.at < 20000) return CNT.v; if (TEST) { CNT = { at: Date.now(), v: FAKE }; return FAKE; } const r = await fetchR(DBR + '/c.json'); if (!r.ok) throw new Error('c ' + r.status); const v = (await r.json()) || {}; CNT = { at: Date.now(), v }; return v; }
// 「見つけた」を数える（数だけ。同じエンドは1人1回）。数えられたら true
async function sendFound(id) {
  if (S.sent.includes(id)) return false; if (TEST) { S.sent.push(id); save(); FAKE[id] = (FAKE[id] || 0) + 1; return true; }
  try { const a = await fbAuth(), body = {}; body['u/' + a.uid + '/' + id] = TS; body['c/' + id] = { '.sv': { increment: 1 } }; const r = await fetchR(DBR + QA(a), { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); if (r.ok || r.status === 401 || r.status === 403) { if (!S.sent.includes(id)) { S.sent.push(id); save(); } return r.ok; } } catch (e) { console.warn(e); } return false;
}
async function record(e) { const id = 'e' + e, ok = await sendFound(id); let v = null; try { v = await counts(true); } catch (_) { } if (ok && v && S.got[e] <= 0) { S.got[e] = Math.max(1, v[id] || 1); save(); }
  if (nFound() >= NE && !S.comp) { const ok2 = await sendFound('comp'); let v2 = null; try { v2 = await counts(true); } catch (_) { } S.comp = ok2 && v2 ? Math.max(1, v2.comp || 1) : -1; save(); v = v2 || v; } return v; }
async function syncAll() { for (let i = 0; i < NE; i++)if (S.got[i] && !S.sent.includes('e' + i)) await record(i); }

// ===== 結果 =====
function finish(e) {
  mode = 'result'; lastEnd = e; const isNew = !S.got[e]; if (isNew) S.got[e] = -1; S.plays++; save(); gaEv('end_' + e); if (isNew) gaEv('new_end');
  RES = { isNew, wait: !S.sent.includes('e' + e), cnt: CNT ? CNT.v : null }; fillResult(); show('result'); if (isNew && actx()) SND.chime(anow() + .05);
  record(e).then(v => { RES.wait = false; if (v) RES.cnt = v; if (lastEnd === e && mode === 'result') fillResult(); }).catch(() => { RES.wait = false; if (lastEnd === e) fillResult(); });
}
function fillResult() {
  const e = lastEnd; if (e < 0) return; const r = RANK[e], o = S.got[e], c = RES.cnt;
  $('rNew').hidden = !RES.isNew; $('rNew').textContent = t('rNew'); $('rRank').textContent = r; $('rRank').style.background = RCOL[r]; $('rName').textContent = t('rEnd', { e: t('en')[e] }); $('rDesc').textContent = t('ed')[e];
  $('rOrder').textContent = o > 0 ? t(e === 1 ? 'rOrderA' : 'rOrder', { n: o.toLocaleString() }) : RES.wait ? t('rOrderW') : '';
  $('sP1').textContent = t('stP'); $('sP2').textContent = c ? t('lPeople', { n: (c['e' + e] || 0).toLocaleString() }) : '…'; $('sG1').textContent = t('stG'); $('sG2').textContent = nFound() + '/' + NE;
}
const shareURL = () => GAME_URL;
function postText(e) { const o = S.got[e]; return t(o > 0 ? 'post' : 'postNo', { e: t('en')[e], r: RANK[e], n: o > 0 ? o.toLocaleString() : '', k: nFound() }) + '\n' + t('tags'); }
// Xの投稿で引用するツイート（なすびのお庭の管理ページ quote/ で日本語・英語を貼りかえられる）
let QUOTE = {}; if (!TEST) fetch(FB.databaseURL + '/xquote/g/settai-mahjong.json').then(r => r.json()).then(d => { if (d && typeof d === 'object') QUOTE = d; }).catch(() => { });
function quoteURL() { const u = (lang === 'ja' ? QUOTE.ja : QUOTE.en) || ''; return /^https:\/\/x\.com\/[A-Za-z0-9_]{1,15}\/status\/\d{5,25}$/.test(u) ? u : ''; }
function xIntent(text, url) { const q = quoteURL(); return 'https://x.com/intent/post?text=' + encodeURIComponent(q ? text + '\n' + url : text) + '&url=' + encodeURIComponent(q || url); }
function openX(text, url) { const u = xIntent(text, url); const w = window.open(u, '_blank'); if (!w) location.href = u; }
$('againBtn').onclick = () => { if (mode === 'result') startGame(true); };
$('xBtn').onclick = () => openX(postText(lastEnd), shareURL());
$('rTop').onclick = () => { UI.back(); showTitle(); };
$('rList').onclick = () => { UI.tap(); zFrom = 'result'; openList(); };
$('startBtn').onclick = () => startGame(false);

// ===== 動画にする =====
let VCV = null;
function pickMime() { const c = ['video/mp4;codecs=avc1', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm']; for (const m of c) { try { if (window.MediaRecorder && MediaRecorder.isTypeSupported(m)) return m; } catch (e) { } } return ''; }
function cardInfo(e) { const o = S.got[e]; return { title: t('title'), rank: RANK[e], rcol: RCOL[RANK[e]], name: t('rEnd', { e: t('en')[e] }), desc: t('ed')[e], order: o > 0 ? t(e === 1 ? 'rOrderA' : 'rOrder', { n: o.toLocaleString() }) : '', prog: t('rProg', { n: nFound() }), url: 'nasubi-no-oniwa.github.io/settai-mahjong', tags: t('tags') }; }
async function makeVideo() {
  if (vidBusy || lastEnd < 0 || mode !== 'result') return; const mime = pickMime(); if (!mime || !HTMLCanvasElement.prototype.captureStream) { vidDone(null); return; } vidBusy = true; audio();
  const VW = 720, VH = 1280; if (!VCV) { VCV = document.createElement('canvas'); VCV.width = VW; VCV.height = VH; } const vg = VCV.getContext('2d');
  const a = lastEnd === 0 ? A.ron : lastEnd === 1 ? A.arrest : A.e[lastEnd], [c0, c1] = a.clip || [0, a.len], LEN = c1 - c0, TOT = LEN + 2.8, card = cardInfo(lastEnd);
  const V2 = { g: vg, w: VW, h: VH, u: Math.min(VW, VH * .56) / 390, q: [], T: t };
  $('recBadge').textContent = t('rec'); $('recBadge').hidden = false; show(null); mode = 'video'; ui(); R.setPixelRatio(1); R.setSize(VW, VH, false);
  const draw = tt => { paint(a, Math.min(c1, c0 + tt), V2, tt > LEN ? VV => A.card(VV, (tt - LEN) / .4, card) : null); vg.setTransform(1, 0, 0, 1, 0, 0); vg.drawImage(cv, 0, 0, VW, VH); for (const f of V2.q) { vg.save(); try { f(); } catch (e) { } vg.restore(); }
    G.setTransform(1, 0, 0, 1, 0, 0); G.fillStyle = '#120d0a'; G.fillRect(0, 0, fx.width, fx.height); const k = Math.min(fx.width / VW, fx.height / VH); G.drawImage(VCV, (fx.width - VW * k) / 2, (fx.height - VH * k) / 2, VW * k, VH * k); };
  draw(0);
  const st = VCV.captureStream(30); let dest = null; const AC = actx(), master = aout(); try { if (AC) { dest = AC.createMediaStreamDestination(); master.connect(dest); for (const tr of dest.stream.getAudioTracks()) st.addTrack(tr); } } catch (e) { }
  const fin = () => { try { if (dest) master.disconnect(dest); } catch (_) { } $('recBadge').hidden = true; mode = 'result'; vidBusy = false; resize(); };
  const chunks = []; let rec; try { rec = new MediaRecorder(st, { mimeType: mime, videoBitsPerSecond: 4000000 }); } catch (e) { fin(); vidDone(null); return; }
  rec.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); }; const stopped = new Promise(r => rec.onstop = r);
  rec.start(200); let l2 = performance.now(), tt = 0;
  await new Promise(res => { function stp(now) { const dt = Math.min(.1, (now - l2) / 1000); l2 = now; const p = tt; tt += dt; if (p < LEN) runSfx(a.sfx, c0 + p, c0 + Math.min(tt, LEN)); draw(tt); if (tt >= TOT) res(); else requestAnimationFrame(stp); } requestAnimationFrame(stp); });
  rec.stop(); await stopped; fin(); vidDone(new Blob(chunks, { type: mime.split(';')[0] }), mime);
}
function vidDone(blob, mime) {
  mode = 'result'; show('vidPanel');
  if (!blob || !blob.size) { $('vMsg').textContent = t('vfail'); $('vShare').hidden = $('vSave').hidden = true; $('vidPrev').hidden = true; return; }
  $('vidPrev').hidden = false; const url = URL.createObjectURL(blob); $('vidPrev').src = url; $('vidPrev').muted = true; $('vidPrev').play().catch(() => { });
  const ext = /mp4/.test(mime) ? 'mp4' : 'webm', nm = 'settai_mahjong_' + Date.now() + '.' + ext, file = new File([blob], nm, { type: blob.type }), canShare = !!(navigator.canShare && navigator.canShare({ files: [file] }));
  $('vShare').hidden = !canShare; $('vSave').hidden = false; $('vMsg').textContent = canShare ? t('vmade') : t('shareHint');
  $('vShare').onclick = async () => { try { await navigator.share({ files: [file], text: postText(lastEnd) + '\n' + shareURL() + (quoteURL() ? '\n' + quoteURL() : '') }); gaEv('x_share'); } catch (e) { } };
  $('vSave').onclick = () => { const a = document.createElement('a'); a.href = url; a.download = nm; document.body.appendChild(a); a.click(); a.remove(); };
}
$('vidBtn').onclick = () => makeVideo(); $('vX').onclick = () => openX(postText(lastEnd), shareURL()); $('vBack').onclick = () => show('result');

// ===== エンド一覧 =====
let zFrom = 'title';
async function openList() {
  show('zPanel'); const box = $('zBox'), n = nFound(); $('zNotice').hidden = Date.now() >= HIDE; $('zNotice').textContent = t('notice'); $('zFound').textContent = t('found', { n }); $('zNote').textContent = ''; $('zGod').hidden = n < NE;
  const rows = v => '<table class="zk">' + RANK.map((r, i) => { const own = !!S.got[i]; return '<tr class="' + (own ? 'own' : 'no') + '"><td class="ck">' + (own ? '✓' : '') + '</td><td style="width:44px"><span class="rk" style="background:' + RCOL[r] + ';font-size:13px;min-width:30px;text-align:center">' + r + '</span></td><td class="n">' + esc(own ? t('en')[i] : t('lHid')) + '</td><td class="c">' + (v ? esc(t('lPeople', { n: (v['e' + i] || 0).toLocaleString() })) : '…') + '</td></tr>'; }).join('')
    + (n >= NE ? '<tr class="god"><td class="ck">👑</td><td colspan="2">' + esc(t('lGod')) + '<br><small>' + esc(t('lGodNote')) + '</small></td><td class="c">' + (v ? esc(t('lPeople', { n: (v.comp || 0).toLocaleString() })) : '…') + '</td></tr>' : '') + '</table>';
  box.innerHTML = rows(null); try { const v = await counts(); box.innerHTML = rows(v); } catch (e) { $('zNote').textContent = t('lErr'); }
}
$('zBtn').onclick = () => { UI.tap(); zFrom = 'title'; openList(); };
$('zBack').onclick = () => { UI.back(); if (zFrom === 'result' && lastEnd >= 0) { mode = 'result'; show('result'); } else showTitle(); };
$('zGod').onclick = () => openX(t('postGod') + '\n' + t('tags'), shareURL());

// ===== 引き継ぎコード =====
const CHS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function newCode() { const a = new Uint32Array(8); try { crypto.getRandomValues(a); } catch (e) { for (let i = 0; i < 8; i++)a[i] = Math.random() * 4294967296; } let s = ''; for (let i = 0; i < 8; i++)s += CHS[a[i] % 32]; return s; }
$('hBtn').onclick = () => { UI.tap(); show('hPanel'); $('hCode').textContent = S.code || ''; $('hMsg1').textContent = S.code ? t('hMade') : ''; $('hMsg2').textContent = ''; $('hIn').value = ''; };
$('hBack').onclick = () => { UI.back(); showTitle(); };
$('hMake').onclick = async () => {
  const m = $('hMsg1'); m.className = 'note'; m.textContent = t('lLoad');
  try { const code = S.code || newCode(), body = { u: '', g: S.got.join(','), s: S.sent.join(','), c: S.comp || 0, t: TS }; if (!TEST) { const a = await fbAuth(); body.u = a.uid; const r = await fetchR(DBR + '/x/' + code + QA(a), { ...JH, body: JSON.stringify(body) }); if (!r.ok) { if (S.code) { S.code = ''; save(); } throw new Error('x ' + r.status); } } S.code = code; save(); $('hCode').textContent = code; m.textContent = t('hMade'); m.className = 'note ok'; UI.ok(); } catch (e) { console.warn(e); m.textContent = t('hErr'); m.className = 'note err'; }
};
$('hLoad').onclick = async () => {
  const m = $('hMsg2'), code = ($('hIn').value || '').toUpperCase().replace(/[^A-Z2-9]/g, ''); m.className = 'note'; if (code.length !== 8) { m.textContent = t('hNg'); m.className = 'note err'; return; } m.textContent = t('lLoad');
  try { let d = null; if (!TEST) { const r = await fetchR(DBR + '/x/' + code + '.json'); if (!r.ok) throw new Error('x ' + r.status); d = await r.json(); } if (!d || typeof d.g !== 'string') { m.textContent = t('hNg'); m.className = 'note err'; return; }
    const g = d.g.split(',').map(x => parseInt(x, 10) || 0); for (let i = 0; i < NE; i++) { if (g[i] && (!S.got[i] || (S.got[i] < 0 && g[i] > 0))) S.got[i] = g[i]; } if (!S.comp && d.c) S.comp = +d.c; for (const k of String(d.s || '').split(',')) if (/^(e[0-9]|e10|comp)$/.test(k) && !S.sent.includes(k)) S.sent.push(k);
    save(); m.textContent = t('hOk'); m.className = 'note ok'; UI.ok(); } catch (e) { console.warn(e); m.textContent = t('hErr'); m.className = 'note err'; }
};

// ===== 画面の文字 =====
function applyLang() {
  document.documentElement.lang = lang === 'zh' ? 'zh-Hant' : lang; document.title = t('title');
  $('tTitle').textContent = t('title'); $('tSub').textContent = t('sub'); $('tHow').textContent = t('how'); $('startBtn').textContent = t('start'); $('zBtn').textContent = t('list') + '　' + nFound() + '/' + NE; $('hBtn').textContent = t('hikitsugi');
  $('tNotice').textContent = t('notice'); $('tNotice').hidden = Date.now() >= HIDE;
  $('skipBtn').textContent = t('skip'); $('ronBtn').textContent = t('ron') + (lang === 'ja' || lang === 'ko' ? '！' : '!'); $('endBtn').textContent = t('owaru');
  $('againBtn').textContent = t('again'); $('vidBtn').textContent = t('vid'); $('xBtn').textContent = t('xpost'); $('rList').textContent = t('list'); $('rTop').textContent = t('top');
  $('vShare').textContent = t('vshare'); $('vSave').textContent = t('vsave'); $('vX').textContent = t('vx'); $('vBack').textContent = t('back');
  $('zTitle').textContent = t('lTitle'); $('zBack').textContent = t('back'); $('zGod').textContent = t('lGodPost');
  $('hTitle').textContent = t('hTitle'); $('hNote').textContent = t('hNote'); $('hMake').textContent = t('hMake'); $('hIn').placeholder = t('hIn') + '（' + t('hPh') + '）'; $('hLoad').textContent = t('hLoad'); $('hBack').textContent = t('back');
  $('soonTitle').textContent = t('title'); $('soonSub').textContent = t('sub'); $('soonAt').textContent = t('soon'); $('soonNote').textContent = t('soonNote');
  const lg = $('langs'); lg.innerHTML = ''; for (const [k, n] of LANGS) { const b = document.createElement('button'); b.textContent = n; if (k === lang) b.className = 'on'; b.onclick = () => { lang = k; ls.set('sm_lang', k); applyLang(); }; lg.appendChild(b); }
  if (mode === 'result') fillResult();
}
setInterval(() => { if (Date.now() >= HIDE) { $('tNotice').hidden = true; $('zNotice').hidden = true; } }, 20000);

// ===== はじまり（公開の時刻までは予告だけ。確認用の合鍵つきのリンクなら先に遊べる） =====
async function sha(s) { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join(''); }
const left = d => { const s = Math.ceil(d / 1000), h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), ss = s % 60; return (h ? h + ':' : '') + String(m).padStart(h ? 2 : 1, '0') + ':' + String(ss).padStart(2, '0'); };
async function boot() {
  resize(); addEventListener('resize', resize);
  let open = Date.now() >= REL; if (!open && Q.get('pre')) { try { open = (await sha('sm:' + Q.get('pre'))) === PRE; } catch (e) { } }
  if ((OGP || ICON || HOME) && open) { still(); return; }
  applyLang();
  if (open) showTitle(); else { mode = 'soon'; show('soon'); const tick = () => { const d = REL - Date.now(); if (d <= 0) { showTitle(); fbAuth().then(syncAll).catch(() => { }); return; } $('soonLeft').textContent = t('soonLeft', { t: left(d) }); setTimeout(tick, 500); }; tick(); }
  if (!STEP) requestAnimationFrame(loop);
  if (!TEST && open) fbAuth().then(syncAll).catch(() => { });
}
// リンクの画像・アイコン・なすびのお庭の画像（?ogp / ?icon / ?homeimg）
function still() {
  show(null); mode = 'ogp'; const w = V.w, h = V.h, land = w > h;
  const sc = { len: 1, sfx: [], run(tt, VV) { A.dec.run(1.2, VV); VV.q.length = 0; W.setCam(ICON ? [.9, 1.9, 1.5] : land ? [1.5, 2.0, 1.9] : [1.2, 2.5, 2.6], ICON ? [-.3, .95, 0] : land ? [.75, .95, -.1] : [-.1, .9, -.1], ICON ? .62 : land ? 1.5 : 1.0, ICON ? .62 : land ? .8 : 1.2, 0); } };
  paint(sc, 0, V, VV => VV.q.push(() => {
    const g = VV.g, u = Math.min(w, h) / 630; if (ICON) { FX.tile(g, atlas, 31, w * .5, h * .46, w * .34, { glow: '#ff4a3a' }); FX.txt(g, t('ron') + '！', w * .5, h * .84, w * .2, '#ff3b30', '#fff', w * .045); return; }
    const gr = g.createLinearGradient(land ? w : 0, 0, land ? w * .36 : 0, land ? 0 : h * .5); gr.addColorStop(0, 'rgba(10,6,4,.94)'); gr.addColorStop(.55, 'rgba(10,6,4,.8)'); gr.addColorStop(1, 'rgba(10,6,4,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const x = land ? w * .95 : w * .5, al = land ? 'right' : 'center'; FX.txt(g, t('title'), x, h * (land ? .2 : .1), u * (land ? 108 : 86), '#ffe27a', '#5a1a00', u * 16, FX.SERIF, al);
    FX.txt(g, t('ogp1'), x, h * (land ? .43 : .2), u * (land ? 38 : 30), '#fff', '#16192e', u * 8, null, al); FX.txt(g, t('ogp2'), x, h * (land ? .55 : .25), u * (land ? 38 : 30), '#ffd84a', '#16192e', u * 8, null, al);
    if (!HOME) { FX.handRow(g, atlas, HANDS[0], land ? w * .69 : w * .5, h * (land ? .76 : .9), land ? w * .52 : w * .92, { win: 31 }); FX.txt(g, t('ogp3'), land ? w * .95 : w * .5, h * (land ? .92 : .96), u * 26, '#fff', '#c4201c', u * 7, null, al); }
    const p = W.pj(W.dr[3].m.position); FX.tile(g, atlas, 31, p.x, p.y - u * 50, u * 70, { glow: '#ff4a3a' });
  })); drawFx(V); window.__READY = true;
}
window.__SM = { get P0() { return P0; }, get mode() { return mode; }, get T() { return T; }, set T(v) { T = v; }, get waitT() { return waitT; }, set waitT(v) { waitT = v; }, get cur() { return cur; }, S, A, W, V, R, go, startEnd, finish, startGame, showTitle, makeVideo, openList, hit, ron, step: dt => frame(dt), setLang: k => { lang = k; applyLang(); }, paint, drawFx, t };
boot();
