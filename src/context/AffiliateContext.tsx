import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { fetchAffiliateOffer, type AffiliateOffer } from '../lib/affiliates';
import {
  captureAffiliateRefFromUrl,
  getStoredAffiliateCode,
} from '../utils/affiliateSession';

type AffiliateContextValue = {
  offer: AffiliateOffer | null;
  loading: boolean;
};

const AffiliateContext = createContext<AffiliateContextValue>({
  offer: null,
  loading: false,
});

export function AffiliateProvider({ children }: { children: ReactNode }) {
  const [offer, setOffer] = useState<AffiliateOffer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const code = captureAffiliateRefFromUrl() ?? getStoredAffiliateCode();
    if (!code) {
      setOffer(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    void fetchAffiliateOffer(code)
      .then((next) => {
        if (!cancelled) setOffer(next);
      })
      .catch(() => {
        if (!cancelled) setOffer(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(() => ({ offer, loading }), [offer, loading]);
  return <AffiliateContext.Provider value={value}>{children}</AffiliateContext.Provider>;
}

export function useAffiliateOffer(): AffiliateContextValue {
  return useContext(AffiliateContext);
}
