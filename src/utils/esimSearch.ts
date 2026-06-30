import { normalizeEsimSearch } from '../lib/esimCatalog';
import type { EsimSearch } from '../types';

export const defaultEsimSearch: EsimSearch = normalizeEsimSearch({
  simType: 'esim',
  countryCode: 'JP',
  dataPlan: '1gb',
  days: 7,
});
