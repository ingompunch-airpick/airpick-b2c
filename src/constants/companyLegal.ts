/** 에어픽 플랫폼 운영·브랜드·고객센터 (소개·푸터·개인정보처리방침) */

export const COMPANY_LEGAL = {
  /** 대외 브랜드명 */
  serviceName: '에어픽',
  /** 운영·사업자 상호 (사업자등록 기준) */
  name: '에어픽 주차대행 비교센터',
  registrationNumber: '776-32-01655',
  representative: '김인원',
  address: '인천시 중구 자연대로29, 2017호',
  email: 'ingompunch@gmail.com',
  phone: '01025565746',
  privacyOfficer: '김인원',
  /** 서비스 영역 */
  serviceArea: '인천공항',
  /** 공식 사이트 — canonical·sitemap·JSON-LD 와 동일 (유니코드 www) */
  siteUrl: 'https://www.에어픽.kr',
  siteUrlDisplay: 'www.에어픽.kr',
  /** Firebase/web.app 리다이렉트·DNS용 퓨니코드 (표기는 siteUrl 우선) */
  siteUrlAscii: 'https://www.xn--oh5b1bw17d.kr',
  /** 카카오 고객센터 채널 */
  kakaoChatUrl: 'http://pf.kakao.com/_lxhEnn/chat',
  /** 카카오 채널 프로필 (Organization sameAs) */
  kakaoProfileUrl: 'https://pf.kakao.com/_lxhEnn',
  /** 고객센터 운영 시간 */
  supportHours: '09:00 ~ 18:00',
} as const;

/**
 * 브랜드 검색·AI·네이버 채널용 정의 문장 (한 줄 정본).
 * 채널·랜딩·FAQ에서 이 문장을 그대로 쓴다.
 */
export const AIRPICK_DEFINITION =
  '에어픽 주차대행 비교센터(에어픽)는 인천공항 출국시간 계산·주차대행 비교·이심(eSIM) 제휴 할인 안내 플랫폼입니다.';

/** 메타·OG용 짧은 보조 (확정 요금·최저가 단정 금지) */
export const AIRPICK_DEFINITION_META =
  '에어픽 — 인천공항 출국시간 계산, 주차대행 비교, 이심(eSIM) 제휴 할인. 혼잡·대기 여유를 보고 나설 시각을 잡고, 공식 파트너는 예약·위치·사진·보험까지.';

/** 고객 화면용 한 줄 — 정의문(플랫폼입니다) 대신 쓸 때 */
export const AIRPICK_CUSTOMER_PITCH =
  '인천공항 출국 전에 나설 시각을 잡고, 확인된 주차대행만 비교·예약하세요. 이심은 제휴 할인으로 준비할 수 있어요.';

/**
 * 공식 외부 채널 (개설된 URL만 sameAs에 넣는다).
 * 네이버 플레이스·블로그 URL은 docs/naver 개설 후 여기만 채우면 됨.
 */
export const OFFICIAL_CHANNEL_URLS: {
  kakao: string;
  naverBlog: string | null;
  naverPlace: string | null;
} = {
  kakao: COMPANY_LEGAL.kakaoProfileUrl,
  /** 예: https://blog.naver.com/... — docs/naver 개설 후 기입 */
  naverBlog: null,
  /** 네이버 플레이스 상세 URL — 개설 후 기입 */
  naverPlace: null,
};

/** Organization JSON-LD sameAs — null 제외 */
export function buildOrganizationSameAs(): string[] {
  return Object.values(OFFICIAL_CHANNEL_URLS).filter(
    (url): url is string => typeof url === 'string' && url.length > 0
  );
}

/** 에어픽이 하는 일 (소개·고객 화면) */
export const AIRPICK_SERVICES = [
  {
    id: 'leave-by',
    title: '나설 시각 계산',
    body: '비행 출발 3시간 전 공항 도착을 기준으로, 집에서 언제 나서면 될지 잡아 드려요.',
  },
  {
    id: 'parking',
    title: '주차대행 비교',
    body: '확인된 업체만 요금을 비교하고, 앱에서 바로 예약할 수 있어요.',
  },
  {
    id: 'esim',
    title: '이심(eSIM) 제휴 할인',
    body: '제휴 할인 링크로 이동합니다. 구매·개통은 제휴사에서 진행해요.',
  },
] as const;

/** 공식 파트너 — 소개 페이지·FAQ 공통 */
export const PARTNER_BENEFITS = {
  title: '공식 파트너',
  points: [
    '사업자·보험·주차장·운영을 에어픽에서 확인한 업체예요.',
    '앱에서 바로 예약할 수 있어요.',
    '이용하신 분이 남긴 실제 평점·후기만 보여 드려요.',
    '맡긴 뒤 입고 사진·주차 위치·보험을 예약 탭에서 확인할 수 있어요.',
  ],
} as const;
