import {
  AIRPICK_AVAILABILITY_NOTE,
  AIRPICK_DEFINITION,
  COMPANY_LEGAL,
  FOOTER_INTERMEDIARY_NOTICE,
  POLICY_PATHS,
} from '../constants/companyLegal';
import { buildTelHref, formatPhoneDisplay } from '../utils/contact';

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

      <nav
        aria-label="약관·정책"
        className="mt-2 flex flex-wrap gap-x-2 gap-y-1 text-[10px] font-bold text-muted"
      >
        <a href={POLICY_PATHS.terms} className="text-brand underline-offset-2 hover:underline">
          이용약관
        </a>
        <span className="font-medium text-muted-light" aria-hidden>
          |
        </span>
        <a href={POLICY_PATHS.privacy} className="text-brand underline-offset-2 hover:underline">
          <strong>개인정보처리방침</strong>
        </a>
        <span className="font-medium text-muted-light" aria-hidden>
          |
        </span>
        <a href={POLICY_PATHS.refund} className="text-brand underline-offset-2 hover:underline">
          취소·환불 정책
        </a>
        <span className="font-medium text-muted-light" aria-hidden>
          |
        </span>
        <a
          href={COMPANY_LEGAL.kakaoChatUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand underline-offset-2 hover:underline"
        >
          고객문의
        </a>
      </nav>

      <p className="mt-2 text-[10px] font-medium leading-relaxed text-muted">
        상호: {COMPANY_LEGAL.name}
        <br />
        서비스명: {COMPANY_LEGAL.serviceName}
        <br />
        대표자: {COMPANY_LEGAL.representative}
        <br />
        사업자등록번호: {COMPANY_LEGAL.registrationNumber}
        <br />
        {COMPANY_LEGAL.mailOrderNumber ? (
          <>
            통신판매업 신고번호: {COMPANY_LEGAL.mailOrderNumber}
            <br />
          </>
        ) : null}
        주소: {COMPANY_LEGAL.address}
        <br />
        전화번호:{' '}
        {tel ? (
          <a href={tel} className="text-brand underline-offset-2 hover:underline">
            {phoneLabel}
          </a>
        ) : (
          phoneLabel
        )}
        <br />
        이메일:{' '}
        <a
          href={`mailto:${COMPANY_LEGAL.email}`}
          className="text-brand underline-offset-2 hover:underline"
        >
          {COMPANY_LEGAL.email}
        </a>
        <br />
        호스팅 서비스 제공자: {COMPANY_LEGAL.hostingProvider}
      </p>

      <p className="mt-2 text-[10px] font-medium leading-relaxed text-muted">
        판매 상품: 인천공항 주차대행 예약(중개) · 요금은{' '}
        <a href="/pricing/" className="text-brand underline-offset-2 hover:underline">
          요금 안내
        </a>
      </p>

      <p className="mt-2 text-[10px] font-medium leading-relaxed text-muted">
        {FOOTER_INTERMEDIARY_NOTICE}
      </p>

      <p className="mt-2 text-[10px] font-medium text-muted-light">
        © {COMPANY_LEGAL.name}. All rights reserved. · 고객센터 {COMPANY_LEGAL.supportHours}
      </p>
    </footer>
  );
}
