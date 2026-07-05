import type { ReactNode } from 'react';
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

function ConsentCheckbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-start gap-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-sky-border text-brand"
      />
      <span className="text-[11px] font-semibold text-ink">{label}</span>
    </label>
  );
}

function ConsentDetailBlock({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-sky-bg p-3 ring-1 ring-sky-border/70">
      <p className="text-[11px] font-bold text-ink">{title}</p>
      <div className="mt-2 max-h-40 overflow-y-auto rounded-xl bg-sky-soft p-2.5 text-[10px] leading-relaxed text-muted">
        {children}
      </div>
    </div>
  );
}

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
  const parkingServiceTerms = buildParkingServiceTerms(providerName);
  const thirdPartyPrivacy = buildThirdPartyPrivacyConsent(providerName);
  const allAgreed =
    agreedPlatformTerms && agreedServiceTerms && agreedPrivacy && agreedThirdParty;

  return (
    <section className="space-y-3">
      <p className="text-xs font-bold text-brand">약관·개인정보 동의</p>

      <div className="space-y-1.5 rounded-xl bg-amber-50 px-3 py-2.5 ring-1 ring-amber-100">
        {INTERMEDIARY_DISCLAIMER.map((line) => (
          <p key={line} className="text-[10px] font-semibold leading-relaxed text-amber-800">
            {line}
          </p>
        ))}
      </div>

      <ConsentDetailBlock title={AIRPICK_PLATFORM_TERMS.title}>
        {AIRPICK_PLATFORM_TERMS.articles.map((article) => (
          <TermsArticleBlock key={article.heading} article={article} />
        ))}
      </ConsentDetailBlock>
      <ConsentCheckbox
        checked={agreedPlatformTerms}
        onChange={onAgreedPlatformTermsChange}
        label={AIRPICK_PLATFORM_TERMS.checkbox}
      />

      <ConsentDetailBlock title={parkingServiceTerms.title}>
        {parkingServiceTerms.articles.map((article) => (
          <TermsArticleBlock key={article.heading} article={article} />
        ))}
      </ConsentDetailBlock>
      <ConsentCheckbox
        checked={agreedServiceTerms}
        onChange={onAgreedServiceTermsChange}
        label={parkingServiceTerms.checkbox}
      />

      <ConsentDetailBlock title={PRIVACY_CONSENT.title}>
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
      </ConsentDetailBlock>
      <ConsentCheckbox
        checked={agreedPrivacy}
        onChange={onAgreedPrivacyChange}
        label={PRIVACY_CONSENT.checkbox}
      />

      <ConsentDetailBlock title={thirdPartyPrivacy.title}>
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
      </ConsentDetailBlock>
      <ConsentCheckbox
        checked={agreedThirdParty}
        onChange={onAgreedThirdPartyChange}
        label={thirdPartyPrivacy.checkbox}
      />

      {!allAgreed ? (
        <p className={cn('text-[10px] font-semibold text-muted')}>
          약관·개인정보 4항목 모두 동의 후 예약을 접수할 수 있습니다.
        </p>
      ) : null}
    </section>
  );
}
