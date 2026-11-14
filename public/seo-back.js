/**
 * 앱·폰 우선 — 유입은 앱이 더 많다 (docs/work/subpage-partner-style-plan.md 5번)
 * is-app  : 에어픽 앱(Capacitor), 홈 화면 앱(PWA), 카카오톡·네이버 등 앱 안 브라우저
 * has-dock: is-app 또는 폰 브라우저 → 하단 고정 「이심 · 주차대행 비교하기」
 */
(function () {
  var root = document.documentElement;
  var ua = navigator.userAgent || '';
  var native = false;
  try {
    native = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
  } catch (_) {
    native = false;
  }
  var standalone =
    (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
    window.navigator.standalone === true;
  var inAppBrowser = /KAKAOTALK|NAVER\(inapp|DaumApps|Instagram|FBAN|FBAV|Line\/|everytimeApp|; wv\)/i.test(ua);
  var isApp = native || standalone || inAppBrowser;
  var phone = window.matchMedia && window.matchMedia('(max-width: 767px)').matches;

  if (isApp) root.classList.add('is-app');
  if (!(isApp || phone)) return;
  root.classList.add('has-dock');

  var dock = document.createElement('nav');
  dock.className = 'app-dock';
  dock.setAttribute('aria-label', '바로 예약');
  dock.innerHTML =
    '<a class="sub" href="/esim">이심</a><a href="/">주차대행 비교하기</a>';
  document.body.appendChild(dock);
})();

/** SEO 정적 페이지 뒤로가기 — 더보기에서 왔으면 메뉴로, 아니면 이전/홈 */
(function () {
  var MENU_KEY = 'airpick_open_menu';

  document.querySelectorAll('[data-seo-back]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      var fromMenu = false;
      try {
        fromMenu = sessionStorage.getItem(MENU_KEY) === '1';
      } catch (_) {
        fromMenu = false;
      }

      if (fromMenu) {
        e.preventDefault();
        window.location.href = '/?menu=1';
        return;
      }

      var ref = document.referrer;
      var sameOrigin = false;
      if (ref) {
        try {
          sameOrigin = new URL(ref).origin === location.origin;
        } catch (_) {
          sameOrigin = false;
        }
      }
      if (sameOrigin && window.history.length > 1) {
        e.preventDefault();
        window.history.back();
      }
    });
  });
})();

/** 상단 내비에서 지금 보는 섹션 칩 표시 */
(function () {
  var path = location.pathname;
  var links = document.querySelectorAll('.topnav a:not(.brand)');
  var best = null;
  links.forEach(function (a) {
    var href = a.getAttribute('href') || '';
    if (href === '/' || href.charAt(0) !== '/') return;
    if (path === href || path.indexOf(href.replace(/\/?$/, '/')) === 0) {
      if (!best || href.length > best.getAttribute('href').length) best = a;
    }
  });
  if (best) best.setAttribute('aria-current', 'page');
})();
