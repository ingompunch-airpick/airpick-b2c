import { ChevronDown } from 'lucide-react';
import { AIRPICK_DEFINITION, COMPANY_LEGAL } from '../constants/companyLegal';
import { SITE_NAV_PRIMARY, SITE_NAV_SECONDARY } from '../constants/siteNav';

export default function SiteFooter() {
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

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-bold">
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

      <details className="group mt-3">
        <summary className="flex cursor-pointer list-none items-center gap-1 text-[10px] font-bold text-muted [&::-webkit-details-marker]:hidden">
          <span>사업자 정보</span>
          <ChevronDown
            size={14}
            strokeWidth={2.5}
            className="text-muted transition-transform group-open:rotate-180"
            aria-hidden
          />
        </summary>

        <p className="mt-2.5 text-[10px] font-medium leading-relaxed text-muted">
          {AIRPICK_DEFINITION}
        </p>

        <dl className="mt-2.5 grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] font-medium leading-relaxed text-muted-light">
          <div className="flex min-w-0 gap-1.5">
            <dt className="shrink-0 text-muted">브랜드</dt>
            <dd>{COMPANY_LEGAL.serviceName}</dd>
          </div>
          <div className="flex min-w-0 gap-1.5">
            <dt className="shrink-0 text-muted">대표</dt>
            <dd>{COMPANY_LEGAL.representative}</dd>
          </div>
          <div className="flex min-w-0 gap-1.5">
            <dt className="shrink-0 text-muted">사업자번호</dt>
            <dd className="break-all">{COMPANY_LEGAL.registrationNumber}</dd>
          </div>
          <div className="flex min-w-0 gap-1.5">
            <dt className="shrink-0 text-muted">이메일</dt>
            <dd className="min-w-0 truncate">
              <a
                href={`mailto:${COMPANY_LEGAL.email}`}
                className="text-brand underline-offset-2 hover:underline"
              >
                {COMPANY_LEGAL.email}
              </a>
            </dd>
          </div>
          <div className="col-span-2 flex gap-1.5">
            <dt className="shrink-0 text-muted">주소</dt>
            <dd className="break-keep">{COMPANY_LEGAL.address}</dd>
          </div>
          <div className="flex min-w-0 gap-1.5">
            <dt className="shrink-0 text-muted">사이트</dt>
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
          <div className="flex min-w-0 gap-1.5">
            <dt className="shrink-0 text-muted">고객센터</dt>
            <dd>
              <a
                href={COMPANY_LEGAL.kakaoChatUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand underline-offset-2 hover:underline"
              >
                카카오톡 · {COMPANY_LEGAL.supportHours}
              </a>
            </dd>
          </div>
        </dl>
      </details>
    </footer>
  );
}
