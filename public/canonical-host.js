/**
 * Firebase 기본 호스트(web.app / firebaseapp.com) → 공식 www 로 보냄.
 * 목적지는 canonical·sitemap과 동일한 유니코드 호스트(www.에어픽.kr).
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
    'https://www.에어픽.kr' + location.pathname + location.search + location.hash;
  location.replace(dest);
})();
