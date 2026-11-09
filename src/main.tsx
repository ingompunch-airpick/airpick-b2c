import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './firebase';
import './index.css';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import { installGlobalErrorReporting, setErrorReportContext } from './lib/errorReport.ts';
import AdminReviewsPage from './pages/AdminReviewsPage.tsx';
import DirectionsPage from './pages/DirectionsPage.tsx';
import ReceiptPage from './pages/ReceiptPage.tsx';
import { AffiliateProvider } from './context/AffiliateContext.tsx';
import { parseReceiptIdFromPath } from './lib/receipt';
import { recoverStolenSeoDocument } from './utils/appPath';
import { registerSW } from 'virtual:pwa-register';

function isDirectionsPath(pathname: string): boolean {
  const path = pathname.replace(/\/+$/, '') || '/';
  return path === '/directions' || path.startsWith('/directions/');
}

installGlobalErrorReporting();
setErrorReportContext({ screen: window.location.pathname || '/' });

if (import.meta.env.PROD) {
  registerSW({
    onRegisterError() {
      // 사파리·인앱 브라우저는 서비스 워커를 거절한다. 예약 화면에는 영향이 없다.
    },
  });
}

async function boot() {
  if (await recoverStolenSeoDocument()) return;

  const pathname = window.location.pathname;
  const receiptId = parseReceiptIdFromPath(pathname);
  const isAdminReviews = /^\/admin\/reviews\/?$/.test(pathname);
  const showDirections = isDirectionsPath(pathname);

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ErrorBoundary>
        {isAdminReviews ? (
          <AdminReviewsPage />
        ) : showDirections ? (
          <DirectionsPage />
        ) : receiptId ? (
          <ReceiptPage reservationId={receiptId} />
        ) : (
          <AffiliateProvider>
            <App />
          </AffiliateProvider>
        )}
      </ErrorBoundary>
    </StrictMode>
  );
}

void boot();
