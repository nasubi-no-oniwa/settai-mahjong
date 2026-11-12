// 接待麻雀：音（すべてその場で合成）。S.なまえ(鳴らす時刻, …) の形。動画やPVでも同じ音を使う
let AC = null, OUT = null, NB = null;
export function audio() { if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); OUT = AC.createGain(); OUT.gain.value = .85; OUT.connect(AC.destination); } catch (e) { AC = null; } } if (AC && AC.state === 'suspended') AC.resume().catch(() => { }); return AC; }
export const ctx = () => AC, out = () => OUT;
export function useCtx(c, o) { AC = c; OUT = o; NB = null; }
export const now = () => AC ? AC.currentTime : 0;
function nbuf() { if (!NB) { NB = AC.createBuffer(1, AC.sampleRate, AC.sampleRate); const d = NB.getChannelData(0); let s = 12345; for (let i = 0; i < d.length; i++) { s = (s * 1103515245 + 12345) & 0x7fffffff; d[i] = s / 0x3fffffff - 1; } } return NB; }
function env(at, a, d, v) { const g = AC.createGain(); g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(v, at + a); g.gain.exponentialRampToValueAtTime(.0001, at + a + d); g.connect(OUT); return g; }
function osc(type, f, at, a, d, v, f2) { const o = AC.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, at); if (f2) o.frequency.exponentialRampToValueAtTime(f2, at + a + d); o.connect(env(at, a, d, v)); o.start(at); o.stop(at + a + d + .05); return o; }
function noise(at, d, v, type, f, q = 1, f2) { const s = AC.createBufferSource(); s.buffer = nbuf(); s.loop = true; const fl = AC.createBiquadFilter(); fl.type = type; fl.frequency.setValueAtTime(f, at); if (f2) fl.frequency.exponentialRampToValueAtTime(f2, at + d); fl.Q.value = q; s.connect(fl); fl.connect(env(at, .004, d, v)); s.start(at, (at * 7.3) % .9); s.stop(at + d + .05); }
export const S = {
  clack(at, v = 1) { noise(at, .05, .5 * v, 'bandpass', 2600, 2); osc('square', 900, at, .001, .03, .12 * v, 500); },
  thud(at, v = 1) { osc('sine', 130, at, .003, .28, .9 * v, 42); noise(at, .12, .3 * v, 'lowpass', 400); },
  slam(at, v = 1) { S.thud(at, v); noise(at, .5, .32 * v, 'highpass', 1800); osc('sawtooth', 70, at, .003, .3, .25 * v, 35); },
  gong(at, v = 1) { for (const [r, a] of [[1, .5], [2.01, .3], [2.76, .22], [4.1, .14], [5.43, .08]]) osc('sine', 98 * r, at, .005, 2.4 / Math.sqrt(r), a * v); noise(at, .25, .2 * v, 'bandpass', 900, .7); },
  ron(at, p = 1, v = 1) { for (const r of [1, 1.26, 1.5, 2]) osc('sawtooth', 220 * p * r, at, .012, .4, .13 * v, 233 * p * r); S.slam(at, .7 * v); },
  tick(at, v = 1) { osc('square', 1700, at, .001, .03, .06 * v); },
  coin(at, p = 1, v = 1) { osc('triangle', 1250 * p, at, .001, .07, .12 * v, 1800 * p); },
  whoosh(at, d = .4, v = 1) { noise(at, d, .35 * v, 'bandpass', 300, .8, 2600); },
  cry(at, d = 1, v = 1) { const o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(560, at); o.frequency.linearRampToValueAtTime(470, at + d * .3); o.frequency.linearRampToValueAtTime(360, at + d); const l = AC.createOscillator(); l.frequency.value = 7; const lg = AC.createGain(); lg.gain.value = 22; l.connect(lg); lg.connect(o.frequency); const f = AC.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1050; f.Q.value = 3; const g = AC.createGain(); g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(.5 * v, at + .08); g.gain.setValueAtTime(.5 * v, at + d * .7); g.gain.linearRampToValueAtTime(0, at + d); o.connect(f); f.connect(g); g.connect(OUT); o.start(at); l.start(at); o.stop(at + d + .05); l.stop(at + d + .05); },
  sob(at, v = 1) { S.cry(at, .22, v); S.cry(at + .28, .2, v * .8); S.cry(at + .55, .4, v * .9); },
  step(at, v = 1) { osc('sine', 95, at, .002, .09, .5 * v, 55); noise(at, .04, .1 * v, 'lowpass', 700); },
  door(at, v = 1) { S.thud(at, 1.1 * v); noise(at, .18, .5 * v, 'bandpass', 500, .6); },
  glass(at, v = 1) { noise(at, .6, .45 * v, 'highpass', 3500); for (let i = 0; i < 8; i++) osc('sine', 2200 + ((i * 733) % 3100), at + i * .035, .001, .18, .07 * v); },
  siren(at, d = 2, v = 1) { for (let t = 0; t < d; t += .7) { osc('triangle', 760, at + t, .02, .33, .16 * v); osc('triangle', 570, at + t + .35, .02, .33, .16 * v); } },
  pop(at, v = 1) { osc('sine', 500, at, .002, .09, .3 * v, 1300); },
  fan(at, v = 1) { [262, 330, 392, 523, 659, 784].forEach((f, i) => { osc('sawtooth', f, at + i * .09, .01, i === 5 ? .9 : .16, .13 * v); osc('square', f / 2, at + i * .09, .01, i === 5 ? .9 : .16, .06 * v); }); S.gong(at + .45, .5 * v); },
  sad(at, v = 1) { [392, 370, 349, 311, 262].forEach((f, i) => osc('triangle', f, at + i * .28, .02, i === 4 ? 1.1 : .3, .2 * v)); },
  heart(at, v = 1) { osc('sine', 62, at, .004, .13, .8 * v, 40); osc('sine', 56, at + .2, .004, .15, .6 * v, 38); },
  cuff(at, v = 1) { noise(at, .03, .4 * v, 'highpass', 5000); noise(at + .07, .05, .5 * v, 'bandpass', 4200, 4); osc('square', 2900, at + .07, .001, .04, .07 * v); },
  gulp(at, v = 1) { const o = osc('sine', 330, at, .01, .3, .5 * v); o.frequency.setValueAtTime(330, at); o.frequency.exponentialRampToValueAtTime(110, at + .14); o.frequency.exponentialRampToValueAtTime(280, at + .3); },
  whistle(at, d = .7, v = 1) { const o = osc('sine', 2500, at, .01, d, .22 * v); const l = AC.createOscillator(); l.frequency.value = 28; const lg = AC.createGain(); lg.gain.value = 130; l.connect(lg); lg.connect(o.frequency); l.start(at); l.stop(at + d + .05); },
  drum(at, v = 1) { S.thud(at, v); S.thud(at + .13, .8 * v); S.thud(at + .34, 1.2 * v); },
  cough(at, v = 1) { noise(at, .12, .5 * v, 'bandpass', 700, .8); noise(at + .18, .15, .55 * v, 'bandpass', 600, .8); },
  clap(at, v = 1) { noise(at, .05, .35 * v, 'bandpass', 1500, 1.2); noise(at + .012, .04, .25 * v, 'bandpass', 2100, 1.5); },
  laugh(at, v = 1) { for (let i = 0; i < 5; i++) osc('sawtooth', 240 - i * 14, at + i * .16, .01, .1, .16 * v, 200 - i * 14); },
  buzz(at, v = 1) { osc('square', 110, at, .005, .35, .16 * v); osc('square', 117, at, .005, .35, .16 * v); },
  zap(at, v = 1) { noise(at, .25, .4 * v, 'bandpass', 3000, 3, 300); osc('sawtooth', 1500, at, .001, .2, .12 * v, 80); },
  rustle(at, v = 1) { for (let i = 0; i < 4; i++) noise(at + i * .09 + (i % 2) * .03, .06, .16 * v, 'bandpass', 1800 + i * 400, 1); },
  chime(at, v = 1) { [784, 988, 1175, 1568].forEach((f, i) => osc('sine', f, at + i * .07, .003, .6, .12 * v)); },
  low(at, d = 2, v = 1) { const o = osc('sine', 55, at, .3, d, .28 * v); o.frequency.linearRampToValueAtTime(49, at + d); },
  mash(at, p = 1, v = 1) { osc('sawtooth', 300 * p, at, .005, .09, .16 * v, 330 * p); osc('square', 150 * p, at, .005, .08, .06 * v); }
};
// 場面の音の予定表 E＝[[秒, なまえ, 引数…], …] のうち、t0〜t1 のあいだに来たものを鳴らす
export function runSfx(E, t0, t1) { if (!AC || !E) return; const n = AC.currentTime + .02; for (const e of E) if (e[0] >= t0 && e[0] < t1) { try { S[e[1]](n + Math.max(0, e[0] - t0) * 0, ...e.slice(2)); } catch (_) { } } }
// まとめて予定に入れる（PV用。at0＝この場面が始まる時刻）
export function scheduleAll(E, at0, from = 0, to = 1e9, rate = 1) { for (const e of E) if (e[0] >= from && e[0] < to) { try { S[e[1]](at0 + (e[0] - from) / rate, ...e.slice(2)); } catch (_) { } } }
export const UI = { tap() { if (audio()) S.tick(now() + .01, 1.4); }, ok() { if (audio()) S.pop(now() + .01); }, back() { if (audio()) S.tick(now() + .01, .8); } };
