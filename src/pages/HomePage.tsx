import { Car, Smartphone } from 'lucide-react';
import HomeCategoryCard from '../components/HomeCategoryCard';
import HomeHero from '../components/HomeHero';
import { HOME_ESIM, HOME_PARKING } from '../constants/marketing';
import type { Company } from '../types';

export default function HomePage({
  companies,
  onCompareParking,
  onCompareEsim,
}: {
  companies: Company[];
  onCompareParking: () => void;
  onCompareEsim: () => void;
}) {
  return (
    <div className="space-y-6 pb-2">
      <HomeHero companies={companies} />

      <HomeCategoryCard
        headline={HOME_PARKING.headline}
        highlights={HOME_PARKING.highlights}
        cta={HOME_PARKING.cta}
        onCta={onCompareParking}
        icon={Car}
        featured
      />

      <HomeCategoryCard
        headline={HOME_ESIM.headline}
        highlights={HOME_ESIM.highlights}
        cta={HOME_ESIM.cta}
        onCta={onCompareEsim}
        icon={Smartphone}
      />
    </div>
  );
}
