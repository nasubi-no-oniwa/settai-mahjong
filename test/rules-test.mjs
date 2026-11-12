// 接待麻雀のルールの試験（試し用のデータベースで試す。本番には触らない）
const B = 'http://127.0.0.1:9000';
const NS = '?ns=ft-red-default-rtdb';
const tok = uid => { const e = o => Buffer.from(JSON.stringify(o)).toString('base64url'); return e({ alg: 'none', typ: 'JWT' }) + '.' + e({ uid, sub: uid, user_id: uid, provider_id: 'anonymous', iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 3600, aud: 'ft-red', iss: 'https://securetoken.google.com/ft-red', firebase: { sign_in_provider: 'anonymous' } }) + '.'; };
async function req(method, path, body, uid) {
  const r = await fetch(B + '/settaimj' + path + '.json' + NS + (uid ? '&auth=' + tok(uid) : ''), { method, headers: { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) });
  return r.status;
}
const now = { '.sv': 'timestamp' }, inc = { '.sv': { increment: 1 } };
const A = 'userAaaaaaaaaaaaaaaaaaaaa', Bu = 'userBbbbbbbbbbbbbbbbbbbbb', C = 'userCccccccccccccccccccccc';
let bad = 0;
async function ok(name, p, want) { const s = await p; const pass = want ? s === 200 : s !== 200; console.log((pass ? 'OK ' : 'NG ') + name + ' (' + s + ')'); if (!pass) bad++; }
// ---- エンドごとの「見つけた人数」 ----
await ok('Aがクビを見つける（数を1ふやす）', req('PATCH', '', { ['u/' + A + '/e0']: now, ['c/e0']: inc }, A), true);
await ok('Aがもう一度クビを数える', req('PATCH', '', { ['u/' + A + '/e0']: now, ['c/e0']: inc }, A), false);
await ok('印なしで数だけふやす', req('PATCH', '', { ['c/e0']: inc }, A), false);
await ok('数をふやさず印だけつける', req('PATCH', '', { ['u/' + A + '/e1']: now }, A), false);
await ok('2つふやす', req('PATCH', '', { ['u/' + A + '/e1']: now, ['c/e1']: { '.sv': { increment: 2 } } }, A), false);
await ok('Bがクビを見つける', req('PATCH', '', { ['u/' + Bu + '/e0']: now, ['c/e0']: inc }, Bu), true);
await ok('BがAの印をつける', req('PATCH', '', { ['u/' + A + '/e2']: now, ['c/e2']: inc }, Bu), false);
await ok('ないエンド（e11）', req('PATCH', '', { ['u/' + Bu + '/e11']: now, ['c/e11']: inc }, Bu), false);
await ok('時刻をごまかす', req('PATCH', '', { ['u/' + Bu + '/e3']: 123, ['c/e3']: inc }, Bu), false);
await ok('ログインなし', req('PATCH', '', { ['u/' + C + '/e3']: now, ['c/e3']: inc }), false);
await ok('数を消す', req('DELETE', '/c/e0', undefined, A), false);
await ok('印を消す', req('DELETE', '/u/' + A + '/e0', undefined, A), false);
await ok('Bが逃げるを見つける（e10）', req('PATCH', '', { ['u/' + Bu + '/e10']: now, ['c/e10']: inc }, Bu), true);
await ok('Bが制覇を数える', req('PATCH', '', { ['u/' + Bu + '/comp']: now, ['c/comp']: inc }, Bu), true);
await ok('人数を読む（ログインなし）', fetch(B + '/settaimj/c.json' + NS).then(r => r.status), true);
await ok('ほかの人の印は読めない', fetch(B + '/settaimj/u/' + A + '.json' + NS + '&auth=' + tok(Bu)).then(r => r.status), false);
// ---- 引き継ぎコード ----
const rec = uid => ({ u: uid, g: '3,0,-1,0,0,12,0,0,0,0,0', s: 'e0,e5', c: 0, t: now });
await ok('Aがコードを作る', req('PUT', '/x/ABCD2345', rec(A), A), true);
await ok('Aが同じコードを書きなおす', req('PUT', '/x/ABCD2345', rec(A), A), true);
await ok('BがAのコードを書きかえる', req('PUT', '/x/ABCD2345', rec(Bu), Bu), false);
await ok('持ち主をごまかす', req('PUT', '/x/WXYZ6789', rec(A), Bu), false);
await ok('形のちがうコード', req('PUT', '/x/abcd2345', rec(A), A), false);
await ok('中身の形がちがう', req('PUT', '/x/QRST2345', { ...rec(A), g: '1,2,3' }, A), false);
await ok('余計なものを足す', req('PUT', '/x/QRST2345', { ...rec(A), z: 1 }, A), false);
await ok('コードを消す', req('DELETE', '/x/ABCD2345', undefined, A), false);
await ok('コードを知っていれば読める（ログインなし）', fetch(B + '/settaimj/x/ABCD2345.json' + NS).then(r => r.status), true);
await ok('コードの一覧は読めない', fetch(B + '/settaimj/x.json' + NS).then(r => r.status), false);
const c = await fetch(B + '/settaimj/c.json' + NS).then(r => r.json());
console.log('人数', JSON.stringify(c));
if (!c || c.e0 !== 2 || c.e10 !== 1 || c.comp !== 1 || c.e1) bad++;
if (bad) { console.log(bad + ' 件が合いません'); process.exit(1); } else console.log('すべて合いました');
