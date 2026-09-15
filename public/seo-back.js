/** SEO 정적 페이지 뒤로가기 — 같은 출처에서 왔으면 history.back, 아니면 href(/) */
(function () {
  document.querySelectorAll('[data-seo-back]').forEach(function (el) {
    el.addEventListener('click', function (e) {
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
