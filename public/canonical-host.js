/**
 * Firebase 기본 호스트(web.app / firebaseapp.com) → 공식 www 로 보냄.
 * (Hosting JSON 은 호스트별 리다이렉트를 못 해서 엔트리 HTML에서 처리)
 */
(function () {
  var host = location.hostname;
  if (!/(^|\.)web\.app$|(^|\.)firebaseapp\.com$/i.test(host)) return;

  var meta = document.createElement('meta');
  meta.name = 'robots';
  meta.content = 'noindex, nofollow';
  if (document.head) document.head.appendChild(meta);

  var dest =
    'https://www.xn--oh5b1bw17d.kr' + location.pathname + location.search + location.hash;
  location.replace(dest);
})();
