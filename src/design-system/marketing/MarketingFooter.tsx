import { COMPANY_LEGAL } from '../../constants/companyLegal';
import { Container } from '../components/Container';

type FooterLink = { href: string; label: string };

type MarketingFooterProps = {
  links?: FooterLink[];
};

const DEFAULT_LINKS: FooterLink[] = [
  { href: '/#services', label: '서비스' },
  { href: '/partner#apply', label: '파트너' },
  { href: '/for-partners/', label: '입점사 자료' },
  { href: '/about/', label: '소개' },
  { href: '/privacy/', label: '개인정보' },
];

export function MarketingFooter({ links = DEFAULT_LINKS }: MarketingFooterProps) {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-mkt-border bg-mkt-sub py-14">
      <Container className="flex flex-col gap-10 md:flex-row md:justify-between">
        <div className="max-w-sm">
          <p className="text-lg font-bold tracking-tight text-mkt-ink">AirPick</p>
          <p className="mt-2 text-sm leading-relaxed text-mkt-muted">
            인천공항 주차대행 비교·예약 플랫폼. 신뢰를 기준으로 입점 업체를 선별합니다.
          </p>
          <dl className="mt-5 space-y-1 text-xs text-mkt-muted">
            <div className="flex gap-2">
              <dt className="shrink-0 font-semibold text-mkt-ink">상호</dt>
              <dd>{COMPANY_LEGAL.name}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="shrink-0 font-semibold text-mkt-ink">사업자</dt>
              <dd>{COMPANY_LEGAL.registrationNumber}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="shrink-0 font-semibold text-mkt-ink">대표</dt>
              <dd>{COMPANY_LEGAL.representative}</dd>
            </div>
          </dl>
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
