import { ChevronLeft, Headphones } from 'lucide-react';
import ContactActions from '../components/ContactActions';
import { AIRPICK_SUPPORT, FAQ_CATEGORIES } from '../constants/support';
import { buildTelHref, formatPhoneDisplay } from '../utils/contact';

export default function SupportPage({ onBack }: { onBack: () => void }) {
  const hasPhone = Boolean(buildTelHref(AIRPICK_SUPPORT.phone));
  const phoneDisplay =
    AIRPICK_SUPPORT.phoneDisplay ||
    (hasPhone ? formatPhoneDisplay(AIRPICK_SUPPORT.phone) : '전화 문의');

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-sky-bg">
      <header className="flex shrink-0 items-center gap-2 border-b border-sky-border/80 bg-sky-bg/95 px-2 py-3 backdrop-blur-md">
        <button
          type="button"
          onClick={onBack}
          className="rounded-full p-2 text-muted transition-colors hover:bg-sky-soft"
          aria-label="닫기"
        >
          <ChevronLeft size={22} />
        </button>
        <h1 className="text-base font-bold text-ink">고객센터</h1>
      </header>

      <div className="mx-auto w-full max-w-lg flex-1 overflow-y-auto px-4 py-5 pb-8">
        <section className="rounded-3xl bg-gradient-to-br from-sky-tint to-sky-soft p-5 shadow-[0_4px_16px_rgba(49,130,246,0.1)]">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/15">
              <Headphones size={20} className="text-brand" strokeWidth={2} />
            </div>
            <div>
              <p className="text-xs font-bold text-brand">에어픽 고객센터</p>
              <p className="text-sm font-bold text-ink">
                {hasPhone ? phoneDisplay : '전화 · 카톡 연락처 등록 예정'}
              </p>
              <p className="text-[11px] font-medium text-muted">{AIRPICK_SUPPORT.hours}</p>
            </div>
          </div>
          <p className="mt-3 text-xs font-medium leading-relaxed text-muted">
            {AIRPICK_SUPPORT.guide}
          </p>
          {(hasPhone || AIRPICK_SUPPORT.kakaoChannelUrl) && (
            <div className="mt-4">
              <ContactActions
                showCompany={false}
                airpickPhone={AIRPICK_SUPPORT.phone || undefined}
                airpickPhoneDisplay={phoneDisplay}
                kakaoChannelUrl={AIRPICK_SUPPORT.kakaoChannelUrl || undefined}
                kakaoLabel={AIRPICK_SUPPORT.kakaoLabel}
              />
            </div>
          )}
        </section>

        <section className="mt-5">
          <h2 className="px-0.5 text-sm font-bold text-ink">자주 묻는 질문</h2>
          <p className="mt-0.5 px-0.5 text-xs font-medium text-muted">
            전화 전에 확인해 보세요
          </p>
          <div className="mt-3 space-y-4">
            {FAQ_CATEGORIES.map((category) => (
              <div key={category.id}>
                <p className="mb-2 px-0.5 text-[11px] font-bold text-brand">{category.label}</p>
                <div className="space-y-2">
                  {category.items.map((item) => (
                    <details
                      key={item.id}
                      className="rounded-2xl bg-sky-soft px-4 py-3 ring-1 ring-sky-border/60"
                    >
                      <summary className="cursor-pointer list-none text-sm font-semibold text-ink marker:content-none">
                        {item.question}
                      </summary>
                      <p className="mt-2 text-xs font-medium leading-relaxed text-muted">
                        {item.answer}
                      </p>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
