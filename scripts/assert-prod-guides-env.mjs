/**
 * 프로덕션 호스팅 배포 전 — draft 가이드가 섞이지 않게 환경변수 차단.
 * AIRPICK_GUIDES_INCLUDE_DRAFT 가 켜져 있으면 실패.
 */
const raw = String(process.env.AIRPICK_GUIDES_INCLUDE_DRAFT ?? '').trim();
if (raw === '' || raw === '0' || raw.toLowerCase() === 'false') {
  process.exit(0);
}

console.error(
  '[prod] AIRPICK_GUIDES_INCLUDE_DRAFT 가 켜져 있어 배포를 중단합니다.',
  `값=${JSON.stringify(raw)}`,
  '미리보기는 npm run deploy:hosting:preview 를 사용하세요.'
);
process.exit(1);
