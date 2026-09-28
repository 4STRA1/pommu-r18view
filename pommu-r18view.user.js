// ==UserScript==
// @name         PommuR18imgView
// @namespace    https://github.com/4STRA1
// @match        https://ch.dlsite.com/*
// @version      1.0.0
// @description  DLsiteの画像表示を補助するTampermonkeyスクリプト
// @author       4STRA1
// @supportURL   https://github.com/4STRA1/pommu-r18view
// @run-at       document-start
// @grant        unsafeWindow
// @updateURL    https://raw.githubusercontent.com/4STRA1/pommu-r18view/main/pommu-r18view.user.js
// @downloadURL  https://raw.githubusercontent.com/4STRA1/pommu-r18view/main/pommu-r18view.user.js
// ==/UserScript==


(() => {
  // Firefox: unsafeWindow + exportFunction / Chrome: そのままのwindow + 素通しの関数
  const W = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
  const ex = typeof exportFunction === 'function' ? exportFunction : (f) => f;

  const MIN_POSTS = 6;   // 1回の読み込みで最低これだけ集める
  const MAX_PAGES = 8;   // 1回の読み込みで先読みする最大ページ数
  const LIST_PATH = '/api/pommu/posts';
  const ANCHOR = 'label[for^="r18toggle"]'; // 「R18投稿表示」のトグル(SP/PC両方)
  const COLOR_ON = '#38bdf8';               // 水色

  let enabled = true;
  try { enabled = localStorage.getItem('__pf_on') !== '0'; } catch {}
  let scanned = 0, passed = 0, failed = 0;

  // --- サイトの見た目に合わせたスタイル(色は文字色から継承) ---
  const style = document.createElement('style');
  style.textContent = `
.pf-row{margin-bottom:.75rem;--pf-w:2rem;--pf-h:1.25rem}
.pf-track{position:relative;flex:none;box-sizing:border-box;width:var(--pf-w);height:var(--pf-h);border-radius:9999px;border:1px solid color-mix(in srgb,currentColor 40%,transparent);transition:background-color .2s ease-out,border-color .2s ease-out}
.pf-track::after{content:"";position:absolute;top:2px;left:2px;width:calc(var(--pf-h) - 6px);height:calc(var(--pf-h) - 6px);border-radius:9999px;background:color-mix(in srgb,currentColor 60%,transparent);transition:transform .2s ease-out,background-color .2s ease-out}
.pf-row[aria-checked="true"] .pf-track{background:${COLOR_ON};border-color:${COLOR_ON}}
.pf-row[aria-checked="true"] .pf-track::after{background:#fff;transform:translateX(calc(var(--pf-w) - var(--pf-h)))}
.pf-stat{margin-left:.5rem;font-size:11px;opacity:.6}`;
  document.documentElement.append(style);

  // --- トグル行(サイトの label と同じクラス構成) ---
  const rows = new Set();
  const byAnchor = new WeakMap();

  const toggle = () => {
    enabled = !enabled;
    try { localStorage.setItem('__pf_on', enabled ? '1' : '0'); } catch {}
    paint();
    setTimeout(() => location.reload(), 150); // 絞り込みは読み込み時に行うため、反映にはリロードが必要
  };

  const makeRow = () => {
    const row = document.createElement('label');
    row.className = 'label justify-start p-0 cursor-pointer pf-row';
    row.setAttribute('role', 'switch');
    row.tabIndex = 0;
    const name = document.createElement('span');
    name.className = 'mr-2 text-body-md text-on-surface';
    name.textContent = 'R18画像のみ表示';
    const track = document.createElement('span');
    track.className = 'pf-track';
    const stat = document.createElement('span');
    stat.className = 'pf-stat';
    row.append(name, track, stat);
    row._stat = stat;
    row.addEventListener('click', toggle);
    row.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle(); }
    });
    return row;
  };

  const paint = () => {
    const t = enabled ? `${passed}/${scanned}${failed ? ' ERR' + failed : ''}` : '';
    for (const row of rows) {
      const v = String(enabled);
      if (row.getAttribute('aria-checked') !== v) row.setAttribute('aria-checked', v);
      if (row._stat.textContent !== t) row._stat.textContent = t; // 同じ内容なら触らない(再描画ループ防止)
    }
  };

  const mount = () => {
    for (const r of rows) if (!r.isConnected) rows.delete(r);
    for (const a of document.querySelectorAll(ANCHOR)) {
      let row = byAnchor.get(a);
      if (!row) {
        row = makeRow();
        byAnchor.set(a, row);
        // 実物のトグルの大きさに合わせる(非表示で測れない時は既定値のまま)
        const inp = a.querySelector('input');
        const cs = inp && getComputedStyle(inp);
        if (cs && parseFloat(cs.width) > 0 && parseFloat(cs.height) > 0) {
          row.style.setProperty('--pf-w', cs.width);
          row.style.setProperty('--pf-h', cs.height);
        }
      }
      rows.add(row);
      if (a.previousElementSibling !== row) a.parentElement.insertBefore(row, a); // 真上に置く
    }
    paint();
  };

  let queued = false;
  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; mount(); });
  };
  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });

  // --- R18 かつ 画像付き ---
  const keep = (p) => (p.post?.ageCategory ?? 1) >= 2 && (p.post?.imageUrls?.length ?? 0) > 0;

  // --- 次ページを先読みして、条件に合う投稿を集める ---
  async function collect(s) {
    const u = new URL(s.u);
    const out = [];
    let last = null, pages = 0;
    while (pages < MAX_PAGES) {
      const r = await fetch(u.href, { headers: s.h, credentials: 'include' });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const j = await r.json();
      pages++;
      last = j;
      for (const p of j.posts || []) {
        scanned++;
        if (keep(p)) { out.push(p); passed++; }
      }
      paint();
      if (out.length >= MIN_POSTS || !j.hasMorePages || !j.nextCursor) break;
      u.searchParams.set('nextCursor', j.nextCursor);
    }
    return { ...last, posts: out };
  }

  // --- XHR フック: 投稿一覧のリクエストだけ差し替える ---
  const proto = W.XMLHttpRequest.prototype;
  const oo = proto.open, os = proto.send, oh = proto.setRequestHeader;
  const meta = new WeakMap();

  proto.open = ex(function (m, url, ...r) {
    try {
      const u = new URL(String(url), location.href);
      if (enabled && u.pathname === LIST_PATH && String(m).toUpperCase() === 'GET') {
        meta.set(this, { u: u.href, h: {} });
      } else {
        meta.delete(this);
      }
    } catch {}
    return oo.call(this, m, url, ...r);
  }, W);

  proto.setRequestHeader = ex(function (k, v) {
    try { const s = meta.get(this); if (s) s.h[k] = v; } catch {}
    return oh.call(this, k, v);
  }, W);

  proto.send = ex(function (body) {
    const s = meta.get(this);
    if (!s) return os.call(this, body);
    const xhr = this;
    collect(s).then((json) => {
      const blobUrl = W.URL.createObjectURL(new W.Blob([JSON.stringify(json)], { type: 'application/json' }));
      oo.call(xhr, 'GET', blobUrl);
      os.call(xhr);
    }).catch(() => {
      failed++; paint();
      os.call(xhr, body); // 失敗時は元のリクエストをそのまま送る
    });
  }, W);
})();