import {
  COMPANY_LEGAL,
  FOOTER_INTERMEDIARY_NOTICE,
  POLICY_PATHS,
} from '../../constants/companyLegal';
import { buildTelHref, formatPhoneDisplay } from '../../utils/contact';
import { Container } from '../components/Container';

type FooterLink = { href: string; label: string };

type MarketingFooterProps = {
  links?: FooterLink[];
};

const DEFAULT_LINKS: FooterLink[] = [
  { href: '/#services', label: '서비스' },
  { href: '/join#apply', label: '파트너' },
  { href: POLICY_PATHS.about, label: '소개' },
  { href: POLICY_PATHS.terms, label: '이용약관' },
  { href: POLICY_PATHS.privacy, label: '개인정보' },
  { href: POLICY_PATHS.refund, label: '취소·환불' },
  { href: POLICY_PATHS.pricing, label: '요금 안내' },
];

export function MarketingFooter({ links = DEFAULT_LINKS }: MarketingFooterProps) {
  const year = new Date().getFullYear();
  const tel = buildTelHref(COMPANY_LEGAL.phone);
  const phoneLabel = formatPhoneDisplay(COMPANY_LEGAL.phone);

  return (
    <footer className="border-t border-mkt-border bg-mkt-sub py-14">
      <Container className="flex flex-col gap-10 md:flex-row md:justify-between">
        <div className="max-w-lg">
          <p className="text-lg font-bold tracking-tight text-mkt-ink">AirPick</p>
          <p className="mt-2 text-sm leading-relaxed text-mkt-muted">
            인천공항 주차대행 비교·예약 플랫폼. 신뢰를 기준으로 입점 업체를 선별합니다.
          </p>
          <p className="mt-4 text-xs leading-relaxed text-mkt-muted">
            상호: {COMPANY_LEGAL.name} | 대표자: {COMPANY_LEGAL.representative} | 사업자등록번호:{' '}
            {COMPANY_LEGAL.registrationNumber}
            {COMPANY_LEGAL.mailOrderNumber
              ? ` | 통신판매업 신고번호: ${COMPANY_LEGAL.mailOrderNumber}`
              : ''}{' '}
            | 주소: {COMPANY_LEGAL.address} | 고객센터:{' '}
            {tel ? (
              <a href={tel} className="text-mkt-brand underline-offset-2 hover:underline">
                {phoneLabel}
              </a>
            ) : (
              phoneLabel
            )}{' '}
            | 이메일:{' '}
            <a
              href={`mailto:${COMPANY_LEGAL.email}`}
              className="text-mkt-brand underline-offset-2 hover:underline"
            >
              {COMPANY_LEGAL.email}
            </a>
          </p>
          <p className="mt-3 text-xs leading-relaxed text-mkt-muted">{FOOTER_INTERMEDIARY_NOTICE}</p>
        </div>
        <nav aria-label="푸터" className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-mkt-muted">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-mkt-brand">
              {l.label}
            </a>
          ))}
        </nav>
      </Container>
      <Container className="mt-10 border-t border-mkt-border pt-6">
        <p className="text-xs text-mkt-muted">
          © {year} {COMPANY_LEGAL.name} · AirPick. All rights reserved.
        </p>
      </Container>
    </footer>
  );
}
