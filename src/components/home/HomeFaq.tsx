import { ChevronDown } from 'lucide-react';
import { FAQ_CATEGORIES, type FaqItem } from '../../constants/support';

/**
 * 홈 하단 FAQ 4개 — 화면에 보이는 질문과 index.html FAQPage JSON-LD·프리렌더를 같게 유지.
 * 바꿀 때: index.html 「home-faq」 프리렌더 블록 + FAQPage JSON-LD 도 같이 수정.
 */
export const HOME_FAQ_IDS = ['what-is', 'book-how', 'pay-when', 'cancel-free'] as const;

/** 홈 안내 정보 기준일 — index.html WebPage.dateModified 와 같게 */
export const HOME_UPDATED = '2026.11.14';

function pickHomeFaq(): FaqItem[] {
  const all = FAQ_CATEGORIES.flatMap((c) => c.items);
  return HOME_FAQ_IDS.map((id) => all.find((i) => i.id === id)).filter(
    (i): i is FaqItem => Boolean(i)
  );
}

function restAnswer(item: FaqItem): string {
  return item.answer.startsWith(item.shortAnswer)
    ? item.answer.slice(item.shortAnswer.length).trim()
    : item.answer;
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
        {items.map((item) => (
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
              {/* answer가 shortAnswer로 시작하면 겹치는 문장은 빼고 나머지만 */}
              {restAnswer(item) ? <p className="mt-1.5">{restAnswer(item)}</p> : null}
            </div>
          </details>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between px-1 text-[13px] text-[#6b7a8a]">
        <span>안내 기준일 {HOME_UPDATED}</span>
        <a href="/faq/" className="font-semibold text-[#0f1a2e] underline decoration-[#c9a244]/70 underline-offset-[3px]">
          FAQ 전체 보기
        </a>
      </div>
    </section>
  );
}
