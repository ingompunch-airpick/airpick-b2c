import { PRIVACY_CONSENT, WAWA_TERMS_OF_SERVICE, type TermsArticle } from '../constants/consent';
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

export default function BookingConsent({
  agreedTerms,
  agreedPrivacy,
  onAgreedTermsChange,
  onAgreedPrivacyChange,
}: {
  agreedTerms: boolean;
  agreedPrivacy: boolean;
  onAgreedTermsChange: (v: boolean) => void;
  onAgreedPrivacyChange: (v: boolean) => void;
}) {
  return (
    <section className="space-y-3">
      <p className="text-xs font-bold text-brand">약관 동의</p>

      <div className="rounded-2xl bg-sky-bg p-3 ring-1 ring-sky-border/70">
        <p className="text-[11px] font-bold text-ink">{WAWA_TERMS_OF_SERVICE.title}</p>
        <div className="mt-2 max-h-44 overflow-y-auto rounded-xl bg-sky-soft p-2.5 text-[10px] leading-relaxed text-muted">
          {WAWA_TERMS_OF_SERVICE.articles.map((article) => (
            <TermsArticleBlock key={article.heading} article={article} />
          ))}
        </div>
        <label className="mt-2 flex items-start gap-2">
          <input
            type="checkbox"
            checked={agreedTerms}
            onChange={(e) => onAgreedTermsChange(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-sky-border text-brand"
          />
          <span className="text-[11px] font-semibold text-ink">{WAWA_TERMS_OF_SERVICE.checkbox}</span>
        </label>
      </div>

      <div className="rounded-2xl bg-sky-bg p-3 ring-1 ring-sky-border/70">
        <p className="text-[11px] font-bold text-ink">{PRIVACY_CONSENT.title}</p>
        <div className="mt-2 rounded-xl bg-sky-soft p-2.5 text-[10px] leading-relaxed text-muted">
          <p>
            <span className="font-bold text-ink">수집 목적: </span>
            {PRIVACY_CONSENT.purpose}
          </p>
          <p className="mt-1">
            <span className="font-bold text-ink">수집 항목: </span>
            {PRIVACY_CONSENT.items.join(', ')}
          </p>
          <p className="mt-1">
            <span className="font-bold text-ink">보유 기간: </span>
            {PRIVACY_CONSENT.retention}
          </p>
        </div>
        <label className="mt-2 flex items-start gap-2">
          <input
            type="checkbox"
            checked={agreedPrivacy}
            onChange={(e) => onAgreedPrivacyChange(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-sky-border text-brand"
          />
          <span className="text-[11px] font-semibold text-ink">{PRIVACY_CONSENT.checkbox}</span>
        </label>
      </div>

      {!agreedTerms || !agreedPrivacy ? (
        <p className={cn('text-[10px] font-semibold text-muted')}>
          약관·개인정보 동의 후 예약을 접수할 수 있습니다.
        </p>
      ) : null}
    </section>
  );
}
