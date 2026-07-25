/** 에어픽 플랫폼 운영·브랜드·고객센터 (소개·푸터·개인정보처리방침) */

export const COMPANY_LEGAL = {
  /** 대외 브랜드명 */
  serviceName: '에어픽',
  /** 운영·사업자 상호 */
  name: '곰컴퍼니',
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
  '에어픽은 곰컴퍼니가 운영하는 인천공항 출국시간 계산·주차대행 비교·이심(eSIM) 가격비교 플랫폼입니다.';

/** 메타·OG용 짧은 보조 (확정 요금·최저가 단정 금지) */
export const AIRPICK_DEFINITION_META =
  '에어픽 — 인천공항 출국시간 계산, 주차대행 비교, 이심(eSIM) 가격비교. 혼잡·대기 여유를 보고 나설 시각을 잡고, 입점은 예약·위치·사진·보험까지.';

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

/** 에어픽이 하는 일 (소개·AI/검색용 한 줄 근거) */
export const AIRPICK_SERVICES = [
  {
    id: 'leave-by',
    title: '출국시간 계산',
    body: '비행기 출발 3시간 전 공항 도착을 기준으로 추천 출발 시각을 계산합니다. 장기·단기·주차대행의 공항 이동을 반영합니다.',
  },
  {
    id: 'parking',
    title: '주차대행 비교',
    body: '인천공항 주차대행 업체의 요금을 나란히 비교하고, 입점 업체는 앱에서 바로 예약할 수 있습니다.',
  },
  {
    id: 'esim',
    title: '이심(eSIM) 가격 비교',
    body: '여행용 이심·유심 제휴 요금을 비교합니다. 구매·개통은 각 제휴사에서 진행합니다.',
  },
] as const;

/** 입점 vs 미입점 — 소개 페이지·FAQ 공통 */
export const PARTNER_VS_EXTERNAL = {
  partner: {
    title: '입점 업체',
    points: [
      '가격·보험·주차장 위치를 에어픽에서 안내·확인한 업체입니다.',
      '에어픽 앱에서 바로 예약할 수 있습니다.',
      '이용 후 고객이 남긴 실제 평점·후기를 확인할 수 있습니다.',
      '예약 후 입고 사진·주차 위치·보험을 예약 탭에서 확인할 수 있습니다.',
    ],
  },
  external: {
    title: '미입점 업체',
    points: [
      '가격 비교 참고용으로만 제공합니다. 요금은 시점마다 달라질 수 있어 에어픽이 확정하지 않습니다.',
      '업체 홈페이지에 보험·주차장 위치가 있어도, 그때그때 바뀌는 내용을 에어픽이 확인하지 않습니다.',
      '에어픽에서 예약할 수 없으며, 에어픽 평점·후기도 없습니다.',
      '예약은 해당 업체 홈페이지로 이동합니다.',
    ],
  },
} as const;
