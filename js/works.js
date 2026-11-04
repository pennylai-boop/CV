/* 作品大圖卡輪播：從 #works-data 內每個 section.product 建立卡片；點擊開啟詳細視窗 */
(function () {
  var data = document.getElementById('works-data');
  var cf = document.getElementById('cf');
  if (!data || !cf) return;
  var secs = [].slice.call(data.querySelectorAll('section.product'));
  var dots = document.getElementById('cf-dots');
  var wm = document.getElementById('wm'), wmBody = wm.querySelector('.wm-body'), wmNo = wm.querySelector('.wm-no');
  var cur = 0, cards = [];
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  secs.forEach(function (sec, i) {
    var t = sec.querySelector('.p-title');
    var name = t ? t.childNodes[0].textContent.trim() : sec.id;
    var sub = t && t.querySelector('span') ? t.querySelector('span').textContent : '';
    var tag = sec.querySelector('.p-tagline');
    var cover = sec.getAttribute('data-cover'), anim = sec.getAttribute('data-anim');
    var card = document.createElement('div');
    card.className = 'cf-card'; card.tabIndex = 0; card.setAttribute('role', 'button');
    card.setAttribute('aria-label', name + '：查看作品');
    var media = cover
      ? '<img alt="" loading="' + (i < 3 ? 'eager' : 'lazy') + '" src="' + cover + '">' + (anim ? '<span class="cf-live">LIVE</span>' : '')
      : '<div class="cf-ph"><div><b></b><small></small></div></div>';
    card.innerHTML = '<div class="cf-media">' + media + '</div>' +
      '<div class="cf-cap"><div><div class="no">No. ' + ('0' + (i + 1)).slice(-2) + '</div><h2></h2><p></p></div><span class="go">查看作品 →</span></div>';
    card.querySelector('h2').textContent = name;
    card.querySelector('p').textContent = tag ? tag.textContent : sub;
    if (!cover) { card.querySelector('.cf-ph b').textContent = name; card.querySelector('.cf-ph small').textContent = sub; }
    card.addEventListener('click', function () { if (i === cur) open(i); else go(i); });
    card.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (i === cur) open(i); else go(i); } });
    cf.appendChild(card);
    cards.push({ el: card, cover: cover, anim: anim, img: card.querySelector('.cf-media img') });
    var d = document.createElement('button');
    d.textContent = name; d.addEventListener('click', function () { go(i); });
    dots.appendChild(d);
  });

  function layout() {
    var n = cards.length, w = cf.clientWidth;
    var gap = Math.min(w * 0.36, 420);
    cards.forEach(function (c, i) {
      var off = i - cur;
      if (off > n / 2) off -= n; if (off < -n / 2) off += n;
      var a = Math.abs(off);
      var x = off * gap * (a > 1 ? 0.82 : 1), z = -a * 260, ry = off === 0 ? 0 : (off > 0 ? -32 : 32);
      c.el.style.transform = 'translateX(' + x + 'px) translateZ(' + z + 'px) rotateY(' + ry + 'deg) scale(' + (off === 0 ? 1 : 0.86) + ')';
      c.el.style.opacity = a > 2 ? 0 : (a === 0 ? 1 : a === 1 ? 0.75 : 0.35);
      c.el.style.filter = a === 0 ? 'none' : 'brightness(.6) saturate(.7)';
      c.el.style.zIndex = 40 - a;
      c.el.style.pointerEvents = a > 2 ? 'none' : 'auto';
      c.el.classList.toggle('on', a === 0);
      // 只有中央卡片播放 GIF，其餘顯示靜態截圖
      if (c.img && c.anim) { var want = a === 0 && !reduce ? c.anim : c.cover; if (c.img.getAttribute('src') !== want) c.img.src = want; }
    });
    [].forEach.call(dots.children, function (b, i) { b.classList.toggle('on', i === cur); });
  }
  function go(i) { cur = (i + cards.length) % cards.length; layout(); }
  document.getElementById('cf-prev').onclick = function () { go(cur - 1); };
  document.getElementById('cf-next').onclick = function () { go(cur + 1); };
  window.addEventListener('resize', layout);

  // 滑動切換
  var sx = null;
  cf.addEventListener('pointerdown', function (e) { sx = e.clientX; });
  cf.addEventListener('pointerup', function (e) {
    if (sx === null) return; var dx = e.clientX - sx; sx = null;
    if (Math.abs(dx) > 50) { go(cur + (dx < 0 ? 1 : -1)); suppress = true; setTimeout(function () { suppress = false; }, 50); }
  });
  var suppress = false;
  cf.addEventListener('click', function (e) { if (suppress) { e.stopPropagation(); e.preventDefault(); } }, true);

  // 自動輪播（滑入暫停）
  var timer = null, paused = false;
  function tick() { if (!paused && !wm.classList.contains('open')) go(cur + 1); }
  if (!reduce) timer = setInterval(tick, 6000);
  cf.addEventListener('mouseenter', function () { paused = true; });
  cf.addEventListener('mouseleave', function () { paused = false; });

  // 詳細視窗
  var opened = -1;
  function open(i) {
    close(true);
    opened = i; cur = i; layout();
    wmBody.appendChild(secs[i]);
    wmNo.textContent = 'No. ' + ('0' + (i + 1)).slice(-2) + ' / ' + ('0' + secs.length).slice(-2);
    wm.classList.add('open'); document.body.classList.add('wm-lock');
    wm.scrollTop = 0;
    if (location.hash !== '#' + secs[i].id) history.replaceState(null, '', '#' + secs[i].id);
    wm.querySelector('.wm-close').focus();
  }
  function close(keep) {
    if (opened >= 0) { data.appendChild(secs[opened]); opened = -1; }
    if (keep === true) return;
    wm.classList.remove('open'); document.body.classList.remove('wm-lock');
    history.replaceState(null, '', location.pathname);
  }
  wm.querySelector('.wm-close').onclick = function () { close(); };
  wm.querySelector('.wm-prev').onclick = function () { open((opened - 1 + secs.length) % secs.length); };
  wm.querySelector('.wm-next').onclick = function () { open((opened + 1) % secs.length); };
  wm.addEventListener('click', function (e) { if (e.target === wm) close(); });
  document.addEventListener('keydown', function (e) {
    var lbOpen = document.getElementById('lb').classList.contains('open');
    if (e.key === 'Escape' && !lbOpen && wm.classList.contains('open')) close();
    if (!wm.classList.contains('open') && (e.key === 'ArrowLeft' || e.key === 'ArrowRight') && document.activeElement.tagName !== 'INPUT') go(cur + (e.key === 'ArrowRight' ? 1 : -1));
  });

  // 聯絡區塊下方：條列所有作品
  var list = document.getElementById('works-list');
  if (list) secs.forEach(function (sec, i) {
    var t = sec.querySelector('.p-title');
    var li = document.createElement('li');
    li.className = 'wl-item'; li.tabIndex = 0;
    li.innerHTML = '<div class="wl-no"></div><div class="wl-thumb"></div><div><div class="wl-name"></div><div class="wl-sub"></div><div class="wl-tag"></div><div class="wl-meta"></div></div><span class="wl-go">查看作品 →</span>';
    li.querySelector('.wl-no').textContent = ('0' + (i + 1)).slice(-2);
    var cover = sec.getAttribute('data-cover');
    if (cover) { var im = document.createElement('img'); im.src = cover; im.alt = ''; im.loading = 'lazy'; li.querySelector('.wl-thumb').appendChild(im); }
    li.querySelector('.wl-name').textContent = t ? t.childNodes[0].textContent.trim() : sec.id;
    li.querySelector('.wl-sub').textContent = t && t.querySelector('span') ? t.querySelector('span').textContent : '';
    var tag = sec.querySelector('.p-tagline'); li.querySelector('.wl-tag').textContent = tag ? tag.textContent : '';
    var meta = li.querySelector('.wl-meta');
    sec.querySelectorAll('.p-meta .chip').forEach(function (c) {
      var a = c.querySelector('a'), el;
      if (a) { el = document.createElement('a'); el.href = a.href; el.target = '_blank'; el.rel = 'noopener'; el.addEventListener('click', function (e) { e.stopPropagation(); }); }
      else el = document.createElement('span');
      el.textContent = c.textContent.trim(); meta.appendChild(el);
    });
    li.addEventListener('click', function () { open(i); });
    li.addEventListener('keydown', function (e) { if (e.key === 'Enter') open(i); });
    list.appendChild(li);
  });

  layout();
  // 由網址 #id 直接開啟（例如履歷頁連結 portfolio.html#fgpay）
  function fromHash() {
    var h = location.hash.slice(1);
    secs.forEach(function (s, i) { if (s.id === h && opened !== i) open(i); });
  }
  fromHash();
  window.addEventListener('hashchange', fromHash);

  // 燈箱（事件委派，視窗內圖片也適用）
  var lb = document.getElementById('lb'), lbImg = lb.querySelector('img'), lbCap = lb.querySelector('p');
  document.addEventListener('click', function (e) {
    var el = e.target.closest('.gallery figure,[data-lb],.live-shot');
    if (!el || !wm.contains(el)) return;
    var im = el.querySelector('img'); if (!im) return;
    lbImg.src = im.src;
    var c = el.querySelector('figcaption'); lbCap.textContent = c ? c.textContent : (im.alt || '');
    lb.classList.add('open');
  });
  lb.addEventListener('click', function () { lb.classList.remove('open'); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') lb.classList.remove('open'); });
})();
