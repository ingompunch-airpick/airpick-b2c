import CompanyCard from '../components/CompanyCard';
import SearchPanel from '../components/SearchPanel';
import type { BookingSearch, Company } from '../types';
import { calculatePrice } from '../utils/pricing';

export default function ComparePage({
  search,
  onSearchChange,
  companies,
  onSelectCompany,
}: {
  search: BookingSearch;
  onSearchChange: (s: BookingSearch) => void;
  companies: Company[];
  onSelectCompany: (company: Company, price: number) => void;
}) {
  const priced = companies
    .map((c) => ({
      company: c,
      price: calculatePrice(
        c,
        search.departureDate,
        search.arrivalDate,
        search.isIndoor,
        search.terminal === 'T2',
        search.departureTime,
        search.arrivalTime
      ),
    }))
    .sort((a, b) => a.price - b.price);

  return (
    <div className="space-y-4">
      <div className="px-1">
        <h2 className="text-base font-bold text-ink">주차대행</h2>
        <p className="text-xs font-medium text-muted">날짜·터미널 선택 후 업체를 비교하세요</p>
      </div>

      <SearchPanel search={search} onChange={onSearchChange} onSubmit={() => {}} />

      <div className="px-1">
        <h3 className="text-sm font-bold text-ink">업체 가격 비교</h3>
        <p className="text-xs font-medium text-muted">
          {priced.length}개 업체 · 낮은 가격순 · eSIM 무료는 주차 일수 기준
        </p>
      </div>

      <div className="space-y-3">
        {priced.map(({ company, price }) => (
          <CompanyCard
            key={company.id}
            company={company}
            price={price}
            layout="list"
            onSelect={() => onSelectCompany(company, price)}
          />
        ))}
        {priced.length === 0 && (
          <p className="rounded-2xl bg-sky-soft p-8 text-center text-sm text-muted shadow-[0_2px_8px_rgba(49,130,246,0.07)]">
            표시할 업체가 없습니다.
          </p>
        )}
      </div>
    </div>
  );
}
