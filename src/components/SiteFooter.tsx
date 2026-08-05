import { ChevronDown } from 'lucide-react';
import { AIRPICK_DEFINITION, COMPANY_LEGAL } from '../constants/companyLegal';

/** 홈·앱 하단 — 메뉴 링크는 ≡ 시트로. 여기는 사업자 정보만 */
export default function SiteFooter() {
  return (
    <footer className="mt-6 border-t border-sky-border/60 px-1 pt-3 pb-2">
      <details className="group">
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
