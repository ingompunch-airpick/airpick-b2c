import { COMPANY_LEGAL, OFFICIAL_CHANNEL_URLS } from './companyLegal';

/** 소개·푸터·about 공개용 채널 목록 (개설된 것만) */
export interface OfficialChannelLink {
  id: string;
  label: string;
  href: string;
  note?: string;
}

export function listOfficialChannelLinks(): OfficialChannelLink[] {
  const links: OfficialChannelLink[] = [
    {
      id: 'kakao',
      label: '카카오톡 고객센터',
      href: COMPANY_LEGAL.kakaoChatUrl,
      note: `상담 ${COMPANY_LEGAL.supportHours}`,
    },
  ];
  if (OFFICIAL_CHANNEL_URLS.naverBlog) {
    links.push({
      id: 'naver-blog',
      label: '네이버 블로그',
      href: OFFICIAL_CHANNEL_URLS.naverBlog,
      note: '비교·가이드 요약',
    });
  }
  if (OFFICIAL_CHANNEL_URLS.naverPlace) {
    links.push({
      id: 'naver-place',
      label: '네이버 플레이스',
      href: OFFICIAL_CHANNEL_URLS.naverPlace,
      note: '사업자·길찾기',
    });
  }
  return links;
}
