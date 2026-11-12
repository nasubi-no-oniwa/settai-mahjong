// 接待麻雀：3Dの舞台（部屋・卓・牌・人）。毎コマ「元の形」に戻してから、場面（acts.js）が動かす
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
export { THREE };
export const TW = .044, TH = .06, TD = .03, TY = .72; // 牌の幅・高さ・厚み、卓の高さ
export const cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const K = (t, a, b) => cl((t - a) / (b - a));
export const ez = k => { k = cl(k); return k * k * (3 - 2 * k); };
export const eo = k => 1 - Math.pow(1 - cl(k), 3);
export const ei = k => { k = cl(k); return k * k * k; };
export const eb = k => { k = cl(k); const c = 1.70158; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); };
export const lerp = (a, b, k) => a + (b - a) * k;
export const hash = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
export const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

// ===== 牌の絵（9列×4段。0-8 萬子、9-17 筒子、18-26 索子、27-33 東南西北白發中、34 側面、35 背中） =====
export const CW = 160, CH = 216;
export const HAKU = 31, HATSU = 32, CHUN = 33;
export function mkAtlas() {
  const c = document.createElement('canvas'); c.width = CW * 9; c.height = CH * 4; const g = c.getContext('2d');
  const SER = '"Hiragino Mincho ProN","Yu Mincho","Noto Serif CJK JP","Noto Serif JP","Songti TC",serif';
  const NUM = '一二三四五六七八九', HON = '東南西北白發中', BL = '#1b2a4a', RD = '#c4201c', GR = '#1b7a44';
  const dot = (x, y, r, col) => { g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.fillStyle = '#fbf8ee'; g.beginPath(); g.arc(x, y, r * .62, 0, 7); g.fill(); g.fillStyle = col; g.beginPath(); g.arc(x, y, r * .34, 0, 7); g.fill(); };
  const bam = (x, y, l, col) => { const w = CW * .085; g.fillStyle = col; g.beginPath(); g.roundRect(x - w / 2, y - l / 2, w, l, w * .45); g.fill(); g.fillStyle = '#fbf8ee'; g.fillRect(x - w / 2, y - 1.5, w, 3); g.fillRect(x - w * .12, y - l * .36, w * .24, l * .25); g.fillRect(x - w * .12, y + l * .11, w * .24, l * .25); };
  const PIN = [[[.5, .5, .3]], [[.5, .27, .17], [.5, .73, .17]], [[.27, .2, .14], [.5, .5, .14], [.73, .8, .14]], [[.3, .28, .15], [.7, .28, .15], [.3, .72, .15], [.7, .72, .15]],
  [[.28, .24, .13], [.72, .24, .13], [.5, .5, .13], [.28, .76, .13], [.72, .76, .13]], [[.3, .2, .125], [.7, .2, .125], [.3, .5, .125], [.7, .5, .125], [.3, .8, .125], [.7, .8, .125]],
  [[.24, .13, .095], [.5, .22, .095], [.76, .31, .095], [.3, .6, .115], [.7, .6, .115], [.3, .85, .115], [.7, .85, .115]],
  [[.3, .14, .1], [.7, .14, .1], [.3, .38, .1], [.7, .38, .1], [.3, .62, .1], [.7, .62, .1], [.3, .86, .1], [.7, .86, .1]],
  [[.22, .2, .105], [.5, .2, .105], [.78, .2, .105], [.22, .5, .105], [.5, .5, .105], [.78, .5, .105], [.22, .8, .105], [.5, .8, .105], [.78, .8, .105]]];
  const PC = [[RD], [BL, GR], [BL, RD, GR], [BL, GR, GR, BL], [BL, GR, RD, GR, BL], [GR, GR, RD, RD, RD, RD], [GR, GR, GR, RD, RD, RD, RD], [BL, BL, BL, BL, BL, BL, BL, BL], [BL, BL, BL, RD, RD, RD, GR, GR, GR]];
  const SOU = [null, [[.5, .27], [.5, .73]], [[.5, .27], [.3, .73], [.7, .73]], [[.3, .27], [.7, .27], [.3, .73], [.7, .73]], [[.28, .27], [.72, .27], [.5, .5, 1], [.28, .73], [.72, .73]],
    [[.25, .27], [.5, .27], [.75, .27], [.25, .73], [.5, .73], [.75, .73]], [[.5, .17, 1], [.25, .5], [.5, .5], [.75, .5], [.25, .82], [.5, .82], [.75, .82]],
    [[.2, .27], [.4, .27], [.6, .27], [.8, .27], [.2, .73], [.4, .73], [.6, .73], [.8, .73]], [[.25, .18], [.5, .18, 1], [.75, .18], [.25, .5], [.5, .5, 1], [.75, .5], [.25, .82], [.5, .82, 1], [.75, .82]]];
  for (let k = 0; k < 36; k++) {
    const x = (k % 9) * CW, y = Math.floor(k / 9) * CH; g.save(); g.translate(x, y); g.beginPath(); g.rect(0, 0, CW, CH); g.clip();
    g.fillStyle = k === 35 ? '#e9a11d' : '#fbf8ee'; g.fillRect(0, 0, CW, CH);
    g.textAlign = 'center'; g.textBaseline = 'middle';
    if (k < 9) { g.font = `900 ${CH * .4}px ${SER}`; g.fillStyle = BL; g.fillText(NUM[k], CW / 2, CH * .27); g.fillStyle = RD; g.font = `900 ${CH * .42}px ${SER}`; g.fillText('萬', CW / 2, CH * .72); }
    else if (k < 18) { const n = k - 9; PIN[n].forEach((d, i) => dot(d[0] * CW, d[1] * CH, d[2] * CW, PC[n][i])); }
    else if (k < 27) {
      const n = k - 18;
      if (n === 0) { g.fillStyle = GR; g.beginPath(); g.ellipse(CW * .5, CH * .56, CW * .2, CH * .2, 0, 0, 7); g.fill(); g.fillStyle = RD; g.beginPath(); g.arc(CW * .5, CH * .3, CW * .13, 0, 7); g.fill(); g.fillStyle = '#e9a11d'; g.beginPath(); g.moveTo(CW * .62, CH * .28); g.lineTo(CW * .8, CH * .31); g.lineTo(CW * .62, CH * .35); g.fill(); g.strokeStyle = GR; g.lineWidth = 8; for (const d of [-.16, 0, .16]) { g.beginPath(); g.moveTo(CW * .5, CH * .72); g.lineTo(CW * (.5 + d), CH * .93); g.stroke(); } g.fillStyle = '#fbf8ee'; g.beginPath(); g.arc(CW * .54, CH * .285, 4, 0, 7); g.fill(); }
      else { const rows = n >= 6 && n !== 7 ? (n === 8 ? 3 : n === 6 ? 3 : 2) : 2, l = CH * (rows === 3 ? .25 : .36); SOU[n].forEach(d => bam(d[0] * CW, d[1] * CH, n === 6 && d[2] ? CH * .22 : l, d[2] ? RD : GR)); }
    }
    else if (k < 34) { const h = k - 27; if (h === 4) { g.strokeStyle = '#9fb4d6'; g.lineWidth = 7; g.beginPath(); g.roundRect(CW * .14, CH * .12, CW * .72, CH * .76, 14); g.stroke(); } else { g.font = `900 ${CH * .62}px ${SER}`; g.fillStyle = h === 5 ? GR : h === 6 ? RD : BL; g.fillText(HON[h], CW / 2, CH * .52); } }
    g.restore();
  }
  return c;
}

// ===== 手牌（西家＝自分、北家＝部下、東家（親）＝女同僚、南家＝部長。ツモ順は 自分→部下→女同僚→部長） =====
export const HANDS = [
  [0, 1, 2, 17, 17, 31, 31, 32, 32, 32, 33, 33, 33],            // 自分：白と九筒のシャンポン。白なら大三元
  [0, 8, 9, 17, 18, 26, 27, 27, 28, 29, 30, 32, 33],            // 部下：国士無双（白待ち）
  [6, 6, 6, 10, 10, 10, 22, 22, 22, 25, 25, 25, 31],            // 女同僚：四暗刻単騎（白待ち）
  [1, 2, 3, 4, 5, 11, 12, 13, 14, 15, 17, 19, 19]];             // 部長：ばらばら
export const DRAWS = [21, 14, 20, 31];                           // 最後の4枚（部長の海底が白）
export const SEATA = i => i * Math.PI / 2;
export function sp(i, lx, y, lz) { const a = SEATA(i), c = Math.cos(a), s = Math.sin(a); return V3(lx * c + lz * s, y, -lx * s + lz * c); }
const HZ = .475, RZ = .14, RP = .061, WZ = .385;
export const handSlot = (i, j) => sp(i, (j - 6) * TW, TY + TH / 2, HZ);
export const drawSlot = i => sp(i, 7.4 * TW, TY + TH / 2, HZ);
export const riverSlot = (i, n) => sp(i, ((n % 6) - 2.5) * TW * 1.03, TY + TD / 2, RZ + TH / 2 + Math.floor(n / 6) * RP);
const RIVN = [16, 16, 17, 17];

export function mkWorld(atlas) {
  const SC = new THREE.Scene(); SC.background = new THREE.Color(0x120d0a);
  const CAM = new THREE.PerspectiveCamera(50, 1, .08, 60);
  const hemi = new THREE.HemisphereLight(0xfff0d8, 0x5a4636, 1.15); SC.add(hemi);
  const sun = new THREE.DirectionalLight(0xffffff, .95); sun.position.set(2, 5, 3); SC.add(sun);
  const lampL = new THREE.PointLight(0xffd9a0, 2.6, 0, 1.1); lampL.position.set(0, 1.95, 0); SC.add(lampL);
  const M = (c, r = .5) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: 0 });
  const box = (w, h, d, m, x, y, z, par) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); (par || SC).add(o); return o; };
  const W = { SC, CAM, THREE, view: { w: 390, h: 844 }, post: [] };

  // ---- 部屋 ----
  const wood = M(0x7a4d2c, .6), wall = M(0xe6d8ba, .9), dwood = M(0x4a2c18, .55);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(9, 9), M(0x8d5f3f, .8)); fl.rotation.x = -Math.PI / 2; SC.add(fl);
  const rug = new THREE.Mesh(new THREE.CircleGeometry(1.75, 48), M(0x2f5d4b, .95)); rug.rotation.x = -Math.PI / 2; rug.position.y = .003; SC.add(rug);
  const sh = new THREE.Mesh(new THREE.CircleGeometry(.95, 40), new THREE.MeshBasicMaterial({ color: 0, transparent: true, opacity: .28 })); sh.rotation.x = -Math.PI / 2; sh.position.y = .006; SC.add(sh);
  box(6, 3, .1, wall, 0, 1.5, -2.25); box(6, .95, .14, wood, 0, .475, -2.22); box(6, .05, .18, dwood, 0, .97, -2.2);
  box(6, .1, 7, M(0xd8c9a8, .95), 0, 3.05, .5); box(6, 3, .1, wall, 0, 1.5, 3.4); box(6, .95, .14, wood, 0, .475, 3.37); box(.1, 3, 7, wall, -2.75, 1.5, .5); box(.1, 3, 7, wall, 2.75, 1.5, .5); box(.1, 3, 6, wall, -2.75, 1.5, 0); box(.14, .95, 6, wood, -2.72, .475, 0); box(.1, 3, 6, wall, 2.75, 1.5, 0); box(.14, .95, 6, wood, 2.72, .475, 0);
  // 窓（うしろの壁の右）
  const WIN = V3(1.25, 1.55, -2.19);
  { const cv = document.createElement('canvas'); cv.width = 256; cv.height = 288; const g = cv.getContext('2d'); const gr = g.createLinearGradient(0, 0, 0, 288); gr.addColorStop(0, '#0a1030'); gr.addColorStop(1, '#27336b'); g.fillStyle = gr; g.fillRect(0, 0, 256, 288);
    g.fillStyle = '#fff3b8'; g.beginPath(); g.arc(180, 70, 34, 0, 7); g.fill(); g.fillStyle = '#ffffff'; for (let i = 0; i < 40; i++)g.fillRect(hash(i) * 256, hash(i + 50) * 150, 2, 2);
    for (let i = 0; i < 7; i++) { const bw = 30 + hash(i + 9) * 22, bh = 60 + hash(i + 20) * 90, bx = i * 38 - 6; g.fillStyle = '#060a1c'; g.fillRect(bx, 288 - bh, bw, bh); g.fillStyle = '#ffd97a'; for (let a = 0; a < 3; a++)for (let b = 0; b < 6; b++)if (hash(i * 31 + a * 7 + b) > .5) g.fillRect(bx + 5 + a * 9, 288 - bh + 8 + b * 13, 5, 7); }
    const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; const p = new THREE.Mesh(new THREE.PlaneGeometry(.92, 1.04), new THREE.MeshBasicMaterial({ map: tx })); p.position.copy(WIN); SC.add(p);
    box(1.06, .07, .1, dwood, WIN.x, WIN.y + .55, WIN.z + .02); box(1.06, .07, .1, dwood, WIN.x, WIN.y - .55, WIN.z + .02); box(.07, 1.16, .1, dwood, WIN.x - .5, WIN.y, WIN.z + .02); box(.07, 1.16, .1, dwood, WIN.x + .5, WIN.y, WIN.z + .02);
    W.glass = new THREE.Mesh(new THREE.PlaneGeometry(.92, 1.04), new THREE.MeshBasicMaterial({ color: 0xbfe3ff, transparent: true, opacity: .16 })); W.glass.position.set(WIN.x, WIN.y, WIN.z + .012); SC.add(W.glass);
    W.bar = box(.04, 1.04, .05, dwood, WIN.x, WIN.y, WIN.z + .03); }
  // ドア（うしろの壁の左）
  const DOOR = V3(-1.3, 0, -2.19);
  { box(.98, 2.1, .04, new THREE.MeshBasicMaterial({ color: 0x07070c }), DOOR.x, 1.05, DOOR.z + .005); box(.09, 2.2, .12, dwood, DOOR.x - .53, 1.1, DOOR.z + .03); box(.09, 2.2, .12, dwood, DOOR.x + .53, 1.1, DOOR.z + .03); box(1.15, .09, .12, dwood, DOOR.x, 2.19, DOOR.z + .03);
    const piv = new THREE.Group(); piv.position.set(DOOR.x - .48, 0, DOOR.z + .05); SC.add(piv); W.door = piv;
    box(.96, 2.08, .05, M(0x6b4226, .5), .48, 1.04, 0, piv); W.dglass = box(.5, .6, .06, new THREE.MeshBasicMaterial({ color: 0xcfd6c8 }), .48, 1.5, 0, piv); const kn = new THREE.Mesh(new THREE.SphereGeometry(.04, 12, 10), M(0xd9b24a, .3)); kn.position.set(.86, 1.0, .05); piv.add(kn); }
  // 看板・時計
  { const cv = document.createElement('canvas'); cv.width = 256; cv.height = 128; const g = cv.getContext('2d'); g.fillStyle = '#3a1410'; g.fillRect(0, 0, 256, 128); g.strokeStyle = '#ffcf5a'; g.lineWidth = 6; g.strokeRect(8, 8, 240, 112); g.fillStyle = '#ffcf5a'; g.font = '900 78px "Hiragino Mincho ProN","Yu Mincho","Noto Serif CJK JP",serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('麻雀', 128, 68);
    const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; const p = new THREE.Mesh(new THREE.PlaneGeometry(.8, .4), new THREE.MeshBasicMaterial({ map: tx })); p.position.set(0, 2.3, -2.19); SC.add(p);
    const ck = new THREE.Mesh(new THREE.CylinderGeometry(.17, .17, .04, 28), M(0xfaf6ea, .4)); ck.rotation.x = Math.PI / 2; ck.position.set(-.1, 1.62, -2.18); SC.add(ck); box(.015, .11, .01, dwood, -.1, 1.665, -2.155); box(.08, .015, .01, dwood, -.065, 1.62, -2.155); }
  // 明かり
  const LAMP = V3(0, 2.12, 0);
  { const g = new THREE.Group(); SC.add(g); W.lampG = g; const cord = new THREE.Mesh(new THREE.CylinderGeometry(.008, .008, 1.1, 6), dwood); cord.position.set(0, 2.72, 0); cord.scale.y = .8; g.add(cord);
    const shd = new THREE.Mesh(new THREE.ConeGeometry(.3, .2, 28, 1, true), new THREE.MeshStandardMaterial({ color: 0xc8402e, roughness: .4, side: THREE.DoubleSide })); shd.position.copy(LAMP).y += .08; g.add(shd);
    W.bulb = new THREE.Mesh(new THREE.SphereGeometry(.085, 16, 12), new THREE.MeshBasicMaterial({ color: 0xfff2c4 })); W.bulb.position.set(0, 2.1, 0); g.add(W.bulb); }
  W.WIN = WIN; W.DOOR = DOOR; W.LAMP = LAMP;

  // ---- 卓と牌 ----
  const TBL = new THREE.Group(); SC.add(TBL); W.TBL = TBL;
  box(1.2, .06, 1.2, dwood, 0, TY - .04, 0, TBL); box(1.08, .014, 1.08, M(0x1e7a52, .95), 0, TY - .007, 0, TBL);
  for (const [x, z, w, d] of [[0, .57, 1.2, .06], [0, -.57, 1.2, .06], [.57, 0, .06, 1.08], [-.57, 0, .06, 1.08]]) box(w, .03, d, wood, x, TY + .004, z, TBL);
  const leg = new THREE.Mesh(new THREE.CylinderGeometry(.09, .12, .66, 16), dwood); leg.position.y = .34; TBL.add(leg); const ft = new THREE.Mesh(new THREE.CylinderGeometry(.34, .36, .04, 24), dwood); ft.position.y = .02; TBL.add(ft);
  const atex = new THREE.CanvasTexture(atlas); atex.colorSpace = THREE.SRGBColorSpace; atex.anisotropy = 4;
  const TMAT = new THREE.MeshStandardMaterial({ map: atex, roughness: .32 });
  const baseGeo = new RoundedBoxGeometry(TW, TH, TD, 1, .006);
  const geoCache = {};
  function tileGeo(face) {
    if (geoCache[face]) return geoCache[face]; const g = baseGeo.clone(), p = g.attributes.position, uv = g.attributes.uv;
    const a = V3(), b = V3(), c = V3(), n = V3();
    for (let i = 0; i < p.count; i += 3) {
      a.fromBufferAttribute(p, i); b.fromBufferAttribute(p, i + 1); c.fromBufferAttribute(p, i + 2); n.subVectors(b, a).cross(c.clone().sub(a)).normalize();
      const front = n.z > .7, k = front ? face : (n.z < -.7 || (a.z + b.z + c.z) / 3 < -TD * .2) ? 35 : 34, cx = k % 9, cy = Math.floor(k / 9);
      for (let j = 0; j < 3; j++) { const x = p.getX(i + j), y = p.getY(i + j); uv.setXY(i + j, front ? (cx + .5 + x / TW * .93) / 9 : (cx + .5) / 9, front ? 1 - (cy + .5 - y / TH * .93) / 4 : 1 - (cy + .5) / 4); }
    }
    uv.needsUpdate = true; return geoCache[face] = g;
  }
  const qOf = (seat, mode) => new THREE.Quaternion().setFromEuler(new THREE.Euler(mode === 'up' ? -Math.PI / 2 : mode === 'down' ? Math.PI / 2 : 0, SEATA(seat), 0, 'YXZ'));
  const TL = []; W.TL = TL;
  function addTile(face, pos, q, kind, seat, j) { const m = new THREE.Mesh(tileGeo(face), TMAT); TBL.add(m); const o = { m, face, kind, seat, j, bp: pos.clone(), bq: q.clone() }; TL.push(o); return o; }
  W.hand = [[], [], [], []];
  for (let i = 0; i < 4; i++)for (let j = 0; j < 13; j++)W.hand[i].push(addTile(HANDS[i][j], handSlot(i, j), qOf(i, 'st'), 'hand', i, j));
  // 残りの牌を、河と王牌に配る（部下の河には、国士でいらない中の牌だけ）
  { const pool = []; for (let k = 0; k < 34; k++)for (let n = 0; n < 4; n++)pool.push(k); const take = k => { const i = pool.indexOf(k); if (i < 0) throw new Error('牌が足りない ' + k); pool.splice(i, 1); };
    HANDS.flat().forEach(take); DRAWS.forEach(take);
    let sd = 20261113; const rnd = () => { sd = (sd + 0x6D2B79F5) >>> 0; let x = sd; x = Math.imul(x ^ x >>> 15, x | 1); x ^= x + Math.imul(x ^ x >>> 7, x | 61); return ((x ^ x >>> 14) >>> 0) / 4294967296; };
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1));[pool[i], pool[j]] = [pool[j], pool[i]]; }
    const yao = k => k >= 27 || k % 9 === 0 || k % 9 === 8; const riv = [[], [], [], []];
    for (let n = 0; n < 16; n++) { const i = pool.findIndex(k => !yao(k)); riv[1].push(pool.splice(i, 1)[0]); }
    for (const i of [0, 2, 3]) for (let n = 0; n < RIVN[i]; n++)riv[i].push(pool.pop());
    W.river = riv.map((r, i) => r.map((k, n) => addTile(k, riverSlot(i, n), qOf(i, 'up'), 'river', i, n)));
    // 王牌（女同僚の前）。7山＋最後のツモ2山
    W.wall = []; const wp = (s, top) => sp(2, (s - 4) * TW * 1.02, TY + TD / 2 + (top ? TD : 0), WZ);
    for (let s = 0; s < 7; s++)for (const top of [0, 1]) { const dora = s === 2 && top; W.wall.push(addTile(pool.pop(), wp(s, top), qOf(2, dora ? 'up' : 'down'), 'wall', 2, s)); }
    W.dr = DRAWS.map((k, i) => { const o = addTile(k, wp(7 + (i >> 1), !(i & 1)), qOf(2, 'down'), 'draw', i, 0); o.pH = drawSlot(i); o.qH = qOf(i, 'st'); o.pR = riverSlot(i, RIVN[i]); o.qR = qOf(i, 'up'); return o; });
  }
  // ツモ→切る の進み具合 k（0＝山、.45〜.6＝手もと、1＝河）
  W.setDraw = (i, k) => {
    const o = W.dr[i], m = o.m; if (k <= 0) return;
    if (k < .6) { const u = ez(K(k, 0, .45)); m.position.lerpVectors(o.bp, o.pH, u); m.position.y += Math.sin(u * Math.PI) * .12; m.quaternion.slerpQuaternions(o.bq, o.qH, u); }
    else { const u = ez(K(k, .6, 1)); m.position.lerpVectors(o.pH, o.pR, u); m.position.y += Math.sin(u * Math.PI) * .09; m.quaternion.slerpQuaternions(o.qH, o.qR, u); }
  };
  // 手牌をたおして見せる（k：0〜1）
  const upQ = [0, 1, 2, 3].map(i => qOf(i, 'up'));
  W.reveal = (i, k, from) => { (from || W.hand[i]).forEach((o, j) => { const u = eo(cl(k * 1.7 - j * .05)); if (u <= 0) return; const m = o.m, d = sp(i, 0, 0, -1); m.position.x += d.x * TH * .5 * u; m.position.z += d.z * TH * .5 * u; m.position.y += -(TH - TD) / 2 * u + Math.sin(u * Math.PI) * .03; m.quaternion.slerpQuaternions(m.quaternion.clone(), upQ[i], u); }); };

  // ---- いす ----
  W.chairs = [0, 1, 2, 3].map(i => { const g = new THREE.Group(); g.position.copy(sp(i, 0, 0, .92)); g.rotation.y = SEATA(i); SC.add(g); box(.44, .06, .42, wood, 0, .42, 0, g); box(.44, .5, .05, wood, 0, .7, .2, g); for (const [x, z] of [[-.18, -.17], [.18, -.17], [-.18, .17], [.18, .17]]) box(.04, .42, .04, dwood, x, .21, z, g); return g; });

  // ---- 人 ----
  const UP = V3(0, 1, 0), WHITE = new THREE.Color(0xf4f4f4), BLK = new THREE.MeshBasicMaterial({ color: 0x151515 });
  const CH_ = []; W.chars = CH_;
  function mkChar(o) {
    const g = new THREE.Group(); SC.add(g); const f = o.fat || 1;
    const cloth = M(o.cloth), skin = M(o.skin || 0xffd9b8, .55), hairM = M(o.hairC || 0x1c1c1c, .7), pant = M(o.pant || 0x2a2f3a);
    const c0 = cloth.color.clone(), s0 = skin.color.clone();
    const tr = new THREE.Group(); g.add(tr);
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(.15 * f, .34, 6, 16), cloth); body.position.y = .29; tr.add(body);
    if (o.tie) { const ti = box(.045, .2, .02, M(o.tie), 0, .4, .153 * f, tr); ti.rotation.x = -.08; }
    if (o.vest) { const v = new THREE.Mesh(new THREE.CapsuleGeometry(.156 * f, .2, 6, 16), M(o.vest)); v.position.y = .27; v.scale.z = .98; tr.add(v); }
    const hd = new THREE.Group(); hd.position.y = .8; tr.add(hd);
    hd.add(new THREE.Mesh(new THREE.SphereGeometry(.155, 24, 18), skin));
    const eG = new THREE.SphereGeometry(.021, 10, 8), eL = new THREE.Mesh(eG, BLK), eR = new THREE.Mesh(eG, BLK); eL.position.set(-.056, .012, .143); eR.position.set(.056, .012, .143); hd.add(eL, eR);
    const bG = new THREE.BoxGeometry(.058, .013, .012), bL = new THREE.Mesh(bG, BLK), bR = new THREE.Mesh(bG, BLK); bL.position.set(-.058, .066, .146); bR.position.set(.058, .066, .146); hd.add(bL, bR);
    const mo = new THREE.Mesh(new THREE.SphereGeometry(.03, 12, 10), new THREE.MeshBasicMaterial({ color: 0x7a1f1f })); mo.position.set(0, -.068, .139); hd.add(mo);
    const cap = (r, th, m) => new THREE.Mesh(new THREE.SphereGeometry(r, 20, 12, 0, Math.PI * 2, 0, Math.PI * th), m);
    const P = { g, tr, hd, o, hL: V3(), hR: V3() };
    if (o.hair === 'cap' || o.hair === 'spiky' || o.hair === 'wig') { const h = cap(.163, .5, hairM); h.rotation.x = -.42; hd.add(h); P.wig = h; if (o.hair === 'spiky') for (let i = 0; i < 6; i++) { const cn = new THREE.Mesh(new THREE.ConeGeometry(.035, .1, 8), hairM); const a = i / 6 * 6.283; cn.position.set(Math.cos(a) * .07, .17, Math.sin(a) * .07 - .02); cn.rotation.set(Math.sin(a) * .5, 0, -Math.cos(a) * .5); hd.add(cn); } }
    if (o.hair === 'wig') { for (let i = -1; i <= 1; i++) { const s = box(.2, .008, .012, BLK, 0, .15, i * .035 - .01, hd); s.rotation.z = .02; s.scale.x = 1 - Math.abs(i) * .15; } for (const s of [-1, 1]) { const sd = new THREE.Mesh(new THREE.SphereGeometry(.05, 10, 8), hairM); sd.position.set(s * .14, .0, -.03); sd.scale.set(.5, 1, 1.2); hd.add(sd); } }
    if (o.hair === 'bob') { const h = cap(.166, .52, hairM); h.rotation.x = -.5; hd.add(h); const b = new THREE.Mesh(new THREE.SphereGeometry(.172, 18, 14), hairM); b.position.set(0, -.04, -.045); b.scale.set(1.04, 1.22, .92); hd.add(b); for (const s of [-1, 1]) { const ck = new THREE.Mesh(new THREE.CircleGeometry(.024, 12), new THREE.MeshBasicMaterial({ color: 0xff9aa8, transparent: true, opacity: .7 })); ck.position.set(s * .095, -.035, .128); ck.rotation.y = s * .6; hd.add(ck); } }
    if (o.glasses) { for (const s of [-1, 1]) { const r = new THREE.Mesh(new THREE.TorusGeometry(.04, .006, 6, 18), BLK); r.position.set(s * .058, .012, .152); hd.add(r); } box(.03, .008, .008, BLK, 0, .015, .156, hd); }
    if (o.stache) box(.075, .018, .012, BLK, 0, -.04, .152, hd);
    if (o.cop) { const cp = new THREE.Mesh(new THREE.CylinderGeometry(.15, .158, .08, 20), M(0x1d2f6b)); cp.position.y = .145; hd.add(cp); const br = box(.2, .012, .1, BLK, 0, .11, .15, hd); br.rotation.x = .15; const bd = new THREE.Mesh(new THREE.SphereGeometry(.022, 8, 6), M(0xe9c24a, .3)); bd.position.set(0, .15, .152); hd.add(bd); }
    const arm = s => { const a = new THREE.Mesh(new THREE.CylinderGeometry(.04, .036, 1, 10), cloth), h = new THREE.Mesh(new THREE.SphereGeometry(.05, 12, 10), skin), sh = new THREE.Mesh(new THREE.SphereGeometry(.052, 10, 8), cloth); sh.position.set(s * (.13 * f + .05), .5, 0); tr.add(a, h, sh); return { a, h, s: sh.position }; };
    const AL = arm(-1), AR = arm(1);
    const legs = [-1, 1].map(s => { const l = new THREE.Mesh(new THREE.CylinderGeometry(.055, .05, 1, 10), pant); l.position.set(s * .085, .3, 0); g.add(l); return l; });
    P.home = V3(); P.homeR = 0; P.homeVis = true; P.homeSt = 0;
    P.reset = () => { g.position.copy(P.home); g.rotation.set(0, P.homeR, 0); g.scale.setScalar(1); g.visible = P.homeVis; P.st = P.homeSt; P.by = 0; P.ln = 0; P.tw = 0; P.sd = 0; P.hy = 0; P.hp = 0; P.hr = 0; P.es = 1; P.ey = 1; P.br = 0; P.mo = 0; P.mw = 1.1; P.wh = 0; if (P.homeSt) { P.hL.set(-.22 * f, .78, .03); P.hR.set(.22 * f, .78, .03); } else { P.hL.set(-.16, .78, .36); P.hR.set(.16, .78, .36); } if (P.wig) P.wig.visible = true; };
    const v = V3(), qi = new THREE.Quaternion();
    P.apply = () => {
      const hy = .45 + .2 * P.st; tr.position.set(0, hy + P.by, 0); tr.rotation.set(P.ln, P.tw, P.sd); hd.rotation.set(P.hp, P.hy, P.hr);
      legs.forEach(l => { l.visible = P.st > .05; l.scale.y = hy + P.by; l.position.y = (hy + P.by) / 2; });
      qi.copy(tr.quaternion).invert();
      for (const [A, h] of [[AL, P.hL], [AR, P.hR]]) { v.copy(h).sub(tr.position).applyQuaternion(qi); A.h.position.copy(v); const d = v.clone().sub(A.s), len = Math.max(.02, d.length()); A.a.position.copy(A.s).addScaledVector(d, .5); A.a.quaternion.setFromUnitVectors(UP, d.normalize()); A.a.scale.set(1, len, 1); }
      eL.scale.set(P.es, P.es * P.ey, P.es); eR.scale.copy(eL.scale); bL.rotation.z = P.br; bR.rotation.z = -P.br; bL.position.y = bR.position.y = .066 + (P.es - 1) * .02; mo.scale.set(P.mw, .13 + P.mo * 1.5, .35);
      cloth.color.copy(c0).lerp(WHITE, P.wh); skin.color.copy(s0).lerp(WHITE, P.wh * .8);
    };
    // 世界の点を、この人から見た点になおす（手をのばす先を決めるのに使う）
    P.toL = w => { const d = w.clone().sub(g.position), a = -g.rotation.y, c = Math.cos(a), s = Math.sin(a); return V3(d.x * c + d.z * s, d.y, -d.x * s + d.z * c); };
    P.reach = (side, w, k = 1) => { const h = side === 'L' ? P.hL : P.hR; h.lerp(P.toL(w), k); };
    P.headW = () => hd.getWorldPosition(V3());
    P.face = (to, k = 1) => { const d = to.clone().sub(g.position); g.rotation.y = lerp(g.rotation.y, Math.atan2(d.x, d.z), k); };
    P.seat = i => { P.home.copy(sp(i, 0, 0, .9)); P.homeR = SEATA(i) + Math.PI; };
    CH_.push(P); return P;
  }
  const C = W.C = {
    sf: mkChar({ cloth: 0x2c3e73, hair: 'cap', tie: 0xd94f3a }),
    bk: mkChar({ cloth: 0xf1f4fa, hair: 'spiky', hairC: 0x5a3a22, tie: 0x2f66c8, fat: .92 }),
    on: mkChar({ cloth: 0xf29bb5, hair: 'bob', hairC: 0x4a2c1c, fat: .9 }),
    bu: mkChar({ cloth: 0x5d6470, hair: 'wig', tie: 0xb5261e, fat: 1.25, glasses: 1, stache: 1 }),
    st: mkChar({ cloth: 0xf4f4f4, hair: 'cap', vest: 0x1a1a1f, fat: .95 }),
    p1: mkChar({ cloth: 0x27408b, cop: 1, pant: 0x1d2f6b }),
    p2: mkChar({ cloth: 0x27408b, cop: 1, pant: 0x1d2f6b, fat: 1.1 })
  };
  C.sf.seat(0); C.bk.seat(1); C.on.seat(2); C.bu.seat(3);
  for (const c of [C.st, C.p1, C.p2]) { c.homeVis = false; c.homeSt = 1; c.home.set(-1.3, 0, -3); }
  W.seatC = [C.sf, C.bk, C.on, C.bu];

  // ---- 小物・つぶ ----
  const inst = (geo, mat, n) => { const m = new THREE.InstancedMesh(geo, mat, n); m.frustumCulled = false; m.count = n; SC.add(m); return m; };
  const D = new THREE.Object3D(), ZERO = new THREE.Matrix4().makeScale(0, 0, 0);
  const NS = 150; W.sticks = inst(new THREE.BoxGeometry(.014, .014, .1), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .4 }), NS);
  { const cols = [0xffffff, 0xffffff, 0xff5a4a, 0x4a8bff, 0xffd24a], c = new THREE.Color(); for (let i = 0; i < NS; i++) { W.sticks.setColorAt(i, c.set(cols[i % 5])); } }
  const NT = 56; W.tears = inst(new THREE.SphereGeometry(.022, 8, 6), new THREE.MeshBasicMaterial({ color: 0x6ec6ff }), NT);
  const NCF = 150; W.conf = inst(new THREE.PlaneGeometry(.045, .03), new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }), NCF);
  { const cols = [0xff4a4a, 0xffd24a, 0x4ad1ff, 0x6ae36a, 0xff8ad1, 0xffffff], c = new THREE.Color(); for (let i = 0; i < NCF; i++)W.conf.setColorAt(i, c.set(cols[i % 6])); }
  const NG = 44; W.shards = inst(new THREE.CircleGeometry(.07, 3), new THREE.MeshBasicMaterial({ color: 0xd8f0ff, transparent: true, opacity: .75, side: THREE.DoubleSide }), NG);
  const hideAll = m => { for (let i = 0; i < m.count; i++)m.setMatrixAt(i, ZERO); m.instanceMatrix.needsUpdate = true; };
  W.put = (m, i, p, rx, ry, rz, s) => { D.position.copy(p); D.rotation.set(rx, ry, rz); D.scale.setScalar(s); D.updateMatrix(); m.setMatrixAt(i, D.matrix); };
  // 点棒：部長の胸から、あがった3人へ飛ぶ（女同僚に6割）
  const CHEST = () => C.bu.g.position.clone().add(V3(.25, 1.0, 0));
  W.payTo = i => { const s = [2, 0, 2, 1, 2][i % 5]; return sp(s, (hash(i * 3.1) - .5) * .5, TY + .03 + hash(i * 1.7) * .04, .47 + hash(i * 2.3) * .05); };
  W.flySticks = (t, t0, gap, n = NS) => { const a = CHEST(); for (let i = 0; i < n; i++) { const u = (t - t0 - i * gap) / .62; if (u <= 0) { W.sticks.setMatrixAt(i, ZERO); continue; } const k = cl(u), b = W.payTo(i), p = a.clone().lerp(b, k); p.y += Math.sin(k * Math.PI) * (.45 + hash(i) * .5); W.put(W.sticks, i, p, k < 1 ? t * 9 + i : 0, i * 2.4 + (k < 1 ? t * 7 : 0), k < 1 ? t * 5 : Math.PI / 2 * (i % 2), 1); } W.sticks.instanceMatrix.needsUpdate = true; };
  // 涙：顔の両わきから噴水のように
  W.cry = (c, t, k) => W.post.push(() => { const h = c.headW(), ry = c.g.rotation.y, fx = Math.sin(ry), fz = Math.cos(ry), sx = Math.cos(ry), sz = -Math.sin(ry); for (let i = 0; i < NT; i++) { const s = i % 2 ? 1 : -1, ph = (t * 1.5 + hash(i) * 1) % 1, sp_ = .5 + hash(i + 9) * .5; const p = V3(h.x + sx * s * (.06 + ph * .55 * sp_) + fx * (.14 + ph * .1), h.y + .02 + ph * 1.0 * sp_ - ph * ph * 1.5, h.z + sz * s * (.06 + ph * .55 * sp_) + fz * (.14 + ph * .1)); W.put(W.tears, i, p, 0, 0, 0, i < NT * k ? 1 - ph * .5 : 0); } W.tears.instanceMatrix.needsUpdate = true; });
  W.confetti = (t, k) => { for (let i = 0; i < NCF; i++) { const ph = (t * .32 + hash(i)) % 1; W.put(W.conf, i, V3((hash(i + 3) - .5) * 2.6, 2.6 - ph * 2.2, (hash(i + 7) - .5) * 2.2), t * 4 + i, t * 3 + i * 2, i, i < NCF * k ? 1 : 0); } W.conf.instanceMatrix.needsUpdate = true; };
  W.shatter = (t) => { for (let i = 0; i < NG; i++) { const a = hash(i) * 6.283, r = hash(i + 5) * .45, v = 1 + hash(i + 11) * 2; const p = V3(WIN.x + Math.cos(a) * r * (1 + t * .8), WIN.y + Math.sin(a) * r + t * .6 * Math.sin(a) - t * t * 2.2, WIN.z + .03 + t * v * (hash(i + 2) > .35 ? -1 : .5)); W.put(W.shards, i, p, t * 6 + i, t * 5 + i, i, t > 0 && p.y > 0 ? .5 + hash(i + 1) : 0); } W.shards.instanceMatrix.needsUpdate = true; };
  // 飛ぶ小物（財布・時計・カツラ・借用書）
  W.props = {
    wallet: box(.11, .07, .025, M(0x6b3a1e), 0, -9, 0), watch: (() => { const m = new THREE.Mesh(new THREE.TorusGeometry(.035, .012, 8, 16), M(0xe9c24a, .25)); SC.add(m); return m; })(),
    wig: (() => { const m = new THREE.Mesh(new THREE.SphereGeometry(.163, 20, 12, 0, Math.PI * 2, 0, Math.PI * .5), M(0x1c1c1c, .7)); SC.add(m); return m; })(),
    iou: (() => { const cv = document.createElement('canvas'); cv.width = 128; cv.height = 180; const g = cv.getContext('2d'); g.fillStyle = '#fffdf2'; g.fillRect(0, 0, 128, 180); g.fillStyle = '#222'; g.font = '900 40px serif'; g.textAlign = 'center'; '借用書'.split('').forEach((s, i) => g.fillText(s, 64, 52 + i * 46)); const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; const m = new THREE.Mesh(new THREE.PlaneGeometry(.12, .17), new THREE.MeshBasicMaterial({ map: tx, side: THREE.DoubleSide })); SC.add(m); return m; })(),
    hanky: box(.1, .1, .004, new THREE.MeshBasicMaterial({ color: 0xffffff }), 0, -9, 0)
  };
  W.arc = (m, t, t0, dur, a, b, h, spin = 8) => { const u = (t - t0) / dur; if (u <= 0) { m.visible = false; return 0; } const k = cl(u); m.visible = true; m.position.lerpVectors(a, b, k); m.position.y += Math.sin(k * Math.PI) * h; m.rotation.set(k < 1 ? t * spin : 0, k < 1 ? t * spin * .7 : 0, 0); return k; };

  // ---- 毎コマ ----
  W.reset = () => {
    for (const o of TL) { o.m.position.copy(o.bp); o.m.quaternion.copy(o.bq); o.m.scale.setScalar(1); o.m.visible = true; }
    TBL.position.set(0, 0, 0); TBL.rotation.set(0, 0, 0); for (const c of CH_) c.reset();
    W.door.rotation.y = 0; W.glass.visible = true; W.bar.visible = true; W.light = 1; W.lampG.visible = true; W.bulb.visible = true; W.dglass.material.color.set(0xcfd6c8);
    for (const k in W.props) W.props[k].visible = false; hideAll(W.sticks); hideAll(W.tears); hideAll(W.conf); hideAll(W.shards);
    W.chairs.forEach(c => { c.visible = true; c.rotation.x = 0; }); W.post.length = 0; W.shake = 0;
  };
  W.apply = () => {
    for (const c of CH_) c.apply(); hemi.intensity = 1.15 * W.light; sun.intensity = .95 * W.light; lampL.intensity = 2.6 * W.light;
    SC.updateMatrixWorld(true); for (const f of W.post) f();
  };
  // カメラ：場所 p から l を見る。l のところで左右に hw、上下に hh が入るように画角を決める（縦長でも横長でも入る）
  const cp = V3(), cl_ = V3();
  W.setCam = (p, l, hw, hh, t = 0) => {
    cp.set(p[0], p[1], p[2]); cl_.set(l[0], l[1], l[2]); const d = cp.distanceTo(cl_), asp = W.view.w / W.view.h;
    CAM.aspect = asp; CAM.fov = cl(2 * Math.atan(Math.max(hh / d, hw / d / asp)) * 180 / Math.PI, 12, 96);
    if (W.shake) { const s = W.shake; cp.x += Math.sin(t * 71) * s; cp.y += Math.sin(t * 93 + 1) * s; cl_.x += Math.sin(t * 57 + 2) * s * .6; cl_.y += Math.sin(t * 83 + 3) * s * .6; }
    CAM.position.copy(cp); CAM.lookAt(cl_); CAM.updateProjectionMatrix(); CAM.updateMatrixWorld(true);
  };
  const pv = V3();
  W.pj = w => { pv.copy(w).project(CAM); return { x: (pv.x * .5 + .5) * W.view.w, y: (-pv.y * .5 + .5) * W.view.h, ok: pv.z < 1 }; };
  return W;
}
