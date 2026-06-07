import TrustPromise from '../components/TrustPromise';
import EsimBonusCard from '../components/EsimBonusCard';
import HomeHero from '../components/HomeHero';
import type { BookingSearch } from '../types';

export default function HomePage({
  search,
  onBookNow,
}: {
  search: BookingSearch;
  onBookNow: () => void;
}) {
  return (
    <div className="space-y-5 pb-1">
      <EsimBonusCard search={search} onBookNow={onBookNow} />
      <HomeHero />
      <TrustPromise />
    </div>
  );
}
