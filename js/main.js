/* =========================================================
   整体 あさなぎ（制作サンプル・架空）
   - 動きは「動きを減らす」設定のときは止める
   - 電話・SNS・予約・フォームは、どこにも送らず、保存もしない
   ========================================================= */
(function () {
  'use strict';

  document.documentElement.classList.remove('no-js');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  function motionOk() { return !reduceMotion.matches; }

  /* ---------- ヘッダー：スクロールしたら線と影 ---------- */
  var header = document.querySelector('.site-header');
  function onScrollHeader() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  }
  window.addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();

  /* ---------- スマホのメニュー ---------- */
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('global-nav');
  var pcQuery = window.matchMedia('(min-width: 1024px)');

  function setMenu(open) {
    if (!toggle || !nav) return;
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
    var label = toggle.querySelector('.menu-toggle__label');
    if (label) label.textContent = open ? '閉じる' : 'メニュー';
    document.body.classList.toggle('menu-open', open);
    document.querySelectorAll('main, footer, .fixed-cta').forEach(function (el) {
      if (open) el.setAttribute('inert', ''); else el.removeAttribute('inert');
    });
    if (open) {
      /* 引き出しが動き終わってから、最初のリンクに移る（横にスクロールしないように preventScroll） */
      window.setTimeout(function () {
        var first = nav.querySelector('a');
        if (first) first.focus({ preventScroll: true });
      }, motionOk() ? 420 : 0);
    }
  }
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a') && !pcQuery.matches) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { setMenu(false); toggle.focus(); }
    });
    pcQuery.addEventListener('change', function (e) { if (e.matches) setMenu(false); });
  }

  /* ---------- スクロールで現れる ---------- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal, .reveal-clip, .step'));
  function revealInView() {
    /* 画面に入っているものを表示する（IntersectionObserver が動かない環境のための保険） */
    var limit = window.innerHeight * 0.92;
    reveals = reveals.filter(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < limit) { el.classList.add('is-visible'); return false; }
      return true;
    });
  }
  if (motionOk() && 'IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    reveals.forEach(function (el) { revealObserver.observe(el); });
    var revealTick = false;
    function onScrollReveal() {
      if (revealTick) return;
      revealTick = true;
      window.requestAnimationFrame(function () { revealInView(); revealTick = false; });
    }
    window.addEventListener('scroll', onScrollReveal, { passive: true });
    window.addEventListener('resize', onScrollReveal);
    window.addEventListener('load', revealInView);
    revealInView();
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* 2026-10-08 Opus：見出しが1文字ずつ浮かぶ動きと、最初の画面の図形のパララックスは外した
     （心得「動きは飾りではなく、分かりやすさと相談までの近さのために」・辛口審査の学び「動きは4種類まで」） */

  /* ---------- 流れの図：読んでいる段階に合わせて絵を切り替える（PC） ---------- */
  var flowSteps = document.querySelectorAll('.flow .step');
  var flowImgs = document.querySelectorAll('.flow__figure-img');
  var flowTabs = document.querySelectorAll('.flow__figure-tabs li');
  if (flowSteps.length && flowImgs.length && 'IntersectionObserver' in window) {
    var flowObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var i = Array.prototype.indexOf.call(flowSteps, entry.target);
        flowImgs.forEach(function (img, j) { img.classList.toggle('is-active', i === j); });
        flowTabs.forEach(function (t, j) { t.classList.toggle('is-active', i === j); });
      });
    }, { rootMargin: '-40% 0px -40% 0px', threshold: 0 });
    flowSteps.forEach(function (s) { flowObserver.observe(s); });
  }

  /* ---------- スマホ下の固定バー：予約の帯とフッターの近くでは隠す ---------- */
  var fixedCta = document.querySelector('.fixed-cta');
  if (fixedCta && 'IntersectionObserver' in window) {
    var hideNear = document.querySelectorAll('.cta, .site-footer, .booking');
    var visibleCount = 0;
    var ctaObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { visibleCount += entry.isIntersecting ? 1 : -1; });
      visibleCount = Math.max(0, visibleCount);
      fixedCta.classList.toggle('is-hidden', visibleCount > 0);
    }, { threshold: 0.05 });
    hideNear.forEach(function (el) { ctaObserver.observe(el); });
  }

  /* ---------- 電話のボタン（見本）：発信しない ----------
     実際のサイトでは <a href="tel:..."> にして、タップで電話をかける画面が開くようにする */
  document.querySelectorAll('[data-sample-tel]').forEach(function (button) {
    button.addEventListener('click', function () {
      var statusId = button.getAttribute('aria-describedby');
      var status = statusId ? document.getElementById(statusId) : null;
      var msg = 'サンプルのため電話はかかりません（実際のサイトでは 000-0000-0000 に発信します）';
      if (status) status.textContent = msg; else window.alert(msg);
    });
  });

  /* ---------- SNS・LINE のボタン（見本）：どこにも移動しない ----------
     実際のサイトでは <a href="https://www.instagram.com/（アカウント名）/"> などにする。
     公式マークを使うときは、各社のブランドの決まりに沿う */
  document.querySelectorAll('[data-sample-sns]').forEach(function (button) {
    button.addEventListener('click', function () {
      var statusId = button.getAttribute('aria-describedby');
      var status = statusId ? document.getElementById(statusId) : null;
      var name = button.getAttribute('data-sample-sns');
      var msg = 'サンプルのため ' + name + ' には移動しません';
      if (status) status.textContent = msg; else window.alert(msg);
    });
  });

  /* ---------- 入力の確認に使う小さな道具 ---------- */
  function setError(id, message, els) {
    var box = document.getElementById(id);
    if (box) box.textContent = message || '';
    (els || []).forEach(function (el) {
      if (message) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid');
    });
  }
  function digitsOf(text) {
    return (text || '').replace(/[０-９]/g, function (c) { return String.fromCharCode(c.charCodeAt(0) - 0xFEE0); }).replace(/[^0-9]/g, '');
  }
  function looksLikeEmail(text) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text || ''); }

  /* ---------- ご質問のフォーム（見本）：送信しない ---------- */
  var contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = contactForm.querySelector('#cf-name');
      var tel = contactForm.querySelector('#cf-tel');
      var email = contactForm.querySelector('#cf-email');
      var body = contactForm.querySelector('#cf-body');
      var agree = contactForm.querySelector('#cf-agree');
      var ok = true;
      setError('cf-name-error', '', [name]);
      setError('cf-contact-error', '', [tel, email]);
      setError('cf-body-error', '', [body]);
      setError('cf-agree-error', '', [agree]);
      if (!name.value.trim()) { setError('cf-name-error', 'お名前を入力してください', [name]); ok = false; }
      var hasTel = digitsOf(tel.value).length >= 10;
      var hasMail = looksLikeEmail(email.value.trim());
      if (!hasTel && !hasMail) { setError('cf-contact-error', '電話番号かメールアドレスの、どちらかを入力してください', [tel, email]); ok = false; }
      if (!body.value.trim()) { setError('cf-body-error', 'ご質問の内容を入力してください', [body]); ok = false; }
      if (!agree.checked) { setError('cf-agree-error', 'プライバシーポリシーへの同意にチェックを入れてください', [agree]); ok = false; }
      var status = document.getElementById('cf-status');
      if (!ok) {
        status.textContent = '入力されていない項目があります。赤い印の項目をご確認ください。';
        var firstInvalid = contactForm.querySelector('[aria-invalid="true"]');
        if (firstInvalid) firstInvalid.focus();
        return;
      }
      status.textContent = 'サンプルのため送信されません。実際のサイトでは、ここで送信され、2営業日以内にご連絡します。（入力した内容は、どこにも保存されていません）';
      contactForm.reset();
    });
  }

  /* ---------- Web予約の流れ（見本）：予約されない・保存しない ---------- */
  var booking = document.getElementById('booking-form');
  if (booking) initBooking(booking);

  function initBooking(form) {
    var MENUS = {
      first: { name: 'はじめての方（問診＋施術＋セルフケアのお話）', minutes: 75, price: 7700 },
      s60: { name: '2回目から　整体 60分', minutes: 60, price: 6600 },
      s30: { name: '2回目から　整体 短め 30分', minutes: 30, price: 3850 }
    };
    var OPEN = 9 * 60, LAST_END = 20 * 60, CLOSED_DOW = 4; /* 木曜が定休日 */
    var WEEK = ['日', '月', '火', '水', '木', '金', '土'];
    var state = { menu: null, date: null, time: null };
    var panels = form.querySelectorAll('.booking__panel');
    var marks = form.querySelectorAll('.booking__progress li');
    var calBody = form.querySelector('#cal-grid');
    var calTitle = form.querySelector('#cal-title');
    var prevBtn = form.querySelector('#cal-prev');
    var nextBtn = form.querySelector('#cal-next');
    var slotList = form.querySelector('#slot-list');
    var today = startOfDay(new Date());
    var viewMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    var maxDate = addDays(today, 60);

    function startOfDay(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
    function addDays(d, n) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); }
    function sameDay(a, b) { return !!a && !!b && a.getTime() === b.getTime(); }
    function fmtDate(d) { return d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日（' + WEEK[d.getDay()] + '）'; }
    function fmtTime(m) { return Math.floor(m / 60) + ':' + ('0' + (m % 60)).slice(-2); }
    function yen(n) { return n.toLocaleString('ja-JP') + '円'; }
    function minutes() { return state.menu ? MENUS[state.menu].minutes : 60; }

    /* 見本の「埋まっている時間」：日付から決まる計算（本物の予約ではない） */
    function seed(d) { return (d.getFullYear() * 372 + d.getMonth() * 31 + d.getDate()) * 2654435761 % 4294967296; }
    function bookedBlocks(d) {
      var s = seed(d) >>> 0, blocks = [];
      var count = 2 + (s % 3);
      for (var i = 0; i < count; i++) {
        s = (s * 1103515245 + 12345) >>> 0;
        var start = OPEN + ((s >>> 8) % 20) * 30;
        blocks.push([start, start + 60]);
      }
      return blocks;
    }
    function slotsFor(d) {
      var blocks = bookedBlocks(d), list = [];
      for (var t = OPEN; t + minutes() <= LAST_END; t += 30) {
        var free = true;
        for (var i = 0; i < blocks.length; i++) {
          if (t < blocks[i][1] && t + minutes() > blocks[i][0]) { free = false; break; }
        }
        if (sameDay(d, today) && t < (new Date().getHours() + 2) * 60) free = false;
        list.push({ start: t, free: free });
      }
      return list;
    }
    function dayStatus(d) {
      if (d < today || d > maxDate) return 'off';
      if (d.getDay() === CLOSED_DOW) return 'closed';
      var n = slotsFor(d).filter(function (s) { return s.free; }).length;
      if (n === 0) return 'full';
      return n <= 3 ? 'few' : 'ok';
    }

    function goTo(n) {
      panels.forEach(function (p, i) { p.classList.toggle('is-active', i === n); });
      marks.forEach(function (li, i) {
        li.classList.toggle('is-current', i === n);
        li.classList.toggle('is-done', i < n);
        if (i === n) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
      });
      var heading = panels[n].querySelector('h2');
      if (heading) { heading.setAttribute('tabindex', '-1'); heading.focus(); }
      if (n === 1) renderCalendar();
      if (n === 2) renderSlots();
      if (n === 4) renderConfirm();
      form.scrollIntoView({ block: 'start', behavior: motionOk() ? 'smooth' : 'auto' });
    }

    form.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-go]');
      if (!btn) return;
      e.preventDefault();
      var target = parseInt(btn.getAttribute('data-go'), 10);
      var current = Array.prototype.findIndex.call(panels, function (p) { return p.classList.contains('is-active'); });
      if (target > current) {
        if (current === 0 && !checkMenu()) return;
        if (current === 1 && !checkDate()) return;
        if (current === 2 && !checkTime()) return;
        if (current === 3 && !checkPerson()) return;
      }
      goTo(target);
    });
    form.addEventListener('submit', function (e) { e.preventDefault(); });

    /* 1 メニュー */
    function checkMenu() {
      var picked = form.querySelector('input[name="menu"]:checked');
      if (!picked) { setError('bk-menu-error', 'メニューを1つ選んでください', []); return false; }
      setError('bk-menu-error', '', []);
      if (state.menu !== picked.value) { state.menu = picked.value; state.date = null; state.time = null; }
      return true;
    }

    /* 2 日付 */
    function renderCalendar() {
      calTitle.textContent = viewMonth.getFullYear() + '年' + (viewMonth.getMonth() + 1) + '月';
      prevBtn.disabled = viewMonth <= new Date(today.getFullYear(), today.getMonth(), 1);
      nextBtn.disabled = viewMonth >= new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
      calBody.innerHTML = '';
      WEEK.forEach(function (w) {
        var el = document.createElement('div'); el.className = 'cal__dow'; el.textContent = w; el.setAttribute('aria-hidden', 'true');
        calBody.appendChild(el);
      });
      var first = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
      var last = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0);
      for (var i = 0; i < first.getDay(); i++) {
        var empty = document.createElement('div'); empty.className = 'cal__day is-empty'; empty.setAttribute('aria-hidden', 'true');
        calBody.appendChild(empty);
      }
      for (var day = 1; day <= last.getDate(); day++) {
        var d = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day);
        var st = dayStatus(d);
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'cal__day';
        var markText = st === 'closed' ? '休' : st === 'full' ? '満' : st === 'few' ? '残少' : st === 'ok' ? '○' : '';
        b.innerHTML = '<span>' + day + '</span><span class="mark" aria-hidden="true">' + markText + '</span>';
        b.setAttribute('aria-label', fmtDate(d) + (st === 'closed' ? '　定休日' : st === 'full' ? '　満席' : st === 'few' ? '　残りわずか' : st === 'ok' ? '　空きあり' : '　選べません'));
        if (st === 'off' || st === 'closed' || st === 'full') b.disabled = true;
        if (sameDay(d, state.date)) { b.classList.add('is-selected'); b.setAttribute('aria-pressed', 'true'); }
        b.dataset.key = d.getTime();
        calBody.appendChild(b);
      }
    }
    prevBtn.addEventListener('click', function () { viewMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1); renderCalendar(); });
    nextBtn.addEventListener('click', function () { viewMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1); renderCalendar(); });
    calBody.addEventListener('click', function (e) {
      var b = e.target.closest('.cal__day');
      if (!b || b.disabled) return;
      state.date = new Date(parseInt(b.dataset.key, 10));
      state.time = null;
      calBody.querySelectorAll('.cal__day').forEach(function (x) { x.classList.remove('is-selected'); x.removeAttribute('aria-pressed'); });
      b.classList.add('is-selected'); b.setAttribute('aria-pressed', 'true');
      setError('bk-date-error', '', []);
      form.querySelector('#bk-date-picked').textContent = '選んだ日：' + fmtDate(state.date);
    });
    function checkDate() {
      if (!state.date) { setError('bk-date-error', '日にちを選んでください', []); return false; }
      return true;
    }

    /* 3 時間 */
    function renderSlots() {
      slotList.innerHTML = '';
      form.querySelector('#bk-slot-date').textContent = fmtDate(state.date) + '（' + MENUS[state.menu].minutes + '分）';
      slotsFor(state.date).forEach(function (s) {
        var li = document.createElement('li');
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'slot'; b.textContent = fmtTime(s.start);
        b.setAttribute('aria-label', fmtTime(s.start) + (s.free ? '' : '　埋まっています'));
        if (!s.free) b.disabled = true;
        if (state.time === s.start) { b.classList.add('is-selected'); b.setAttribute('aria-pressed', 'true'); }
        b.dataset.start = s.start;
        li.appendChild(b); slotList.appendChild(li);
      });
    }
    slotList.addEventListener('click', function (e) {
      var b = e.target.closest('.slot');
      if (!b || b.disabled) return;
      state.time = parseInt(b.dataset.start, 10);
      slotList.querySelectorAll('.slot').forEach(function (x) { x.classList.remove('is-selected'); x.removeAttribute('aria-pressed'); });
      b.classList.add('is-selected'); b.setAttribute('aria-pressed', 'true');
      setError('bk-time-error', '', []);
      form.querySelector('#bk-time-picked').textContent = '選んだ時間：' + fmtTime(state.time) + '〜' + fmtTime(state.time + minutes());
    });
    function checkTime() {
      if (state.time === null) { setError('bk-time-error', '時間を選んでください', []); return false; }
      return true;
    }

    /* 4 お名前・連絡先 */
    var nameInput = form.querySelector('#bk-name');
    var telInput = form.querySelector('#bk-tel');
    var mailInput = form.querySelector('#bk-email');
    var agreeInput = form.querySelector('#bk-agree');
    function checkPerson() {
      var ok = true;
      setError('bk-name-error', '', [nameInput]);
      setError('bk-contact-error', '', [telInput, mailInput]);
      setError('bk-agree-error', '', [agreeInput]);
      if (!nameInput.value.trim()) { setError('bk-name-error', 'お名前を入力してください', [nameInput]); ok = false; }
      var hasTel = digitsOf(telInput.value).length >= 10;
      var hasMail = looksLikeEmail(mailInput.value.trim());
      if (!hasTel && !hasMail) { setError('bk-contact-error', '電話番号かメールアドレスの、どちらかを入力してください', [telInput, mailInput]); ok = false; }
      if (!agreeInput.checked) { setError('bk-agree-error', 'プライバシーポリシーへの同意にチェックを入れてください', [agreeInput]); ok = false; }
      if (!ok) { var f = form.querySelector('[aria-invalid="true"]'); if (f) f.focus(); }
      return ok;
    }

    /* 5 確認 */
    function renderConfirm() {
      var m = MENUS[state.menu];
      var firstTime = form.querySelector('input[name="visit"]:checked');
      var memo = form.querySelector('#bk-memo').value.trim();
      var rows = [
        ['メニュー', m.name],
        ['日時', fmtDate(state.date) + ' ' + fmtTime(state.time) + '〜' + fmtTime(state.time + m.minutes) + '（' + m.minutes + '分）'],
        ['料金（税込）', yen(m.price) + '　当日、施術のあとにお支払い'],
        ['お名前', nameInput.value.trim()],
        ['ご連絡先', [digitsOf(telInput.value) ? '電話 ' + telInput.value.trim() : '', mailInput.value.trim() ? 'メール ' + mailInput.value.trim() : ''].filter(Boolean).join('／')],
        ['ご来店', firstTime ? firstTime.nextElementSibling.textContent : '—'],
        ['気になること', memo || '（なし）']
      ];
      var tbody = form.querySelector('#bk-summary');
      tbody.innerHTML = '';
      rows.forEach(function (r) {
        var tr = document.createElement('tr');
        var th = document.createElement('th'); th.scope = 'row'; th.textContent = r[0];
        var td = document.createElement('td'); td.textContent = r[1];
        tr.appendChild(th); tr.appendChild(td); tbody.appendChild(tr);
      });
    }
    var finish = form.querySelector('#bk-finish');
    if (finish) {
      finish.addEventListener('click', function () {
        var status = form.querySelector('#bk-status');
        status.textContent = 'ここまでが見本です。サンプルのため予約はされず、入力した内容もどこにも保存されていません。実際のサイトでは、ここで予約が確定し、確認のメールか電話が届きます。';
        finish.disabled = true;
      });
    }
    var reset = form.querySelector('#bk-reset');
    if (reset) {
      reset.addEventListener('click', function () {
        form.reset();
        state = { menu: null, date: null, time: null };
        form.querySelector('#bk-status').textContent = '';
        form.querySelector('#bk-date-picked').textContent = '';
        form.querySelector('#bk-time-picked').textContent = '';
        if (finish) finish.disabled = false;
        [nameInput, telInput, mailInput, agreeInput].forEach(function (el) { el.removeAttribute('aria-invalid'); });
        goTo(0);
      });
    }
  }
})();
