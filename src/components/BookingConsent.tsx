import { useEffect, useId, useState, type ReactNode } from 'react';
import { X } from 'lucide-react';
import {
  AIRPICK_PLATFORM_TERMS,
  buildParkingServiceTerms,
  buildThirdPartyPrivacyConsent,
  PRIVACY_CONSENT,
  type TermsArticle,
} from '../constants/consent';

function TermsArticleBlock({ article }: { article: TermsArticle }) {
  return (
    <div className="mb-3 last:mb-0">
      <p className="font-bold text-ink">{article.heading}</p>
      {article.paragraphs?.map((p) => (
        <p key={p} className="mt-1">
          {p}
        </p>
      ))}
      {article.list && (
        <ul className="mt-1 list-none space-y-1 pl-0">
          {article.list.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
      {article.note && <p className="mt-1.5">{article.note}</p>}
    </div>
  );
}

function ConsentSheet({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const titleId = useId();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-sky-deep/50"
        aria-label="닫기"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[80vh] w-full max-w-lg flex-col rounded-t-3xl bg-white shadow-xl sm:rounded-3xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-sky-border/60 px-5 py-4">
          <h3 id={titleId} className="text-base font-bold text-ink">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full p-1.5 hover:bg-sky-tint"
          >
            <X size={18} className="text-muted" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4 text-[13px] leading-relaxed text-muted">
          {children}
        </div>
        <div className="border-t border-sky-border/60 p-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-brand py-3 text-sm font-bold text-white"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

type SheetKey = 'platform' | 'partner' | 'privacy' | 'thirdParty';

/**
 * Parkos형 — 필수 약관 체크 없음. 예약 완료로 동의.
 * 마케팅만 수신 거부 체크(옵트아웃).
 */
export default function BookingConsent({
  marketingOptIn,
  onMarketingOptInChange,
  providerName,
}: {
  marketingOptIn: boolean;
  onMarketingOptInChange: (v: boolean) => void;
  providerName?: string;
}) {
  const [sheet, setSheet] = useState<SheetKey | null>(null);
  const parkingServiceTerms = buildParkingServiceTerms(providerName);
  const thirdPartyPrivacy = buildThirdPartyPrivacyConsent(providerName);
  const partnerLabel = providerName?.trim() || '제휴업체';

  return (
    <section className="space-y-3 px-3 py-3">
      <label className="flex cursor-pointer items-start gap-2.5">
        <input
          type="checkbox"
          checked={!marketingOptIn}
          onChange={(e) => onMarketingOptInChange(!e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-sky-border text-brand"
        />
        <span className="text-[13px] font-medium leading-relaxed text-ink">
          에어픽의 소식·할인 안내를 받지 않겠습니다.{' '}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setSheet('privacy');
            }}
            className="font-bold text-brand underline-offset-2 hover:underline"
          >
            개인정보처리방침
          </button>
        </span>
      </label>

      <p className="text-[12px] font-medium italic leading-relaxed text-muted">
        예약을 완료하면{' '}
        <button
          type="button"
          onClick={() => setSheet('platform')}
          className="font-bold not-italic text-brand underline-offset-2 hover:underline"
        >
          에어픽 이용약관
        </button>
        ,{' '}
        <button
          type="button"
          onClick={() => setSheet('partner')}
          className="font-bold not-italic text-brand underline-offset-2 hover:underline"
        >
          {partnerLabel} 서비스 약관
        </button>
        ,{' '}
        <button
          type="button"
          onClick={() => setSheet('privacy')}
          className="font-bold not-italic text-brand underline-offset-2 hover:underline"
        >
          개인정보 수집·이용
        </button>
        ,{' '}
        <button
          type="button"
          onClick={() => setSheet('thirdParty')}
          className="font-bold not-italic text-brand underline-offset-2 hover:underline"
        >
          제3자 제공
        </button>
        에 동의한 것으로 봅니다.
      </p>

      {sheet === 'platform' ? (
        <ConsentSheet title={AIRPICK_PLATFORM_TERMS.title} onClose={() => setSheet(null)}>
          {AIRPICK_PLATFORM_TERMS.articles.map((article) => (
            <TermsArticleBlock key={article.heading} article={article} />
          ))}
        </ConsentSheet>
      ) : null}

      {sheet === 'partner' ? (
        <ConsentSheet title={parkingServiceTerms.title} onClose={() => setSheet(null)}>
          {parkingServiceTerms.articles.map((article) => (
            <TermsArticleBlock key={article.heading} article={article} />
          ))}
        </ConsentSheet>
      ) : null}

      {sheet === 'privacy' ? (
        <ConsentSheet title={PRIVACY_CONSENT.title} onClose={() => setSheet(null)}>
          <p>
            <span className="font-bold text-ink">수집주체: </span>
            {PRIVACY_CONSENT.controller}
          </p>
          <p className="mt-1.5">
            <span className="font-bold text-ink">수집목적: </span>
            {PRIVACY_CONSENT.purposes.join(', ')}
          </p>
          <p className="mt-1.5">
            <span className="font-bold text-ink">수집항목: </span>
            {PRIVACY_CONSENT.items.join(', ')}
          </p>
          <p className="mt-1.5">
            <span className="font-bold text-ink">보유 및 이용기간: </span>
            {PRIVACY_CONSENT.retention}
          </p>
          <p className="mt-1.5">{PRIVACY_CONSENT.notice}</p>
        </ConsentSheet>
      ) : null}

      {sheet === 'thirdParty' ? (
        <ConsentSheet title={thirdPartyPrivacy.title} onClose={() => setSheet(null)}>
          <p>
            <span className="font-bold text-ink">제공받는 자: </span>
            {thirdPartyPrivacy.recipient}
          </p>
          <p className="mt-1.5">
            <span className="font-bold text-ink">제공목적: </span>
            {thirdPartyPrivacy.purposes.join(', ')}
          </p>
          <p className="mt-1.5">
            <span className="font-bold text-ink">제공항목: </span>
            {thirdPartyPrivacy.items.join(', ')}
          </p>
          <p className="mt-1.5">
            <span className="font-bold text-ink">보유기간: </span>
            {thirdPartyPrivacy.retention}
          </p>
          <p className="mt-1.5">{thirdPartyPrivacy.notice}</p>
        </ConsentSheet>
      ) : null}
    </section>
  );
}
