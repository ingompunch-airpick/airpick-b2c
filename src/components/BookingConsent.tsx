import { useEffect, useId, useState, type ReactNode } from 'react';
import { ChevronRight, X } from 'lucide-react';
import {
  AIRPICK_PLATFORM_TERMS,
  buildParkingServiceTerms,
  buildThirdPartyPrivacyConsent,
  INTERMEDIARY_DISCLAIMER,
  PRIVACY_CONSENT,
  type TermsArticle,
} from '../constants/consent';
import { cn } from '../utils/cn';

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
        <div className="overflow-y-auto px-5 py-4 text-[12px] leading-relaxed text-muted">
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

export default function BookingConsent({
  agreedPlatformTerms,
  agreedServiceTerms,
  agreedPrivacy,
  agreedThirdParty,
  onAgreedPlatformTermsChange,
  onAgreedServiceTermsChange,
  onAgreedPrivacyChange,
  onAgreedThirdPartyChange,
  providerName,
}: {
  agreedPlatformTerms: boolean;
  agreedServiceTerms: boolean;
  agreedPrivacy: boolean;
  agreedThirdParty: boolean;
  onAgreedPlatformTermsChange: (v: boolean) => void;
  onAgreedServiceTermsChange: (v: boolean) => void;
  onAgreedPrivacyChange: (v: boolean) => void;
  onAgreedThirdPartyChange: (v: boolean) => void;
  providerName?: string;
}) {
  const [sheet, setSheet] = useState<SheetKey | null>(null);
  const parkingServiceTerms = buildParkingServiceTerms(providerName);
  const thirdPartyPrivacy = buildThirdPartyPrivacyConsent(providerName);
  const allAgreed =
    agreedPlatformTerms && agreedServiceTerms && agreedPrivacy && agreedThirdParty;

  const setAllAgreed = (v: boolean) => {
    onAgreedPlatformTermsChange(v);
    onAgreedServiceTermsChange(v);
    onAgreedPrivacyChange(v);
    onAgreedThirdPartyChange(v);
  };

  const rows: { key: SheetKey; label: string }[] = [
    { key: 'platform', label: AIRPICK_PLATFORM_TERMS.title.replace(/^[①②③④]\s*/, '') },
    { key: 'partner', label: parkingServiceTerms.title.replace(/^[①②③④]\s*/, '') },
    { key: 'privacy', label: PRIVACY_CONSENT.title.replace(/^[①②③④]\s*/, '') },
    { key: 'thirdParty', label: thirdPartyPrivacy.title.replace(/^[①②③④]\s*/, '') },
  ];

  return (
    <section className="space-y-3">
      <p className="text-xs font-bold text-brand">약관 및 개인정보 동의</p>

      <div className="space-y-1 rounded-xl bg-amber-50 px-3 py-2.5 ring-1 ring-amber-100">
        {INTERMEDIARY_DISCLAIMER.map((line) => (
          <p key={line} className="text-[10px] font-semibold leading-relaxed text-amber-800">
            {line}
          </p>
        ))}
      </div>

      <div className="rounded-2xl bg-sky-bg ring-1 ring-sky-border/70">
        <label className="flex cursor-pointer items-start gap-2.5 px-3.5 py-3.5">
          <input
            type="checkbox"
            checked={allAgreed}
            onChange={(e) => setAllAgreed(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-sky-border text-brand"
          />
          <span className="text-[13px] font-bold text-ink">전체 동의합니다. (필수)</span>
        </label>

        <ul className="border-t border-sky-border/60">
          {rows.map((row) => (
            <li key={row.key} className="border-b border-sky-border/50 last:border-b-0">
              <button
                type="button"
                onClick={() => setSheet(row.key)}
                className="flex w-full items-center justify-between gap-3 px-3.5 py-3 text-left"
              >
                <span className="text-[12px] font-semibold text-ink">
                  {row.label}
                  <span className="ml-1.5 text-[10px] font-bold text-brand">필수</span>
                </span>
                <ChevronRight size={16} className="shrink-0 text-muted-light" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-[10px] font-medium leading-relaxed text-muted">
        각 항목을 눌러 상세 내용을 확인할 수 있습니다. 예약에 필요한 필수 약관 및 개인정보
        처리에 모두 동의합니다.
      </p>

      {!allAgreed ? (
        <p className={cn('text-[10px] font-semibold text-muted')}>
          전체 동의 후 예약을 접수할 수 있습니다.
        </p>
      ) : null}

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
