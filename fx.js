// 接待麻雀：画面の上に重ねる2Dの絵（文字・吹き出し・手牌・ハンコなど）。動画にも同じものを描く
import { CW, CH, cl, eo, eb, ez, hash } from './world.js?v=3';
if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) { r = Math.max(0, Math.min(typeof r === 'number' ? r : (r && r[0]) || 0, Math.abs(w) / 2, Math.abs(h) / 2)); this.moveTo(x + r, y); this.arcTo(x + w, y, x + w, y + h, r); this.arcTo(x + w, y + h, x, y + h, r); this.arcTo(x, y + h, x, y, r); this.arcTo(x, y, x + w, y, r); this.closePath(); return this; };
export const FONT = '"Hiragino Sans","Hiragino Kaku Gothic ProN","Yu Gothic","Noto Sans CJK JP","Noto Sans JP","Apple SD Gothic Neo","Malgun Gothic",system-ui,sans-serif';
export const SERIF = '"Hiragino Mincho ProN","Yu Mincho","Noto Serif CJK JP","Noto Serif JP","Songti TC","AppleMyungjo",serif';
export const F = (px, fam = FONT, w = 900) => `${w} ${Math.max(4, Math.round(px))}px ${fam}`;
export function fit(g, s, px, maxW, fam) { g.font = F(px, fam); const w = g.measureText(s).width; return w > maxW ? px * maxW / w : px; }
export function txt(g, s, x, y, px, fill, stroke, sw, fam, al) { g.font = F(px, fam); g.textAlign = al || 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; if (stroke) { g.lineWidth = sw || px * .2; g.strokeStyle = stroke; g.strokeText(s, x, y); } g.fillStyle = fill; g.fillText(s, x, y); }
// ドン！と出る文字（dt：出てからの秒）
export function slam(g, dt, s, x, y, px, fill, stroke, o = {}) {
  if (dt < 0 || (o.hold && dt > o.hold)) return; const out = o.hold ? cl((o.hold - dt) / .18) : 1;
  const sc = dt < .13 ? 3 - 2 * eo(dt / .13) : 1 + .07 * Math.exp(-(dt - .13) * 9) * Math.sin(dt * 46);
  px = fit(g, s, px, (o.maxW || 1e9), o.fam); g.save(); g.translate(x + (o.jit ? Math.sin(dt * 60) * o.jit : 0), y + (o.jit ? Math.cos(dt * 47) * o.jit : 0)); g.rotate(o.rot || 0); g.scale(sc, sc); g.globalAlpha = cl(dt / .06) * out;
  if (o.sh) { g.shadowColor = o.sh; g.shadowBlur = px * .35; }
  txt(g, s, 0, 0, px, fill, stroke, px * (o.sw || .22), o.fam); g.restore();
}
export function rays(g, cx, cy, r, t, col, a = 1, n = 16) { g.save(); g.translate(cx, cy); g.rotate(t * .5); g.globalAlpha = a; g.fillStyle = col; for (let i = 0; i < n; i++) { g.rotate(Math.PI * 2 / n); g.beginPath(); g.moveTo(0, 0); g.lineTo(r, -r * .1); g.lineTo(r, r * .1); g.closePath(); g.fill(); } g.restore(); }
export function band(g, w, y, h, col, k) { const e = eo(k); g.fillStyle = col; g.fillRect(0, y - h / 2 * e, w, h * e); }
export function flash(g, w, h, a, col = '#fff') { if (a <= 0) return; g.save(); g.globalAlpha = cl(a); g.fillStyle = col; g.fillRect(0, 0, w, h); g.restore(); }
function wrap(g, s, maxW) { const out = []; for (const para of String(s).split('\n')) { let line = ''; const words = /[ ]/.test(para) && !/[぀-ヿ一-鿿]/.test(para) ? para.split(' ').map((w, i, a) => i < a.length - 1 ? w + ' ' : w) : [...para]; for (const ch of words) { if (g.measureText(line + ch).width > maxW && line) { out.push(line); line = ch.trimStart(); } else line += ch; } out.push(line); } return out; }
// 吹き出し（o.think：心の声、o.dir：しっぽの向き 1＝下、-1＝上）
export function bubble(g, x, y, s, px, o = {}) {
  const k = o.k == null ? 1 : o.k; if (k <= 0) return; g.save(); g.font = F(px); const lines = wrap(g, s, o.maxW || px * 11), lw = Math.max(...lines.map(l => g.measureText(l).width)), w = lw + px * 1.3, h = lines.length * px * 1.3 + px * .7, dir = o.dir || 1;
  const W_ = o.W || 1e9; x = cl(x, w / 2 + 6, W_ - w / 2 - 6); const by = y - dir * (h / 2 + px * .9), sc = eb(cl(k));
  g.translate(x, by); g.scale(sc, sc); g.globalAlpha = cl(k * 2); g.fillStyle = o.bg || '#fff'; g.strokeStyle = o.line || '#1b1b1f'; g.lineWidth = Math.max(2, px * .14);
  g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, o.think ? h / 2 : px * .6); g.fill(); g.stroke();
  const tx = cl((o.tx == null ? x : o.tx) - x, -w / 2 + px, w / 2 - px);
  if (o.think) { for (let i = 0; i < 2; i++) { g.beginPath(); g.arc(tx * (.6 + i * .25), dir * (h / 2 + px * (.25 + i * .38)), px * (.22 - i * .08), 0, 7); g.fill(); g.stroke(); } }
  else { g.beginPath(); g.moveTo(tx - px * .35, dir * (h / 2 - 1)); g.lineTo(tx, dir * (h / 2 + px * .6)); g.lineTo(tx + px * .35, dir * (h / 2 - 1)); g.fill(); g.stroke(); g.fillRect(tx - px * .33, dir * (h / 2) - (dir > 0 ? px * .16 : 0), px * .66, px * .16); }
  g.fillStyle = o.col || '#1b1b1f'; g.textAlign = 'center'; g.textBaseline = 'middle'; lines.forEach((l, i) => g.fillText(l, 0, (i - (lines.length - 1) / 2) * px * 1.3)); g.restore();
}
export function subtitle(g, w, h, s, px, k = 1) { if (k <= 0) return; g.save(); g.globalAlpha = cl(k); g.font = F(px); const lines = wrap(g, s, w * .88), bh = lines.length * px * 1.35 + px * .9, y = h * .8; g.fillStyle = 'rgba(0,0,0,.62)'; g.fillRect(0, y - bh / 2, w, bh); g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; lines.forEach((l, i) => g.fillText(l, w / 2, y + (i - (lines.length - 1) / 2) * px * 1.35)); g.restore(); }
// ハンコ（dt：押してからの秒）
export function stamp(g, dt, s, x, y, px, col, rot = -.2, o = {}) {
  if (dt < 0) return; const sc = dt < .12 ? 2.6 - 1.6 * eo(dt / .12) : 1; g.save(); g.translate(x, y); g.rotate(rot); g.scale(sc, sc); g.globalAlpha = cl(dt / .05);
  px = fit(g, s, px, o.maxW || 1e9); g.font = F(px); const w = g.measureText(s).width + px * .9, h = px * 1.55; g.lineWidth = px * .14; g.strokeStyle = col; g.fillStyle = o.bg || 'rgba(255,255,255,.9)'; g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, px * .22); g.fill(); g.stroke(); g.beginPath(); g.roundRect(-w / 2 + px * .16, -h / 2 + px * .16, w - px * .32, h - px * .32, px * .12); g.lineWidth = px * .05; g.stroke();
  g.fillStyle = col; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(s, 0, px * .04); g.restore();
}
// 牌を1枚（2D）
export function tile(g, atlas, k, x, y, w, o = {}) { const h = w * CH / CW; g.save(); g.translate(x, y); if (o.rot) g.rotate(o.rot); if (o.glow) { g.shadowColor = o.glow; g.shadowBlur = w * .8; } g.fillStyle = '#e9a11d'; g.beginPath(); g.roundRect(-w / 2, -h / 2 + w * .1, w, h, w * .14); g.fill(); g.shadowBlur = 0; g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, w * .14); g.clip(); g.drawImage(atlas, (k % 9) * CW, Math.floor(k / 9) * CH, CW, CH, -w / 2, -h / 2, w, h); if (o.dim) { g.fillStyle = 'rgba(20,20,40,' + o.dim + ')'; g.fillRect(-w / 2, -h / 2, w, h); } g.restore(); g.save(); g.translate(x, y); if (o.rot) g.rotate(o.rot); g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = Math.max(1, w * .04); g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, w * .14); g.stroke(); g.restore(); }
// 手牌を横に並べる（o.win：あがり牌を右にはなして置く、o.hi：光らせる牌の種類、o.k：出てくる進み具合）
export function handRow(g, atlas, tiles, cx, y, width, o = {}) {
  const n = tiles.length + (o.win != null ? 1.35 : 0), w = Math.min(width / n, o.maxT || 1e9), x0 = cx - w * n / 2 + w / 2, k = o.k == null ? 1 : o.k;
  tiles.forEach((t, i) => { const u = eb(cl(k * 2.2 - i * .07)); if (u <= 0) return; tile(g, atlas, t, x0 + i * w, y + (1 - u) * w * 1.5, w * .94, { glow: o.hi && o.hi.includes(t) ? o.hc || '#ffd84a' : null, dim: o.hi && !o.hi.includes(t) ? .28 : 0 }); });
  if (o.win != null) { const u = eb(cl(k * 2.2 - 1.3)); if (u > 0) tile(g, atlas, o.win, x0 + (tiles.length + .35) * w, y - (1 - u) * w * 3, w * .94, { glow: o.wc || '#ff4a3a', rot: (1 - u) * .8 }); }
  return w;
}
export function pill(g, s, x, y, px, bg, col, o = {}) { g.save(); g.font = F(px); const w = g.measureText(s).width + px * 1.1, h = px * 1.6; g.globalAlpha = o.a == null ? 1 : o.a; g.fillStyle = bg; g.beginPath(); g.roundRect(x - w / 2, y - h / 2, w, h, h / 2); g.fill(); if (o.line) { g.strokeStyle = o.line; g.lineWidth = 2; g.stroke(); } g.fillStyle = col; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(s, x, y + px * .04); g.restore(); }
// ！や汗などの小さな記号
export function mark(g, kind, x, y, s, t = 0) {
  g.save(); g.translate(x, y);
  if (kind === 'sweat') { g.fillStyle = '#7fd0ff'; g.strokeStyle = '#2a7fc0'; g.lineWidth = s * .08; const yy = (t * 1.2 % 1) * s * .5; g.beginPath(); g.moveTo(0, -s * .5 + yy); g.quadraticCurveTo(s * .34, s * .1 + yy, 0, s * .28 + yy); g.quadraticCurveTo(-s * .34, s * .1 + yy, 0, -s * .5 + yy); g.fill(); g.stroke(); }
  else if (kind === 'anger') { g.strokeStyle = '#e0261c'; g.lineWidth = s * .16; g.lineCap = 'round'; for (let i = 0; i < 4; i++) { g.rotate(Math.PI / 2); g.beginPath(); g.moveTo(s * .12, s * .34); g.quadraticCurveTo(s * .12, s * .12, s * .34, s * .12); g.stroke(); } }
  else if (kind === 'heart') { g.fillStyle = '#ff4f86'; g.beginPath(); g.moveTo(0, s * .35); g.bezierCurveTo(-s * .7, -s * .15, -s * .3, -s * .6, 0, -s * .22); g.bezierCurveTo(s * .3, -s * .6, s * .7, -s * .15, 0, s * .35); g.fill(); }
  else if (kind === 'soul') { g.fillStyle = 'rgba(255,255,255,.85)'; g.beginPath(); g.arc(0, 0, s * .32, 0, 7); g.fill(); g.beginPath(); g.moveTo(-s * .28, s * .12); g.quadraticCurveTo(-s * .1, s * .9, s * .3, s * 1.1); g.quadraticCurveTo(s * .1, s * .5, s * .28, s * .12); g.fill(); g.fillStyle = '#333'; g.fillRect(-s * .16, -s * .06, s * .1, s * .03); g.fillRect(s * .06, -s * .06, s * .1, s * .03); }
  else if (kind === 'spark') { g.fillStyle = '#fff6a8'; for (let i = 0; i < 4; i++) { g.rotate(Math.PI / 2); g.beginPath(); g.moveTo(0, 0); g.lineTo(s * .09, s * .09); g.lineTo(0, s * .5); g.lineTo(-s * .09, s * .09); g.fill(); } }
  else if (kind === 'cuff') { g.strokeStyle = '#c9ced8'; g.lineWidth = s * .12; g.beginPath(); g.arc(-s * .3, 0, s * .24, 0, 7); g.stroke(); g.beginPath(); g.arc(s * .3, 0, s * .24, 0, 7); g.stroke(); g.beginPath(); g.moveTo(-s * .06, 0); g.lineTo(s * .06, 0); g.stroke(); }
  g.restore();
}
// 暗やみに光る目
export function eyes(g, x, y, s, t, i) { const bl = ((t * .6 + i * .37) % 1) < .08 ? .12 : 1, dx = Math.sin(t * 2.3 + i * 2) * s * .12; g.save(); g.translate(x, y); for (const sx of [-1, 1]) { g.fillStyle = '#fff'; g.beginPath(); g.ellipse(sx * s * .42, 0, s * .3, s * .36 * bl, 0, 0, 7); g.fill(); g.fillStyle = '#111'; g.beginPath(); g.ellipse(sx * s * .42 + dx, 0, s * .12, s * .16 * bl, 0, 0, 7); g.fill(); } g.restore(); }
export function iris(g, w, h, x, y, r) { g.save(); g.fillStyle = '#000'; g.beginPath(); g.rect(0, 0, w, h); g.moveTo(x + Math.max(0, r), y); g.arc(x, y, Math.max(0, r), 0, Math.PI * 2); g.fill('evenodd'); g.restore(); }
export { cl, eo, eb, ez, hash };
