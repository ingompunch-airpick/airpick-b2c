/** 에어픽 플랫폼 운영·브랜드·고객센터 (소개·푸터·개인정보처리방침) */

export const COMPANY_LEGAL = {
  /** 대외 브랜드명 */
  serviceName: '에어픽',
  /** 운영·사업자 상호 */
  name: '에어픽',
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
  /**
   * 통신판매업 신고번호. 확정 전 null — 화면에 가짜 번호 금지.
   * 신고 후 문자열만 채우면 푸터·소개에 노출된다.
   */
  mailOrderNumber: null as string | null,
} as const;

/** 포트원·크롤러용 공개 정책 URL (trailing slash) */
export const POLICY_PATHS = {
  terms: '/terms/',
  privacy: '/privacy/',
  refund: '/refund/',
  pricing: '/pricing/',
  about: '/about/',
} as const;

/** 푸터·정적 HTML용 중개자 고지 (consent INTERMEDIARY_DISCLAIMER와 동취지) */
export const FOOTER_INTERMEDIARY_NOTICE =
  '에어픽은 주차대행 업체와 이용자를 연결하는 통신판매중개자이며, 주차대행 서비스의 당사자가 아닙니다. 서비스 이행에 관한 책임은 각 입점 업체에 있습니다.';

/**
 * 브랜드 검색·AI·네이버 채널용 정의 문장 (한 줄 정본).
 * 채널·랜딩·FAQ에서 이 문장을 그대로 쓴다.
 */
export const AIRPICK_DEFINITION =
  '에어픽은 인천공항 주차대행과 사설주차장을 비교·예약하는 공항주차 서비스입니다. 이심(eSIM)은 제휴 할인으로 안내합니다.';

/** 사설주차장 입점 전까지 정의문 옆에 붙인다. 날짜·「곧」 쓰지 않음 */
export const AIRPICK_AVAILABILITY_NOTE =
  '지금은 주차대행(발렛) 업체부터 예약할 수 있고, 사설주차장은 준비 중입니다.';

/** 메타·OG용 짧은 보조 (확정 요금·최저가 단정 금지) */
export const AIRPICK_DEFINITION_META =
  '에어픽 공항주차 | 인천공항 주차대행·사설주차장 비교·예약. 일정만 넣으면 가격·보험·후기를 한눈에. 지금은 주차대행부터 예약할 수 있어요.';

/** 홈 document.title · index.html title 과 동일하게 유지. 화면 로고와는 별개 */
export const AIRPICK_HOME_DOCUMENT_TITLE = '에어픽 공항주차 | 인천공항 주차대행·사설주차장 비교·예약';

/** 고객 화면용 한 줄 */
export const AIRPICK_CUSTOMER_PITCH =
  '터미널, 실내·야외, 날짜를 고르면 이용 가능한 주차대행 업체와 요금이 나옵니다. 사설주차장은 준비 중이에요. 이심은 제휴 할인으로 준비할 수 있어요.';

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
    id: 'parking',
    title: '주차대행 비교',
    body: '터미널, 실내·야외, 날짜를 고르면 이용 가능 업체와 요금이 나옵니다.',
  },
  {
    id: 'esim',
    title: '이심(eSIM) 제휴 할인',
    body: '제휴 할인 링크로 이동합니다. 구매·개통은 제휴사에서 진행해요.',
  },
] as const;

/** 에어픽 인증 업체 — 소개 페이지·FAQ 공통 */
export const PARTNER_BENEFITS = {
  title: '에어픽 인증 업체',
  points: [
    '사업자·보험·주차장·운영을 에어픽에서 확인한 업체예요.',
    '앱에서 바로 예약할 수 있어요.',
    '이용하신 분이 남긴 실제 평점·후기만 보여 드려요.',
    '맡긴 뒤 입고 사진·주차 위치·보험을 예약 탭에서 확인할 수 있어요.',
  ],
} as const;
