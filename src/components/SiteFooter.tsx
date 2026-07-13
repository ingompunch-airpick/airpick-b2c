import { COMPANY_LEGAL } from '../constants/companyLegal';
import { SITE_NAV_PRIMARY, SITE_NAV_SECONDARY } from '../constants/siteNav';
import { buildTelHref, formatPhoneDisplay } from '../utils/contact';

export default function SiteFooter() {
  const telHref = buildTelHref(COMPANY_LEGAL.phone);

  return (
    <footer className="mt-6 border-t border-sky-border/60 px-1 pt-4 pb-2">
      <nav className="flex flex-wrap gap-x-3 gap-y-1.5 text-[11px] font-bold" aria-label="사이트 메뉴">
        {SITE_NAV_PRIMARY.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="text-ink underline-offset-2 hover:text-brand hover:underline"
          >
            {item.label}
          </a>
        ))}
      </nav>

      <p className="mt-4 text-[10px] font-bold text-muted">사업자 정보</p>
      <dl className="mt-1.5 space-y-0.5 text-[10px] font-medium leading-relaxed text-muted-light">
        <div className="flex gap-1.5">
          <dt className="shrink-0 text-muted">브랜드</dt>
          <dd>{COMPANY_LEGAL.serviceName}</dd>
        </div>
        <div className="flex gap-1.5">
          <dt className="shrink-0 text-muted">상호</dt>
          <dd>{COMPANY_LEGAL.name}</dd>
        </div>
        <div className="flex gap-1.5">
          <dt className="shrink-0 text-muted">대표</dt>
          <dd>{COMPANY_LEGAL.representative}</dd>
        </div>
        <div className="flex gap-1.5">
          <dt className="shrink-0 text-muted">사업자등록번호</dt>
          <dd>{COMPANY_LEGAL.registrationNumber}</dd>
        </div>
        <div className="flex gap-1.5">
          <dt className="shrink-0 text-muted">주소</dt>
          <dd className="break-keep">{COMPANY_LEGAL.address}</dd>
        </div>
        <div className="flex gap-1.5">
          <dt className="shrink-0 text-muted">공식 사이트</dt>
          <dd>
            <a
              href={COMPANY_LEGAL.siteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand underline-offset-2 hover:underline"
            >
              {COMPANY_LEGAL.siteUrlDisplay}
            </a>
          </dd>
        </div>
        <div className="flex gap-1.5">
          <dt className="shrink-0 text-muted">이메일</dt>
          <dd>
            <a
              href={`mailto:${COMPANY_LEGAL.email}`}
              className="text-brand underline-offset-2 hover:underline"
            >
              {COMPANY_LEGAL.email}
            </a>
          </dd>
        </div>
        <div className="flex gap-1.5">
          <dt className="shrink-0 text-muted">전화</dt>
          <dd>
            {telHref ? (
              <a href={telHref} className="text-brand underline-offset-2 hover:underline">
                {formatPhoneDisplay(COMPANY_LEGAL.phone)}
              </a>
            ) : (
              formatPhoneDisplay(COMPANY_LEGAL.phone)
            )}
          </dd>
        </div>
        <div className="flex gap-1.5">
          <dt className="shrink-0 text-muted">고객센터</dt>
          <dd>
            <a
              href={COMPANY_LEGAL.kakaoChatUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand underline-offset-2 hover:underline"
            >
              카카오톡 상담 · {COMPANY_LEGAL.supportHours}
            </a>
          </dd>
        </div>
      </dl>

      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-bold">
        {SITE_NAV_SECONDARY.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="text-muted underline-offset-2 hover:text-brand hover:underline"
          >
            {item.label}
          </a>
        ))}
      </div>
    </footer>
  );
}
