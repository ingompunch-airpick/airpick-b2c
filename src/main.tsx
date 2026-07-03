import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './firebase';
import './index.css';
import App from './App.tsx';
import ReceiptPage from './pages/ReceiptPage.tsx';
import { parseReceiptIdFromPath } from './lib/receipt';

const receiptId = parseReceiptIdFromPath(window.location.pathname);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {receiptId ? <ReceiptPage reservationId={receiptId} /> : <App />}
  </StrictMode>
);
