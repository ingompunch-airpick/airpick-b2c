import {
  AIRPICK_AVAILABILITY_NOTE,
  AIRPICK_DEFINITION,
  COMPANY_LEGAL,
  FOOTER_INTERMEDIARY_NOTICE,
  POLICY_PATHS,
} from '../constants/companyLegal';
import { buildTelHref, formatPhoneDisplay } from '../utils/contact';

const POLICY_LINKS = [
  { href: POLICY_PATHS.terms, label: '이용약관' },
  { href: POLICY_PATHS.privacy, label: '개인정보처리방침' },
  { href: POLICY_PATHS.refund, label: '취소·환불 정책' },
  { href: POLICY_PATHS.pricing, label: '요금 안내' },
  { href: POLICY_PATHS.about, label: '소개' },
] as const;

/** 홈·앱 하단 — 메뉴는 ≡ 시트. 사업자·정책은 크롤러가 읽도록 항상 노출 */
export default function SiteFooter({ tone = 'default' }: { tone?: 'default' | 'premium' }) {
  const tel = buildTelHref(COMPANY_LEGAL.phone);
  const phoneLabel = formatPhoneDisplay(COMPANY_LEGAL.phone);

  return (
    <footer
      className={
        tone === 'premium'
          ? 'mt-6 border-t border-[#0f1a2e]/10 px-1 pt-3 pb-2'
          : 'mt-6 border-t border-sky-border/60 px-1 pt-3 pb-2'
      }
    >
      <p className="text-[10px] font-medium leading-relaxed text-muted">
        {AIRPICK_DEFINITION} {AIRPICK_AVAILABILITY_NOTE}
      </p>

      <p className="mt-2 text-[10px] font-medium leading-relaxed text-muted">
        상호: {COMPANY_LEGAL.name} | 대표자: {COMPANY_LEGAL.representative} | 사업자등록번호:{' '}
        {COMPANY_LEGAL.registrationNumber}
        {COMPANY_LEGAL.mailOrderNumber ? (
          <>
            {' '}
            | 통신판매업 신고번호: {COMPANY_LEGAL.mailOrderNumber}
          </>
        ) : null}{' '}
        | 주소: {COMPANY_LEGAL.address} | 고객센터:{' '}
        {tel ? (
          <a href={tel} className="text-brand underline-offset-2 hover:underline">
            {phoneLabel}
          </a>
        ) : (
          phoneLabel
        )}{' '}
        | 이메일:{' '}
        <a
          href={`mailto:${COMPANY_LEGAL.email}`}
          className="text-brand underline-offset-2 hover:underline"
        >
          {COMPANY_LEGAL.email}
        </a>
      </p>

      <nav
        aria-label="약관·정책"
        className="mt-2 flex flex-wrap gap-x-2 gap-y-1 text-[10px] font-bold text-muted"
      >
        {POLICY_LINKS.map((link, i) => (
          <span key={link.href} className="inline-flex items-center gap-2">
            {i > 0 ? <span className="font-medium text-muted-light" aria-hidden>|</span> : null}
            <a href={link.href} className="text-brand underline-offset-2 hover:underline">
              {link.label}
            </a>
          </span>
        ))}
      </nav>

      <p className="mt-2 text-[10px] font-medium leading-relaxed text-muted">
        {FOOTER_INTERMEDIARY_NOTICE}
      </p>

      <p className="mt-2 text-[10px] font-medium text-muted-light">
        고객센터 카카오톡 · {COMPANY_LEGAL.supportHours} ·{' '}
        <a
          href={COMPANY_LEGAL.kakaoChatUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand underline-offset-2 hover:underline"
        >
          상담 열기
        </a>
      </p>
    </footer>
  );
}
