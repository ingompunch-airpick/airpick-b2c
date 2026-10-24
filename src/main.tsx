import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './firebase';
import './index.css';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import { installGlobalErrorReporting, setErrorReportContext } from './lib/errorReport.ts';
import AdminReviewsPage from './pages/AdminReviewsPage.tsx';
import ReceiptPage from './pages/ReceiptPage.tsx';
import { AffiliateProvider } from './context/AffiliateContext.tsx';
import { parseReceiptIdFromPath } from './lib/receipt';
import { recoverStolenSeoDocument } from './utils/appPath';

installGlobalErrorReporting();
setErrorReportContext({ screen: window.location.pathname || '/' });

async function boot() {
  if (await recoverStolenSeoDocument()) return;

  const pathname = window.location.pathname;
  const receiptId = parseReceiptIdFromPath(pathname);
  const isAdminReviews = /^\/admin\/reviews\/?$/.test(pathname);

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ErrorBoundary>
        {isAdminReviews ? (
          <AdminReviewsPage />
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
