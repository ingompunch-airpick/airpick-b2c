import { ChevronDown } from 'lucide-react';
import {
  allFaqItems,
  faqRestAnswer,
  HOME_FAQ_IDS,
  HOME_FAQ_UPDATED,
  type FaqItem,
} from '../../constants/support';

/**
 * 홈 하단 FAQ 4개. 문구 정본은 constants/support.ts.
 * index.html 프리렌더·FAQPage JSON-LD 는 `npm run faq` 가 같은 데이터로 만듭니다.
 */
function pickHomeFaq(): FaqItem[] {
  const all = allFaqItems();
  return HOME_FAQ_IDS.map((id) => all.find((i) => i.id === id)).filter(
    (i): i is FaqItem => Boolean(i)
  );
}

export default function HomeFaq() {
  const items = pickHomeFaq();
  if (items.length === 0) return null;
  return (
    <section aria-labelledby="home-faq-title">
      <h2 id="home-faq-title" className="px-1 text-[18px] font-bold text-[#0f1a2e]">
        자주 묻는 질문
      </h2>
      <div className="mt-3 space-y-2">
        {items.map((item) => {
          const rest = faqRestAnswer(item);
          return (
            <details
              key={item.id}
              className="group rounded-2xl bg-white ring-1 ring-[#0f1a2e]/8 open:shadow-[0_12px_40px_rgba(15,26,46,0.08)]"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4 text-[15px] font-semibold text-[#0f1a2e] [&::-webkit-details-marker]:hidden">
                <span>{item.question}</span>
                <ChevronDown
                  className="h-5 w-5 shrink-0 text-[#6b7a8a] transition-transform group-open:rotate-180"
                  aria-hidden
                />
              </summary>
              <div className="px-4 pb-4 text-[15px] leading-relaxed text-[#0f1a2e]/75">
                <p className="font-semibold text-[#0f1a2e]">{item.shortAnswer}</p>
                {rest ? <p className="mt-1.5">{rest}</p> : null}
              </div>
            </details>
          );
        })}
      </div>
      <div className="mt-3 flex items-center justify-between px-1 text-[13px] text-[#6b7a8a]">
        <span>안내 기준일 {HOME_FAQ_UPDATED.replace(/-/g, '.')}</span>
        <a
          href="/faq/"
          className="font-semibold text-[#0f1a2e] underline decoration-[#c9a244]/70 underline-offset-[3px]"
        >
          FAQ 전체 보기
        </a>
      </div>
    </section>
  );
}
