import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './firebase';
import './index.css';
import App from './App.tsx';
import AdminReviewsPage from './pages/AdminReviewsPage.tsx';
import ReceiptPage from './pages/ReceiptPage.tsx';
import { parseReceiptIdFromPath } from './lib/receipt';
import { recoverStolenSeoDocument } from './utils/appPath';

async function boot() {
  if (await recoverStolenSeoDocument()) return;

  const pathname = window.location.pathname;
  const receiptId = parseReceiptIdFromPath(pathname);
  const isAdminReviews = /^\/admin\/reviews\/?$/.test(pathname);

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      {isAdminReviews ? (
        <AdminReviewsPage />
      ) : receiptId ? (
        <ReceiptPage reservationId={receiptId} />
      ) : (
        <App />
      )}
    </StrictMode>
  );
}

void boot();
