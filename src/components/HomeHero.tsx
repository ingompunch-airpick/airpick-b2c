import { HOME_PLATFORM_LINE, HOME_PLATFORM_SUB } from '../constants/marketing';
import PageHero from './PageHero';

export default function HomeHero() {
  return <PageHero sub={HOME_PLATFORM_SUB} line={HOME_PLATFORM_LINE} />;
}
