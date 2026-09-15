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
