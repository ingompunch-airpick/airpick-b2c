import {
  MarketingFooter,
  MarketingNavbar,
} from '../../design-system';
import { PartnerApply } from './sections/PartnerApply';
import { PartnerApp } from './sections/PartnerApp';
import { PartnerBenefits } from './sections/PartnerBenefits';
import { PartnerHero } from './sections/PartnerHero';
import { PartnerKakao } from './sections/PartnerKakao';
import { PartnerProblem } from './sections/PartnerProblem';
import { PartnerReviews } from './sections/PartnerReviews';
import { PartnerTimeline } from './sections/PartnerTimeline';
import { PartnerTrust } from './sections/PartnerTrust';
import { PartnerVision } from './sections/PartnerVision';
import { PartnerWhyPlatform } from './sections/PartnerWhyPlatform';
import { PartnerDivider } from './sections/PartnerDivider';

const NAV_LINKS = [
  { href: '#benefits', label: '입점 혜택' },
  { href: '#partner-app', label: '업체용 앱' },
  { href: '#apply', label: '입점 신청' },
];

export default function PartnerLandingPage() {
  return (
    <div className="mkt-root">
      <MarketingNavbar
        brandHref="/partner"
        brand="AirPick"
        links={NAV_LINKS}
        ctaHref="#apply"
        ctaLabel="입점 신청"
      />
      <main>
        <PartnerHero />
        <PartnerProblem />
        <PartnerWhyPlatform />
        <PartnerBenefits />
        <PartnerApp />
        <PartnerKakao />
        <PartnerReviews />
        <PartnerDivider />
        <PartnerTrust />
        <PartnerTimeline />
        <PartnerVision />
        <PartnerApply />
      </main>
      <MarketingFooter />
    </div>
  );
}
