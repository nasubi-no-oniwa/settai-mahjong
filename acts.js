// 接待麻雀：場面（はじめのムービー・迷う3秒・ロンの5秒・それぞれのエンド）。どれも「場面が始まってからの秒 t」だけで絵が決まる
import { TW, TH, TD, TY, cl, K, ez, eo, ei, eb, lerp, hash, V3, sp, HANDS } from './world.js?v=6';
import * as FX from './fx.js?v=6';
export function mkActs(W, atlas) {
  const C = W.C, SF = C.sf, BK = C.bk, ON = C.on, BU = C.bu, ST = C.st, P1 = C.p1, P2 = C.p2, TRI = [SF, BK, ON];
  const D = (V, f) => V.q.push(f);
  const mix = (a, b, k) => a.map((x, i) => lerp(x, b[i], k));
  const cam = (V, t, p, l, hw, hh) => W.setCam(p, l, hw, hh || hw * .9, t);
  const DVP = [-.22, 3.0, 2.4], DVL = [-.02, .84, -.12];
  const camDV = (V, t) => cam(V, t, DVP, DVL, .98, 1.5);
  const hpos = (c, dy) => { const h = c.headW(); h.y += dy; return W.pj(h); };
  const num = n => (n < 0 ? '−' : '') + Math.abs(n).toLocaleString('en-US');
  const TS = (V, key) => key[0] === '#' ? key.slice(1) : V.T(key);
  function say(V, t, a, b, c, key, o = {}) { if (t < a || t >= b || !c.g.visible) return; const k = Math.min(K(t, a, a + .16), K(b - t, 0, .1)); D(V, () => { let p = hpos(c, .2), dir = 1; if (p.y < V.h * .22) { p = hpos(c, -.2); dir = -1; } FX.bubble(V.g, p.x + (o.dx || 0) * V.u, p.y, TS(V, key), V.u * (o.px || 17), { k, think: o.think, W: V.w, tx: p.x, maxW: V.w * .7, dir, bg: o.bg, col: o.col }); }); }
  function sub(V, t, a, b, key) { if (t < a || t >= b) return; D(V, () => FX.subtitle(V.g, V.w, V.h, TS(V, key), V.u * 17, Math.min(K(t, a, a + .2), K(b - t, 0, .2)))); }
  function slamT(V, t, t0, key, x, y, px, fill, stroke, o = {}) { if (t < t0) return; D(V, () => FX.slam(V.g, t - t0, TS(V, key), x * V.w, y * V.h, px * V.u, fill, stroke, { maxW: V.w * .94, ...o })); }
  function stampT(V, t, t0, key, x, y, px, col, rot, o = {}) { if (t < t0) return; D(V, () => FX.stamp(V.g, t - t0, TS(V, key), x * V.w, y * V.h, px * V.u, col, rot, { maxW: V.w * .86, ...o })); }
  function stampC(V, t, t0, key, c, px, col, rot = -.2) { if (t < t0) return; D(V, () => { const p = hpos(c, -.12); FX.stamp(V.g, t - t0, TS(V, key), cl(p.x, V.u * 70, V.w - V.u * 70), p.y, px * V.u, col, rot); }); }
  function mk(V, kind, c, dx, dy, s, t) { if (!c.g.visible) return; D(V, () => { const p = hpos(c, .0); FX.mark(V.g, kind, p.x + dx * V.u, p.y + dy * V.u, s * V.u, t); }); }
  function row(V, t, a, b, tiles, o = {}) { if (t < a || t >= b) return; D(V, () => FX.handRow(V.g, atlas, tiles, V.w / 2, V.h * (o.y || .87), Math.min(V.w * .95, V.u * 440), { k: K(t, a, a + .5), maxT: V.u * 36, ...o })); }
  function flashT(V, t, t0, d = .25, col = '#fff', a = .9) { if (t < t0 || t > t0 + d) return; D(V, () => FX.flash(V.g, V.w, V.h, a * (1 - (t - t0) / d), col)); }
  function dark(V, a, col = '#000') { if (a <= 0) return; D(V, () => FX.flash(V.g, V.w, V.h, a, col)); }
  function bars(V, k = 1) { D(V, () => { const g = V.g, b = V.h * .055 * k; g.fillStyle = '#000'; g.fillRect(0, 0, V.w, b); g.fillRect(0, V.h - b, V.w, b); }); }
  function hud(V) { D(V, () => { const g = V.g, u = V.u, y = V.h - u * 58; const tw = FX.handRow(g, atlas, HANDS[0], V.w / 2, y, Math.min(V.w * .95, u * 430), { maxT: u * 34 }); FX.pill(g, V.T('hudYou') + '　' + V.T('hudWait'), V.w / 2, y - tw * .92 - u * 8, FX.fit(g, V.T('hudYou') + '　' + V.T('hudWait'), u * 12.5, V.w * .86), 'rgba(10,14,30,.8)', '#ffe9a8'); }); }
  function tags(V, sc) { D(V, () => { const g = V.g, u = V.u; const put = (c, s, col) => { if (!c.g.visible) return; const p = hpos(c, -.34); FX.pill(g, s, cl(p.x, u * 62, V.w - u * 62), Math.max(u * 16, p.y), u * 11.5, 'rgba(10,14,30,.82)', col); }; put(BU, V.T('nBu') + ' ' + num(sc == null ? 25000 : sc), sc < 0 ? '#ff7a6a' : '#fff'); put(BK, V.T('nBk') + '：' + V.T('y2'), '#ffd84a'); put(ON, V.T('nOn') + '：' + V.T('y3'), '#ffd84a'); }); }
  const idle = t => W.seatC.forEach((c, i) => { c.by = Math.sin(t * 1.7 + i * 1.3) * .004; if (((t * .31 + i * .27) % 1) < .035) c.ey = .12; });
  const draws = (a, b, c, d) => { W.setDraw(0, a); W.setDraw(1, b); W.setDraw(2, c); W.setDraw(3, d); };
  const follow = (i, d) => { if (d <= 0 || d >= 1) return; const c = W.seatC[i], p = W.dr[i].m.position.clone(); p.y += .05; c.reach('R', p, 1); c.ln = .22 * Math.sin(Math.PI * K(d, 0, .45)) + .2 * Math.sin(Math.PI * K(d, .6, 1)); };
  const nerv = (t, k, who = TRI) => who.forEach(c => { c.es = 1 + .3 * k; c.br = .32 * k; c.mo = Math.max(c.mo, .2 * k); });
  const shock = (c, k) => { c.es = 1 + .75 * k; c.mo = Math.max(c.mo, .85 * k); c.br = .4 * k; c.hp = -.16 * k; };
  const angry = (c, k, t = 0) => { c.br = -.6 * k; c.mo = Math.max(c.mo, (.7 + .3 * Math.sin(t * 16)) * k); c.es = 1 + .1 * k; };
  const smile = (c, k) => { c.ey = lerp(1, .16, k); c.mw = 1.1 + .6 * k; c.mo = Math.max(c.mo, .25 * k); };
  const cryP = (c, t, k) => { c.ey = .12; c.br = .65 * k; c.mo = (.75 + .25 * Math.sin(t * 15)) * k; c.hp = -.22 * k; c.hr = Math.sin(t * 9) * .07 * k; W.cry(c, t, k); };
  const clap = (c, t) => { const a = Math.abs(Math.sin(t * 13)) * .08; c.hL.set(-.04 - a, .98, .34); c.hR.set(.04 + a, .98, .34); };
  const ronUp = (c, t, t0, up = 1) => { const k = eo(K(t, t0, t0 + .16)) * up; if (k <= 0) return; c.st = k * .9; c.ln = .12 * k; c.hR.lerp(V3(.12, 1.5, .42), k); c.mo = Math.max(c.mo, k); c.br = -.35 * k; c.es = 1 + .15 * k; };
  const walk = (c, t, a, b, from, to, faceTo) => { const k = K(t, a, b); c.g.position.lerpVectors(from, to, ez(k)); if (k > 0 && k < 1) { c.by = Math.abs(Math.sin(t * 11)) * .035; c.sd = Math.sin(t * 11) * .05; } if (k < 1 || faceTo) c.face(faceTo || to); return k; };
  const HOLD = t => sp(3, .1, TY + .3 + Math.sin(t * 3) * .012, .25);
  const holdTile = t => { const m = W.dr[3].m; m.position.copy(HOLD(t)); m.quaternion.copy(W.dr[3].qH); m.rotateZ(Math.sin(t * 2.2) * .12); BU.reach('R', m.position.clone().add(V3(-.02, -.03, 0)), 1); BU.ln = .12; };
  const SEATP = [0, 1, 2, 3].map(i => sp(i, 0, 0, .9));
  // ロンのあと：3人の手があいて、点棒と部長の持ちものが散らばっている
  const whiteTo = (seat, k, from) => { const m = W.dr[3].m, a = from || m.position.clone(), b = sp(seat, 7.7 * TW, TY + TD / 2, .475 - TH * .5); m.position.lerpVectors(a, b, k); m.position.y += Math.sin(k * Math.PI) * .28; m.quaternion.slerp(W.dr[seat].qR, k); };
  const spoils = () => { W.flySticks(1e3, 0, .02); const P = W.props; P.wallet.visible = P.watch.visible = P.wig.visible = P.iou.visible = P.jacket.visible = true; P.jacket.position.copy(sp(1, -.2, TY + .05, .33)); P.jacket.rotation.set(0, .6, 0); P.wallet.position.copy(sp(0, -.2, TY + .03, .36)); P.wallet.rotation.set(Math.PI / 2, 0, .4); P.watch.position.copy(sp(1, .1, TY + .02, .36)); P.watch.rotation.set(Math.PI / 2, 0, 0); P.wig.position.copy(sp(2, -.22, TY + .0, .34)); P.wig.rotation.set(0, 0, 0); P.iou.position.copy(sp(2, .18, TY + .012, .33)); P.iou.rotation.set(-Math.PI / 2, 0, .3); };
  const postRon = () => { draws(1, 1, 1, 1); for (const i of [0, 1, 2]) W.reveal(i, 1); whiteTo(2, 1); spoils(); BU.g.visible = false; W.chairs[3].rotation.x = -1.35; };
  // 役満の名乗り（1人ぶん 2.55秒）
  function yaku(V, t, t0, seat, nk, ck, yk, pts, oya, prev) {
    const dt = t - t0; if (dt < 0 || dt >= 2.55) return; const c = W.seatC[seat], hc = sp(seat, 0, .93, .9), cp = sp(seat, .12, 1.42, -.42);
    cam(V, t, [cp.x, cp.y, cp.z], [hc.x, hc.y, hc.z], .5, .62); W.shake = .012 * (1 - K(dt, .2, .6)) * (dt > .2 ? 1 : 0);
    const k = eo(K(dt, .1, .4)); c.hR.lerp(V3(.3, 1.32, .2), k); c.hL.lerp(V3(-.3, 1.32, .2), k); c.mo = .9; c.es = 1.15; c.br = -.25; c.hp = -.2; c.st = .25 * k;
    whiteTo(seat, eo(K(dt, .25, .6)), prev);
    D(V, () => {
      const g = V.g, w = V.w, h = V.h, u = V.u, a = Math.min(K(dt, 0, .15), K(2.55 - dt, 0, .15)), nm = V.T(nk), cap = V.T(ck);
      g.save(); g.globalAlpha = a; const gd = g.createLinearGradient(0, 0, 0, h * .36); gd.addColorStop(0, 'rgba(20,7,0,.8)'); gd.addColorStop(1, 'rgba(20,7,0,0)'); g.fillStyle = gd; g.fillRect(0, 0, w, h * .36); const g2 = g.createLinearGradient(0, h * .6, 0, h); g2.addColorStop(0, 'rgba(20,7,0,0)'); g2.addColorStop(.35, 'rgba(20,7,0,.72)'); g2.addColorStop(1, 'rgba(20,7,0,.8)'); g.fillStyle = g2; g.fillRect(0, h * .6, w, h * .4); g.restore();
      FX.rays(g, w / 2, h * .17, Math.max(w, h) * .6, t, oya ? '#ff9d00' : '#ffd84a', a * .2, 18);
      FX.slam(g, dt - .2, nm, w / 2, h * .155, u * 100, '#ffe27a', '#5a1a00', { fam: FX.SERIF, maxW: w * .92, sh: '#ff8a00', sw: .15 });
      if (dt > .5) FX.txt(g, cap, w / 2, h * .155 + u * 72, FX.fit(g, cap, u * 21, w * .9), '#fff', '#5a1a00', u * 5);
      FX.handRow(g, atlas, HANDS[seat], w / 2, h * .76, Math.min(w * .96, u * 440), { k: K(dt, .35, 1.3), win: 31, maxT: u * 36 });
      FX.slam(g, dt - 1.0, (oya ? V.T('oya') + '・' : '') + V.T(yk) + '　' + V.T('pt', { n: pts.toLocaleString('en-US') }), w / 2, h * .76 + u * 58, u * 31, '#fff', oya ? '#c4201c' : '#1b2a4a', { maxW: w * .93 });
    });
  }
  const yakuSfx = (t0, v = 1) => [[t0, 'whoosh'], [t0 + .2, 'fan', v], [t0 + .2, 'slam', .8], [t0 + 1.0, 'drum', v]];
  const A = { e: {} };

  // ===== はじめのムービー（自分→部下→女同僚→部長の順にツモ） =====
  A.movie = {
    len: 15.6, sfx: [[.3, 'low', 2.5, 1], [3.38, 'clack'], [4.2, 'clack', 1.2], [5.78, 'clack'], [6.6, 'clack', 1.2], [8.18, 'clack'], [9.0, 'clack', 1.2], [9.9, 'heart'], [10.7, 'heart'], [11.5, 'heart'], [12.3, 'low', 3, 1], [13.0, 'gong'], [13.25, 'clack'], [14.2, 'zap'], [14.25, 'slam', .9]],
    run(t, V) {
      idle(t); const d = [K(t, 2.7, 4.2), K(t, 5.1, 6.6), K(t, 7.5, 9.0), K(t, 12.7, 13.9) * .5]; draws(...d); d.forEach((x, i) => follow(i, i === 3 ? x * 2 * .45 : x));
      if (t >= 13.9) holdTile(t);
      bars(V); const left = 4 - d.filter(x => x > .02).length;
      if (t < 2.6) { cam(V, t, mix([1.7, 2.9, 2.7], [1.0, 2.5, 3.0], t / 2.6), [0, .8, 0], 1.15, 1.0); sub(V, t, .3, 2.6, 'm_cap'); }
      else if (t < 5.0) { cam(V, t, [.6, 1.75, 2.0], [0, .86, .25], .52, .5); say(V, t, 3.1, 5.0, SF, 'm_self', { think: 1 }); row(V, t, 3.0, 5.0, HANDS[0], { hi: [31, 32, 33] }); nerv(t, K(t, 3, 3.4), [SF]); }
      else if (t < 7.4) { cam(V, t, [-.3, 1.5, .5], [.78, 1.0, 0], .52, .5); say(V, t, 5.5, 7.4, BK, 'm_buka', { think: 1 }); row(V, t, 5.4, 7.4, HANDS[1]); nerv(t, K(t, 5.4, 5.8), [BK]); }
      else if (t < 9.8) { cam(V, t, [.32, 1.5, .4], [0, 1.0, -.78], .52, .5); say(V, t, 7.9, 9.8, ON, 'm_onna', { think: 1 }); row(V, t, 7.8, 9.8, HANDS[2]); nerv(t, K(t, 7.8, 8.2), [ON]); }
      else if (t < 12.2) { cam(V, t, [0, 2.95, 2.25], [0, .9, -.1], .98, 1.1); nerv(t, 1); TRI.forEach((c, i) => { say(V, t, 9.95 + i * .25, 12.2, c, 'm_haku', { think: 1, px: 15 }); mk(V, 'sweat', c, 22, 0, 16, t + i * .3); }); sub(V, t, 10.6, 12.2, 'm_all'); }
      else { cam(V, t, mix([.6, 1.5, .45], [.35, 1.4, .35], K(t, 12.2, 15.6)), [-.8, 1.02, 0], .55, .52); BU.es = 1 + .1 * K(t, 13.9, 14.2); slamT(V, t, 13.0, 'm_hai', .5, .2, 86, '#ffe27a', '#3a1400', { fam: FX.SERIF, hold: 1.6, sh: '#ff8a00' }); sub(V, t, 12.3, 14.0, 'm_draw');
        if (t >= 14.2) { const k = t - 14.2; dark(V, .6 * K(k, 0, .15)); flashT(V, t, 14.2, .3); D(V, () => { const g = V.g, u = V.u; FX.rays(g, V.w / 2, V.h * .45, V.h, t, '#ffffff', .12, 14); FX.tile(g, atlas, 31, V.w / 2, V.h * .45, u * 130 * eb(K(k, 0, .3)), { glow: '#ffffff', rot: Math.sin(t * 2) * .04 }); }); TRI.forEach((c, i) => D(V, () => FX.slam(V.g, k - .35 - i * .12, '！', V.w * (.24 + i * .26), V.h * .72, V.u * 70, '#ff4a3a', '#fff', { rot: (i - 1) * .2 }))); } }
      D(V, () => FX.pill(V.g, V.T('left', { n: left }), V.w / 2, V.h * .055 + V.u * 22, V.u * 13, 'rgba(10,14,30,.8)', left ? '#fff' : '#ff7a6a'));
    }
  };
  // ===== 部長が白を持って迷う3秒 =====
  A.hes = {
    len: 3.2, sfx: [[.1, 'heart'], [.9, 'heart'], [1.7, 'heart'], [2.5, 'heart', 1.3]],
    run(t, V) { idle(t); draws(1, 1, 1, 0); holdTile(t); camDV(V, t); nerv(t, 1); TRI.forEach((c, i) => mk(V, 'sweat', c, 18, -4, 13, t + i * .3)); tags(V); hud(V); say(V, t, .15, 1.9, BU, 'h_bu1'); say(V, t, 2.1, 3.4, BU, 'h_bu2'); }
  };
  // ===== 白が切られた。ロンの5秒 =====
  const whitePop = (V, t) => D(V, () => { const p = W.pj(W.dr[3].m.position), u = V.u, y = p.y - u * (34 + Math.sin(t * 5) * 3); const g = V.g; g.save(); g.strokeStyle = '#ff4a3a'; g.lineWidth = u * 2.5; g.globalAlpha = .5 + .5 * Math.sin(t * 9); g.beginPath(); g.arc(p.x, p.y, u * (9 + (t * 22) % 14), 0, 7); g.stroke(); g.restore(); FX.tile(g, atlas, 31, p.x, y, u * 34, { glow: '#ff4a3a' }); g.fillStyle = '#ff4a3a'; g.beginPath(); g.moveTo(p.x - u * 6, y + u * 26); g.lineTo(p.x + u * 6, y + u * 26); g.lineTo(p.x, y + u * 33); g.fill(); });
  const discard = (t, a = 0, b = .45) => { const k = ez(K(t, a, b)), o = W.dr[3], m = o.m; m.position.lerpVectors(HOLD(a), o.pR, k); m.position.y += Math.sin(k * Math.PI) * .08; m.quaternion.slerpQuaternions(o.qH, o.qR, k); if (k < 1) { BU.reach('R', m.position.clone().add(V3(0, .04, 0)), 1); BU.ln = .22; } };
  A.dec = {
    len: 5.6, sfx: [[.43, 'clack', 1.6], [.46, 'zap', .7], [1.2, 'heart'], [2.2, 'heart'], [3.2, 'heart', 1.2], [4.0, 'heart', 1.3], [4.6, 'heart', 1.4], [5.1, 'heart', 1.5]],
    run(t, V) { idle(t); draws(1, 1, 1, 0); discard(t); cam(V, t, DVP, DVL, lerp(.98, .9, ez(K(t, .6, 5.6))), lerp(1.5, 1.4, ez(K(t, .6, 5.6)))); { const a = K(t, 3.4, 5.6) * (.55 + .45 * Math.sin(t * 9)); if (a > 0) D(V, () => { const g = V.g, r = Math.hypot(V.w, V.h) / 2, gr = g.createRadialGradient(V.w / 2, V.h / 2, r * .32, V.w / 2, V.h / 2, r); gr.addColorStop(0, 'rgba(255,40,30,0)'); gr.addColorStop(1, 'rgba(255,40,30,' + (.8 * a).toFixed(3) + ')'); g.fillStyle = gr; g.fillRect(0, 0, V.w, V.h); }); } const k = K(t, .4, .6); TRI.forEach(c => shock(c, k * .8)); if (t > .45) { whitePop(V, t); TRI.forEach((c, i) => D(V, () => { const p = hpos(c, .3); FX.slam(V.g, t - .5 - i * .08, '！', p.x + V.u * 20, p.y, V.u * 30, '#ff4a3a', '#fff', {}); })); } flashT(V, t, .43, .2, '#fff', .5); tags(V); hud(V); say(V, t, .1, 1.2, BU, 'd_bu'); }
  };

  // ===== ロン！（3人で役満 → 部長が泣く → 連れていかれる → 「クビだからな」） =====
  { const coins = []; for (let i = 0; i < 42; i++)coins.push([11.0 + i * .085, 'coin', 1 + (i % 8) * .05, .7]);
    A.ron = {
      len: 22.8, clip: [0, 22.2],
      sfx: [[0, 'ron', 1], [.55, 'ron', 1.12], [1.1, 'ron', 1.26], [1.75, 'pop'], [2.15, 'slam', 1.2], [2.15, 'gong'], ...yakuSfx(2.9), ...yakuSfx(5.45), ...yakuSfx(8.0, 1.25), [9.0, 'chime'], ...coins, [11.9, 'buzz'], [11.9, 'slam', .9], [12.4, 'whoosh'], [12.9, 'whoosh'], [13.4, 'whoosh'], [13.5, 'pop'], [13.75, 'whoosh'], [14.0, 'whoosh'], [14.3, 'slam'], [14.7, 'sad'], [15.3, 'cry', 1.9], [15.5, 'thud', .6], [15.9, 'thud', .6], [16.3, 'thud', .6], [16.7, 'thud', .6], [17.5, 'door', .6], [17.7, 'step'], [17.95, 'step'], [18.2, 'step'], [18.7, 'cry', 1.0, .7], [19.0, 'step'], [19.3, 'step'], [19.6, 'step'], [20.0, 'slam', 1.3], [20.0, 'buzz'], [21.4, 'door', 1.4]],
      run(t, V) {
        idle(t); draws(1, 1, 1, 1); const up = 1 - K(t, 2.5, 2.9);
        ronUp(SF, t, 0, up); ronUp(BK, t, .55, up); ronUp(ON, t, 1.1, up);
        if (t >= 2.9) W.reveal(0, K(t, 2.95, 3.7)); if (t >= 5.45) W.reveal(1, K(t, 5.5, 6.25)); if (t >= 8.0) W.reveal(2, K(t, 8.05, 8.8));
        if (t >= 5.45 && t < 8.0) whiteTo(0, 1); else if (t >= 8.0 && t < 10.55) whiteTo(1, 1); else if (t >= 10.55) whiteTo(2, 1);
        if (t < 1.7) { camDV(V, t); W.shake = .03 * Math.max(0, 1 - ((t % .55) / .3)); shock(BU, K(t, .1, .3)); tags(V);
          slamT(V, t, 0, 'ron', .5, .72, 110, '#ff3b30', '#fff', { hold: 1.7 }); slamT(V, t, .55, 'ron', .78, .46, 92, '#ffb300', '#fff', { hold: 1.15, rot: .12 }); slamT(V, t, 1.1, 'ron', .5, .2, 92, '#ff3ea5', '#fff', { hold: .6, rot: -.08 }); flashT(V, t, 0, .2); flashT(V, t, .55, .15); flashT(V, t, 1.1, .15); D(V, () => { const g = V.g; for (let i = 0; i < 3; i++) { const dt = t - i * .55; if (dt > 0 && dt < .5) { g.save(); g.strokeStyle = 'rgba(255,255,255,' + (1 - dt / .5) + ')'; g.lineWidth = V.u * 6; g.beginPath(); g.arc(V.w * [.5, .78, .5][i], V.h * [.72, .46, .2][i], dt * V.w * 1.6, 0, 7); g.stroke(); g.restore(); } } }); }
        else if (t < 2.9) { cam(V, t, [.25, 1.32, .38], [-.86, 1.16, 0], .42, .4); shock(BU, 1); BU.hy = Math.sin(t * 30) * .05; mk(V, 'sweat', BU, 46, 6, 22, t); say(V, t, 1.75, 2.9, BU, 'bu_e', { px: 22 }); W.shake = t > 2.15 ? .02 * (1 - K(t, 2.15, 2.6)) : 0; slamT(V, t, 2.15, 'tri', .5, .78, 64, '#fff', '#c4201c', { sh: '#ff3b30' }); flashT(V, t, 2.15, .3); }
        else if (t < 5.45) yaku(V, t, 2.9, 0, 'y1', 'y1c', 'yk', 32000, 0, W.dr[3].pR);
        else if (t < 8.0) yaku(V, t, 5.45, 1, 'y2', 'y2c', 'yk', 32000, 0, sp(0, 7.7 * TW, TY + TD / 2, .475 - TH * .5));
        else if (t < 10.55) { yaku(V, t, 8.0, 2, 'y3', 'y3c', 'yk2', 96000, 1, sp(1, 7.7 * TW, TY + TD / 2, .475 - TH * .5)); flashT(V, t, 9.0, .3, '#ffe27a', .6); }
        else if (t < 15.2) { // 支払い：点棒が飛び、身ぐるみはがされる
          const k = K(t, 10.55, 15.2); cam(V, t, mix([1.6, 2.4, 2.3], [1.0, 1.95, 1.85], ez(k)), [-.25, .92, 0], 1.12, 1.0);
          W.flySticks(t, 11.0, .022); const P = W.props, ch = BU.g.position.clone().add(V3(.2, 1.0, 0));
          W.arc(P.wallet, t, 12.4, .6, ch, sp(0, -.2, TY + .03, .36), .7); W.arc(P.watch, t, 12.9, .6, ch, sp(1, .1, TY + .02, .36), .7);
          const wk = W.arc(P.wig, t, 13.4, .7, BU.g.position.clone().add(V3(0, 1.4, 0)), sp(2, -.22, TY, .34), .9, 5); if (t >= 13.4) BU.wig.visible = false; W.arc(P.iou, t, 14.0, .6, ch, sp(2, .18, TY + .012, .33), .6, 4); W.arc(P.jacket, t, 13.75, .65, BU.g.position.clone().add(V3(0, .85, 0)), sp(1, -.2, TY + .05, .33), .8, 6);
          const sc = Math.round(lerp(25000, -135000, ez(K(t, 11.0, 14.6))) / 100) * 100; shock(BU, 1); BU.wh = ez(K(t, 12.2, 14.6)); BU.hp = -.3 * K(t, 13, 14.6); BU.hL.y += Math.sin(t * 18) * .04; BU.hR.set(.22, 1.05 + Math.sin(t * 16) * .06, .38);
          TRI.forEach((c, i) => { smile(c, 1); c.hL.set(-.2, .95 + Math.abs(Math.sin(t * 7 + i)) * .12, .34); c.hR.set(.2, .95 + Math.abs(Math.cos(t * 7 + i)) * .12, .34); });
          D(V, () => { const g = V.g, u = V.u, p = hpos(BU, .32); const s = num(sc); const px = u * (30 + (sc < 0 ? 8 : 0)); FX.txt(g, s, cl(p.x, u * 90, V.w - u * 90) + (sc < 0 ? Math.sin(t * 50) * u * 2 : 0), Math.max(u * 40, p.y), px, sc < 0 ? '#ff4a3a' : '#fff', '#16192e', px * .26); if (t >= 13.4 && t < 14.6) { const q = hpos(BU, .16); FX.mark(g, 'spark', q.x - u * 16, q.y, u * 26 * (1 + .3 * Math.sin(t * 20)), t); FX.mark(g, 'spark', q.x + u * 14, q.y - u * 10, u * 16, t); } if (t >= 14.4) { const q = hpos(BU, .25 + (t - 14.4) * .5); g.globalAlpha = cl(1.6 - (t - 14.4) * 1.6); FX.mark(g, 'soul', q.x + u * 10, q.y, u * 34, t); g.globalAlpha = 1; } });
          slamT(V, t, 14.3, '#' + V.T('pay') + '　' + V.T('pt', { n: '160,000' }), .5, .13, 34, '#fff', '#c4201c', {});
          D(V, () => { const g = V.g, u = V.u, gk = ez(K(t, 11.0, 14.6)); [[SF, 32000], [BK, 32000], [ON, 96000]].forEach(([c, n]) => { const p = hpos(c, .3), s = '+' + num(Math.round(n * gk / 100) * 100); FX.txt(g, s, cl(p.x, u * 70, V.w - u * 70), Math.max(u * 30, p.y - Math.abs(Math.sin(t * 9)) * u * 4), u * (n > 50000 ? 26 : 21), '#ffe27a', '#5a1a00', u * 6); });
            const it = V.T('items'), ps = [[P.wallet, 12.4], [P.watch, 12.9], [P.wig, 13.4], [P.jacket, 13.75], [P.iou, 14.0]]; ps.forEach(([m, t0], i) => { const dt = t - t0; if (dt < 0 || dt > 1.1) return; const p = W.pj(m.position); FX.pill(g, it[i], p.x, p.y - u * 22, u * 13, '#fff', '#c4201c', { line: '#c4201c', a: cl((1.1 - dt) * 4) }); }); });
          slamT(V, t, 11.9, 'tobi', .5, .13, 60, '#ff3b30', '#fff', { hold: 1.3, rot: -.06, sh: '#7a0000' }); flashT(V, t, 11.9, .2, '#ff3b30', .35);
        }
        else if (t < 17.4) { cam(V, t, [.2, 1.3, .42], [-.88, 1.12, 0], .46, .44); spoils(); BU.wig.visible = false; BU.wh = 1; cryP(BU, t, 1); BU.ln = .25; BU.hL.set(-.2, .8 + Math.abs(Math.sin(t * 7.8)) * .3, .36); BU.hR.set(.2, .8 + Math.abs(Math.cos(t * 7.8)) * .3, .36); W.TBL.position.y = Math.abs(Math.sin(t * 15.6)) * .006; W.shake = .006; slamT(V, t, 15.3, 'bu_cry', .5, .2, 60, '#6ec6ff', '#16304a', { jit: V.u * 2.5 }); }
        else if (t < 19.8) { cam(V, t, [1.5, 1.9, 2.1], [-1.0, 1.0, -.9], 1.2, 1.0); spoils(); BU.wig.visible = false; BU.wh = 1; W.door.rotation.y = -1.75 * ez(K(t, 17.4, 17.8));
          ST.g.visible = true; const dk = K(t, 18.6, 19.8); if (t < 18.6) walk(ST, t, 17.5, 18.4, V3(-1.3, 0, -2.7), V3(-1.42, 0, -.42), SEATP[3]); else walk(ST, t, 18.6, 19.8, V3(-1.42, 0, -.42), V3(-1.3, 0, -2.45));
          say(V, t, 17.9, 19.7, ST, 'st1', { px: 14 }); cryP(BU, t, 1);
          if (dk > 0) { BU.g.position.lerpVectors(SEATP[3], V3(-1.3, 0, -1.9), ez(dk)); BU.g.rotation.y = lerp(Math.PI * 1.5, Math.PI * 2, ez(K(dk, 0, .4))); BU.st = 1; BU.ln = -.3; BU.hL.set(-.35, 1.3 + Math.sin(t * 20) * .15, .3); BU.hR.set(.35, 1.3 + Math.cos(t * 20) * .15, .3); BU.by = Math.abs(Math.sin(t * 12)) * .03; W.chairs[3].rotation.x = -1.35 * K(dk, 0, .2); ST.reach('L', BU.g.position.clone().add(V3(-.1, 1.1, -.1)), 1); ST.reach('R', BU.g.position.clone().add(V3(.1, 1.1, -.1)), 1); }
          TRI.forEach(c => { c.hy = c === SF ? .5 : c === ON ? -.4 : 0; }); }
        else if (t < 21.8) { cam(V, t, mix([.4, 1.5, .3], [.1, 1.42, -.1], K(t, 19.8, 21.2)), [-1.3, 1.25, -1.95], .66, .62); spoils(); W.chairs[3].rotation.x = -1.35; BU.wig.visible = false; BU.wh = 1;
          const out = ez(K(t, 21.15, 21.4)); W.door.rotation.y = -1.75 * (1 - ez(K(t, 21.2, 21.42))); BU.g.position.set(-1.3, 0, -1.9 - out * .9); BU.g.rotation.y = 0; BU.st = 1; angry(BU, 1, t); BU.ln = .15; BU.hR.set(.12, 1.42, .55); W.cry(BU, t, .6); BU.g.visible = out < 1;
          ST.g.visible = out < 1; ST.g.position.set(-1.3, 0, -2.5 - out * .5); ST.g.rotation.y = 0; ST.reach('L', BU.g.position.clone().add(V3(-.12, 1.15, -.1)), 1); ST.reach('R', BU.g.position.clone().add(V3(.12, 1.15, -.1)), 1);
          if (out < 1) { mk(V, 'anger', BU, -40, -10, 30, t); } slamT(V, t, 20.0, 'bu_fire', .5, .2, 54, '#ff3b30', '#fff', { hold: 1.5, jit: V.u * 1.5, sw: .3 }); W.shake = t > 21.4 ? .03 * (1 - K(t, 21.4, 21.8)) : t > 20 && t < 20.4 ? .015 : 0; flashT(V, t, 20.0, .2, '#ff3b30', .4); }
        else { camDV(V, t); postRon(); TRI.forEach((c, i) => { say(V, t, 22.0 + i * .15, 99, c, 'dots', { px: 14 }); c.es = 1.1; }); }
      }
    };
  }
  // ===== 「終わる」を押さずに待つ（wt：待った秒） =====
  A.wait = { len: 1e9, sfx: [], run(t, V) { idle(t); camDV(V, t); postRon(); if (t > 32) { const r = cl((t - 32) / 22); if (Math.floor(t * .5) % 3 === 0) W.door.rotation.y = -Math.abs(Math.sin(t * 31)) * .03 * r; if (t > 38 && t <= 50 && (t % 5) < 1.3) TRI.forEach(c => { c.hy = c === SF ? .7 : c === BK ? .2 : -.5; c.es = 1.1; }); } TRI.forEach((c, i) => { if (((t + i * 2) % 7) < 3) say(V, t, 0, 1e9, c, 'dots', { px: 14 }); c.hp = .12; }); if (t > 50) { W.dglass.material.color.set(Math.floor(t * 3) % 2 ? 0xff5a5a : 0x5a7aff); nerv(t, K(t, 50, 53)); TRI.forEach(c => { c.hy = c === SF ? .7 : c === BK ? 0 : -.5; }); } } };
  // ===== 逮捕（プレミアム） =====
  A.arrest = {
    len: 11.6, clip: [0, 11.4],
    sfx: [[0, 'door', 1.5], [0, 'siren', 11, .5], [.5, 'slam', 1], [1.4, 'slam', 1.3], [1.4, 'buzz'], [2.6, 'pop'], [4.6, 'thud', .7], [5.4, 'cuff'], [5.75, 'cuff'], [6.1, 'cuff'], [6.6, 'step'], [7.0, 'step'], [7.4, 'step'], [7.8, 'step'], [8.2, 'step'], [8.6, 'step'], [9.0, 'laugh', .8], [9.6, 'slam', 1.6], [9.6, 'gong', 1.2]],
    run(t, V) {
      idle(t); postRon(); W.chairs[3].rotation.x = -1.35; W.door.rotation.y = -1.75 * eo(K(t, 0, .18)); const lit = Math.floor(t * 3.2) % 2;
      BU.g.visible = ST.g.visible = P1.g.visible = P2.g.visible = true; BU.wig.visible = false; BU.st = 1; BU.g.rotation.y = 0; ST.g.rotation.y = P1.g.rotation.y = P2.g.rotation.y = 0;
      const inK = eo(K(t, .05, .5)); BU.g.position.set(-1.3, 0, -2.5 + inK * .8); P1.g.position.set(-.82, 0, -2.75 + inK * .85); P2.g.position.set(-1.8, 0, -2.75 + inK * .85); ST.g.position.set(-1.3, 0, -3.1 + inK * .7);
      if (t < 6.4) { BU.hR.set(.1, 1.4, .58); BU.ln = .12; angry(BU, 1, t); BU.br = t < 2.2 ? .5 : -.5; if (t < 2.2) W.cry(BU, t, .7); }
      TRI.forEach(c => shock(c, K(t, .1, .4) * (t < 6.4 ? 1 : .3)));
      if (t < 2.2) { cam(V, t, mix([.7, 1.65, 1.1], [.45, 1.55, .7], K(t, 0, 2.2)), [-1.3, 1.15, -1.9], .95, .8); W.shake = .03 * (1 - K(t, 0, .4)); flashT(V, t, 0, .3); slamT(V, t, .5, 'a_bu1', .5, .17, 56, '#fff', '#c4201c', { hold: .9 }); slamT(V, t, 1.4, 'a_bu2', .5, .19, 50, '#ffe27a', '#c4201c', { jit: V.u * 2, sh: '#7a0000' }); }
      else if (t < 4.4) { cam(V, t, [-1.25, 1.75, -.75], [.25, 1.05, .35], .98, .85); say(V, t, 2.6, 4.4, SF, 'a_sf', { px: 20 }); TRI.forEach((c, i) => { mk(V, 'sweat', c, 20, 0, 16, t + i); c.hy = 0; c.hL.set(-.25, 1.2, .2); c.hR.set(.25, 1.2, .2); c.hr = Math.sin(t * 22) * .08; }); }
      else if (t < 6.4) { const k = ez(K(t, 4.4, 5.0)); P1.g.position.set(-.82 + k * .25, 0, -1.9 + k * .75); cam(V, t, [.3, 1.5, .75], [-.75, 1.22, -1.2], .6, .58); say(V, t, 4.7, 6.4, P1, 'a_pol', { px: 19 }); P1.hR.set(.1, 1.3, .45); [5.4, 5.75, 6.1].forEach((s, i) => D(V, () => { const dt = t - s; if (dt < 0 || dt > .5) return; FX.mark(V.g, 'cuff', V.w * (.3 + i * .2), V.h * .7, V.u * 60 * (1.4 - dt * .8), t); })); }
      else { const k = K(t, 6.4, 9.4); cam(V, t, [1.7, 2.1, 1.7], [-.75, .95, -1.0], 1.3, 1.05); const line = [P1, BK, ON, SF, P2], q = V3(-1.3, 0, -1.15), dr = V3(-1.3, 0, -3.2);
        line.forEach((c, i) => { const st = c === P1 ? V3(-.57, 0, -1.15) : c === P2 ? V3(-1.8, 0, -1.9) : SEATP[[SF, BK, ON].indexOf(c)]; const a = 6.4 + i * .28, u1 = K(t, a, a + 1.1), u2 = K(t, a + 1.1, a + 2.3); c.st = c === P1 || c === P2 ? 1 : eo(K(t, a - .2, a + .1)); if (u2 > 0) c.g.position.lerpVectors(q, dr, u2); else c.g.position.lerpVectors(st, q, ez(u1)); if (u1 > 0) { c.face(u2 > 0 ? dr : q); c.by = Math.abs(Math.sin(t * 10 + i)) * .03; } if (c !== P1 && c !== P2) { c.hL.set(-.05, .98, .26); c.hR.set(.05, .98, .26); c.hp = .4; c.br = .5; c.ey = .5; c.mo = 0; } c.g.visible = u2 < .98; });
        BU.g.position.set(-.55, 0, -1.9); BU.g.rotation.y = .5; BU.br = 0; smile(BU, 1); BU.hR.set(.3, 1.45 + Math.sin(t * 9) * .08, .3); const hk = W.props.hanky; hk.visible = true; W.post.push(() => { hk.position.copy(BU.g.position).add(V3(.36, 1.62 + Math.sin(t * 9) * .08, .28)); hk.rotation.set(0, .5, Math.sin(t * 9) * .5); });
        ST.g.position.set(-2.05, 0, -1.2); ST.g.rotation.y = 1.2; }
      dark(V, .13, lit ? '#ff2a2a' : '#2a4aff');
      if (t >= 9.6) { dark(V, .35 * K(t, 9.6, 9.8)); flashT(V, t, 9.6, .25); stampT(V, t, 9.6, 's_ar', .5, .42, 120, '#d8201a', -.14); W.shake = .03 * (1 - K(t, 9.6, 10)); }
    }
  };

  // ===== 2 見逃し =====
  A.e[2] = {
    len: 10, sfx: [[.2, 'ron', 1.12], [.7, 'ron', 1.26], [1.3, 'fan'], [1.3, 'slam'], [2.2, 'drum'], [3.3, 'cry', 1.2], [4.8, 'pop'], [7.2, 'slam', 1.2], [7.2, 'chime'], [8.6, 'slam'], [8.9, 'slam'], [8.9, 'buzz']],
    run(t, V) {
      idle(t); draws(1, 1, 1, 1); const up = 1 - K(t, 1.1, 1.4); ronUp(BK, t, .2, up); ronUp(ON, t, .7, up); if (t > 1.3) { W.reveal(1, K(t, 1.3, 2)); W.reveal(2, K(t, 1.3, 2)); }
      const sc = Math.round(lerp(25000, -103000, ez(K(t, 1.6, 3.2))) / 100) * 100;
      if (t < 1.3) { camDV(V, t); shock(BU, K(t, .2, .4)); nerv(t, 1, [SF]); slamT(V, t, .2, 'ron', .78, .46, 92, '#ffb300', '#fff', { hold: 1.1, rot: .12 }); slamT(V, t, .7, 'ron', .5, .2, 92, '#ff3ea5', '#fff', { hold: .6, rot: -.08 }); flashT(V, t, .2, .15); flashT(V, t, .7, .15); W.shake = .02; tags(V); hud(V); }
      else if (t < 3.3) { cam(V, t, [1.3, 2.3, 2.0], [-.2, .9, 0], 1.1, 1.0); shock(BU, 1); W.flySticks(t, 1.6, .012, 120); D(V, () => { const g = V.g, w = V.w, h = V.h, u = V.u, dt = t - 1.3; FX.band(g, w, h * .2, u * 150, 'rgba(20,7,0,.7)', K(dt, 0, .2)); FX.slam(g, dt, V.T('y2'), w * .5, h * .155, u * 54, '#ffe27a', '#5a1a00', { fam: FX.SERIF, maxW: w * .9 }); FX.slam(g, dt - .25, V.T('y3'), w * .5, h * .245, u * 54, '#ffe27a', '#5a1a00', { fam: FX.SERIF, maxW: w * .9 }); const p = hpos(BU, .32); FX.txt(g, num(sc), cl(p.x, u * 90, w - u * 90), p.y, u * 34, sc < 0 ? '#ff4a3a' : '#fff', '#16192e', u * 9); }); }
      else if (t < 4.6) { cam(V, t, [.2, 1.3, .42], [-.88, 1.12, 0], .46, .44); W.flySticks(1e3, 0, .02, 120); cryP(BU, t, 1); BU.wh = .6; }
      else if (t < 7.2) { cam(V, t, [1.05, 1.55, 1.75], [-.45, 1.05, .45], .78, .7); W.flySticks(1e3, 0, .02, 120); BU.wh = .6; BU.hy = -.9 * ez(K(t, 4.6, 5.0)); BU.ey = .5; BU.br = .5; BU.mo = .2; W.cry(BU, t, .4); BU.reach('L', SF.g.position.clone().add(V3(-.2, 1.05, 0)), ez(K(t, 5.0, 5.5))); SF.hy = .9 * ez(K(t, 4.8, 5.2)); smile(SF, K(t, 5.6, 6)); mk(V, 'sweat', SF, 22, 0, 16, t); say(V, t, 5.0, 7.2, BU, 'e3_bu', { px: 16 }); }
      else { camDV(V, t); W.flySticks(1e3, 0, .02, 120); BU.wh = .6; BU.ey = .5; smile(SF, 1); SF.hL.set(-.25, 1.35, .1); SF.hR.set(.25, 1.35, .1); stampC(V, t, 7.2, 's_up', SF, 44, '#d89a00', -.12); if (t > 7.2 && t < 8.6) W.confetti(t, 1); shock(BK, K(t, 8.5, 8.7)); shock(ON, K(t, 8.8, 9.0)); stampC(V, t, 8.6, 's_kubi', BK, 36, '#d8201a', .15); stampC(V, t, 8.9, 's_kubi', ON, 36, '#d8201a', -.2); W.shake = t > 8.6 ? .015 * (1 - K(t, 8.9, 9.3)) : 0; }
    }
  };
  // ===== 3 ちゃぶ台返し =====
  A.e[3] = {
    len: 7.6, sfx: [[.1, 'low', .6, 1], [.5, 'whoosh', .5, 1.4], [.5, 'ron', .7], [.9, 'rustle'], [1.2, 'rustle'], [2.15, 'slam', 1.5], [2.2, 'glass', .5], [2.4, 'slam', 1.2], [2.5, 'clack'], [2.7, 'clack'], [2.95, 'clack'], [3.2, 'clack'], [4.2, 'buzz'], [4.2, 'slam']],
    run(t, V) {
      idle(t); draws(1, 1, 1, t < .5 ? 1 : 1); const f = K(t, .5, 2.15), fe = eo(f);
      if (t < .5) { camDV(V, t); SF.st = .5 * eo(K(t, 0, .3)); SF.ln = .5; SF.hL.set(-.3, .68, .32); SF.hR.set(.3, .68, .32); angry(SF, 1, t); W.TBL.position.y = Math.abs(Math.sin(t * 40)) * .008; nerv(t, 1, [BK, ON]); tags(V); }
      else { cam(V, t, mix([1.7, 1.2, 2.3], [1.9, 1.6, 2.5], K(t, .5, 3)), [0, 1.2, -.55], 1.45, 1.2); SF.st = 1; SF.ln = -.2; SF.hL.set(-.3, 1.75, .3); SF.hR.set(.3, 1.75, .3); angry(SF, 1, t);
        { const th = -fe * Math.PI, py = lerp(TY, .07, f) + Math.sin(f * Math.PI) * 1.35, pz = -fe * 1.45; W.TBL.rotation.x = th; W.TBL.position.set(0, py - TY * Math.cos(th), pz - TY * Math.sin(th)); }
        W.TL.forEach((o, i) => { const u = K(t, .5, 2.6 + hash(i) * .8), m = o.m, d = V3(hash(i + 1) - .5, .2 + hash(i + 2), hash(i + 3) - .5).multiplyScalar(2.2 * eo(u)); m.position.add(d); m.rotation.x += u * (6 + hash(i) * 9); m.rotation.z += u * 5; });
        [BK, ON, BU].forEach((c, i) => { shock(c, 1); c.hL.set(-.3, 1.5, .1); c.hR.set(.3, 1.5, .1); c.ln = -.25; });
        W.shake = t > 2.15 ? .04 * (1 - K(t, 2.15, 2.7)) : 0; flashT(V, t, 2.15, .25); stampT(V, t, 2.4, 's_ng', .5, .2, 84, '#1b2a4a', -.08);
        if (t > 4.0) { BU.st = eo(K(t, 4, 4.2)); angry(BU, 1, t); BU.hR.set(.15, 1.5, .5); BU.ln = .2; mk(V, 'anger', BU, -36, -8, 28, t); say(V, t, 4.2, 9, BU, 'e4_bu', { px: 18 }); [SF, BK, ON].forEach(c => { c.st = .3; c.ln = .55 * K(t, 4.6, 5.2); c.hp = .3; c.br = .5; c.mo = 0; c.es = 1; c.hL.set(-.2, .5, .5); c.hR.set(.2, .5, .5); }); }
      }
    }
  };
  // ===== 4 白を食べる =====
  A.e[4] = {
    len: 7.8, sfx: [[.2, 'whoosh', .4], [1.1, 'pop'], [1.8, 'gulp', 1.4], [1.8, 'thud', .5], [3.5, 'slam'], [3.5, 'buzz'], [5.2, 'slam', 1.3], [5.9, 'coin', .7], [6.05, 'coin', .6], [6.2, 'coin', .5], [6.8, 'sad', .7]],
    run(t, V) {
      idle(t); draws(1, 1, 1, 1); const m = W.dr[3].m, mouth = SF.g.position.clone().add(V3(0, 1.2, -.2)), k = ez(K(t, .15, 1.0));
      if (t < 1.8) { m.position.lerp(mouth, k); m.position.y += Math.sin(k * Math.PI) * .15; m.quaternion.slerp(W.dr[0].qH, k); m.scale.setScalar(1 - .9 * K(t, 1.2, 1.7)); SF.reach('R', m.position.clone(), 1); SF.ln = .3 * Math.sin(Math.PI * K(t, 0, .9)); SF.mo = 1.3 * K(t, .7, 1.1); SF.es = 1.2; } else m.visible = false;
      if (t < 3.4) { cam(V, t, mix([-.5, 1.9, -.5], [-.3, 1.4, 0], K(t, 0, 1.2)), [0, 1.18, .88], .46, .44); if (t > 1.8) { SF.mo = 0; SF.ey = .14; SF.mw = .6; SF.by = -.02 * Math.sin(Math.PI * K(t, 1.8, 2.1)); say(V, t, 2.3, 3.4, SF, 'e5_sf', { think: 1 }); } slamT(V, t, 1.8, 'e5_gulp', .5, .78, 70, '#fff', '#1b2a4a', { hold: 1.4 }); }
      else if (t < 5.2) { camDV(V, t); [BK, ON, BU].forEach(c => shock(c, 1)); BK.st = .9; BK.hR.set(.1, 1.35, .6); say(V, t, 3.5, 5.2, BK, 'e5_bk', { px: 17 }); tags(V); SF.ey = .14; }
      else { camDV(V, t); SF.ey = .14; SF.hR.set(.05, .86 + Math.sin(t * 6) * .02, .2); stampT(V, t, 5.2, 's_ch', .5, .3, 80, '#d8201a', -.1); slamT(V, t, 5.9, 'e5_pay', .5, .47, 30, '#fff', '#1b2a4a', {}); W.shake = .02 * (1 - K(t, 5.2, 5.6)); mk(V, 'sweat', SF, 22, 0, 16, t); }
    }
  };
  // ===== 5 部長の海底ツモ =====
  A.e[5] = {
    len: 9.2, sfx: [[.3, 'pop'], [1.8, 'pop'], [3.0, 'slam', 1.4], [3.05, 'fan'], [3.6, 'gong'], [4.5, 'clap'], [4.7, 'clap'], [4.9, 'clap'], [5.1, 'clap'], [5.3, 'clap'], [5.5, 'clap'], [5.7, 'clap'], [5.9, 'clap'], [6.1, 'clap'], [6.3, 'clap'], [6.5, 'clap'], [6.7, 'clap'], [5.0, 'laugh'], [6.2, 'laugh'], [7.2, 'slam', 1.2], [7.2, 'chime']],
    run(t, V) {
      idle(t); draws(1, 1, 1, 0); const m = W.dr[3].m, o = W.dr[3];
      if (t < 3.0) { holdTile(t); camDV(V, t); SF.hy = .8 * ez(K(t, 0, .3)); SF.ln = .2; SF.sd = .2; SF.hL.set(-.35, 1.0, .3); say(V, t, .3, 1.7, SF, 'e6_sf', { px: 16 }); BU.hy = t > 1.6 ? .5 * Math.sin((t - 1.6) * 6) * (1 - K(t, 2.4, 2.8)) : 0; shock(BU, K(t, 2.2, 2.5) * .6); say(V, t, 1.8, 3.0, BU, 'e6_bu', { px: 17 }); nerv(t, 1, [BK, ON]); tags(V); }
      else { const k = eo(K(t, 3.0, 3.15)); m.position.lerpVectors(HOLD(3), sp(3, 7.4 * TW, TY + TD / 2, .44), k); m.quaternion.slerpQuaternions(o.qH, o.qR, k); W.reveal(3, K(t, 3.1, 3.8)); smile(BU, 1); BU.mo = .6 + .4 * Math.sin(t * 12); BU.hp = -.3; BU.by = Math.abs(Math.sin(t * 9)) * .02; BU.hL.set(-.35, 1.4, .1); BU.hR.set(.35, 1.4, .1);
        if (t < 4.5) { cam(V, t, [.3, 1.5, .45], [-.82, 1.05, 0], .56, .52); W.shake = .02 * (1 - K(t, 3, 3.4)); }
        else { cam(V, t, [0, 2.9, 2.3], [0, .9, -.1], .98, 1.1); W.confetti(t, 1); TRI.forEach((c, i) => { clap(c, t + i * .1); c.ey = .16; c.mw = 1.6; c.mo = .2; mk(V, 'sweat', c, 20, 0, 15, t + i * .4); }); say(V, t, 4.6, 6.6, BK, 'e6_c1', { px: 14 }); say(V, t, 5.0, 6.8, ON, 'e6_c2', { px: 14 }); say(V, t, 5.4, 7.0, BU, 'e6_la', { px: 17 }); }
        D(V, () => { const g = V.g, w = V.w, h = V.h, u = V.u, dt = t - 3.0; if (t < 7.1) { FX.rays(g, w / 2, h * .2, h * .6, t, '#ffd84a', .2 * K(dt, 0, .2)); FX.slam(g, dt, V.T('tsumo'), w / 2, h * .16, u * 96, '#ffe27a', '#5a1a00', { fam: FX.SERIF, sh: '#ff8a00', maxW: w * .9 }); FX.slam(g, dt - .55, V.T('e6_bu2'), w / 2, h * .16 + u * 76, u * 30, '#fff', '#c4201c', { maxW: w * .9 }); FX.handRow(g, atlas, HANDS[3], w / 2, h * .86, Math.min(w * .96, u * 440), { k: K(dt, .4, 1.3), win: 31, maxT: u * 34 }); if (dt > 1.4) FX.pill(g, V.T('e6_note'), w / 2, h * .86 - u * 44, u * 13, 'rgba(10,14,30,.85)', '#ff9a8a'); } });
        flashT(V, t, 3.0, .25); stampT(V, t, 7.2, 's_ok', .5, .42, 70, '#d89a00', -.1); }
    }
  };
  // ===== 6 二人の秘密 =====
  A.e[6] = {
    len: 10.2, sfx: [[.3, 'chime', .7], [1.4, 'pop'], [1.5, 'chime'], [2.7, 'ron', 1.12], [3.0, 'fan', .8], [4.3, 'coin'], [4.45, 'coin'], [4.6, 'coin'], [5.0, 'buzz'], [5.2, 'slam'], [6.0, 'whoosh'], [6.4, 'thud'], [7.2, 'step', .6], [7.6, 'step', .6], [8.0, 'step', .6], [8.4, 'step', .6], [8.0, 'chime'], [9.2, 'pop']],
    run(t, V) {
      idle(t); draws(1, 1, 1, 1); const hearts = (n, t0) => D(V, () => { const a = hpos(ON, .1), b = hpos(SF, .1); for (let i = 0; i < n; i++) { const ph = ((t - t0) * .5 + i / n) % 1; if (t < t0) continue; const src = i % 2 ? a : b; V.g.globalAlpha = 1 - ph; FX.mark(V.g, 'heart', src.x + Math.sin(i * 3 + t * 2) * V.u * 26, src.y - ph * V.u * 90, V.u * (14 + i % 3 * 5), t); V.g.globalAlpha = 1; } });
      if (t < 2.6) { cam(V, t, mix([.4, 1.5, .1], [.25, 1.4, -.1], K(t, 0, 2.6)), [0, 1.1, -.86], .5, .46); ON.es = 1 + .4 * K(t, .2, .4) * (1 - K(t, 1.2, 1.4)); if (t > 1.4) { smile(ON, 1); ON.hr = .15; } ON.hR.lerp(V3(.02, 1.12, .2), ez(K(t, 1.4, 1.7))); say(V, t, 1.5, 2.6, ON, 'dots', { px: 15 }); D(V, () => { if (t > 1.45 && t < 2.6) { const p = hpos(ON, 0); FX.mark(V.g, 'heart', p.x + V.u * 60, p.y - V.u * 20, V.u * 40 * eb(K(t, 1.45, 1.8)), t); } }); sub(V, t, .4, 2.6, 'e7_two'); SF.hR.lerp(V3(.02, 1.14, .2), ez(K(t, .6, .9))); }
      else if (t < 4.2) { cam(V, t, [-.35, 1.5, .45], [.8, 1.05, 0], .56, .52); ronUp(BK, t, 2.7, 1 - K(t, 3.9, 4.2)); W.reveal(1, K(t, 3.0, 3.7)); whiteTo(1, eo(K(t, 3.1, 3.4)), W.dr[3].pR); slamT(V, t, 2.7, 'ron', .5, .74, 96, '#ffb300', '#fff', { hold: .7 }); D(V, () => { const dt = t - 3.0, g = V.g, w = V.w, h = V.h, u = V.u; if (dt < 0) return; FX.rays(g, w / 2, h * .2, h * .6, t, '#ffd84a', .2); FX.slam(g, dt, V.T('y2'), w / 2, h * .18, u * 84, '#ffe27a', '#5a1a00', { fam: FX.SERIF, maxW: w * .92, sh: '#ff8a00' }); FX.slam(g, dt - .5, V.T('yk') + '　' + V.T('pt', { n: '32,000' }), w / 2, h * .18 + u * 70, u * 28, '#fff', '#1b2a4a', { maxW: w * .9 }); }); flashT(V, t, 2.7, .15); }
      else if (t < 7.0) { W.reveal(1, 1); whiteTo(1, 1); cam(V, t, [0, 2.9, 2.3], [0, .9, -.1], .98, 1.1); const sc = Math.round(lerp(25000, -7000, ez(K(t, 4.3, 5.0))) / 100) * 100; tags(V, sc); angry(BU, K(t, 4.8, 5.0), t); BU.hy = -.0; BU.hR.lerp(V3(.15, 1.3, .55), ez(K(t, 4.9, 5.2))); say(V, t, 5.0, 6.6, BU, 'e7_bu', { px: 17 }); mk(V, 'anger', BU, -34, -8, 24, t); shock(BK, K(t, 5.0, 5.2)); stampC(V, t, 5.2, 's_kubi', BK, 38, '#d8201a', .15);
        const f = ei(K(t, 6.0, 6.5)); BK.g.rotation.x = -1.4 * f; BK.g.position.y = -.1 * f; W.chairs[1].rotation.x = -1.35 * f; smile(SF, 1); smile(ON, 1); hearts(4, 5.4); }
      else { W.reveal(1, 1); whiteTo(1, 1); BK.g.visible = false; W.chairs[1].rotation.x = -1.35; cam(V, t, [1.4, 1.8, 1.9], [-.75, 1.0, -1.2], 1.15, 1.0); const k = K(t, 7.0, 9.0), tgt = V3(-1.15, 0, -1.75); W.door.rotation.y = -1.75 * ez(K(t, 7.6, 8.2));
        walk(SF, t, 7.0, 9.0, SEATP[0], tgt.clone().add(V3(.32, 0, .1))); walk(ON, t, 7.0, 9.0, SEATP[2], tgt.clone().add(V3(-.05, 0, .0))); SF.st = ON.st = eo(K(t, 7, 7.2)); smile(SF, 1); smile(ON, 1); hearts(8, 7.2); BU.ey = .5; BU.br = .5; BU.hp = .3;
        D(V, () => { const p = W.pj(tgt.clone().add(V3(.15, 1.15, 0))); FX.iris(V.g, V.w, V.h, p.x, p.y, Math.max(V.w, V.h) * (1.1 - ez(K(t, 8.6, 9.6)) * .98)); }); }
    }
  };
  // ===== 7 落としましたよ =====
  A.e[7] = {
    len: 9.2, sfx: [[.3, 'whoosh', .5], [1.3, 'pop'], [2.2, 'clack', 1.3], [2.7, 'whistle', .8, 1.4], [2.75, 'door', .8], [4.4, 'slam', 1.5], [4.4, 'buzz'], [6.5, 'whoosh'], [6.9, 'whoosh'], [7.3, 'whoosh'], [7.7, 'whoosh'], [8.3, 'door', 1.5]],
    run(t, V) {
      idle(t); draws(1, 1, 1, 1); const m = W.dr[3].m, o = W.dr[3], back = sp(3, 7.4 * TW, TY + TH / 2, .475), k = ez(K(t, .2, 1.1));
      m.position.lerpVectors(o.pR, back, k); m.quaternion.slerpQuaternions(o.qR, o.qH, ez(K(t, 1.3, 1.7)));
      const d2 = W.hand[3][11], k2 = ez(K(t, 1.8, 2.2)), r2 = sp(3, 2.5 * TW * 1.03, TY + TD / 2, .14 + TH / 2 + .061 * 2); d2.m.position.lerp(r2, k2); d2.m.position.y += Math.sin(k2 * Math.PI) * .08; d2.m.quaternion.slerp(o.qR, k2);
      if (t < 2.7) { camDV(V, t); if (k < 1) { SF.reach('R', m.position.clone().add(V3(.02, .05, .02)), 1); SF.ln = .35 * Math.sin(Math.PI * k) + .1; SF.sd = .25 * Math.sin(Math.PI * k); } smile(SF, 1); say(V, t, .3, 1.5, SF, 'e9_sf', { px: 16 }); smile(BU, K(t, 1.2, 1.5)); say(V, t, 1.3, 2.7, BU, 'e9_bu', { px: 16 }); nerv(t, 1, [BK, ON]); tags(V); }
      else if (t < 6.4) { W.door.rotation.y = -1.75 * eo(K(t, 2.7, 2.9)); ST.g.visible = true; walk(ST, t, 2.75, 3.3, V3(-1.3, 0, -2.6), V3(-1.2, 0, -1.3), V3(0, 0, 0)); ST.hR.set(.12, 1.45, .5); angry(ST, 1, t);
        cam(V, t, mix([1.2, 1.7, 1.6], [.7, 1.55, .9], K(t, 2.7, 4.4)), [-1.0, 1.15, -1.2], .9, .8); [SF, BK, ON, BU].forEach(c => { shock(c, K(t, 2.8, 3.0)); c.hy = c === SF ? 2.2 : c === BK ? -.9 : c === BU ? .0 : 2.6; });
        slamT(V, t, 2.7, 'e9_wh', .5, .16, 60, '#ffe27a', '#1b2a4a', { hold: 1.0, jit: V.u * 2 }); say(V, t, 3.3, 6.4, ST, 'e9_st', { px: 15 }); stampT(V, t, 4.4, 's_ban', .5, .68, 70, '#d8201a', -.1); W.shake = t > 4.4 ? .025 * (1 - K(t, 4.4, 4.9)) : 0; }
      else { W.door.rotation.y = -1.75 * (1 - ez(K(t, 8.25, 8.4))); cam(V, t, [1.5, 1.9, 2.0], [-.8, 1.1, -1.2], 1.25, 1.05); ST.g.visible = true; ST.g.position.set(-.55, 0, -1.2); ST.g.rotation.y = -1.2; ST.hL.set(-.3, 1.2, .4); ST.hR.set(.3, 1.2, .4); angry(ST, 1, t);
        [SF, BK, ON, BU].forEach((c, i) => { const a = 6.5 + i * .4, u = K(t, a, a + .7); if (u > 0) { c.st = 1; c.g.position.lerpVectors(SEATP[i], V3(-1.3, .3, -3.0), u); c.g.position.y += Math.sin(u * Math.PI) * 1.1; c.g.rotation.x = u * 9; shock(c, 1); c.hL.set(-.4, 1.5, 0); c.hR.set(.4, 1.5, 0); c.g.visible = u < 1; } }); W.shake = t > 8.3 ? .03 * (1 - K(t, 8.3, 8.8)) : 0; stampT(V, t, 8.4, 's_ban', .5, .42, 84, '#d8201a', -.1); }
    }
  };
  // ===== 8 停電 =====
  A.e[8] = {
    len: 9.8, sfx: [[0, 'glass', .8], [0, 'zap'], [.9, 'rustle'], [1.4, 'rustle'], [1.9, 'rustle'], [2.3, 'clack', .6], [2.6, 'rustle'], [3.0, 'clack', .6], [3.3, 'rustle'], [3.7, 'zap', .6], [4.0, 'pop'], [5.0, 'slam', 1.3], [5.05, 'fan'], [6.4, 'buzz', .7], [8.2, 'slam', 1.2], [8.2, 'chime']],
    run(t, V) {
      idle(t); draws(1, 1, 1, 1); const on = t < .08 ? 1 : t < 3.7 ? 0 : t < 4.1 ? (Math.floor(t * 30) % 2 ? .9 : .15) : 1; W.light = .08 + .92 * on; W.bulb.visible = false; const sw = t > 2;
      if (sw) { W.hand[0].forEach((o, j) => { o.m.position.copy(W.hand[3][j].bp); o.m.quaternion.copy(W.hand[3][j].bq); }); W.hand[3].forEach((o, j) => { o.m.position.copy(W.hand[0][j].bp); o.m.quaternion.copy(W.hand[0][j].bq); }); const m = W.dr[3].m; m.position.copy(sp(3, 7.4 * TW, TY + TH / 2, .475)); m.quaternion.copy(W.dr[3].qH); }
      if (t < 4.2) { camDV(V, t); flashT(V, t, 0, .15); dark(V, .93 * (1 - on)); if (on < .5) { W.seatC.forEach((c, i) => D(V, () => { const p = hpos(c, 0), s = V.u * 22; FX.eyes(V.g, p.x + Math.sin(t * 3 + i * 2) * V.u * (t > .8 && t < 3.4 ? 26 : 2), p.y + Math.cos(t * 2.3 + i) * V.u * (t > .8 && t < 3.4 ? 12 : 1), s, t, i); })); slamT(V, t, .9, 'e11_dark', .5, .5, 34, '#cfd6ff', '#000', { jit: V.u * 1.5, hold: 2.7 }); } }
      else { const k = eo(K(t, 5.0, 5.15)); if (t >= 5.0) { W.reveal(3, K(t, 5.05, 5.8), W.hand[0]); const m = W.dr[3].m; m.position.lerp(sp(3, 7.7 * TW, TY + TD / 2, .475 - TH * .5), k); m.quaternion.slerp(W.dr[3].qR, k); }
        if (t < 6.3) { cam(V, t, [.3, 1.5, .45], [-.82, 1.05, 0], .56, .52); BU.hp = t < 5 ? .3 : -.25; shock(BU, K(t, 4.3, 4.5) * (1 - K(t, 4.9, 5.0))); if (t >= 5) { smile(BU, 1); BU.mo = .8; BU.hL.set(-.35, 1.4, .1); BU.hR.set(.35, 1.4, .1); } say(V, t, 4.3, 6.3, BU, 'e11_bu', { px: 17 });
          D(V, () => { const dt = t - 5.0, g = V.g, w = V.w, h = V.h, u = V.u; if (dt < 0) return; FX.rays(g, w / 2, h * .2, h * .6, t, '#ffd84a', .22); FX.slam(g, dt, V.T('y1'), w / 2, h * .17, u * 96, '#ffe27a', '#5a1a00', { fam: FX.SERIF, maxW: w * .9, sh: '#ff8a00' }); FX.slam(g, dt - .5, V.T('e11_pay'), w / 2, h * .17 + u * 74, u * 24, '#fff', '#1b2a4a', { maxW: w * .92 }); FX.handRow(g, atlas, HANDS[0], w / 2, h * .86, Math.min(w * .96, u * 440), { k: K(dt, .3, 1.2), win: 31, maxT: u * 34 }); }); flashT(V, t, 5.0, .25); W.shake = t > 5 ? .02 * (1 - K(t, 5, 5.4)) : 0; }
        else { cam(V, t, [0, 2.9, 2.3], [0, .9, -.1], .98, 1.1); smile(BU, 1); BU.mo = .6 + .4 * Math.sin(t * 12); BU.hp = -.3; BU.hL.set(-.35, 1.4, .1); BU.hR.set(.35, 1.4, .1); TRI.forEach((c, i) => { shock(c, 1); c.hp = .25; mk(V, 'sweat', c, 20, 0, 15, t + i * .4); }); say(V, t, 6.4, 8.2, SF, 'e11_all', { px: 18 }); row(V, t, 6.5, 8.1, HANDS[3], { y: .88 }); stampT(V, t, 8.2, 's_ok2', .5, .42, 66, '#d89a00', -.1); if (t > 8.2) W.confetti(t, .6); }
      }
    }
  };
  // ===== 9 ロン連打 =====
  { const sf = []; for (let i = 0; i < 26; i++)sf.push([i * i * .0035 + i * .02, 'mash', 1 + i * .05, 1]);
    A.e[9] = {
      len: 7.2, sfx: [...sf, [2.7, 'cough', 1.3], [3.5, 'slam', 1.4], [3.5, 'buzz'], [5.8, 'sad', .7]],
      run(t, V) {
        idle(t); draws(1, 1, 1, 1);
        if (t < 3.4) { camDV(V, t); const k = 1 - K(t, 2.6, 2.7); W.shake = .02 * k + .01; SF.st = .9 * k; SF.hR.set(.12, 1.5, .42); SF.hy = Math.sin(t * 60) * .12 * k; SF.mo = k > 0 ? .5 + .5 * Math.sin(t * 40) : 0; SF.by = Math.abs(Math.sin(t * 30)) * .02 * k; [BK, ON, BU].forEach(c => { shock(c, .6); c.hy = c === BK ? -.9 : c === BU ? .9 : 0; }); tags(V);
          if (t < 2.85) D(V, () => { const g = V.g, n = Math.min(60, Math.floor(Math.pow(Math.min(t, 2.6), 2) * 9) + 2), cols = ['#ff3b30', '#ffb300', '#ff3ea5', '#fff', '#4ad1ff']; for (let i = 0; i < n; i++) { const born = Math.sqrt((i - 1) / 9); FX.slam(g, t - Math.max(0, born), V.T('ron'), V.w * (.12 + hash(i) * .76), V.h * (.1 + hash(i + 40) * .74), V.u * (30 + hash(i + 80) * 70), cols[i % 5], i % 5 === 3 ? '#c4201c' : '#fff', { rot: (hash(i + 7) - .5) * .7 }); } });
          if (t > 2.6) { SF.ln = .4; SF.hR.set(.05, 1.05, .2); SF.ey = .14; slamT(V, t, 2.7, 'e14_cough', .5, .72, 54, '#fff', '#1b2a4a', { hold: .7 }); } }
        else { cam(V, t, mix([.9, 1.6, 1.5], [.6, 1.5, 1.2], K(t, 3.4, 7)), [-.5, 1.1, .4], .85, .75); BU.st = eo(K(t, 3.4, 3.55)); angry(BU, 1, t); BU.hy = -.9; BU.hR.set(.3, 1.45, .4); mk(V, 'anger', BU, -36, -8, 28, t); slamT(V, t, 3.5, 'e14_bu', .5, .18, 46, '#ff3b30', '#fff', { jit: V.u * 2, hold: 2.2 }); W.shake = .025 * (1 - K(t, 3.5, 4)); flashT(V, t, 3.5, .2, '#ff3b30', .4);
          SF.ln = .45; SF.hp = .4; SF.ey = .14; SF.br = .5; SF.hR.set(.03, 1.02, .22); say(V, t, 5.6, 9, SF, 'e14_sf', { px: 15, think: 1 }); mk(V, 'sweat', SF, 22, 0, 16, t); }
      }
    };
  }
  // ===== 10 逃げる =====
  A.e[10] = {
    len: 8.2, sfx: [[.2, 'pop'], [.9, 'step'], [1.1, 'step'], [1.3, 'step'], [1.5, 'step'], [1.7, 'step'], [1.9, 'step'], [2.2, 'whoosh', .4, 1.3], [2.5, 'glass', 1.4], [2.5, 'slam', .8], [4.9, 'pop'], [6.3, 'slam'], [6.6, 'slam'], [6.6, 'buzz']],
    run(t, V) {
      idle(t); draws(1, 1, 1, 1); const win = V3(W.WIN.x, 0, W.WIN.z + .45), brk = t >= 2.5;
      SF.st = eo(K(t, 0, .25)); if (t < .9) { SF.hR.set(.2, 1.5, .1); smile(SF, 1); } else if (t < 2.2) { walk(SF, t, .9, 2.2, SEATP[0], win); SF.ln = .35; SF.hL.set(-.3, 1.0 + Math.sin(t * 22) * .2, .2); SF.hR.set(.3, 1.0 - Math.sin(t * 22) * .2, .2); }
      else { const u = K(t, 2.2, 2.9); SF.g.position.lerpVectors(win, V3(W.WIN.x, .9, W.WIN.z - 1.6), u); SF.g.position.y += Math.sin(u * Math.PI) * .5; SF.g.rotation.set(-1.2 * u, Math.PI, 0); SF.hL.set(-.2, 1.6, .2); SF.hR.set(.2, 1.6, .2); SF.g.scale.setScalar(1 - u * .5); SF.g.visible = u < 1; }
      if (brk) { W.glass.visible = false; W.bar.visible = false; W.shatter(t - 2.5); }
      [BK, ON, BU].forEach(c => { shock(c, K(t, .3, .5)); });
      if (t < .9) { camDV(V, t); say(V, t, .2, 1.4, SF, 'e15_sf', { px: 17 }); tags(V); }
      else if (t < 4.6) { cam(V, t, mix([-1.7, 1.8, 2.0], [-1.0, 1.7, 1.2], K(t, .9, 4.6)), [.85, 1.25, -1.3], 1.15, 1.0); [BK, ON, BU].forEach(c => c.face(win, 1)); flashT(V, t, 2.5, .2); W.shake = brk ? .03 * (1 - K(t, 2.5, 3)) : 0;
        if (t > 3.0) D(V, () => { const p = W.pj(V3(W.WIN.x + .2, W.WIN.y + .22, W.WIN.z)), u = V.u, k = K(t, 3.0, 4.6), g = V.g, x = p.x - u * 46 + k * u * 60, y = p.y + u * 30 - Math.abs(Math.sin(t * 14)) * u * 5, s = u * 9 * (1 - k * .5); g.fillStyle = '#05070f'; g.beginPath(); g.arc(x, y - s * 2.2, s * .8, 0, 7); g.fill(); g.fillRect(x - s * .5, y - s * 1.6, s, s * 1.8); g.lineWidth = s * .45; g.strokeStyle = '#05070f'; g.lineCap = 'round'; const a = Math.sin(t * 14); g.beginPath(); g.moveTo(x, y); g.lineTo(x + a * s, y + s * 1.3); g.moveTo(x, y); g.lineTo(x - a * s, y + s * 1.3); g.moveTo(x, y - s * 1.2); g.lineTo(x + a * s * 1.1, y - s * .4); g.moveTo(x, y - s * 1.2); g.lineTo(x - a * s * 1.1, y - s * .4); g.stroke(); }); }
      else { camDV(V, t); BU.hy = -.6; say(V, t, 4.9, 6.3, BU, 'e15_bu', { px: 17 }); stampC(V, t, 6.3, 's_kubi', BK, 38, '#d8201a', .15); stampC(V, t, 6.6, 's_kubi', ON, 38, '#d8201a', -.2); W.shake = t > 6.3 ? .02 * (1 - K(t, 6.6, 7)) : 0; tags(V); }
    }
  };
  A.e[0] = A.ron; A.e[1] = A.arrest;
  // 動画やPVの最後に出す札
  A.card = (V, k, o) => D(V, () => { const g = V.g, w = V.w, h = V.h, u = V.u, e = eb(cl(k)); g.save(); g.globalAlpha = cl(k * 2); g.fillStyle = 'rgba(8,10,24,.88)'; g.fillRect(0, 0, w, h); g.translate(w / 2, h * .5); g.scale(e, e);
    FX.txt(g, o.title, 0, -u * 250, FX.fit(g, o.title, u * 64, w * .86, FX.SERIF), '#ffe27a', '#5a1a00', u * 10, FX.SERIF); if (o.rank) { g.fillStyle = o.rcol; g.beginPath(); g.roundRect(-u * 62, -u * 190, u * 124, u * 64, u * 14); g.fill(); FX.txt(g, o.rank, 0, -u * 157, u * 44, '#fff'); }
    FX.txt(g, o.name, 0, -u * 70, FX.fit(g, o.name, u * 46, w * .88), '#fff'); if (o.desc) { g.font = FX.F(u * 18); const px = FX.fit(g, o.desc, u * 18, w * .9); FX.txt(g, o.desc, 0, -u * 20, px, '#cfd6ff'); } if (o.order) FX.txt(g, o.order, 0, u * 42, FX.fit(g, o.order, u * 26, w * .9), '#ffd84a'); if (o.prog) FX.txt(g, o.prog, 0, u * 92, u * 22, '#fff');
    FX.txt(g, o.url, 0, u * 190, FX.fit(g, o.url, u * 17, w * .92), '#9fb4ff'); FX.txt(g, o.tags, 0, u * 226, u * 17, '#fff'); g.restore(); });
  A.targets = () => ({ white: W.dr[3].m.position.clone(), onna: ON.headW().add(V3(0, -.12, 0)), lamp: W.LAMP.clone(), win: W.WIN.clone(), bu: BU.headW().add(V3(0, -.1, 0)) });
  return A;
}
