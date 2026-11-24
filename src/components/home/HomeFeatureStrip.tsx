import { CalendarCheck, Camera, MapPin, Receipt } from 'lucide-react';
import { HOME_FEATURE_STRIP } from '../../constants/marketing';

const ICONS = {
  photo: Camera,
  location: MapPin,
  cancel: CalendarCheck,
  price: Receipt,
} as const;

/** 홈 검색 카드 아래 — 에어픽이 실제로 제공하는 기능 한 줄 */
export default function HomeFeatureStrip() {
  return (
    <ul className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
      {HOME_FEATURE_STRIP.map((item) => {
        const Icon = ICONS[item.id];
        return (
          <li
            key={item.id}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-white px-2 py-2.5 text-[13px] font-bold text-[#0f1a2e] ring-1 ring-[#0f1a2e]/8 md:text-[14px]"
          >
            <Icon size={16} strokeWidth={2.25} className="shrink-0 text-[#b8954a]" aria-hidden />
            {item.label}
          </li>
        );
      })}
    </ul>
  );
}
